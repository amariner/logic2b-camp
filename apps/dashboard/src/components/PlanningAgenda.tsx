import { Button, Input, SelectNative, Skeleton } from '@logic-camp/ui';
import { Map as MapIcon, Pencil, Search } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { addDaysIso, isoDay } from '@logic-camp/config';
import type { PlanningBooking, PlanningData } from '../api';
import { t } from '../i18n';
import { fecha } from '../lib/format';
import { QueryError } from './QueryError';

export type AgendaMode = 'day' | 'week';

type StayChange = {
  dateFrom: string;
  dateTo: string;
  unitId: string;
};

type EditorState = StayChange & {
  key: string;
};

type Props = {
  anchor: string;
  mode: AgendaMode;
  data: PlanningData | undefined;
  isPending: boolean;
  isError: boolean;
  error: unknown;
  typeFilter: string;
  statusFilter: string;
  search: string;
  movePending: boolean;
  canEditStay: boolean;
  onAnchorChange: (date: string) => void;
  onModeChange: (mode: AgendaMode) => void;
  onTypeFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onRetry: () => void;
  onOpenBooking: (bookingId: string, opener: HTMLElement) => void;
  onOpenUnit: (unitId: string, date: string) => void;
  onChangeStay: (booking: PlanningBooking, change: StayChange) => void;
};

const agendaStatus = (booking: PlanningBooking) =>
  booking.status === 'confirmed' && booking.checkedInAt && !booking.checkedOutAt
    ? 'inhouse'
    : booking.status;

const dayHeading = (day: string) =>
  new Intl.DateTimeFormat('es', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(`${day}T12:00:00Z`));

function AgendaSkeleton() {
  return (
    <div aria-busy="true" aria-label={t('planning.cargando')} className="space-y-3 px-3 py-4">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="rounded-lg border border-border/60 p-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-3 h-11 w-full" />
        </div>
      ))}
    </div>
  );
}

export default function PlanningAgenda({
  anchor,
  mode,
  data,
  isPending,
  isError,
  error,
  typeFilter,
  statusFilter,
  search,
  movePending,
  canEditStay,
  onAnchorChange,
  onModeChange,
  onTypeFilterChange,
  onStatusFilterChange,
  onSearchChange,
  onRetry,
  onOpenBooking,
  onOpenUnit,
  onChangeStay,
}: Props) {
  const [editor, setEditor] = useState<EditorState | null>(null);
  const editorOpenerRef = useRef<HTMLButtonElement | null>(null);
  const days = useMemo(
    () => Array.from({ length: mode === 'day' ? 1 : 7 }, (_, index) => addDaysIso(anchor, index)),
    [anchor, mode],
  );

  const unitById = useMemo(
    () => new Map((data?.units ?? []).map((unit) => [unit.id, unit])),
    [data],
  );

  const visibleBookings = useMemo(() => {
    if (!data) return [];
    const normalizedSearch = search.trim().toLowerCase();
    return data.bookings
      .filter((booking) => !typeFilter || booking.unitTypeId === typeFilter)
      .filter((booking) => !statusFilter || agendaStatus(booking) === statusFilter)
      .filter((booking) => {
        if (!normalizedSearch) return true;
        const unitCode = booking.unitId ? unitById.get(booking.unitId)?.code : undefined;
        return (
          booking.code.toLowerCase().includes(normalizedSearch) ||
          unitCode?.toLowerCase().includes(normalizedSearch)
        );
      })
      .sort((a, b) => {
        const byArrival = a.dateFrom.localeCompare(b.dateFrom);
        if (byArrival !== 0) return byArrival;
        const unitA = a.unitId ? (unitById.get(a.unitId)?.code ?? '') : '';
        const unitB = b.unitId ? (unitById.get(b.unitId)?.code ?? '') : '';
        return unitA.localeCompare(unitB);
      });
  }, [data, search, statusFilter, typeFilter, unitById]);

  const closeEditor = () => {
    const opener = editorOpenerRef.current;
    setEditor(null);
    requestAnimationFrame(() => {
      if (opener?.isConnected) opener.focus();
    });
  };

  const periodDays = mode === 'day' ? 1 : 7;

  return (
    <section
      role="region"
      aria-label={t('planning.agenda.aria')}
      className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-muted/20"
    >
      <div className="border-b border-border/60 bg-background px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-11"
              onClick={() => onAnchorChange(addDaysIso(anchor, -periodDays))}
              aria-label={t('planning.anterior')}
            >
              ←
            </Button>
            <Button
              variant="outline"
              className="min-h-11 px-3"
              onClick={() => onAnchorChange(isoDay(new Date()))}
            >
              {t('planning.hoy')}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-11"
              onClick={() => onAnchorChange(addDaysIso(anchor, periodDays))}
              aria-label={t('planning.siguiente')}
            >
              →
            </Button>
          </div>
          <div className="flex overflow-hidden rounded-md border border-input">
            {(['day', 'week'] as const).map((item) => (
              <Button
                key={item}
                variant={mode === item ? 'primary' : 'outline'}
                className="min-h-11 rounded-none border-0 border-l border-input px-3 first:border-l-0"
                onClick={() => onModeChange(item)}
                aria-pressed={mode === item}
              >
                {t(`planning.agenda.${item}`)}
              </Button>
            ))}
          </div>
        </div>

        <Input
          type="date"
          aria-label={t('planning.agenda.fecha')}
          value={anchor}
          onChange={(event) => event.target.value && onAnchorChange(event.target.value)}
          className="tnum mt-2 min-h-11 w-full text-base"
        />
      </div>

      {data && (
        <div className="border-b border-border/60 bg-background px-3 py-2">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <SelectNative
              aria-label={t('planning.filtro.tipo')}
              value={typeFilter}
              onChange={(event) => onTypeFilterChange(event.target.value)}
              className="min-h-11 shrink-0 text-base"
            >
              <option value="">{t('planning.filtro.todos')}</option>
              {data.unitTypes.map((unitType) => (
                <option key={unitType.id} value={unitType.id}>
                  {unitType.nameI18n.es ?? unitType.id}
                </option>
              ))}
            </SelectNative>
            <SelectNative
              aria-label={t('planning.filtro.estado')}
              value={statusFilter}
              onChange={(event) => onStatusFilterChange(event.target.value)}
              className="min-h-11 shrink-0 text-base"
            >
              <option value="">{t('planning.filtro.todas')}</option>
              {(['confirmed', 'inhouse', 'pending', 'completed', 'no_show'] as const).map(
                (status) => (
                  <option key={status} value={status}>
                    {t(`estado.${status}`)}
                  </option>
                ),
              )}
            </SelectNative>
          </div>
          <div className="relative mt-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={t('planning.buscar')}
              aria-label={t('planning.buscar')}
              className="min-h-11 w-full pl-9 text-base"
            />
          </div>
        </div>
      )}

      {isPending && <AgendaSkeleton />}
      {isError && <QueryError error={error} onRetry={onRetry} />}

      {data && (
        <div className="space-y-5 px-3 py-4">
          {days.map((day) => {
            const dayBookings = visibleBookings.filter(
              (booking) => booking.dateFrom <= day && day < booking.dateTo,
            );
            return (
              <section key={day} aria-labelledby={`agenda-${day}`}>
                <div className="mb-2 flex items-baseline justify-between gap-2">
                  <h2 id={`agenda-${day}`} className="text-sm font-semibold capitalize">
                    {dayHeading(day)}
                  </h2>
                  <span className="tnum text-xs text-muted-foreground">
                    {dayBookings.length === 1
                      ? t('planning.agenda.conteoUno')
                      : t('planning.agenda.conteo', { n: dayBookings.length })}
                  </span>
                </div>

                {dayBookings.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
                    {t('planning.agenda.vacio')}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {dayBookings.map((booking) => {
                      const unit = booking.unitId ? unitById.get(booking.unitId) : undefined;
                      const status = agendaStatus(booking);
                      const pax = booking.occupancy.adults + booking.occupancy.childrenAges.length;
                      const editorKey = `${day}:${booking.id}`;
                      const editing = editor?.key === editorKey;
                      const canMove =
                        canEditStay &&
                        Boolean(unit) &&
                        (booking.status === 'pending' || booking.status === 'confirmed');
                      const compatibleUnits = data.units.filter(
                        (candidate) =>
                          candidate.unitTypeId === booking.unitTypeId &&
                          candidate.status === 'active',
                      );
                      const unchanged =
                        editor?.dateFrom === booking.dateFrom &&
                        editor.dateTo === booking.dateTo &&
                        editor.unitId === booking.unitId;
                      const valid = Boolean(
                        editor && editor.dateFrom < editor.dateTo && editor.unitId,
                      );

                      return (
                        <article
                          key={booking.id}
                          className="overflow-hidden rounded-lg border border-border/70 bg-background shadow-xs"
                        >
                          <div className="flex items-stretch">
                            <Button
                              variant="ghost"
                              className="h-auto min-h-11 min-w-0 flex-1 justify-start rounded-none px-3 py-2 text-left"
                              aria-label={t('planning.agenda.abrir', {
                                code: booking.code,
                                unit: unit?.code ?? t('ficha.sinAsignar'),
                              })}
                              onClick={(event) => onOpenBooking(booking.id, event.currentTarget)}
                            >
                              <span className="min-w-0">
                                <span className="flex items-center gap-2">
                                  <span className="tnum truncate text-sm font-semibold">
                                    {booking.code}
                                  </span>
                                  <span className={`lc-chip st-${status} shrink-0`}>
                                    {t(`estado.${status}`)}
                                  </span>
                                </span>
                                <span className="tnum mt-1 block text-xs font-normal text-muted-foreground">
                                  {fecha(booking.dateFrom)} → {fecha(booking.dateTo)} ·{' '}
                                  {t('planning.pax', { n: pax })}
                                </span>
                              </span>
                            </Button>
                            {unit && (
                              <Button
                                variant="outline"
                                className="h-auto min-h-11 shrink-0 rounded-none border-y-0 border-r-0 px-3"
                                aria-label={t('planning.agenda.verUnidad', { unit: unit.code })}
                                onClick={() => onOpenUnit(unit.id, day)}
                              >
                                <MapIcon className="size-4" />
                                <span className="tnum">{unit.code}</span>
                              </Button>
                            )}
                          </div>

                          {canMove && (
                            <Button
                              variant="ghost"
                              className="min-h-11 w-full justify-start rounded-none border-t border-border/60 px-3"
                              aria-expanded={editing}
                              aria-label={t('planning.agenda.editar', { code: booking.code })}
                              onClick={(event) => {
                                editorOpenerRef.current = event.currentTarget;
                                setEditor({
                                  key: editorKey,
                                  dateFrom: booking.dateFrom,
                                  dateTo: booking.dateTo,
                                  unitId: booking.unitId!,
                                });
                              }}
                            >
                              <Pencil className="size-4" />
                              {t('planning.agenda.editarVisible')}
                            </Button>
                          )}

                          {editing && editor && (
                            <form
                              role="group"
                              aria-label={t('planning.agenda.editor', { code: booking.code })}
                              className="grid gap-3 border-t border-border/60 bg-muted/30 p-3"
                              onSubmit={(event) => {
                                event.preventDefault();
                                if (!valid || unchanged || movePending) return;
                                onChangeStay(booking, editor);
                                closeEditor();
                              }}
                            >
                              <div className="grid grid-cols-2 gap-2">
                                <label className="grid gap-1 text-xs font-semibold text-muted-foreground">
                                  {t('planning.agenda.entrada')}
                                  <Input
                                    type="date"
                                    aria-label={t('planning.agenda.entrada')}
                                    value={editor.dateFrom}
                                    max={addDaysIso(editor.dateTo, -1)}
                                    onChange={(event) =>
                                      setEditor({ ...editor, dateFrom: event.target.value })
                                    }
                                    className="tnum min-h-11 min-w-0 px-2 text-base"
                                  />
                                </label>
                                <label className="grid gap-1 text-xs font-semibold text-muted-foreground">
                                  {t('planning.agenda.salida')}
                                  <Input
                                    type="date"
                                    aria-label={t('planning.agenda.salida')}
                                    value={editor.dateTo}
                                    min={addDaysIso(editor.dateFrom, 1)}
                                    onChange={(event) =>
                                      setEditor({ ...editor, dateTo: event.target.value })
                                    }
                                    className="tnum min-h-11 min-w-0 px-2 text-base"
                                  />
                                </label>
                              </div>
                              <label className="grid gap-1 text-xs font-semibold text-muted-foreground">
                                {t('planning.agenda.unidad')}
                                <SelectNative
                                  aria-label={t('planning.agenda.unidad')}
                                  value={editor.unitId}
                                  onChange={(event) =>
                                    setEditor({ ...editor, unitId: event.target.value })
                                  }
                                  className="min-h-11 w-full text-base"
                                >
                                  {compatibleUnits.map((candidate) => (
                                    <option key={candidate.id} value={candidate.id}>
                                      {candidate.code}
                                    </option>
                                  ))}
                                </SelectNative>
                              </label>
                              <div className="grid grid-cols-2 gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="min-h-11"
                                  onClick={closeEditor}
                                >
                                  {t('planning.precio.cancelar')}
                                </Button>
                                <Button
                                  type="submit"
                                  className="min-h-11"
                                  disabled={!valid || unchanged || movePending}
                                >
                                  {movePending
                                    ? t('planning.agenda.aplicando')
                                    : t('planning.agenda.aplicar')}
                                </Button>
                              </div>
                            </form>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}
