import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Screen } from '@/src/ui/Screen';
import { Ionicons, type IconName } from '@/src/ui/Icon';
import { colors, fonts, shadowCard, spacing } from '@/src/theme/tokens';
import { useAppStore } from '@/src/store/useAppStore';
import { callEdge } from '@/src/lib/identity';
import { isSupabaseConfigured, supabase } from '@/src/lib/supabase';
import { getNotifications } from '@/src/features/reminders';

type Point = { icon: IconName; en: [string, string]; hi: [string, string] };

const PRIVACY: Point[] = [
  {
    icon: 'phone-portrait-outline',
    en: ['Stored on your phone first', 'Your logs, meals, labs and chats are saved on this device. When cloud backup is on, they are stored in your private account, visible only to you.'],
    hi: ['पहले आपके फ़ोन पर', 'आपके लॉग, खाना, लैब और चैट इसी डिवाइस पर सेव होते हैं। क्लाउड बैकअप चालू होने पर वे आपके निजी अकाउंट में रहते हैं, जिसे सिर्फ़ आप देख सकती हैं।'],
  },
  {
    icon: 'sparkles-outline',
    en: ['How AI uses your data', 'When you ask the AI coach or scan a lab report, that message or photo and a summary of your recent data are sent to our AI provider to create the answer. Lab photos are not stored by us after reading.'],
    hi: ['AI आपके डेटा का उपयोग कैसे करता है', 'AI कोच से पूछने या लैब रिपोर्ट स्कैन करने पर, वह संदेश या फोटो और आपके हाल के डेटा का सारांश जवाब बनाने के लिए हमारे AI प्रदाता को भेजा जाता है। पढ़ने के बाद लैब फोटो हम सेव नहीं करते।'],
  },
  {
    icon: 'people-outline',
    en: ['Community is anonymous by default', 'Posts don’t need your name. Report or hide anything; reported posts go to human moderators.'],
    hi: ['कम्युनिटी डिफ़ॉल्ट रूप से अनाम', 'पोस्ट के लिए नाम ज़रूरी नहीं। कुछ भी रिपोर्ट या छिपाएँ; रिपोर्ट मानव मॉडरेटर तक जाती हैं।'],
  },
  {
    icon: 'card-outline',
    en: ['Payments through Google Play', 'Subscriptions are billed by Google Play (UPI, cards, netbanking). We never see your card or UPI details. Cancel anytime in Play Store → Subscriptions.'],
    hi: ['पेमेंट Google Play से', 'सब्सक्रिप्शन Google Play से (UPI, कार्ड, नेटबैंकिंग)। हम आपका कार्ड या UPI विवरण कभी नहीं देखते। Play Store → Subscriptions में कभी भी रद्द करें।'],
  },
  {
    icon: 'ban-outline',
    en: ['No ads, no selling data', 'We don’t show ads and we never sell or share your health data for advertising.'],
    hi: ['न विज्ञापन, न डेटा बिक्री', 'हम विज्ञापन नहीं दिखाते और आपका स्वास्थ्य डेटा कभी नहीं बेचते।'],
  },
];

const TERMS: Point[] = [
  {
    icon: 'medkit-outline',
    en: ['Educational companion, not medical care', 'NariCare does not diagnose, treat or prescribe. Always follow your doctor’s advice. In an emergency call 112.'],
    hi: ['शैक्षिक साथी, इलाज नहीं', 'NariCare निदान, इलाज या दवा नहीं देता। हमेशा डॉक्टर की सलाह मानें। इमरजेंसी में 112 पर कॉल करें।'],
  },
  {
    icon: 'person-outline',
    en: ['For adults 18+', 'NariCare is designed for women aged 18 and above.'],
    hi: ['18+ वयस्कों के लिए', 'NariCare 18 वर्ष और उससे अधिक उम्र की महिलाओं के लिए है।'],
  },
  {
    icon: 'videocam-outline',
    en: ['Videos and attributions', 'Recipe and exercise videos open on YouTube and belong to their creators. Exercise illustrations and steps: RepDB (repdb.co). Move animations: IconScout & LottieFiles licenses.'],
    hi: ['वीडियो और श्रेय', 'रेसिपी और एक्सरसाइज़ वीडियो YouTube पर खुलते हैं और उनके निर्माताओं के हैं। एक्सरसाइज़ चित्र और स्टेप्स: RepDB (repdb.co)। मूव एनिमेशन: IconScout और LottieFiles लाइसेंस।'],
  },
];

export default function Privacy() {
  const router = useRouter();
  const hi = useAppStore((s) => s.profile?.language) === 'hi';
  const [deleting, setDeleting] = useState(false);

  const wipe = async () => {
    setDeleting(true);
    try {
      if (isSupabaseConfigured) {
        await callEdge('delete-account', {});
        await supabase.auth.signOut();
      }
      const N = await getNotifications();
      await N?.cancelAllScheduledNotificationsAsync();
      await useAppStore.persist.clearStorage();
      await AsyncStorage.clear();
      useAppStore.setState(useAppStore.getInitialState(), true);
      router.replace('/');
    } catch {
      Alert.alert(hi ? 'हटाया नहीं जा सका' : 'Couldn’t delete', hi ? 'इंटरनेट जाँचें और फिर कोशिश करें।' : 'Check your internet and try again.');
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = () =>
    Alert.alert(
      hi ? 'सब कुछ हटाएँ?' : 'Delete everything?',
      hi
        ? 'आपका अकाउंट, लॉग, लैब, चैट और प्लान हमेशा के लिए हट जाएँगे। सब्सक्रिप्शन अलग से Play Store में रद्द करें।'
        : 'Your account, logs, labs, chats and plan will be permanently deleted. Cancel any subscription separately in Play Store.',
      [
        { text: hi ? 'रद्द' : 'Cancel', style: 'cancel' },
        { text: hi ? 'हमेशा के लिए हटाएँ' : 'Delete permanently', style: 'destructive', onPress: () => void wipe() },
      ],
    );

  const render = (list: Point[]) =>
    list.map((p, i) => (
      <Animated.View key={p.en[0]} entering={FadeInDown.delay(40 * i).duration(300)} style={styles.card}>
        <Ionicons name={p.icon} size={20} color={colors.blushDeep} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{hi ? p.hi[0] : p.en[0]}</Text>
          <Text style={styles.body}>{hi ? p.hi[1] : p.en[1]}</Text>
        </View>
      </Animated.View>
    ));

  return (
    <>
      <Stack.Screen options={{ title: hi ? 'प्राइवेसी और शर्तें' : 'Privacy & terms', headerTintColor: colors.blushDeep, headerStyle: { backgroundColor: colors.surface } }} />
      <Screen scroll>
        <Text style={styles.h1}>{hi ? 'आपका डेटा, आपका नियंत्रण' : 'Your data, your control'}</Text>
        {render(PRIVACY)}
        <Text style={styles.h2}>{hi ? 'उपयोग की शर्तें' : 'Terms of use'}</Text>
        {render(TERMS)}
        <Pressable onPress={confirmDelete} disabled={deleting} style={styles.delete}>
          {deleting ? <ActivityIndicator color={colors.danger} /> : <Ionicons name="trash-outline" size={18} color={colors.danger} />}
          <Text style={styles.deleteText}>{hi ? 'मेरा अकाउंट और डेटा हटाएँ' : 'Delete my account & data'}</Text>
        </Pressable>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  h1: { fontFamily: fonts.displayBold, fontSize: 26, color: colors.ink, letterSpacing: -0.5, marginTop: spacing.sm, marginBottom: spacing.sm },
  h2: { fontFamily: fonts.displayBold, fontSize: 19, color: colors.ink, marginTop: spacing.lg, marginBottom: 4 },
  card: { flexDirection: 'row', gap: 12, backgroundColor: '#fff', borderRadius: 18, padding: spacing.md, marginTop: spacing.sm, ...shadowCard, shadowOpacity: 0.05, elevation: 1 },
  title: { fontFamily: fonts.bodyBold, fontSize: 14.5, color: colors.ink },
  body: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.muted, marginTop: 4 },
  delete: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: spacing.xl, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: colors.danger },
  deleteText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.danger },
});
