import QRCode from 'react-native-qrcode-svg';
import { Box } from '@/types/box';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import Svg from 'react-native-svg';
import { getDeepLink } from '@/components/DeepLink';

type QrCodeDisplayProps = {
  box: Box;
};

export const QRCodeDisplay = forwardRef<Svg, QrCodeDisplayProps>(
  ({ box }, ref) => {
    const qrCodeRef = useRef<Svg>(null);
    const deepLink = getDeepLink(`box/${box.id}`);

    console.log('Deep link:', deepLink);

    useImperativeHandle(ref, () => qrCodeRef.current!, []);

    return (
      <QRCode
        getRef={(c) => {
          qrCodeRef.current = c;
        }}
        value={deepLink}
        logo={require('@/assets/images/package-open.png')}
        logoSize={24}
        size={256}
      />
    );
  }
);
