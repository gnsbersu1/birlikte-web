import { Alert, Linking, Platform } from 'react-native';
import { translateCurrent } from '@/i18n';

async function openDeviceApp(url: string) {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert(translateCurrent('phone.couldNotOpen'), translateCurrent('phone.tryAgain'));
  }
}

function confirmDeviceAction(title: string, message: string, confirmLabel: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
    return;
  }

  Alert.alert(title, message, [
    { text: translateCurrent('common.cancel'), style: 'cancel' },
    { text: confirmLabel, onPress: onConfirm },
  ]);
}

export function confirmPhoneCall(name: string, phone: string, message?: string) {
  confirmDeviceAction(
    translateCurrent('phone.callQuestion', { name }),
    message ?? translateCurrent('phone.callDefault', { phone }),
    translateCurrent('phone.yesCall'),
    () => void openDeviceApp(`tel:${phone}`),
  );
}

export function confirmMessage(name: string, phone: string) {
  confirmDeviceAction(
    translateCurrent('phone.messageQuestion', { name }),
    translateCurrent('phone.messageDefault'),
    translateCurrent('common.message'),
    () => void openDeviceApp(`sms:${phone}`),
  );
}
