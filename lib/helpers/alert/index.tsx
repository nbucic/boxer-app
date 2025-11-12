import { Alert, Platform } from 'react-native';

type ShowAlertType =
  | {
      title: string;
      message: string;
    }
  | {
      title: string;
      message: string;
      onConfirm: () => void;
      onCancel: () => void;
    }
  | {
      title: string;
      message: string;
      onConfirm: () => void;
    };

export const showAlert = (props: ShowAlertType) => {
  // Case 1: Both Confirm and Cancel are provided
  if ('onConfirm' in props && 'onCancel' in props) {
    switch (Platform.OS) {
      case 'web':
        if (window.confirm(`${props.title}\n\n${props.message}`)) {
          props.onConfirm();
        } else {
          props.onCancel();
        }
        return;
      default:
        Alert.alert(
          props.title,
          props.message,
          [
            { text: 'Cancel', style: 'cancel', onPress: props.onCancel },
            { text: 'Confirm', style: 'default', onPress: props.onConfirm },
          ],
          {
            cancelable: true,
          }
        );
        break;
    }
  }
  // Case 2: Only Confirm is provided
  else if ('onConfirm' in props) {
    switch (Platform.OS) {
      case 'web':
        if (window.confirm(`${props.title}\n\n${props.message}`)) {
          props.onConfirm();
        }
        break;
      default:
        Alert.alert(
          props.title,
          props.message,
          [
            {
              text: 'OK',
              onPress: props.onConfirm,
            },
          ],
          {
            cancelable: true,
          }
        );
        break;
    }
  }
  // Case 3: Only Cancel is provided
  else {
    switch (Platform.OS) {
      case 'web':
        window.alert(`${props.title}\n\n${props.message}`);
        break;
      default:
        Alert.alert(props.title, props.message);
        break;
    }
  }
};
