import { Alert, Platform } from 'react-native';

type BaseAlertProps = {
  title: string;
  message: string;
};

type AlertVariations =
  | {
      onConfirm?: never;
      onCancel?: never;
    }
  | {
      onConfirm: () => void;
      onCancel?: never;
    }
  | {
      onConfirm: () => void;
      onCancel: () => void;
    };

type ShowAlertType = BaseAlertProps & AlertVariations;

export const showAlert = (props: ShowAlertType) => {
  // Case 1: Both Confirm and Cancel are provided
  if (props.onConfirm && props.onCancel) {
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
  else if (props.onConfirm) {
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
