import { Alert, Platform } from 'react-native';

export const showAlert = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel: () => void
) => {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n${message}`)) {
      onConfirm();
    } else {
      onCancel();
    }
  } else {
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel', onPress: onCancel },
        { text: 'Confirm', style: 'destructive', onPress: onConfirm },
      ],
      { cancelable: true }
    );
  }
};
