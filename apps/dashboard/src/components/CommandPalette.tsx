/**
 * Paleta ⌘K (ADR 0022, C4): buscar reserva por código, cliente por nombre y
 * unidad por código, y saltar a su pantalla. `cmdk` se instaló aquí a propósito
 * (no en C2). Cero mocks: reusa /admin/bookings?q= y /admin/guests?q= (que ya
 * existen) y el catálogo cacheado para las unidades.
 */
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@logic-camp/ui';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { BookMarked, MapPin, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { apiGet, type BookingListItem, type Catalog, type GuestListItem } from '../api';
import { t } from '../i18n';

const iso = (d: Date) => d.toISOString().slice(0, 10);

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState('');
  const [debounced, setDebounced] = useState('');
  const navigate = useNavigate();

  // atajo global ⌘K / Ctrl-K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // debounce del término (no una petición por tecla)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(term.trim()), 200);
    return () => clearTimeout(id);
  }, [term]);

  // al cerrar, limpiar para no reabrir con resultados viejos
  useEffect(() => {
    if (!open) {
      setTerm('');
      setDebounced('');
    }
  }, [open]);

  const enabled = open && debounced.length >= 2;

  const bookings = useQuery({
    queryKey: ['cmdk', 'bookings', debounced],
    queryFn: () =>
      apiGet<{ items: BookingListItem[] }>(
        `/api/admin/bookings?q=${encodeURIComponent(debounced.toUpperCase())}&pageSize=6`,
      ),
    enabled,
    staleTime: 30_000,
  });
  const guests = useQuery({
    queryKey: ['cmdk', 'guests', debounced],
    queryFn: () =>
      apiGet<{ items: GuestListItem[] }>(
        `/api/admin/guests?q=${encodeURIComponent(debounced)}&pageSize=6`,
      ),
    enabled,
    staleTime: 30_000,
  });
  // las unidades salen del catálogo cacheado, filtradas en cliente
  const catalog = useQuery({
    queryKey: ['catalog'],
    queryFn: () => apiGet<Catalog>('/api/admin/catalog'),
    staleTime: 5 * 60_000,
    enabled: open,
  });

  const units = useMemo(() => {
    if (!enabled || !catalog.data) return [];
    const q = debounced.toLowerCase();
    return catalog.data.units.filter((u) => u.code.toLowerCase().includes(q)).slice(0, 6);
  }, [enabled, catalog.data, debounced]);

  const go = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  const loading = enabled && (bookings.isFetching || guests.isFetching);
  const nothing =
    enabled &&
    !loading &&
    (bookings.data?.items.length ?? 0) === 0 &&
    (guests.data?.items.length ?? 0) === 0 &&
    units.length === 0;

  return (
    <CommandDialog open={open} onOpenChange={setOpen} label={t('cmdk.placeholder')}>
      <CommandInput
        autoFocus
        value={term}
        onValueChange={setTerm}
        placeholder={t('cmdk.placeholder')}
      />
      <CommandList>
        {!enabled && <CommandEmpty>{t('cmdk.escribe')}</CommandEmpty>}
        {loading && <CommandEmpty>{t('cmdk.cargando')}</CommandEmpty>}
        {nothing && <CommandEmpty>{t('cmdk.vacio')}</CommandEmpty>}

        {(bookings.data?.items.length ?? 0) > 0 && (
          <CommandGroup heading={t('cmdk.reservas')}>
            {bookings.data!.items.map((b) => (
              <CommandItem
                key={b.id}
                value={`b-${b.id}`}
                onSelect={() => go(() => navigate({ to: '/reservas/$id', params: { id: b.id } }))}
              >
                <BookMarked className="size-4 shrink-0 text-muted-foreground" />
                <span className="tnum font-semibold">{b.code}</span>
                <span className="truncate text-muted-foreground">{b.leadName ?? '—'}</span>
                <span className={`lc-chip st-${b.status} ml-auto`}>{t(`estado.${b.status}`)}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {(guests.data?.items.length ?? 0) > 0 && (
          <CommandGroup heading={t('cmdk.clientes')}>
            {guests.data!.items.map((g) => (
              <CommandItem
                key={g.id}
                value={`g-${g.id}`}
                onSelect={() => go(() => navigate({ to: '/clientes/$id', params: { id: g.id } }))}
              >
                <Users className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate font-medium">{`${g.name} ${g.surname}`.trim()}</span>
                <span className="truncate text-muted-foreground">{g.email ?? g.phone ?? ''}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {units.length > 0 && (
          <CommandGroup heading={t('cmdk.unidades')}>
            {units.map((u) => (
              <CommandItem
                key={u.id}
                value={`u-${u.id}`}
                onSelect={() =>
                  go(() =>
                    navigate({ to: '/plano', search: { unit: u.id, date: iso(new Date()) } }),
                  )
                }
              >
                <MapPin className="size-4 shrink-0 text-muted-foreground" />
                <span className="tnum font-semibold">{u.code}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
