import { CATEGORIAS as CATEGORIAS_BASE, LUGARES as LUGARES_BASE, type FiltroTipo } from '@/features/objetos/modelo';
import { usePublicaciones } from '@/features/objetos/publicaciones';
import { useState } from 'react';

export const LUGARES = ['Todos los lugares', ...LUGARES_BASE];
export const CATEGORIAS = ['Todas las categorías', ...CATEGORIAS_BASE];

function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

/** Estado y reglas de filtrado compartidos entre las interfaces web y nativa. */
export function useFiltrosPublicaciones() {
  const { objetos } = usePublicaciones();
  const [busqueda, setBusqueda] = useState('');
  const [tipo, setTipo] = useState<FiltroTipo>('todos');
  const [lugar, setLugar] = useState(LUGARES[0]);
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);

  const termino = normalizar(busqueda);
  const resultados = objetos.filter((objeto) => {
    const contenido = normalizar(`${objeto.titulo} ${objeto.categoria} ${objeto.lugar} ${objeto.zona} ${objeto.descripcion}`);
    return contenido.includes(termino)
      && (tipo === 'todos' || objeto.tipo === tipo)
      && (lugar === LUGARES[0] || objeto.lugar === lugar)
      && (categoria === CATEGORIAS[0] || objeto.categoria === categoria);
  });

  function limpiarFiltros(): void {
    setBusqueda('');
    setTipo('todos');
    setLugar(LUGARES[0]);
    setCategoria(CATEGORIAS[0]);
  }

  return { objetos, busqueda, setBusqueda, tipo, setTipo, lugar, setLugar, categoria, setCategoria, resultados, limpiarFiltros };
}
