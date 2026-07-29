import { cn } from '../lib/cn';

/**
 * Wordmark «Logic2B Campings» — el logo del producto (docs/BRAND.md §2).
 *
 * Solo texto: **el isotipo queda retirado** (decisión de Andreu, sesión 59).
 * El lockup es el de `logic2b-norte`: Poppins, «Logic» en 600 a plena tinta y
 * «2B» en 800 un punto por debajo (`--logo-2b`) — el salto de peso ES la marca,
 * así que hace falta la cara real de 800; con negrita sintética el trazo sale
 * sucio en hidpi. «Campings» hereda el 600 y baja a gris de cuerpo: nombra el
 * vertical sin competir con la marca.
 *
 * `tracking` abierto (.015em) → lockup geométrico. Vive aquí y no en cada app
 * para que cabecera, pie y login no puedan divergir.
 *
 * Tres variantes, no una con recortes: la sidebar plegada son 56px y ahí no
 * cabe ni «Logic2B». Al retirar el isotipo alguien tiene que ocupar ese hueco,
 * y «2B» es la parte distintiva del lockup — no un símbolo nuevo.
 */
export function Wordmark({
  className,
  variant = 'full',
  ...props
}: {
  className?: string;
  /** `full` = Logic2B Campings · `brand` = Logic2B · `compact` = 2B */
  variant?: 'full' | 'brand' | 'compact';
} & React.HTMLAttributes<HTMLSpanElement>) {
  const base = cn(
    'font-wordmark inline-block leading-none font-semibold tracking-[0.015em] text-foreground',
    className,
  );

  if (variant === 'compact') {
    // Nombre accesible completo: lo que se recorta es el dibujo, no la marca.
    return (
      <span className={base} aria-label="Logic2B Campings" {...props}>
        <span aria-hidden="true" className="font-extrabold text-logo-2b">
          2B
        </span>
      </span>
    );
  }

  return (
    <span className={base} {...props}>
      Logic<span className="font-extrabold text-logo-2b">2B</span>
      {variant === 'full' && <span className="text-muted-foreground"> Campings</span>}
    </span>
  );
}
