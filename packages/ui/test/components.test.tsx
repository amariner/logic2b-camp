import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  EmptyState,
  ErrorState,
  Input,
  Label,
  LogoMark,
  Separator,
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  Skeleton,
  SkeletonRows,
  SkeletonText,
  Spinner,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  cn,
} from '../src/index';

describe('cn', () => {
  it('resuelve conflictos de Tailwind quedándose con el último', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('text-sm', false && 'hidden', 'font-medium')).toBe('text-sm font-medium');
  });
});

/* ---------- los 4 de B1, que hasta ADR 0020 no tenían ningún test ---------- */

describe('Button', () => {
  it('renderiza un <button> y dispara onClick', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Guardar</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('no dispara onClick cuando está deshabilitado', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Guardar
      </Button>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('con asChild renderiza el hijo conservando las clases del botón', () => {
    render(
      <Button asChild>
        <a href="/reservas">Ver reservas</a>
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'Ver reservas' });
    expect(link).toHaveAttribute('href', '/reservas');
    expect(link.className).toContain('inline-flex');
  });

  it('la variante destructiva usa el token destructive, no el color de texto', () => {
    render(<Button variant="destructive">Cancelar reserva</Button>);
    expect(screen.getByRole('button').className).toContain('bg-destructive');
  });
});

describe('Badge', () => {
  it('renderiza su contenido', () => {
    render(<Badge>Confirmada</Badge>);
    expect(screen.getByText('Confirmada')).toBeInTheDocument();
  });
});

describe('Card', () => {
  it('compone cabecera y contenido', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Ocupación</CardTitle>
        </CardHeader>
        <CardContent>86%</CardContent>
      </Card>,
    );
    expect(screen.getByText('Ocupación')).toBeInTheDocument();
    expect(screen.getByText('86%')).toBeInTheDocument();
  });
});

describe('LogoMark', () => {
  it('renderiza un svg decorativo', () => {
    const { container } = render(<LogoMark />);
    expect(container.querySelector('svg')).toBeTruthy();
  });
});

/* ---------- primitivos nuevos de C2 ---------- */

describe('Skeleton', () => {
  it('queda oculto a los lectores de pantalla', () => {
    const { container } = render(<Skeleton className="h-4 w-20" />);
    expect(container.querySelector('[data-slot="skeleton"]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('SkeletonText pinta tantas líneas como se le piden', () => {
    const { container } = render(<SkeletonText lines={4} />);
    expect(container.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(4);
  });

  it('SkeletonRows pinta filas × columnas', () => {
    const { container } = render(<SkeletonRows rows={3} cols={['w-10', 'w-20']} />);
    expect(container.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(6);
  });
});

describe('Spinner / EmptyState / ErrorState', () => {
  it('Spinner no anuncia nada al lector de pantalla', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('EmptyState muestra título, descripción y su salida', () => {
    render(
      <EmptyState
        art="calendar"
        title="No hay llegadas hoy"
        description="Nadie tiene entrada prevista para esta fecha."
        action={<Button size="sm">Ver mañana</Button>}
      />,
    );
    expect(screen.getByText('No hay llegadas hoy')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ver mañana' })).toBeInTheDocument();
  });

  it('ErrorState se anuncia como alerta', () => {
    render(<ErrorState title="No se pudo cargar" />);
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo cargar');
  });
});

describe('Dialog', () => {
  it('se abre desde el disparador y muestra el título', async () => {
    render(
      <Dialog>
        <DialogTrigger>Abrir</DialogTrigger>
        <DialogContent>
          <DialogTitle>Nueva reserva</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    await userEvent.click(screen.getByText('Abrir'));
    expect(await screen.findByRole('dialog')).toHaveTextContent('Nueva reserva');
  });
});

describe('AlertDialog', () => {
  it('confirma la acción destructiva', async () => {
    const onConfirm = vi.fn();
    render(
      <AlertDialog>
        <AlertDialogTrigger>Reembolsar</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>¿Reembolsar 120,00 €?</AlertDialogTitle>
          <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={onConfirm}>
              Reembolsar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );

    await userEvent.click(screen.getByText('Reembolsar'));
    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toHaveTextContent('Esta acción no se puede deshacer.');

    await userEvent.click(within(dialog).getByRole('button', { name: 'Reembolsar' }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('cancelar cierra sin ejecutar la acción', async () => {
    const onConfirm = vi.fn();
    render(
      <AlertDialog>
        <AlertDialogTrigger>Dar de baja</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>¿Dar de baja la unidad?</AlertDialogTitle>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm}>Dar de baja</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );

    await userEvent.click(screen.getByText('Dar de baja'));
    const dialog = await screen.findByRole('alertdialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Volver' }));
    expect(onConfirm).not.toHaveBeenCalled();
  });
});

describe('Sheet', () => {
  it('abre el panel lateral', async () => {
    render(
      <Sheet>
        <SheetTrigger>Ficha</SheetTrigger>
        <SheetContent>
          <SheetTitle>CS-2026-0006</SheetTitle>
        </SheetContent>
      </Sheet>,
    );
    await userEvent.click(screen.getByText('Ficha'));
    expect(await screen.findByRole('dialog')).toHaveTextContent('CS-2026-0006');
  });
});

describe('Table', () => {
  it('renderiza cabeceras y celdas con roles de tabla', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>CS-2026-0001</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByRole('columnheader', { name: 'Código' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'CS-2026-0001' })).toBeInTheDocument();
  });

  /* `containerClassName` es lo que hace posible la cabecera pegajosa (B1,
     sesión 52): si el contenedor se queda con `overflow-x-auto`, ES él el que
     desplaza en los dos ejes y un `thead sticky` se pega a algo que nunca se
     mueve. Al pasar `overflow-auto` tiene que GANAR, no acumularse. */
  it('containerClassName va al contenedor de scroll y gana al overflow por defecto', () => {
    render(
      <Table containerClassName="min-h-0 flex-1 overflow-auto" data-testid="tabla">
        <TableBody>
          <TableRow>
            <TableCell>CS-2026-0001</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const contenedor = screen.getByTestId('tabla').parentElement;
    expect(contenedor).toHaveClass('overflow-auto', 'flex-1', 'min-h-0');
    expect(contenedor).not.toHaveClass('overflow-x-auto');
  });
});

describe('Input y Label', () => {
  it('el label enfoca su input al hacer click', async () => {
    render(
      <>
        <Label htmlFor="titular">Titular</Label>
        <Input id="titular" />
      </>,
    );
    await userEvent.click(screen.getByText('Titular'));
    expect(screen.getByRole('textbox')).toHaveFocus();
  });
});

describe('Switch y Checkbox', () => {
  it('el switch conmuta', async () => {
    const onCheckedChange = vi.fn();
    render(<Switch aria-label="Avisos por email" onCheckedChange={onCheckedChange} />);
    await userEvent.click(screen.getByRole('switch'));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('el checkbox conmuta', async () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox aria-label="Seleccionar fila" onCheckedChange={onCheckedChange} />);
    await userEvent.click(screen.getByRole('checkbox'));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });
});

describe('DropdownMenu', () => {
  it('abre y ejecuta una opción', async () => {
    const onSelect = vi.fn();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Acciones</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={onSelect}>Reasignar</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await userEvent.click(screen.getByText('Acciones'));
    await userEvent.click(await screen.findByText('Reasignar'));
    expect(onSelect).toHaveBeenCalledOnce();
  });
});

describe('Tabs', () => {
  it('cambia de panel', async () => {
    render(
      <Tabs defaultValue="datos">
        <TabsList>
          <TabsTrigger value="datos">Datos</TabsTrigger>
          <TabsTrigger value="pagos">Pagos</TabsTrigger>
        </TabsList>
        <TabsContent value="datos">Titular</TabsContent>
        <TabsContent value="pagos">Desglose</TabsContent>
      </Tabs>,
    );
    expect(screen.getByText('Titular')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('tab', { name: 'Pagos' }));
    expect(await screen.findByText('Desglose')).toBeInTheDocument();
  });
});

describe('Tooltip', () => {
  it('muestra el contenido al enfocar el disparador', async () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Info</TooltipTrigger>
          <TooltipContent>Noches facturables</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    await userEvent.tab();
    expect(await screen.findAllByText('Noches facturables')).not.toHaveLength(0);
  });
});

describe('Separator', () => {
  it('es decorativo por defecto', () => {
    const { container } = render(<Separator />);
    expect(container.querySelector('[data-orientation="horizontal"]')).toBeTruthy();
  });
});

describe('Command (⌘K, ADR 0022)', () => {
  it('filtra en cliente (shouldFilter=false) y dispara onSelect al elegir', async () => {
    const onSelect = vi.fn();
    render(
      <Command shouldFilter={false}>
        <CommandInput placeholder="Buscar…" />
        <CommandList>
          <CommandGroup heading="Reservas">
            <CommandItem value="cs-1" onSelect={onSelect}>
              CS-2026-0001
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );
    expect(screen.getByPlaceholderText('Buscar…')).toBeInTheDocument();
    await userEvent.click(screen.getByText('CS-2026-0001'));
    expect(onSelect).toHaveBeenCalledOnce();
  });
});
