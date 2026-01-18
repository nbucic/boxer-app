import { useCallback, useRef } from 'react';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import {
  Alert,
  Linking,
  Modal,
  Platform,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Print from 'expo-print';
import { Box as BoxType } from '@/types/box';
import Svg from 'react-native-svg';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { PrinterIcon, ShareIcon, XIcon } from 'lucide-react-native';
import { QRCodeDisplay } from '@/components/QRCode/Display';
import { Text } from '@/components/ui/text';
import { Box } from '@/components/ui/box';
import { GlassCard } from '@/components/layout/GlassCard';

export default function ShareBox({
  box,
  isOpen,
  onClose,
}: {
  box: BoxType;
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
      <View
        className={'flex-1 bg-background-900/40 backdrop-blur-xl justify-end'}
      >
        <VStack
          className={
            'bg-background-0 rounded-t-3xl border-t border-outline-50 pb-safe shadow-2xl'
          }
        >
          {/* Handle bar for visual cue */}
          <View className="items-center pt-3 pb-1">
            <View className="w-12 h-1.5 bg-outline-200 rounded-full" />
          </View>

          {/* Header */}
          <HStack className={'justify-between items-center px-6 py-4'}>
            <VStack>
              <Heading size="xl" className="text-typography-900">
                Share Box
              </Heading>
              <Text size="sm" className="text-typography-500">
                Generate a QR code for your label
              </Text>
            </VStack>
            <TouchableOpacity
              onPress={onClose}
              className="bg-background-100 p-2 rounded-full"
            >
              <XIcon size={20} className="text-typography-600" />
            </TouchableOpacity>
          </HStack>

          {/* Body */}
          <View className={'px-6 py-4'}>
            <GlassCard className={'items-center justify-center py-10'}>
              <Text
                className={'text-xl font-bold text-typography-900 text-center'}
              >
                {box.name}
              </Text>

              <Box
                className={'bg-white p-4 rounded-3xl border border-outline-100'}
              >
                <QRCodeDisplay box={box} ref={qrCodeRef} />
              </Box>

              <Text className="text-xs text-typography-400 mt-6 text-center px-10">
                Anyone with this QR code can view the contents of this box.
              </Text>
            </GlassCard>
          </View>

          {/* Footer Actions */}
          <HStack space="md" className="p-6 mb-4">
            <Button
              variant="outline"
              size="lg"
              onPress={handlePrint}
              className="flex-1 rounded-2xl border-outline-300"
            >
              <ButtonIcon as={PrinterIcon} className="mr-2" />
              <ButtonText className="text-typography-700">Print</ButtonText>
            </Button>

            <Button
              size="lg"
              onPress={handleShare}
              className="flex-1 bg-primary-500 rounded-2xl shadow-soft-1"
            >
              <ButtonIcon as={ShareIcon} className="mr-2" />
              <ButtonText className="font-bold text-white">Share</ButtonText>
            </Button>
          </HStack>
        </VStack>
      </View>
    </Modal>
  );
}
