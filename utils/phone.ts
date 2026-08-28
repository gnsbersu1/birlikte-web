import { Alert, Linking } from 'react-native';
import { translateCurrent } from '@/i18n';

async function openDeviceApp(url: string) {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert(translateCurrent('phone.couldNotOpen'), translateCurrent('phone.tryAgain'));
  }
}

export function confirmPhoneCall(name: string, phone: string, message?: string) {
  Alert.alert(
    translateCurrent('phone.callQuestion', { name }),
    message ?? translateCurrent('phone.callDefault', { phone }),
    [
      { text: translateCurrent('common.cancel'), style: 'cancel' },
      { text: translateCurrent('phone.yesCall'), onPress: () => void openDeviceApp(`tel:${phone}`) },
    ],
  );
}

export function confirmMessage(name: string, phone: string) {
  Alert.alert(translateCurrent('phone.messageQuestion', { name }), translateCurrent('phone.messageDefault'), [
    { text: translateCurrent('common.cancel'), style: 'cancel' },
    { text: translateCurrent('common.message'), onPress: () => void openDeviceApp(`sms:${phone}`) },
  ]);
}
