import { Toaster as Sonner, toast } from 'sonner';

/**
 * Toasts (sonner) con los tokens del DS (ADR 0020, C3).
 *
 * Sustituye al `useState<{text, error}>` que estaba copiado a mano en 6 ficheros
 * y se pintaba como un `<p>` que no desaparecía solo.
 *
 * Se estiliza por `toastOptions.classNames` en vez de por el tema propio de
 * sonner: así el toast usa exactamente los mismos tokens que el resto del
 * producto y no una segunda paleta que se desincronice.
 */
export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      // La recepcionista no mira la esquina de la pantalla: si algo importa,
      // tiene que durar lo bastante como para leerlo con una llamada en curso.
      duration={5000}
      toastOptions={{
        classNames: {
          toast:
            'group flex items-center gap-3 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-lg',
          title: 'text-[13px] font-medium',
          description: 'text-[12px] text-muted-foreground',
          actionButton:
            'ml-auto shrink-0 rounded-md bg-primary px-2.5 py-1 text-[12px] font-medium text-primary-foreground hover:opacity-90',
          cancelButton:
            'shrink-0 rounded-md px-2.5 py-1 text-[12px] font-medium text-muted-foreground hover:bg-accent',
          error: 'border-destructive/40',
        },
      }}
    />
  );
}

export { toast };
