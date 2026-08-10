/**
 * Ajustes del camping (ADR 0008, sesión 20). Edita lo operativo (nombre, zona,
 * moneda) vía PATCH /api/admin/settings (gerencia, auditado). Nivel e idiomas
 * se muestran pero se cambian con Logic2B: afectan al despliegue de la web.
 *
 * C3 (ADR 0020): feedback por toast, esqueleto con forma de formulario y los
 * toggles de notificación con el `Switch` del DS.
 *
 * B1 (sesión 59): las tres secciones pasan a `Card` en rejilla de dos columnas
 * —una sola columna de 576px dejaba dos tercios del lienzo vacíos a 1366px— y,
 * sobre todo, **notificaciones deja de vivir dentro del formulario de datos**:
 * sus dos campos estaban en el mismo `<form>` cuyo submit guarda nombre/zona/
 * moneda, así que pulsar Intro en «Buzón interno» disparaba el guardado
 * equivocado (o ninguno, si los datos no estaban sucios) y el correo escrito se
 * perdía sin decir nada. Dos formularios, dos submits.
 */
import { errorMutacion } from '../avisos';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Skeleton,
  Switch,
  toast,
} from '@logic-camp/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiGet, apiPatch, type TenantSettings } from '../api';
import { usePuede } from '../auth';
import { QueryError } from '../components/QueryError';
import { t } from '../i18n';
import { BotonAyuda } from '../components/BotonAyuda';

const ETIQUETA = 'text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase';

/** La rejilla que comparten el esqueleto y el contenido: misma forma al cargar. */
const REJILLA = 'grid items-start gap-4 p-4 lg:grid-cols-2';

/** Esqueleto con la forma real: la ficha de datos + la de notificaciones. */
function AjustesEsqueleto() {
  return (
    <div aria-busy="true" className={REJILLA}>
      <Card className="p-5">
        <Skeleton className="h-3.5 w-40" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="mt-4 flex flex-col gap-1.5">
            <Skeleton className="h-2.5 w-28" />
            <Skeleton className={i === 2 ? 'h-8 w-24' : 'h-8 w-full max-w-sm'} />
          </div>
        ))}
        <Skeleton className="mt-4 h-8 w-40" />
      </Card>
      <Card className="p-5">
        <Skeleton className="h-3.5 w-48" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="mt-3 flex items-center gap-2">
            <Skeleton className="h-5 w-9 rounded-full" />
            <Skeleton className="h-2.5 w-56" />
          </div>
        ))}
      </Card>
    </div>
  );
}

export default function Ajustes() {
  const qc = useQueryClient();
  const puedeEditar = usePuede('settings:manage');
  const [draft, setDraft] = useState<
    Partial<Pick<TenantSettings, 'name' | 'timezone' | 'currency'>>
  >({});

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['settings'],
    queryFn: () => apiGet<TenantSettings>('/api/admin/settings'),
  });

  const guardar = useMutation({
    mutationFn: (patch: typeof draft) => apiPatch('/api/admin/settings', patch),
    onSuccess: () => {
      toast.success(t('aju.guardado'));
      setDraft({});
      void qc.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (e) => errorMutacion(e, t('aju.errorGuardar')),
  });

  const sucia = Object.keys(draft).length > 0;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border/60 px-4 py-2.5">
        <p className="text-[12px] text-muted-foreground">{t('aju.nota')}</p>
        <BotonAyuda className="ml-auto" />
      </div>

      {isPending && <AjustesEsqueleto />}
      {isError && <QueryError error={error} onRetry={() => void refetch()} />}

      {data && (
        <div className={`min-h-0 flex-1 overflow-y-auto text-[13px] ${REJILLA}`}>
          {/* Las dos fichas cortas apiladas en UNA celda: como celdas hermanas,
              la fila la estiraba «Notificaciones» y quedaban 200px muertos. */}
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('aju.datos')}</CardTitle>
                <CardDescription className="text-[13px]">{t('aju.datosNota')}</CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  className="flex flex-col gap-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (sucia && !guardar.isPending) guardar.mutate(draft);
                  }}
                >
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="aju-nombre">{t('aju.nombre')}</Label>
                    <Input
                      id="aju-nombre"
                      type="text"
                      value={draft.name ?? data.name}
                      onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                      disabled={!puedeEditar}
                      className="max-w-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="aju-zona">{t('aju.zona')}</Label>
                    <Input
                      id="aju-zona"
                      type="text"
                      value={draft.timezone ?? data.timezone}
                      onChange={(e) => setDraft((d) => ({ ...d, timezone: e.target.value }))}
                      disabled={!puedeEditar}
                      className="max-w-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="aju-moneda">{t('aju.moneda')}</Label>
                    <Input
                      id="aju-moneda"
                      type="text"
                      maxLength={3}
                      value={draft.currency ?? data.currency}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, currency: e.target.value.toUpperCase() }))
                      }
                      disabled={!puedeEditar}
                      className="tnum w-24"
                    />
                  </div>
                  {puedeEditar && (
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!sucia || guardar.isPending}
                      className="w-fit"
                    >
                      {t('aju.guardar')}
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Solo lectura, y por eso ficha aparte: mientras vivía entre el
                último campo editable y el botón de guardar, parecía parte del
                formulario. */}
            <Card>
              <CardHeader>
                <CardTitle>{t('aju.gestionado')}</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-muted-foreground">
                  <dt className={ETIQUETA}>{t('aju.nivel')}</dt>
                  <dd className="font-medium text-foreground">
                    {t(`aju.nivel${data.tier as 1 | 2 | 3 | 4}`)} · {data.tier}
                  </dd>
                  <dt className={ETIQUETA}>{t('aju.idiomas')}</dt>
                  <dd className="tnum uppercase">{data.locales.join(' · ')}</dd>
                </dl>
              </CardContent>
            </Card>
          </div>

          <Notificaciones data={data} editable={puedeEditar} />
        </div>
      )}
    </div>
  );
}

/** on/off por evento SIN deploy (ADR 0010): edita modules.notifications vía el PATCH auditado. */
const EVENTOS = [
  'enquiry_received',
  'enquiry_autoreply',
  'booking_confirmed',
  'booking_cancelled',
  'booking_pending_stuck',
  'booking_reminder',
] as const;

type NotifConfig = {
  enabled?: Partial<Record<(typeof EVENTOS)[number], boolean>>;
  from?: string;
  notifyTo?: string;
};

function Notificaciones({ data, editable }: { data: TenantSettings; editable: boolean }) {
  const qc = useQueryClient();
  const actual = (data.modules.notifications ?? {}) as NotifConfig;
  const [draft, setDraft] = useState<NotifConfig | null>(null); // null = sin cambios
  const config = draft ?? actual;

  const guardar = useMutation({
    mutationFn: (next: NotifConfig) =>
      apiPatch('/api/admin/settings', { modules: { ...data.modules, notifications: next } }),
    onSuccess: () => {
      setDraft(null);
      // Dos formularios, dos avisos: con el genérico, guardar notificaciones
      // decía «Ajustes guardados» y no había forma de saber cuál de los dos.
      toast.success(t('aju.guardadoNotif'));
      void qc.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (e) => errorMutacion(e, t('aju.errorGuardar')),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('aju.notificaciones')}</CardTitle>
        <CardDescription className="text-[13px]">{t('aju.notifNota')}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* `<form>` propio: sus campos ya no cuelgan del formulario de datos, así
            que Intro aquí guarda ESTO y no el nombre del camping. */}
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (draft !== null && !guardar.isPending) guardar.mutate(draft);
          }}
        >
          {EVENTOS.map((ev) => (
            <div key={ev} className="flex items-center gap-2 py-0.5">
              <Switch
                id={`aju-notif-${ev}`}
                checked={config.enabled?.[ev] ?? true}
                disabled={!editable}
                onCheckedChange={(checked) =>
                  setDraft({
                    ...config,
                    enabled: { ...config.enabled, [ev]: checked },
                  })
                }
              />
              <Label
                htmlFor={`aju-notif-${ev}`}
                className="text-[13px] normal-case tracking-normal font-normal text-foreground"
              >
                {t(`notif.${ev}`)}
              </Label>
            </div>
          ))}
          <div className="mt-2 flex flex-col gap-1.5">
            <Label htmlFor="aju-notif-from">{t('aju.notifFrom')}</Label>
            <Input
              id="aju-notif-from"
              type="text"
              placeholder="Camping X <reservas@campingx.com>"
              value={config.from ?? ''}
              onChange={(e) => setDraft({ ...config, from: e.target.value })}
              disabled={!editable}
              className="max-w-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="aju-notif-to">{t('aju.notifTo')}</Label>
            <Input
              id="aju-notif-to"
              type="email"
              value={config.notifyTo ?? ''}
              onChange={(e) => setDraft({ ...config, notifyTo: e.target.value })}
              disabled={!editable}
              className="max-w-sm"
            />
          </div>
          {editable && (
            <Button
              type="submit"
              size="sm"
              disabled={draft === null || guardar.isPending}
              className="mt-2 w-fit"
            >
              {t('aju.guardarNotif')}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
