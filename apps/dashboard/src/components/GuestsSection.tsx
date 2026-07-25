/**
 * Huéspedes editables de una reserva (ADR 0022 §2): sin esto no hay parte de
 * viajeros, requisito legal en un camping español. Hasta C4 la ficha solo los
 * MOSTRABA. Añadir / editar documento / quitar acompañante, contra las rutas
 * genéricas de /admin. El servidor audita cada cambio.
 */
import { errorMutacion } from '../avisos';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Input,
  Label,
  SelectNative,
  toast,
} from '@logic-camp/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { apiDelete, apiPatch, apiPost, type BookingGuest } from '../api';
import { t } from '../i18n';

const DOC_TYPES = ['dni', 'nie', 'passport', 'other'] as const;

type GuestForm = {
  name: string;
  surname: string;
  secondSurname: string;
  sex: string;
  docType: string;
  docNumber: string;
  docSupportNumber: string;
  kinship: string;
  birthdate: string;
  nationality: string;
  email: string;
  phone: string;
};

const emptyForm: GuestForm = {
  name: '',
  surname: '',
  secondSurname: '',
  sex: '',
  docType: '',
  docNumber: '',
  docSupportNumber: '',
  kinship: '',
  birthdate: '',
  nationality: '',
  email: '',
  phone: '',
};

const fromGuest = (g: BookingGuest): GuestForm => ({
  name: g.name,
  surname: g.surname,
  secondSurname: g.secondSurname ?? '',
  sex: g.sex ?? '',
  docType: g.docType ?? '',
  docNumber: g.docNumber ?? '',
  docSupportNumber: g.docSupportNumber ?? '',
  kinship: g.kinship ?? '',
  birthdate: g.birthdate ?? '',
  nationality: g.nationality ?? '',
  email: g.email ?? '',
  phone: g.phone ?? '',
});

/** Los campos vacíos van como null en el PATCH (la BD no guarda cadenas vacías). */
const toPatch = (f: GuestForm) => ({
  name: f.name,
  surname: f.surname,
  secondSurname: f.secondSurname || null,
  sex: f.sex || null,
  docType: f.docType || null,
  docNumber: f.docNumber || null,
  docSupportNumber: f.docSupportNumber || null,
  kinship: f.kinship || null,
  birthdate: f.birthdate || null,
  nationality: f.nationality || null,
  email: f.email || null,
  phone: f.phone || null,
});

function GuestFields({
  form,
  set,
  idPrefix,
}: {
  form: GuestForm;
  set: (patch: Partial<GuestForm>) => void;
  idPrefix: string;
}) {
  const input = 'w-full text-[13px]';
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor={`${idPrefix}-name`}>{t('huesped.nombre')}</Label>
          <Input
            id={`${idPrefix}-name`}
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            className={input}
          />
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-surname`}>{t('huesped.apellidos')}</Label>
          <Input
            id={`${idPrefix}-surname`}
            value={form.surname}
            onChange={(e) => set({ surname: e.target.value })}
            className={input}
          />
        </div>
      </div>
      {/* Campos del parte de viajeros (ADR 0028): 2º apellido y sexo. */}
      <div className="grid grid-cols-[1.5fr_1fr] gap-2">
        <div>
          <Label htmlFor={`${idPrefix}-surname2`}>{t('huesped.segundoApellido')}</Label>
          <Input
            id={`${idPrefix}-surname2`}
            value={form.secondSurname}
            onChange={(e) => set({ secondSurname: e.target.value })}
            className={input}
          />
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-sex`}>{t('huesped.sexo')}</Label>
          <SelectNative
            id={`${idPrefix}-sex`}
            value={form.sex}
            onChange={(e) => set({ sex: e.target.value })}
            className={input}
          >
            <option value="">{t('huesped.sinDato')}</option>
            <option value="M">{t('huesped.sexoM')}</option>
            <option value="F">{t('huesped.sexoF')}</option>
          </SelectNative>
        </div>
      </div>
      <div className="grid grid-cols-[1fr_1.2fr] gap-2">
        <div>
          <Label htmlFor={`${idPrefix}-doctype`}>{t('huesped.docTipo')}</Label>
          <SelectNative
            id={`${idPrefix}-doctype`}
            value={form.docType}
            onChange={(e) => set({ docType: e.target.value })}
            className={input}
          >
            <option value="">{t('huesped.sinDoc')}</option>
            {DOC_TYPES.map((d) => (
              <option key={d} value={d}>
                {t(`doc.${d}`)}
              </option>
            ))}
          </SelectNative>
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-docnum`}>{t('huesped.docNumero')}</Label>
          <Input
            id={`${idPrefix}-docnum`}
            value={form.docNumber}
            onChange={(e) => set({ docNumber: e.target.value })}
            className={`${input} tnum`}
          />
        </div>
      </div>
      {/* Nº de soporte del documento (dato del parte distinto del número) y parentesco
          — este último SOLO aplica a menores de 14 (ADR 0028). */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor={`${idPrefix}-docsup`}>{t('huesped.docSoporte')}</Label>
          <Input
            id={`${idPrefix}-docsup`}
            value={form.docSupportNumber}
            onChange={(e) => set({ docSupportNumber: e.target.value })}
            className={`${input} tnum`}
          />
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-kinship`}>{t('huesped.parentesco')}</Label>
          <Input
            id={`${idPrefix}-kinship`}
            value={form.kinship}
            placeholder={t('huesped.parentescoAyuda')}
            onChange={(e) => set({ kinship: e.target.value })}
            className={input}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor={`${idPrefix}-birth`}>{t('huesped.nacimiento')}</Label>
          <Input
            id={`${idPrefix}-birth`}
            type="date"
            value={form.birthdate}
            onChange={(e) => set({ birthdate: e.target.value })}
            className={`${input} tnum`}
          />
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-nat`}>{t('huesped.nacionalidad')}</Label>
          <Input
            id={`${idPrefix}-nat`}
            maxLength={2}
            value={form.nationality}
            onChange={(e) => set({ nationality: e.target.value.toUpperCase() })}
            className={`${input} tnum`}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor={`${idPrefix}-email`}>{t('huesped.email')}</Label>
          <Input
            id={`${idPrefix}-email`}
            type="email"
            value={form.email}
            onChange={(e) => set({ email: e.target.value })}
            className={input}
          />
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-phone`}>{t('huesped.telefono')}</Label>
          <Input
            id={`${idPrefix}-phone`}
            type="tel"
            value={form.phone}
            onChange={(e) => set({ phone: e.target.value })}
            className={`${input} tnum`}
          />
        </div>
      </div>
    </div>
  );
}

function GuestRow({
  bookingId,
  guest,
  invalidate,
}: {
  bookingId: string;
  guest: BookingGuest;
  invalidate: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<GuestForm>(() => fromGuest(guest));

  const save = useMutation({
    mutationFn: () => apiPatch(`/api/admin/guests/${guest.id}`, toPatch(form)),
    onSuccess: () => {
      toast.success(t('ficha.huespedGuardado'));
      setEditing(false);
      invalidate();
    },
    onError: (e) => errorMutacion(e, t('ficha.huespedError')),
  });
  const remove = useMutation({
    mutationFn: () => apiDelete(`/api/admin/bookings/${bookingId}/guests/${guest.id}`),
    onSuccess: () => {
      toast.success(t('ficha.huespedQuitado'));
      invalidate();
    },
    onError: (e) => errorMutacion(e, t('ficha.huespedError')),
  });

  if (editing)
    return (
      <li className="rounded-(--lc-radius) border border-border/60 p-2">
        <GuestFields
          form={form}
          set={(p) => setForm((f) => ({ ...f, ...p }))}
          idPrefix={`edit-${guest.id}`}
        />
        <div className="mt-2 flex gap-2">
          <Button
            type="button"
            size="xs"
            disabled={!form.name || !form.surname || save.isPending}
            onClick={() => save.mutate()}
          >
            {t('ficha.guardarHuesped')}
          </Button>
          <Button
            type="button"
            size="xs"
            variant="outline"
            onClick={() => {
              setForm(fromGuest(guest));
              setEditing(false);
            }}
          >
            {t('ficha.cancelarEdicion')}
          </Button>
        </div>
      </li>
    );

  return (
    <li className="flex items-start justify-between gap-2 py-1">
      <div className="min-w-0">
        <p className="truncate font-medium">
          {guest.name} {guest.surname}
          {guest.isLead && (
            <span className="ml-1 text-[11px] text-muted-foreground">· {t('ficha.titular')}</span>
          )}
        </p>
        {guest.docNumber && (
          <p className="tnum text-muted-foreground">
            {guest.docType?.toUpperCase()} {guest.docNumber}
            {guest.nationality && ` · ${guest.nationality}`}
          </p>
        )}
      </div>
      <div className="flex shrink-0 gap-0.5">
        <Button
          type="button"
          size="iconSm"
          variant="ghost"
          aria-label={t('ficha.editarHuesped')}
          title={t('ficha.editarHuesped')}
          onClick={() => setEditing(true)}
        >
          <Pencil className="size-3.5" />
        </Button>
        {!guest.isLead && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                size="iconSm"
                variant="ghost"
                aria-label={t('ficha.quitarHuesped')}
                title={t('ficha.quitarHuesped')}
                disabled={remove.isPending}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {t('confirmar.quitarHuesped.titulo', {
                    nombre: `${guest.name} ${guest.surname}`.trim(),
                  })}
                </AlertDialogTitle>
                <AlertDialogDescription>{t('confirmar.quitarHuesped.desc')}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('confirmar.cancelar')}</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={() => remove.mutate()}>
                  {t('confirmar.quitarHuesped.ok')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </li>
  );
}

export default function GuestsSection({
  bookingId,
  guests,
}: {
  bookingId: string;
  guests: BookingGuest[];
}) {
  const qc = useQueryClient();
  const invalidate = () => void qc.invalidateQueries({ queryKey: ['booking', bookingId] });
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<GuestForm>(emptyForm);

  const add = useMutation({
    mutationFn: () => apiPost(`/api/admin/bookings/${bookingId}/guests`, toPatch(form)),
    onSuccess: () => {
      toast.success(t('ficha.huespedAnadido'));
      setForm(emptyForm);
      setAdding(false);
      invalidate();
    },
    onError: (e) => errorMutacion(e, t('ficha.huespedError')),
  });

  return (
    <section>
      <h3 className="lc-panel-h">{t('ficha.titular')}</h3>
      <ul className="flex flex-col divide-y divide-border/30">
        {guests.map((g) => (
          <GuestRow key={g.id} bookingId={bookingId} guest={g} invalidate={invalidate} />
        ))}
      </ul>

      {adding ? (
        <div className="mt-2 rounded-(--lc-radius) border border-border/60 p-2">
          <GuestFields form={form} set={(p) => setForm((f) => ({ ...f, ...p }))} idPrefix="add" />
          <div className="mt-2 flex gap-2">
            <Button
              type="button"
              size="xs"
              disabled={!form.name || !form.surname || add.isPending}
              onClick={() => add.mutate()}
            >
              {t('ficha.guardarHuesped')}
            </Button>
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={() => {
                setForm(emptyForm);
                setAdding(false);
              }}
            >
              {t('ficha.cancelarEdicion')}
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          size="xs"
          variant="outline"
          className="mt-2"
          onClick={() => setAdding(true)}
        >
          <Plus className="size-3.5" />
          {t('ficha.anadirHuesped')}
        </Button>
      )}
    </section>
  );
}
