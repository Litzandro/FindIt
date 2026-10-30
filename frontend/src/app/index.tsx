
/**
 * Landing público de FindIt.
 * Diseño responsivo para Web, Android e iOS.
 */

import { Link, router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ObjetoPublicado } from '@/features/objetos/modelo';
import { usePublicaciones } from '@/features/objetos/publicaciones';

// Colores para ambos temas
const PALETAS = {
  claro: {
    fondo: '#FBF7F0',
    superficie: '#FFFFFF',
    texto: '#071F28',
    secundario: '#596777',
    borde: '#E9DCCC',
    verde: '#087D67',
    verdeFuerte: '#076C59',
    verdeSuave: '#D7F1E9',
    verdeTexto: '#08634F',
    naranja: '#AF4019',
    naranjaSuave: '#FFE8D9',
    logoNaranja: '#CB4A1A',
    cabecera: '#FCF8F2',
  },
  oscuro: {
    fondo: '#111C20',
    superficie: '#1B2B30',
    texto: '#F4F8F6',
    secundario: '#B5C6CA',
    borde: '#35494C',
    verde: '#24AC91',
    verdeFuerte: '#13876E',
    verdeSuave: '#16483D',
    verdeTexto: '#A5E8D8',
    naranja: '#FFB394',
    naranjaSuave: '#4B3028',
    logoNaranja: '#F7A175',
    cabecera: '#172429',
  },
} as const;

type Colores =
  | typeof PALETAS.claro
  | typeof PALETAS.oscuro;

// Pasos de "Cómo funciona"
const PASOS = [
  {
    numero: '1',
    titulo: 'Publica',
    descripcion: 'Sube una foto y elige el lugar y la zona exacta.',
  },
  {
    numero: '2',
    titulo: 'Busca',
    descripcion: 'Filtra por lugar, tipo y categoría.',
  },
  {
    numero: '3',
    titulo: 'Reclama',
    descripcion:
      'Envía una solicitud de recuperación y coordina la entrega.',
  },
];

// Fechas de los objetos de ejemplo
function tiempoDeEjemplo(objeto: ObjetoPublicado): string {
  if (!objeto.esEjemplo) return 'Recién publicado';

  if (
    objeto.id === 'ejemplo-1' ||
    objeto.id === 'ejemplo-4'
  ) {
    return 'Hoy';
  }

  if (
    objeto.id === 'ejemplo-2' ||
    objeto.id === 'ejemplo-5' ||
    objeto.id === 'ejemplo-6'
  ) {
    return 'Ayer';
  }

  return 'Hace 2 días';
}

// Logo
function Marca({
  colores,
  styles,
}: {
  colores: Colores;
  styles: ReturnType<typeof crearEstilos>;
}) {
  return (
    <Link href="/" asChild>
      <Pressable
        accessibilityLabel="FindIt, ir al inicio"
        accessibilityRole="link"
        style={styles.logoEnlace}
      >
        <Text style={styles.logoVerde}>
          Find
          <Text style={{ color: colores.logoNaranja }}>
            It
          </Text>
        </Text>
      </Pressable>
    </Link>
  );
}

// Botones reutilizables
function BotonEnlace({
  titulo,
  href,
  principal = false,
  styles,
}: {
  titulo: string;
  href: '/registro' | '/iniciar-sesion' | '/objetos';
  principal?: boolean;
  styles: ReturnType<typeof crearEstilos>;
}) {
  return (
    <Link href={href} asChild>
      <Pressable
        accessibilityRole="link"
        style={({ pressed }) => [
          styles.boton,
          principal
            ? styles.botonPrincipal
            : styles.botonSecundario,
          pressed && styles.presionado,
        ]}
      >
        <Text
          style={
            principal
              ? styles.botonPrincipalTexto
              : styles.botonSecundarioTexto
          }
        >
          {titulo}
        </Text>
      </Pressable>
    </Link>
  );
}

// Tarjeta de objeto perdido o encontrado
function TarjetaObjeto({
  objeto,
  styles,
  colores,
  compacto,
}: {
  objeto: ObjetoPublicado;
  styles: ReturnType<typeof crearEstilos>;
  colores: Colores;
  compacto: boolean;
}) {
  const encontrado = objeto.tipo === 'encontrado';

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`Ver objetos recientes: ${objeto.titulo}`}
      onPress={() => router.push('/objetos')}
      style={({ pressed }) => [
        styles.tarjetaObjeto,
        pressed && styles.presionado,
      ]}
    >
      <View
        style={[
          styles.iconoObjetoContenedor,
          compacto && styles.iconoObjetoMovil,
          {
            backgroundColor: encontrado
              ? colores.verdeSuave
              : colores.naranjaSuave,
          },
        ]}
      >
        {objeto.fotoUri ? (
          <Image
            source={{ uri: objeto.fotoUri }}
            style={styles.imagenObjeto}
            resizeMode="cover"
          />
        ) : (
          <Text
            accessible={false}
            style={styles.iconoObjeto}
          >
            {objeto.icono}
          </Text>
        )}
      </View>

      <View style={styles.tarjetaDetalle}>
        <Text
          numberOfLines={1}
          style={styles.objetoTitulo}
        >
          {objeto.titulo}
        </Text>

        <Text
          numberOfLines={compacto ? 1 : 2}
          style={styles.objetoSubtitulo}
        >
          {compacto
            ? `${objeto.lugar} · ${tiempoDeEjemplo(objeto)}`
            : `${objeto.zona} · ${objeto.lugar} · ${tiempoDeEjemplo(objeto)}`}
        </Text>

        <View
          style={[
            styles.etiqueta,
            {
              backgroundColor: encontrado
                ? colores.verdeSuave
                : colores.naranjaSuave,
            },
          ]}
        >
          <Text
            style={[
              styles.etiquetaTexto,
              {
                color: encontrado
                  ? colores.verdeTexto
                  : colores.naranja,
              },
            ]}
          >
            {encontrado ? 'Encontrado' : 'Perdido'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

// Pantalla principal
export default function Landing() {
  const { objetos } = usePublicaciones();

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [oscuro, setOscuro] = useState(false);
  const [montado, setMontado] = useState(
    Platform.OS !== 'web'
  );

  const { width } = useWindowDimensions();
  const scroll = useRef<ScrollView>(null);
  const seccionPasosY = useRef(0);

  useEffect(() => {
    setMontado(true);
  }, []);

  const ancho = montado ? width : 390;
  const escritorio = ancho >= 760;
  const pantallaGrande = ancho >= 1160;

  const colores = oscuro
    ? PALETAS.oscuro
    : PALETAS.claro;

  const styles = useMemo(
    () => crearEstilos(colores),
    [colores]
  );

  const destacados = objetos.slice(
    0,
    escritorio ? 3 : 2
  );

  function irAPasos() {
    setMenuAbierto(false);

    scroll.current?.scrollTo({
      y: seccionPasosY.current,
      animated: true,
    });
  }

  return (
    <SafeAreaView
      style={styles.pantalla}
      edges={['top', 'left', 'right']}
    >
      {/* HEADER */}
      <View style={styles.cabecera}>
        <View
          style={[
            styles.cabeceraInterior,
            {
              paddingHorizontal: escritorio ? 30 : 28,
            },
          ]}
        >
          <Marca
            colores={colores}
            styles={styles}
          />

          {escritorio ? (
            <View style={styles.navDesktop}>
              <Pressable
                accessibilityRole="button"
                onPress={irAPasos}
                style={styles.navegacionTextoBoton}
              >
                <Text style={styles.navTexto}>
                  Cómo funciona
                </Text>
              </Pressable>

              <BotonEnlace
                titulo="Iniciar sesión"
                href="/iniciar-sesion"
                styles={styles}
              />

              <BotonEnlace
                titulo="Registrarme"
                href="/registro"
                principal
                styles={styles}
              />

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  oscuro
                    ? 'Activar modo claro'
                    : 'Activar modo oscuro'
                }
                onPress={() =>
                  setOscuro((actual) => !actual)
                }
                style={[
                  styles.botonTema,
                  styles.botonTemaDesktop,
                ]}
              >
                <Text style={styles.temaIcono}>
                  {oscuro ? '☀' : '☾'}
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                menuAbierto
                  ? 'Cerrar menú'
                  : 'Abrir menú'
              }
              accessibilityState={{
                expanded: menuAbierto,
              }}
              onPress={() =>
                setMenuAbierto((actual) => !actual)
              }
              style={styles.botonMenu}
            >
              <Text style={styles.menuIcono}>
                {menuAbierto ? '×' : '☰'}
              </Text>
            </Pressable>
          )}
        </View>

        {/* MENÚ MÓVIL */}
        {!escritorio && menuAbierto && (
          <View style={styles.menuMovil}>
            <Pressable
              onPress={irAPasos}
              style={styles.menuItem}
            >
              <Text style={styles.menuItemTexto}>
                Cómo funciona
              </Text>
            </Pressable>

            <Link href="/objetos" asChild>
              <Pressable style={styles.menuItem}>
                <Text style={styles.menuItemTexto}>
                  Ver objetos recientes
                </Text>
              </Pressable>
            </Link>

            <Link href="/registro" asChild>
              <Pressable style={styles.menuItem}>
                <Text style={styles.menuItemTexto}>
                  Registrarme
                </Text>
              </Pressable>
            </Link>

            <Link href="/iniciar-sesion" asChild>
              <Pressable style={styles.menuItem}>
                <Text style={styles.menuItemTexto}>
                  Iniciar sesión
                </Text>
              </Pressable>
            </Link>

            <Pressable
              onPress={() =>
                setOscuro((actual) => !actual)
              }
              style={styles.menuItem}
            >
              <Text style={styles.menuItemTexto}>
                {oscuro
                  ? '☀  Modo claro'
                  : '☾  Modo oscuro'}
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* CONTENIDO */}
      <ScrollView
        ref={scroll}
        style={styles.scroll}
        contentContainerStyle={styles.scrollInterior}
      >
        <View
          style={[
            styles.contenido,
            {
              paddingHorizontal: escritorio ? 30 : 28,
            },
          ]}
        >
          {/* HERO */}
          <View
            style={[
              styles.hero,
              escritorio
                ? styles.heroDesktop
                : styles.heroMovil,
            ]}
          >
            <View
              style={[
                styles.textoHero,
                escritorio
                  ? styles.textoHeroDesktop
                  : styles.textoHeroMovil,
              ]}
            >
              <Text
                accessibilityRole="header"
                style={[
                  styles.titulo,
                  {
                    fontSize: pantallaGrande
                      ? 60
                      : escritorio
                      ? 41
                      : 34,
                    lineHeight: pantallaGrande
                      ? 65
                      : escritorio
                      ? 46
                      : 36,
                  },
                ]}
              >
                Lo que perdiste,{"\n"}alguien lo encontró.
              </Text>

              <Text
                style={[
                  styles.descripcion,
                  escritorio &&
                    styles.descripcionDesktop,
                ]}
              >
                Publica objetos perdidos o encontrados
                en tu universidad, centro comercial o
                comunidad.
              </Text>

              <View
                style={[
                  styles.accionesHero,
                  !escritorio &&
                    styles.accionesHeroMovil,
                ]}
              >
                <BotonEnlace
                  titulo="Registrarme"
                  href="/registro"
                  principal
                  styles={styles}
                />

                {escritorio ? (
                  <BotonEnlace
                    titulo="Ver objetos recientes"
                    href="/objetos"
                    styles={styles}
                  />
                ) : (
                  <BotonEnlace
                    titulo="Iniciar sesión"
                    href="/iniciar-sesion"
                    styles={styles}
                  />
                )}
              </View>
            </View>

            {/* OBJETOS RECIENTES */}
            <View
              style={[
                styles.listaHero,
                escritorio
                  ? styles.listaHeroDesktop
                  : styles.listaHeroMovil,
              ]}
            >
              {destacados.map((objeto) => (
                <TarjetaObjeto
                  key={objeto.id}
                  objeto={objeto}
                  compacto={!escritorio}
                  colores={colores}
                  styles={styles}
                />
              ))}

              {!escritorio && (
                <Link href="/objetos" asChild>
                  <Pressable style={styles.enlaceObjetos}>
                    <Text
                      style={styles.enlaceObjetosTexto}
                    >
                      Ver todos los objetos →
                    </Text>
                  </Pressable>
                </Link>
              )}
            </View>
          </View>

          {/* CÓMO FUNCIONA */}
          <View
            style={[
              styles.comoFunciona,
              escritorio
                ? styles.comoFuncionaDesktop
                : styles.comoFuncionaMovil,
            ]}
            onLayout={(evento) => {
              seccionPasosY.current =
                evento.nativeEvent.layout.y;
            }}
          >
            <Text
              accessibilityRole="header"
              style={styles.seccionTitulo}
            >
              Cómo funciona
            </Text>

            <View
              style={[
                styles.pasos,
                !escritorio && styles.pasosMovil,
              ]}
            >
              {PASOS.map((paso) => (
                <View
                  key={paso.numero}
                  style={[
                    styles.paso,
                    escritorio && styles.pasoDesktop,
                  ]}
                >
                  <View style={styles.numeroCirculo}>
                    <Text style={styles.numeroTexto}>
                      {paso.numero}
                    </Text>
                  </View>

                  <Text style={styles.pasoTitulo}>
                    {paso.titulo}
                  </Text>

                  <Text style={styles.pasoDescripcion}>
                    {paso.descripcion}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.pie}>
            <Text style={styles.pieTexto}>
              FindIt · Prototipo con datos de ejemplo
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ESTILOS
function crearEstilos(c: Colores) {
  return StyleSheet.create({
    pantalla: {
      flex: 1,
      backgroundColor: c.fondo,
    },

    cabecera: {
      backgroundColor: c.cabecera,
      borderBottomWidth: 1,
      borderBottomColor: c.borde,
      zIndex: 2,
    },

    cabeceraInterior: {
      maxWidth: 1440,
      width: '100%',
      alignSelf: 'center',
      minHeight: 72,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    logoEnlace: {
      minHeight: 44,
      justifyContent: 'center',
      paddingRight: 8,
    },

    logoVerde: {
      color: c.verde,
      fontSize: 24,
      fontWeight: '800',
      letterSpacing: -0.8,
    },

    navDesktop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },

    navegacionTextoBoton: {
      minHeight: 44,
      paddingHorizontal: 16,
      justifyContent: 'center',
    },

    navTexto: {
      color: c.texto,
      fontSize: 14,
      fontWeight: '600',
    },

    boton: {
      minHeight: 44,
      borderRadius: 12,
      paddingHorizontal: 21,
      paddingVertical: 11,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
    },

    botonPrincipal: {
      backgroundColor: c.verde,
      borderColor: c.verde,
    },

    botonSecundario: {
      backgroundColor: 'transparent',
      borderColor: c.borde,
    },

    botonPrincipalTexto: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 14,
    },

    botonSecundarioTexto: {
      color: c.texto,
      fontWeight: '700',
      fontSize: 14,
    },

    presionado: {
      opacity: 0.75,
    },

    botonTema: {
      width: 42,
      height: 42,
      borderWidth: 1,
      borderColor: c.borde,
      borderRadius: 23,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: c.superficie,
    },

    botonTemaDesktop: {
      marginLeft: 3,
    },

    temaIcono: {
      color: c.texto,
      fontSize: 23,
      lineHeight: 28,
    },

    botonMenu: {
      width: 42,
      height: 42,
      borderWidth: 1,
      borderColor: c.borde,
      borderRadius: 23,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: c.superficie,
    },

    menuIcono: {
      color: c.texto,
      fontSize: 21,
      lineHeight: 26,
    },

    menuMovil: {
      paddingHorizontal: 28,
      paddingBottom: 12,
      backgroundColor: c.cabecera,
      borderTopWidth: 1,
      borderTopColor: c.borde,
    },

    menuItem: {
      minHeight: 46,
      justifyContent: 'center',
      borderBottomWidth: 1,
      borderBottomColor: c.borde,
    },

    menuItemTexto: {
      color: c.texto,
      fontSize: 15,
      fontWeight: '600',
    },

    scroll: {
      flex: 1,
    },

    scrollInterior: {
      flexGrow: 1,
    },

    contenido: {
      width: '100%',
      maxWidth: 1440,
      alignSelf: 'center',
    },

    hero: {
      width: '100%',
    },

    heroDesktop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 34,
      minHeight: 400,
      paddingTop: 42,
      paddingBottom: 44,
    },

    heroMovil: {
      flexDirection: 'column',
      paddingTop: 30,
      paddingBottom: 8,
    },

    textoHero: {
      minWidth: 0,
    },

    textoHeroDesktop: {
      flex: 1.1,
    },

    textoHeroMovil: {
      width: '100%',
    },

    titulo: {
      fontWeight: '800',
      letterSpacing: -1.65,
      color: c.texto,
    },

    descripcion: {
      color: c.secundario,
      fontSize: 15,
      lineHeight: 23,
      marginTop: 15,
      maxWidth: 570,
    },

    descripcionDesktop: {
      fontSize: 16,
      lineHeight: 25,
      marginTop: 22,
    },

    accionesHero: {
      flexDirection: 'row',
      gap: 11,
      marginTop: 23,
    },

    accionesHeroMovil: {
      flexDirection: 'column',
      gap: 10,
      marginTop: 21,
    },

    listaHero: {
      minWidth: 0,
      gap: 10,
    },

    listaHeroDesktop: {
      flex: 0.95,
      paddingLeft: 0,
    },

    listaHeroMovil: {
      width: '100%',
      marginTop: 24,
    },

    tarjetaObjeto: {
      minHeight: 77,
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 13,
      borderWidth: 1,
      borderColor: c.borde,
      backgroundColor: c.superficie,
    },

    iconoObjetoContenedor: {
      width: 55,
      height: 55,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },

    iconoObjetoMovil: {
      width: 58,
      height: 58,
    },

    iconoObjeto: {
      fontSize: 27,
    },

    imagenObjeto: {
      width: '100%',
      height: '100%',
    },

    tarjetaDetalle: {
      flex: 1,
      minWidth: 0,
      alignItems: 'flex-start',
    },

    objetoTitulo: {
      color: c.texto,
      fontSize: 14,
      fontWeight: '700',
    },

    objetoSubtitulo: {
      color: c.secundario,
      fontSize: 12,
      marginTop: 3,
      marginBottom: 4,
    },

    etiqueta: {
      borderRadius: 20,
      paddingHorizontal: 9,
      paddingVertical: 3,
    },

    etiquetaTexto: {
      fontSize: 11,
      fontWeight: '700',
    },

    enlaceObjetos: {
      paddingVertical: 8,
      minHeight: 36,
      justifyContent: 'center',
      alignItems: 'flex-start',
    },

    enlaceObjetosTexto: {
      fontWeight: '700',
      color: c.verde,
      fontSize: 13,
    },

    comoFunciona: {
      width: '100%',
    },

    comoFuncionaDesktop: {
      paddingTop: 14,
      paddingBottom: 35,
    },

    comoFuncionaMovil: {
      paddingTop: 26,
      paddingBottom: 26,
    },

    seccionTitulo: {
      color: c.texto,
      fontSize: 24,
      lineHeight: 31,
      letterSpacing: -0.7,
      fontWeight: '800',
      marginBottom: 13,
    },

    pasos: {
      flexDirection: 'row',
      gap: 12,
    },

    pasosMovil: {
      flexDirection: 'column',
    },

    paso: {
      backgroundColor: c.superficie,
      borderRadius: 13,
      borderWidth: 1,
      borderColor: c.borde,
      padding: 17,
      minHeight: 116,
    },

    pasoDesktop: {
      flex: 1,
      minWidth: 0,
      minHeight: 120,
    },

    numeroCirculo: {
      width: 22,
      height: 22,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.verdeSuave,
      marginBottom: 7,
    },

    numeroTexto: {
      color: c.verdeTexto,
      fontWeight: '800',
      fontSize: 12,
    },

    pasoTitulo: {
      color: c.texto,
      fontWeight: '700',
      fontSize: 15,
      marginBottom: 4,
    },

    pasoDescripcion: {
      color: c.secundario,
      fontSize: 12,
      lineHeight: 19,
    },

    pie: {
      paddingTop: 5,
      paddingBottom: 23,
    },

    pieTexto: {
      color: c.secundario,
      fontSize: 11,
      textAlign: 'center',
    },
  });
}
