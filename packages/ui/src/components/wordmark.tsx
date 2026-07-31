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
const MATRIZ = 'https://logic2b.com';
const PRODUCTO = 'https://camp.logic2b.com';

export function Wordmark({
  className,
  variant = 'full',
  enlazado = false,
  ...props
}: {
  className?: string;
  /** `full` = Logic2B Campings · `brand` = Logic2B · `compact` = 2B */
  variant?: 'full' | 'brand' | 'compact';
  /**
   * Parte el lockup en DOS enlaces, como el gemelo Astro de la landing: «Logic2B»
   * a la matriz y «Campings» al sitio del producto. Por eso el envoltorio nunca
   * es un `<a>` — HTML no permite anidar enlaces — y cada mitad lleva su
   * `aria-label`, porque «Campings» a secas no dice adónde va.
   *
   * Salen del dashboard, así que `target="_blank"`: quien está en el mostrador
   * no quiere perder la pantalla en la que estaba trabajando.
   */
  enlazado?: boolean;
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

  if (enlazado) {
    const mitad = 'transition-opacity hover:opacity-70';
    return (
      <span className={base} {...props}>
        <a
          href={MATRIZ}
          target="_blank"
          rel="noreferrer"
          className={mitad}
          aria-label="Logic2B — ir a logic2b.com"
        >
          Logic<span className="font-extrabold text-logo-2b">2B</span>
        </a>
        {/* el espacio queda FUERA de los dos enlaces: si no, al pasar por encima
            se subraya un espacio suelto que no pertenece a ninguna mitad */}
        {variant === 'full' && ' '}
        {variant === 'full' && (
          <a
            href={PRODUCTO}
            target="_blank"
            rel="noreferrer"
            className={cn(mitad, 'text-muted-foreground')}
            aria-label="Logic2B Campings — ir a camp.logic2b.com"
          >
            Campings
          </a>
        )}
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
