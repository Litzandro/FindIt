import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  validarPublicacion,
  type EntradaPublicacion,
  type ObjetoPublicado,
} from './modelo';

type PublicacionesContexto = {
  objetos: ObjetoPublicado[];
  agregarPublicacion: (entrada: EntradaPublicacion) => void;
};

const PublicacionesContext = createContext<PublicacionesContexto | undefined>(undefined);

function fechaHaceDias(dias: number, fechaBase: Date): string {
  const fecha = new Date(fechaBase.getTime());
  fecha.setDate(fecha.getDate() - dias);
  const anio = String(fecha.getFullYear()).padStart(4, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

// Separamos las partes de la fecha para evitar desplazamientos por zona horaria.
function fechaParaMostrar(fechaSuceso: string): string {
  const [anio, mes, dia] = fechaSuceso.split('-');
  return `${dia}/${mes}/${anio}`;
}

function crearEjemplos(fechaBase = new Date(2026, 9, 29, 12)): ObjetoPublicado[] {
  // La fecha fija permite que el HTML y el primer render cliente coincidan.
  const hoy = fechaHaceDias(0, fechaBase);
  const ayer = fechaHaceDias(1, fechaBase);
  const anteayer = fechaHaceDias(2, fechaBase);
  const ejemplos: (EntradaPublicacion & { icono: string })[] = [
    { titulo: 'Mochila negra', tipo: 'perdido', categoria: 'Bolsos y mochilas', lugar: 'Universidad', zona: 'Biblioteca', fechaSuceso: hoy, descripcion: 'Mochila negra extraviada en la biblioteca.', icono: '🎒' },
    { titulo: 'Llaves con llavero rojo', tipo: 'encontrado', categoria: 'Llaves', lugar: 'Mall Megaplaza', zona: 'Zona de bancos', fechaSuceso: ayer, descripcion: 'Juego de llaves encontrado cerca de la zona de bancos.', icono: '🔑' },
    { titulo: 'Audífonos blancos', tipo: 'perdido', categoria: 'Electrónicos', lugar: 'Universidad', zona: 'Edificio B', fechaSuceso: anteayer, descripcion: 'Audífonos blancos extraviados cerca del edificio B.', icono: '🎧' },
    { titulo: 'Billetera café', tipo: 'encontrado', categoria: 'Otros', lugar: 'Mall Megaplaza', zona: 'Zona de comida', fechaSuceso: hoy, descripcion: 'Billetera café encontrada en la zona de comida.', icono: '👛' },
    { titulo: 'Paraguas azul', tipo: 'perdido', categoria: 'Otros', lugar: 'Mall Megaplaza', zona: 'Parqueo', fechaSuceso: ayer, descripcion: 'Paraguas azul extraviado en el parqueo.', icono: '☂️' },
    { titulo: 'Cargador de laptop', tipo: 'encontrado', categoria: 'Electrónicos', lugar: 'Universidad', zona: 'Aula 12', fechaSuceso: ayer, descripcion: 'Cargador de laptop encontrado en el aula 12.', icono: '🔌' },
  ];

  return ejemplos.map((ejemplo, indice) => ({
    ...ejemplo,
    id: `ejemplo-${indice + 1}`,
    fecha: fechaParaMostrar(ejemplo.fechaSuceso),
    esEjemplo: true,
  }));
}

function iconoDeCategoria(categoria: string): string {
  switch (categoria) {
    case 'Llaves': return '🔑';
    case 'Bolsos y mochilas': return '🎒';
    case 'Electrónicos': return '🔌';
    default: return '📦';
  }
}

// Este estado se comparte entre rutas, pero se pierde al recargar o cerrar la app.
export function PublicacionesProvider({ children }: { children: ReactNode }) {
  const [objetos, setObjetos] = useState<ObjetoPublicado[]>(crearEjemplos);
  const siguienteId = useRef(0);

  useEffect(() => {
    const ejemplosActualizados = crearEjemplos(new Date());
    // Solo actualiza los ejemplos; conserva las publicaciones del usuario.
    setObjetos((actuales) => actuales.map((objeto) => objeto.esEjemplo
      ? ejemplosActualizados.find((ejemplo) => ejemplo.id === objeto.id) ?? objeto
      : objeto));
  }, []);

  function agregarPublicacion(entrada: EntradaPublicacion): void {
    const errores = validarPublicacion(entrada);
    if (Object.keys(errores).length > 0) {
      throw new Error('Revisa los campos de la publicación antes de continuar.');
    }

    siguienteId.current += 1;
    const nuevoObjeto: ObjetoPublicado = {
      ...entrada,
      titulo: entrada.titulo.trim(),
      zona: entrada.zona.trim(),
      descripcion: entrada.descripcion.trim(),
      id: `local-${siguienteId.current}`,
      fecha: fechaParaMostrar(entrada.fechaSuceso),
      icono: iconoDeCategoria(entrada.categoria),
      esEjemplo: false,
    };

    setObjetos((actuales) => [nuevoObjeto, ...actuales]);
  }

  return (
    <PublicacionesContext.Provider value={{ objetos, agregarPublicacion }}>
      {children}
    </PublicacionesContext.Provider>
  );
}

export function usePublicaciones(): PublicacionesContexto {
  const contexto = useContext(PublicacionesContext);
  if (contexto === undefined) {
    throw new Error('usePublicaciones debe usarse dentro de PublicacionesProvider.');
  }
  return contexto;
}
