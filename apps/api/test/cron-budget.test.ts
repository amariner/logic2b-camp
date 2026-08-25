import { env } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import {
  CRONS,
  CRON_BUDGETS,
  CRON_TASKS,
  assertBudgetPlan,
  assertCronBudget,
  cronName,
} from '../src/cron-policy';
import { runScheduled, type Bindings } from '../src';
import { seedTenant } from './fixtures';

type Meter = { queries: number; rowsRead: number; rowsWritten: number };
type ResultMeta = { rows_read?: number; rows_written?: number };

function addResult(meter: Meter, result: { meta?: ResultMeta }): void {
  meter.queries += 1;
  meter.rowsRead += result.meta?.rows_read ?? 0;
  meter.rowsWritten += result.meta?.rows_written ?? 0;
}

/** Binding transparente que suma el meta real devuelto por workerd/D1. */
function meteredD1(inner: D1Database, meter: Meter): D1Database {
  const native = new WeakMap<object, D1PreparedStatement>();
  const wrapStatement = (statement: D1PreparedStatement): D1PreparedStatement => {
    const proxy = new Proxy(statement, {
      get(target, property) {
        if (property === 'bind') {
          return (...values: unknown[]) => wrapStatement(target.bind(...values));
        }
        if (property === 'all' || property === 'run') {
          return async (...args: unknown[]) => {
            const method = target[property] as (...input: unknown[]) => Promise<D1Result>;
            const result = await method.apply(target, args);
            addResult(meter, result);
            return result;
          };
        }
        const value = Reflect.get(target, property, target) as unknown;
        return typeof value === 'function' ? value.bind(target) : value;
      },
    });
    native.set(proxy, statement);
    return proxy;
  };

  return new Proxy(inner, {
    get(target, property) {
      if (property === 'prepare') {
        return (sql: string) => wrapStatement(target.prepare(sql));
      }
      if (property === 'batch') {
        return async (statements: D1PreparedStatement[]) => {
          const results = await target.batch(
            statements.map((statement) => native.get(statement) ?? statement),
          );
          results.forEach((result) => addResult(meter, result));
          return results;
        };
      }
      const value = Reflect.get(target, property, target) as unknown;
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });
}

const eventFor = (cron: string) =>
  ({ cron, scheduledTime: Date.now(), type: 'scheduled', noRetry() {} }) as ScheduledController;

describe('presupuesto D1 de crons', () => {
  it('acepta los dos planes publicados y ningún cron antiguo', () => {
    expect(() => assertCronBudget('daily')).not.toThrow();
    expect(() => assertCronBudget('weekly')).not.toThrow();
    expect(cronName(CRONS.daily)).toBe('daily');
    expect(cronName(CRONS.weekly)).toBe('weekly');
    expect(cronName('*/15 * * * *')).toBeNull();
    expect(cronName('0 3 * * *')).toBeNull();
  });

  it.each(['maxQueries', 'maxRowsRead', 'maxRowsWritten'] as const)(
    'falla si un cron supera %s',
    (field) => {
      const budget = { ...CRON_BUDGETS.daily, [field]: 0 };
      expect(() => assertBudgetPlan('roto', budget, CRON_TASKS.daily)).toThrow(field);
    },
  );

  it('falla si una tarea intenta escribir una tabla protegida', () => {
    expect(() =>
      assertBudgetPlan('roto', { maxQueries: 1, maxRowsRead: 1, maxRowsWritten: 1 }, [
        {
          task: 'wipe',
          maxQueries: 1,
          maxRowsRead: 0,
          maxRowsWritten: 1,
          writes: ['bookings', 'users'],
        },
      ]),
    ).toThrow('users');
  });

  it.each(['daily', 'weekly'] as const)(
    'mide el meta real de D1 y mantiene el cron %s dentro de presupuesto',
    async (name) => {
      await seedTenant(env.DB, `budget-${name}`);
      const meter: Meter = { queries: 0, rowsRead: 0, rowsWritten: 0 };
      const bindings = {
        ...env,
        DB: meteredD1(env.DB, meter),
        TENANT_SLUG: `budget-${name}`,
      } as unknown as Bindings;
      await runScheduled(eventFor(CRONS[name]), bindings);
      expect(meter.queries).toBeLessThanOrEqual(CRON_BUDGETS[name].maxQueries);
      expect(meter.rowsRead).toBeLessThanOrEqual(CRON_BUDGETS[name].maxRowsRead);
      expect(meter.rowsWritten).toBeLessThanOrEqual(CRON_BUDGETS[name].maxRowsWritten);
    },
  );
});
