/**
 * Modo oscuro del dashboard (ADR 0023, C1.5 — desbloqueado al cerrar el mapa de
 * color). Tres estados cíclicos: claro → oscuro → sistema. Persistido en
 * localStorage ('lc-theme'); "sistema" sigue a prefers-color-scheme en vivo.
 * El primer pintado sin parpadeo lo resuelve el script inline de index.html
 * (mismo patrón sin-FOUC que el selector de temas de la web, ADR 0009).
 */
import { Button } from '@logic-camp/ui';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { t } from '../i18n';

type Theme = 'light' | 'dark' | 'system';
const KEY = 'lc-theme';
const NEXT: Record<Theme, Theme> = { light: 'dark', dark: 'system', system: 'light' };
const ICON: Record<Theme, typeof Sun> = { light: Sun, dark: Moon, system: Monitor };

const apply = (theme: Theme) => {
  const dark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
};

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const v = localStorage.getItem(KEY);
      return v === 'dark' || v === 'light' ? v : 'system';
    } catch {
      return 'system';
    }
  });

  useEffect(() => {
    apply(theme);
    if (theme !== 'system') return;
    // en "sistema", si el SO cambia de tema a media tarde, el dashboard le sigue
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => apply('system');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [theme]);

  const Icon = ICON[theme];
  return (
    <Button
      variant="ghost"
      size="iconSm"
      className="size-11 md:size-8"
      onClick={() => {
        const next = NEXT[theme];
        try {
          localStorage.setItem(KEY, next);
        } catch {
          /* modo privado: no persiste, no pasa nada */
        }
        setTheme(next);
      }}
      title={t(`tema.${theme}`)}
      aria-label={t(`tema.${theme}`)}
    >
      <Icon className="size-4" />
    </Button>
  );
}
