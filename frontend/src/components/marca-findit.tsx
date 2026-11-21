
import { Image, View } from 'react-native';

type MarcaFindItProps = {
  sobreTeal?: boolean;
  ancho?: number;
};

export default function MarcaFindIt({
  sobreTeal = false,
  ancho = 112,
}: MarcaFindItProps) {
  // Mantener la proporción original de cada logo.
  const alto = sobreTeal
    ? (ancho * 450) / 874
    : (ancho * 391) / 1000;

  return (
    <View
      style={{
        width: ancho,
        height: alto,
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      <Image
        source={
          sobreTeal
            ? require('../../assets/images/findit-logo-teal.png')
            : require('../../assets/images/findit-logo-claro.png')
        }
        resizeMode="contain"
        style={{
          width: ancho,
          height: alto,
        }}
        accessibilityLabel="Logotipo de FindIt"
      />
    </View>
  );
}
