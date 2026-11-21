import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/features/auth/auth-context';
import { getSupabaseClient } from '@/lib/supabase';

export type ModoCuenta = 'ingresar' | 'registrar';

function mensajeError(error: unknown): string {
  const mensaje = error instanceof Error ? error.message : String(error);
  if (/invalid login credentials/i.test(mensaje)) return 'Correo o contraseña incorrectos.';
  if (/email not confirmed/i.test(mensaje)) return 'Confirma tu correo electrónico antes de continuar.';
  if (/user already registered/i.test(mensaje)) return 'Ya existe una cuenta con este correo.';
  if (/password should be at least|password is too short/i.test(mensaje)) return 'La contraseña no cumple los requisitos del servidor.';
  if (/failed to fetch|network request failed|fetch failed/i.test(mensaje)) return 'No se pudo conectar con Supabase. Revisa la URL, Docker y tu red.';
  return mensaje;
}

/** Lógica única de formulario y Supabase para las dos plataformas. */
export function useCuenta() {
  const { modo: solicitado } = useLocalSearchParams<{ modo?: string }>();
  const auth = useAuth();
  const [modo, setModo] = useState<ModoCuenta>(solicitado === 'registrar' ? 'registrar' : 'ingresar');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [terminos, setTerminos] = useState(false);
  const [nombrePerfil, setNombrePerfil] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  useEffect(() => {
    if (solicitado === 'registrar' || solicitado === 'ingresar') setModo(solicitado);
  }, [solicitado]);
  useEffect(() => { if (auth.perfil) setNombrePerfil(auth.perfil.display_name); }, [auth.perfil]);

  function cambiarModo(nuevo: ModoCuenta) {
    setModo(nuevo);
    setError('');
    setExito('');
    setContrasena('');
    setConfirmacion('');
  }

  async function enviar() {
    if (procesando) return;
    setError(''); setExito('');
    const email = correo.trim().toLowerCase();
    const nombreLimpio = nombre.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Introduce un correo electrónico válido.'); return; }
    if (modo === 'registrar' && (nombreLimpio.length < 2 || nombreLimpio.length > 80)) { setError('El nombre debe tener entre 2 y 80 caracteres.'); return; }
    if (modo === 'registrar' && contrasena.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return; }
    if (modo === 'registrar' && contrasena !== confirmacion) { setError('Las contraseñas no coinciden.'); return; }
    if (modo === 'ingresar' && !contrasena) { setError('Introduce tu contraseña.'); return; }
    if (modo === 'registrar' && !terminos) { setError('Debes aceptar las condiciones de uso antes de registrarte.'); return; }

    setProcesando(true);
    try {
      const supabase = getSupabaseClient();
      if (modo === 'registrar') {
        const { data, error: fallo } = await supabase.auth.signUp({
          email, password: contrasena, options: { data: { display_name: nombreLimpio } },
        });
        if (fallo) throw fallo;
        setContrasena('');
        setConfirmacion('');
        if (data.session) router.replace('/');
        else setExito('Revisa tu correo para confirmar tu cuenta, si tu servidor lo requiere.');
      } else {
        const { error: fallo } = await supabase.auth.signInWithPassword({ email, password: contrasena });
        if (fallo) throw fallo;
        setContrasena('');
        router.replace('/');
      }
    } catch (fallo) { setError(mensajeError(fallo)); }
    finally { setProcesando(false); }
  }

  async function guardarNombre() {
    if (procesando || !auth.usuario) return;
    const limpio = nombrePerfil.trim();
    if (limpio.length < 2 || limpio.length > 80) { setError('Escribe un nombre de entre 2 y 80 caracteres.'); return; }
    setProcesando(true); setError(''); setExito('');
    try {
      const { error: fallo } = await getSupabaseClient().from('profiles').update({ display_name: limpio }).eq('id', auth.usuario.id);
      if (fallo) throw fallo;
      auth.recargarPerfil();
      setExito('Nombre guardado correctamente.');
    } catch (fallo) { setError(mensajeError(fallo)); }
    finally { setProcesando(false); }
  }

  async function cerrarSesion() {
    if (procesando) return;
    setProcesando(true); setError(''); setExito('');
    try { await auth.cerrarSesion(); setContrasena(''); router.replace('/'); }
    catch (fallo) { setError(mensajeError(fallo)); }
    finally { setProcesando(false); }
  }

  async function recuperarContrasena() {
    const email = correo.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Primero escribe tu correo electrónico para solicitar recuperación.'); return; }
    if (procesando) return;
    setProcesando(true); setError(''); setExito('');
    try {
      const { error: fallo } = await getSupabaseClient().auth.resetPasswordForEmail(email);
      if (fallo) throw fallo;
      setExito('Si existe una cuenta para ese correo, recibirás instrucciones. La URL de recuperación debe configurarse en Supabase para completar el proceso.');
    } catch (fallo) { setError(mensajeError(fallo)); }
    finally { setProcesando(false); }
  }

  return {
    ...auth, modo, cambiarModo, nombre, setNombre, correo, setCorreo, contrasena, setContrasena,
    confirmacion, setConfirmacion, terminos, setTerminos, nombrePerfil, setNombrePerfil, procesando, error, exito,
    enviar, guardarNombre, cerrarSesion, recuperarContrasena,
  };
}
