import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import { tema } from '@/features/inicio/ui/tema-findit';

type SkeletonProps = {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

/** Pulso suave, sin librerías extra y respetando la preferencia de reducir movimiento. */
export function Skeleton({ width = '100%', height = 14, radius = 9, style }: SkeletonProps) {
  const opacidad = useRef(new Animated.Value(0.75)).current;
  useEffect(() => {
    let vigente = true;
    let animacion: Animated.CompositeAnimation | undefined;
    void AccessibilityInfo.isReduceMotionEnabled().then((reducido) => {
      if (!vigente || reducido) return;
      animacion = Animated.loop(Animated.sequence([
        Animated.timing(opacidad, { toValue: 0.42, duration: 680, useNativeDriver: true }),
        Animated.timing(opacidad, { toValue: 0.88, duration: 680, useNativeDriver: true }),
      ]));
      animacion.start();
    }).catch(() => undefined);
    return () => { vigente = false; animacion?.stop(); };
  }, [opacidad]);

  return <Animated.View accessible={false} importantForAccessibility="no-hide-descendants" style={[{ width, height, borderRadius: radius, backgroundColor: tema.esqueleto, opacity: opacidad }, style]} />;
}

/** Se puede colocar tanto en el catálogo web como en las tarjetas de la aplicación. */
export function SkeletonObjeto({ compacto = false }: { compacto?: boolean }) {
  return (
    <View accessibilityLabel="Cargando publicación" accessibilityRole="progressbar" style={[styles.tarjeta, compacto ? styles.compacta : styles.grande]}>
      <Skeleton width={compacto ? 66 : '100%'} height={compacto ? 66 : 120} radius={12} />
      <View style={styles.detalles}>
        <Skeleton width="72%" height={17} />
        <Skeleton width="92%" height={12} />
        <Skeleton width="38%" height={19} radius={20} />
      </View>
    </View>
  );
}

export function SkeletonPerfil() {
  return (
    <View accessibilityLabel="Cargando perfil" accessibilityRole="progressbar" style={styles.perfil}>
      <Skeleton width={72} height={72} radius={36} />
      <Skeleton width={140} height={19} />
      <Skeleton width={190} height={12} />
      <Skeleton width="100%" height={48} radius={12} />
      <Skeleton width="100%" height={48} radius={12} />
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: { backgroundColor: tema.panel, borderWidth: 1, borderColor: tema.borde, borderRadius: 16, padding: 11, gap: 12 },
  compacta: { flexDirection: 'row', alignItems: 'center' },
  grande: { width: '100%' },
  detalles: { flex: 1, gap: 11 },
  perfil: { backgroundColor: tema.panel, borderWidth: 1, borderColor: tema.borde, borderRadius: 16, alignItems: 'center', padding: 22, gap: 14, width: '100%' },
});
