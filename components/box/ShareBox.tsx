import { useCallback, useRef } from 'react';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Button, ButtonText } from '@/components/ui/button';
import {
  Alert,
  Linking,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Print from 'expo-print';
import { Box } from '@/types/box';
import Svg from 'react-native-svg';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { XIcon } from 'lucide-react-native';
import { QRCodeDisplay } from '@/components/QRCode/Display';

export default function ShareBox({
  box,
  isOpen,
  onClose,
}: {
  box: Box;
  isOpen: boolean;
  onClose: () => void;
}) {
  const qrCodeRef = useRef<Svg>(null);

  const handleShare = useCallback(async () => {
    const qrCode = qrCodeRef.current;
    if (!qrCode) {
      return;
    }

    const shareLocalFile = async (uri: string) => {
      const options = {
        url: uri,
        message: 'Demo message',
        mimeType: 'image/png',
        dialogTitle: 'Share the QR code of the box',
      };

      try {
        await Sharing.shareAsync(uri, options);
        /*await Share.share(
          {
            title: 'What to share',
            message: text,
          },
          {
            dialogTitle: 'How to share?',
          }
        );*/
      } catch (error) {
        console.error('Error sharing file:', error);
        Alert.alert('Sharing Error', 'Failed to open the share sheet.');
      }
    };

    qrCode.toDataURL(async (svg) => {
      if (Platform.OS === 'web') {
        await Linking.openURL(`data:image/png;base64,${svg}`);
        return;
      }

      const fileName = `qr-code-${Date.now()}.png`;
      const file = new File(Paths.cache, fileName);

      try {
        file.create();
        file.write(svg, {
          encoding: 'base64',
        });

        const fileUri = file.uri;
        await shareLocalFile(fileUri);
      } catch (error) {
        console.error('Error sharing', error);
      } finally {
        try {
          file.delete();
        } catch (cleanupError) {
          console.warn('Failed to clean up temporary file:', cleanupError);
        }
      }
    });
  }, [box.id]);

  const handlePrint = useCallback(() => {
    const qrCode = qrCodeRef.current;
    if (!qrCode) {
      return;
    }

    qrCode.toDataURL(async (data) => {
      const html = `
      <html lang="en">
        <head>
          <style>
            @page {margin: 20px; }
            body {
                display: flex; 
                flex-direction: column; 
                justify-content: center; 
                align-items: center; 
                font-family: sans-serif; 
            }
            h1 { 
                font-size: 24px; 
                margin-bottom: 20px; 
                text-align: center; 
            }
            img {width: 80%; height: auto; max-width: 400px; }
          </style>
        </head>
        <body>
            <h1>${box.name}</h1>
            <img src="data:image/png;base64,${data}" alt="QR Code" />
        </body>
      </html>
      `;
      try {
        await Print.printAsync({
          html,
        });
      } catch (error) {
        console.error('Error printing', error);
      }
    });
  }, [box.name]);

  return (
    <Modal
      animationType={'slide'}
      transparent={true}
      visible={isOpen}
      onRequestClose={onClose}
    >
      <View className={'flex-1 bg-black/50'}>
        <VStack className={'bg-white rounded-t-3xl mt-auto'}>
          {/* Header */}
          <HStack
            className={
              'justify-between items-center p-4 border-b border-outline-100'
            }
          >
            <Heading className={'text-center'}>Share the box</Heading>
            <TouchableOpacity onPress={onClose}>
              <XIcon size={24} />
            </TouchableOpacity>
          </HStack>

          {/* Body */}
          <View className={'items-center justify-center p-5'}>
            <Text className={'text-2xl pb-4'}>{box.name}!</Text>
            <QRCodeDisplay box={box} ref={qrCodeRef} />
          </View>

          {/* Footer */}
          <HStack className={'w-full gap-x-3 p-4 border-t border-outline-100'}>
            <Button size={'sm'} onPress={handleShare} className={'flex-1'}>
              <ButtonText>Share</ButtonText>
            </Button>
            <Button size={'sm'} onPress={handlePrint} className={'flex-1'}>
              <ButtonText>Print</ButtonText>
            </Button>
          </HStack>
        </VStack>
      </View>
    </Modal>
  );
}
