import { useRouter, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/src/ui/Button';
import { colors, fonts, spacing } from '@/src/theme/tokens';
import { useAppStore } from '@/src/store/useAppStore';

export default function NotFoundScreen() {
  const router = useRouter();
  const hi = useAppStore((s) => s.profile?.language === 'hi');
  return (
    <>
      <Stack.Screen options={{ title: hi ? 'नहीं मिला' : 'Not found' }} />
      <View style={styles.container}>
        <Text style={styles.brand}>NariCare</Text>
        <Text style={styles.title}>
          {hi ? 'यह स्क्रीन खो गई' : 'This screen wandered off'}
        </Text>
        <Text style={styles.body}>
          {hi
            ? 'होम पर वापस जाएँ — आज का फोकस इंतज़ार कर रहा है।'
            : 'Head back home — today’s focus is waiting.'}
        </Text>
        <Button
          label={hi ? 'होम जाएँ' : 'Go home'}
          onPress={() => router.replace('/')}
          style={{ marginTop: spacing.lg, alignSelf: 'stretch' }}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  brand: {
    fontFamily: fonts.displayBold,
    fontSize: 16,
    color: colors.blushDeep,
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 24,
    color: colors.ink,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
  },
});
