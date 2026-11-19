import { Text } from '@/components/ui/inter-text';
import { useCallback, useEffect, useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSupabaseClient } from '@/lib/supabase';

type Item = { code: string; name: string };
type Estado = { cargando: boolean; error: string | null; categorias: Item[]; lugares: Item[] };

export default function ConexionSupabaseScreen() {
  const [intento, setIntento] = useState(0);
  const [estado, setEstado] = useState<Estado>({
    cargando: true,
    error: null,
    categorias: [],
    lugares: [],
  });
  const reintentar = useCallback(() => setIntento((actual) => actual + 1), []);

  useEffect(() => {
    let activo = true;
    setEstado({ cargando: true, error: null, categorias: [], lugares: [] });
    async function consultar() {
      try {
        const supabase = getSupabaseClient();
        const [respuestaCategorias, respuestaLugares] = await Promise.all([
          supabase.from('categories').select('code,name').order('name'),
          supabase.from('places').select('code,name').order('name'),
        ]);
        if (respuestaCategorias.error) throw respuestaCategorias.error;
        if (respuestaLugares.error) throw respuestaLugares.error;
        if (activo) {
          setEstado({
            cargando: false,
            error: null,
            categorias: respuestaCategorias.data ?? [],
            lugares: respuestaLugares.data ?? [],
          });
        }
      } catch (error) {
        if (activo) setEstado({
          cargando: false,
          error: error instanceof Error ? error.message : String(error),
          categorias: [],
          lugares: [],
        });
      }
    }
    void consultar();
    return () => { activo = false; };
  }, [intento]);

  return (
    <SafeAreaView style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <Pressable onPress={() => router.dismissTo('/')} style={styles.volver}>
          <Text style={styles.enlace}>← Volver al inicio</Text>
        </Pressable>
        <Text style={styles.titulo}>Conexión con Supabase</Text>
        <Text style={styles.descripcion}>
          Prueba de lectura de las tablas existentes. No modifica registros ni necesita iniciar sesión.
        </Text>

        {estado.cargando ? (
          <View style={styles.tarjeta}>
            <ActivityIndicator color="#0D7F6B" size="large" />
            <Text style={styles.detalle}>Consultando la base de datos…</Text>
          </View>
        ) : estado.error ? (
          <View style={styles.tarjeta}>
            <Text style={styles.errorTitulo}>No fue posible conectar</Text>
            <Text selectable style={styles.error}>{estado.error}</Text>
            <Text style={styles.detalle}>
              Comprueba Docker, npm run db:status, la URL, la clave pública y que el dispositivo pueda llegar al puerto 54321.
            </Text>
          </View>
        ) : (
          <View style={styles.tarjeta}>
            <Text style={styles.correcto}>✓ Lectura de Supabase exitosa</Text>
            <Text style={styles.subtitulo}>Categorías ({estado.categorias.length})</Text>
            {estado.categorias.map((c) => <Text key={c.code} style={styles.fila}>• {c.name} ({c.code})</Text>)}
            <Text style={styles.subtitulo}>Lugares ({estado.lugares.length})</Text>
            {estado.lugares.map((l) => <Text key={l.code} style={styles.fila}>• {l.name} ({l.code})</Text>)}
            {estado.categorias.length === 0 && estado.lugares.length === 0 && (
              <Text style={styles.detalle}>La conexión funciona, pero no hay datos. Revisa las semillas.</Text>
            )}
          </View>
        )}
        <Pressable onPress={reintentar} style={styles.boton}>
          <Text style={styles.botonTexto}>Volver a comprobar</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: '#F4F7F6' },
  contenido: { paddingHorizontal: 22, paddingVertical: 28, gap: 16, maxWidth: 620, width: '100%', alignSelf: 'center' },
  volver: { alignSelf: 'flex-start', paddingVertical: 10 },
  enlace: { fontWeight: '700', color: '#0D7F6B', fontSize: 15 },
  titulo: { fontSize: 28, color: '#172825', fontWeight: '800' },
  descripcion: { color: '#596C67', lineHeight: 23, fontSize: 15 },
  tarjeta: { backgroundColor: 'white', borderColor: '#DBE5E1', borderWidth: 1, borderRadius: 16, padding: 20, gap: 10 },
  correcto: { color: '#08704B', fontSize: 17, fontWeight: '700' },
  errorTitulo: { color: '#B42318', fontSize: 17, fontWeight: '700' },
  error: { color: '#B42318', lineHeight: 21 },
  detalle: { color: '#596C67', fontSize: 14, lineHeight: 21 },
  subtitulo: { marginTop: 8, color: '#172825', fontWeight: '700', fontSize: 16 },
  fila: { color: '#243C35', fontSize: 15, lineHeight: 22 },
  boton: { marginTop: 4, backgroundColor: '#0D7F6B', borderRadius: 13, alignItems: 'center', padding: 15 },
  botonTexto: { fontSize: 16, color: 'white', fontWeight: '700' },
});
