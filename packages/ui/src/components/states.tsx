import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../lib/cn';

/**
 * Estados vacío / error / cargando (ADR 0020, C3).
 *
 * La ilustración es deliberadamente **monocroma y de trazo** (docs/BRAND.md, y
 * el antimodelo explícito de CLAUDE.md: nada de mascotas ni isometrías). Usa
 * `currentColor`, así que hereda el tono del contenedor y funciona en claro y
 * oscuro sin una segunda versión.
 */

export function Spinner({ className, ...props }: ComponentProps<'svg'>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn('size-4 animate-spin motion-reduce:animate-none', className)}
      {...props}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.5" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Ilustraciones de estado vacío. Trazo fino, sin relleno, sin color propio. */
const art = {
  /* Calendario vacío — para "no hay llegadas/reservas". */
  calendar: (
    <>
      <rect x="8" y="14" width="48" height="42" rx="4" />
      <path d="M8 26h48M20 8v10M44 8v10" />
      <path d="M20 38h8M36 38h8M20 48h8" strokeOpacity="0.45" />
    </>
  ),
  /* Bandeja vacía — para solicitudes / notificaciones. */
  inbox: (
    <>
      <path d="M8 36 18 12h28l10 24v16a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V36Z" />
      <path d="M8 36h14l3 7h14l3-7h14" />
    </>
  ),
  /* Búsqueda sin resultados. */
  search: (
    <>
      <circle cx="28" cy="28" r="16" />
      <path d="m40 40 14 14" strokeLinecap="round" />
    </>
  ),
} as const;

export type EmptyArt = keyof typeof art;

export function EmptyState({
  art: kind = 'inbox',
  title,
  description,
  action,
  className,
}: {
  art?: EmptyArt;
  title: string;
  description?: string;
  /** La salida. Un vacío sin salida es un callejón, no un estado. */
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn('flex flex-col items-center gap-3 px-6 py-14 text-center', className)}
      data-slot="empty-state"
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        aria-hidden="true"
        className="size-14 text-muted-foreground/35"
      >
        {art[kind]}
      </svg>
      <p className="text-[14px] font-medium text-foreground">{title}</p>
      {description && (
        <p className="max-w-sm text-[13px] leading-relaxed text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-1 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}

/**
 * Error a la vista del usuario. Siempre con salida: un error sin acción es una
 * pantalla muerta, que es exactamente lo que C3 viene a quitar.
 */
export function ErrorState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn('flex flex-col items-center gap-3 px-6 py-14 text-center', className)}
      data-slot="error-state"
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
        className="size-14 text-destructive/45"
      >
        <path d="M32 10 58 54H6L32 10Z" strokeLinejoin="round" />
        <path d="M32 26v12" />
        <circle cx="32" cy="45" r="1.6" fill="currentColor" />
      </svg>
      <p className="text-[14px] font-medium text-foreground">{title}</p>
      {description && (
        <p className="max-w-sm text-[13px] leading-relaxed text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-1 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}
