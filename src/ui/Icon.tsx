import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

export type IconName = keyof typeof Ionicons.glyphMap;

type Props = {
  name: IconName;
  color: string;
  bg: string;
  size?: number;
  box?: number;
};

export function IconBubble({ name, color, bg, size = 20, box = 42 }: Props) {
  return (
    <View
      style={{
        width: box,
        height: box,
        borderRadius: box / 2.6,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name={name} size={size} color={color} />
    </View>
  );
}

export { Ionicons };
