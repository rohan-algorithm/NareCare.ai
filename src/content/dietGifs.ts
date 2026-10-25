import type { ImageSourcePropType } from 'react-native';

/** Diet-only GIF — keep separate so Move GIFs aren't loaded on Diet import. */
export const DIET_GIFS = {
  healthy_plate: require('../../assets/gifs/healthy_plate.gif') as ImageSourcePropType,
};
