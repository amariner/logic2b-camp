/**
 * Política única de Cron Triggers y presupuesto D1.
 *
 * Las cifras son topes de diseño, no una factura reconstruida: cada job limita
 * sus lotes en código y los tests impiden ampliar este plan sin revisar cuota y
 * tablas afectadas.
 */
export const CRONS = {
  daily: '17 8 * * *',
  weekly: '37 3 * * 1',
} as const;

export type CronName = keyof typeof CRONS;
export type CronTaskPlan = {
  task: string;
  maxQueries: number;
  maxRowsRead: number;
  maxRowsWritten: number;
  writes: readonly string[];
};

export const PROTECTED_CRON_TABLES = new Set([
  'tenants',
  'seasons_calendar',
  'unit_types',
  'units',
  'rate_plans',
  'rate_rules',
  'extras',
  'inventory_blocks',
  'users',
  'accounts',
  'sessions',
  'verifications',
]);

export const CRON_BUDGETS = {
  daily: { maxQueries: 70, maxRowsRead: 10_000, maxRowsWritten: 100 },
  weekly: { maxQueries: 140, maxRowsRead: 20_000, maxRowsWritten: 250 },
} as const;

export const CRON_TASKS: Record<CronName, readonly CronTaskPlan[]> = {
  daily: [
    {
      task: 'purge_holds',
      maxQueries: 2,
      maxRowsRead: 251,
      maxRowsWritten: 50,
      writes: ['inventory_holds'],
    },
    {
      task: 'stuck_pending',
      maxQueries: 31,
      maxRowsRead: 2_500,
      maxRowsWritten: 25,
      writes: ['notifications_log'],
    },
    {
      task: 'arrival_reminders',
      maxQueries: 31,
      maxRowsRead: 2_500,
      maxRowsWritten: 25,
      writes: ['notifications_log'],
    },
  ],
  weekly: [
    {
      task: 'retention_sweep',
      maxQueries: 110,
      maxRowsRead: 15_000,
      maxRowsWritten: 150,
      writes: ['guests', 'bookings', 'audit_log'],
    },
    {
      task: 'enquiry_retention',
      maxQueries: 26,
      maxRowsRead: 501,
      maxRowsWritten: 25,
      writes: ['enquiries'],
    },
  ],
};

export function cronName(cron: string): CronName | null {
  if (cron === CRONS.daily) return 'daily';
  if (cron === CRONS.weekly) return 'weekly';
  return null;
}

export function assertCronBudget(name: CronName): void {
  assertBudgetPlan(name, CRON_BUDGETS[name], CRON_TASKS[name]);
}

export function assertBudgetPlan(
  name: string,
  budget: { maxQueries: number; maxRowsRead: number; maxRowsWritten: number },
  plan: readonly CronTaskPlan[],
): void {
  const sum = (field: 'maxQueries' | 'maxRowsRead' | 'maxRowsWritten') =>
    plan.reduce((total, task) => total + task[field], 0);
  for (const task of plan) {
    const forbidden = task.writes.filter((table) => PROTECTED_CRON_TABLES.has(table));
    if (forbidden.length) {
      throw new Error(`cron ${name}/${task.task} intenta escribir tablas protegidas: ${forbidden}`);
    }
  }
  if (sum('maxQueries') > budget.maxQueries) throw new Error(`cron ${name} excede maxQueries`);
  if (sum('maxRowsRead') > budget.maxRowsRead) throw new Error(`cron ${name} excede maxRowsRead`);
  if (sum('maxRowsWritten') > budget.maxRowsWritten)
    throw new Error(`cron ${name} excede maxRowsWritten`);
}
