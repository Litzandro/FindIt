export type TipoObjeto = 'perdido' | 'encontrado';
export type FiltroTipo = 'todos' | TipoObjeto;

export const CATEGORIAS = ['Llaves', 'Bolsos y mochilas', 'Electrónicos', 'Otros'] as const;
export const LUGARES = ['Universidad', 'Mall Megaplaza'] as const;

export type EntradaPublicacion = {
  titulo: string;
  tipo: TipoObjeto;
  categoria: string;
  lugar: string;
  zona: string;
  fechaSuceso: string;
  descripcion: string;
  fotoUri?: string;
};

export type ObjetoPublicado = EntradaPublicacion & {
  id: string;
  fecha: string;
  icono: string;
  esEjemplo: boolean;
};

// Usamos la fecha del dispositivo, sin convertirla a UTC.
export function fechaHoyLocal(): string {
  const ahora = new Date();
  const anio = String(ahora.getFullYear()).padStart(4, '0');
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

function esFechaReal(fecha: string): boolean {
  if (fecha.length !== 10 || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;

  const [anio, mes, dia] = fecha.split('-').map(Number);
  if (anio < 1 || mes < 1 || mes > 12 || dia < 1) return false;

  const bisiesto = anio % 400 === 0 || (anio % 4 === 0 && anio % 100 !== 0);
  const diasPorMes = [31, bisiesto ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return dia <= diasPorMes[mes - 1];
}

export function validarPublicacion(
  entrada: EntradaPublicacion,
): Partial<Record<keyof EntradaPublicacion, string>> {
  const errores: Partial<Record<keyof EntradaPublicacion, string>> = {};
  const titulo = entrada.titulo.trim();
  const zona = entrada.zona.trim();

  if (titulo.length < 3 || titulo.length > 80) {
    errores.titulo = 'Escribe un título de entre 3 y 80 caracteres.';
  }

  if (entrada.tipo !== 'perdido' && entrada.tipo !== 'encontrado') {
    errores.tipo = 'Selecciona si el objeto está perdido o fue encontrado.';
  }

  if (!CATEGORIAS.some((categoria) => categoria === entrada.categoria)) {
    errores.categoria = 'Selecciona una categoría de la lista.';
  }

  if (!LUGARES.some((lugar) => lugar === entrada.lugar)) {
    errores.lugar = 'Selecciona un lugar de la lista.';
  }

  if (zona.length < 2 || zona.length > 100) {
    errores.zona = 'Escribe una zona de entre 2 y 100 caracteres.';
  }

  if (!esFechaReal(entrada.fechaSuceso)) {
    errores.fechaSuceso = 'Escribe una fecha válida con el formato AAAA-MM-DD.';
  } else if (entrada.fechaSuceso > fechaHoyLocal()) {
    // Las fechas válidas en este formato se pueden comparar como texto.
    errores.fechaSuceso = 'La fecha del suceso no puede estar en el futuro.';
  }

  if (entrada.descripcion.length > 1000) {
    errores.descripcion = 'La descripción puede tener hasta 1000 caracteres.';
  }

  return errores;
}
