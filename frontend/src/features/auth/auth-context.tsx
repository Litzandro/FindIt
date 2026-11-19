import { getSupabaseClient } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Perfil = { id: string; display_name: string };

type AuthContexto = {
  usuario: User | null;
  sesion: Session | null;
  perfil: Perfil | null;
  cargando: boolean;
  cargandoPerfil: boolean;
  errorConfiguracion: string | null;
  errorPerfil: string | null;
  recargarPerfil: () => void;
  cerrarSesion: () => Promise<void>;
};

const AuthContext = createContext<AuthContexto | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Session | null>(null);
  const [cargando, setCargando] = useState(true);
  const [errorConfiguracion, setErrorConfiguracion] = useState<string | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [cargandoPerfil, setCargandoPerfil] = useState(false);
  const [errorPerfil, setErrorPerfil] = useState<string | null>(null);
  const [revisionPerfil, setRevisionPerfil] = useState(0);

  useEffect(() => {
    let activo = true;
    try {
      const supabase = getSupabaseClient();
      // El listener se encarga de SIGNED_IN, SIGNED_OUT y cambios de token.
      // Evitamos consultas asíncronas dentro de onAuthStateChange.
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_evento, nuevaSesion) => {
        if (!activo) return;
        setSesion(nuevaSesion);
        setCargando(false);
      });

      void supabase.auth.getSession().then(({ data, error }) => {
        if (!activo) return;
        if (error) setErrorConfiguracion(error.message);
        else setSesion(data.session);
        setCargando(false);
      }).catch((error: unknown) => {
        if (!activo) return;
        setErrorConfiguracion(error instanceof Error ? error.message : 'No se pudo recuperar la sesión.');
        setCargando(false);
      });

      return () => { activo = false; subscription.unsubscribe(); };
    } catch (error) {
      setErrorConfiguracion(error instanceof Error ? error.message : 'No se pudo iniciar Supabase.');
      setCargando(false);
      return undefined;
    }
  }, []);

  const id = sesion?.user.id;
  useEffect(() => {
    if (!id) {
      setPerfil(null);
      setErrorPerfil(null);
      setCargandoPerfil(false);
      return;
    }

    let activo = true;
    setPerfil(null);
    setErrorPerfil(null);
    setCargandoPerfil(true);
    void Promise.resolve(getSupabaseClient()
      .from('profiles')
      .select('id,display_name')
      .eq('id', id)
      .maybeSingle())
      .then(({ data, error }) => {
        if (!activo) return;
        if (error) setErrorPerfil(error.message);
        else if (!data) setErrorPerfil('No se encontró el perfil. Revisa el trigger de registro.');
        else setPerfil(data);
        setCargandoPerfil(false);
      }).catch((error: unknown) => {
        if (!activo) return;
        setErrorPerfil(error instanceof Error ? error.message : 'No se pudo consultar el perfil.');
        setCargandoPerfil(false);
      });
    return () => { activo = false; };
  }, [id, revisionPerfil]);

  async function cerrarSesion() {
    const { error } = await getSupabaseClient().auth.signOut();
    if (error) throw error;
  }

  return (
    <AuthContext.Provider value={{
      usuario: sesion?.user ?? null,
      sesion,
      perfil,
      cargando,
      cargandoPerfil,
      errorConfiguracion,
      errorPerfil,
      recargarPerfil: () => setRevisionPerfil((actual) => actual + 1),
      cerrarSesion,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth debe utilizarse dentro de AuthProvider.');
  return contexto;
}
