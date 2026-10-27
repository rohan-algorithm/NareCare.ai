import { useState } from 'react';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Screen } from '@/src/ui/Screen';
import { Button } from '@/src/ui/Button';
import { Card } from '@/src/ui/Card';
import { Body, Display, Label, Muted, Title } from '@/src/ui/Typography';
import { colors, fonts, spacing } from '@/src/theme/tokens';
import { useAppStore } from '@/src/store/useAppStore';
import {
  formatAlarmTime,
  reminderBody,
  reminderTitle,
} from '@/src/features/reminderDefaults';

export default function Reminders() {
  const router = useRouter();
  const reminders = useAppStore((s) => s.reminders);
  const setReminderEnabled = useAppStore((s) => s.setReminderEnabled);
  const setAlarmsArmed = useAppStore((s) => s.setAlarmsArmed);
  const profile = useAppStore((s) => s.profile);
  const lang = profile?.language ?? 'en';
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  const save = async () => {
    setSaving(true);
    try {
      const { scheduleReminders } = await import('@/src/features/reminders');
      const n = await scheduleReminders(reminders);
      setAlarmsArmed(n > 0);
      setStatus(
        n > 0
          ? lang === 'hi'
            ? `अगले 7 दिनों के ${n} स्मार्ट रिमाइंडर तैयार`
            : `${n} smart reminders set for the next 7 days`
          : lang === 'hi'
            ? 'सेटिंग्स में नोटिफिकेशन चालू करें'
            : 'Turn on notifications for NariCare in Settings',
      );
    } catch (e: any) {
      setStatus(e?.message ?? 'Could not schedule — use a dev build for push');
    } finally {
      setSaving(false);
    }
  };

  const test = async () => {
    try {
      const { sendTestReminder } = await import('@/src/features/reminders');
      await sendTestReminder();
      Alert.alert('Sent', lang === 'hi' ? '~3 सेकंड में टेस्ट' : 'Test notification in ~3 seconds');
    } catch (e: any) {
      Alert.alert('Notifications', e?.message ?? 'Allow notifications or use a development build.');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: lang === 'hi' ? 'अलार्म' : 'Alarms',
          headerTintColor: colors.blushDeep,
          headerStyle: { backgroundColor: colors.surface },
        }}
      />
      <Screen scroll>
        <Animated.View entering={FadeInDown.duration(400)}>
          <Label>{lang === 'hi' ? 'दिन की लय' : 'Day rhythm'}</Label>
          <Display style={{ marginTop: 6 }}>
            {lang === 'hi' ? 'अलार्म जो\nकार्रवाई लाएँ' : 'Alarms that\nlead to action'}
          </Display>
          <Body style={{ color: colors.muted, marginTop: 8 }}>
            {lang === 'hi'
              ? 'एक्सरसाइज़ अलार्म पर Move खोलें → Start → पूरा करें। फ़ोटो नहीं।'
              : 'On exercise alarm open Move → Start → complete. No photo.'}
          </Body>
        </Animated.View>

        {reminders.map((r, i) => (
          <Animated.View key={r.key} entering={FadeInDown.delay(40 * i).duration(350)}>
            <Card tone="solid" style={{ marginTop: spacing.md }}>
              <View style={styles.row}>
                <View style={{ flex: 1, paddingRight: spacing.md }}>
                  <Title>{reminderTitle(r, lang === 'hi' ? 'hi' : 'en')}</Title>
                  <Muted style={{ marginTop: 4 }}>
                    {reminderBody(r, lang === 'hi' ? 'hi' : 'en')}
                  </Muted>
                  <Text style={styles.time}>
                    {formatAlarmTime(r.hour, r.minute)}{' '}
                    {lang === 'hi' ? 'रोज़' : 'daily'}
                  </Text>
                </View>
                <Switch
                  value={r.enabled}
                  onValueChange={(v) => setReminderEnabled(r.key, v)}
                  trackColor={{ true: colors.blushDeep, false: colors.lineStrong }}
                  thumbColor={colors.white}
                />
              </View>
            </Card>
          </Animated.View>
        ))}

        <Button
          label={saving ? '…' : lang === 'hi' ? 'फ़ोन पर अलार्म सेव करें' : 'Save alarms to phone'}
          onPress={save}
          style={{ marginTop: spacing.xl }}
        />
        <Button
          label={lang === 'hi' ? 'अभी मूव शुरू करें' : 'Start Move now'}
          variant="secondary"
          onPress={() => router.push('/move?start=1')}
          style={{ marginTop: spacing.sm }}
        />
        <Button
          label={lang === 'hi' ? 'टेस्ट नोटिफिकेशन' : 'Send test notification'}
          variant="ghost"
          onPress={test}
          style={{ marginTop: spacing.sm }}
        />
        {!!status && <Muted style={{ marginTop: spacing.md, textAlign: 'center' }}>{status}</Muted>}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  time: {
    marginTop: 8,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.amber,
    letterSpacing: 0.3,
  },
});
