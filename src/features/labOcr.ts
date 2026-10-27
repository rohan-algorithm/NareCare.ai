import * as ImagePicker from 'expo-image-picker';

import { callEdge } from '@/src/lib/identity';
import { isSupabaseConfigured } from '@/src/lib/supabase';

export const labScanAvailable = isSupabaseConfigured;

type OcrResult = { values: Record<string, number>; readable: boolean; lab?: string | null };

/** Raw extracted markers → app marker keys (LH and FSH become the ratio). */
export function toMarkerValues(raw: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const k of ['total_testosterone', 'fasting_insulin', 'hba1c', 'tsh', 'vit_d']) {
    if (raw[k] != null) out[k] = raw[k];
  }
  if (raw.lh_fsh_ratio != null) out.lh_fsh_ratio = raw.lh_fsh_ratio;
  else if (raw.lh != null && raw.fsh) out.lh_fsh_ratio = Math.round((raw.lh / raw.fsh) * 100) / 100;
  return out;
}

/** Returns null when the user cancels the picker. */
export async function pickPhoto(source: 'camera' | 'library'): Promise<{ base64: string; mimeType: string } | null> {
  if (source === 'camera') {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) throw new Error('camera-denied');
  }
  const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.6, base64: true };
  const picked =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(opts)
      : await ImagePicker.launchImageLibraryAsync(opts);
  if (picked.canceled) return null;
  const asset = picked.assets[0];
  if (!asset.base64) throw new Error('no-image');
  return { base64: asset.base64, mimeType: asset.mimeType ?? 'image/jpeg' };
}

/** Returns null when the user cancels the picker. */
export async function scanLabReport(source: 'camera' | 'library'): Promise<Record<string, number> | null> {
  const photo = await pickPhoto(source);
  if (!photo) return null;
  const res = await callEdge<OcrResult>('lab-ocr', { image: photo.base64, mimeType: photo.mimeType }, 45000);
  const values = toMarkerValues(res.values ?? {});
  if (!res.readable || Object.keys(values).length === 0) throw new Error('unreadable');
  return values;
}
