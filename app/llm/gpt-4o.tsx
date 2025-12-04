import '@tensorflow/tfjs-react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { ImagePickerAsset, ImagePickerOptions } from 'expo-image-picker';
import { ActivityIndicator, Button, Image, Platform, View } from 'react-native';
import { showAlert } from '@/lib/helpers/alert';
import { DetectedObject } from '@tensorflow-models/coco-ssd';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
} from '@/components/ui/actionsheet';
import { VStack } from '@/components/ui/vstack';

export default function TensorScreen() {
  const [model, setModel] = useState();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<DetectedObject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [imageWidthAndHeight, setImageWidthAndHeight] = useState<
    | {
        width: number;
        height: number;
      }
    | undefined
  >(undefined);

  const imagePickerOptions: ImagePickerOptions = {
    mediaTypes: 'images',
    allowsEditing: false,
    aspect: [4, 3],
    quality: 1,
    base64: true,
  };

  const borderColors = ['blue', 'green', 'orange', 'pink', 'purple'];
  const ratio = 3;

  //1. Initialize  TFJS and load the model
  useEffect(() => {
    const prepare = async () => {};

    void prepare().catch((error) => {
      console.error('Error initializing ML:', error);
    });
  }, []);

  //2.a) Select an image and convert it to a tensor
  const getAnImage = async ({
    type = 'gallery',
  }: {
    type: 'gallery' | 'camera';
  }) => {
    try {
      // Clear previous results
      setImageUri(null);
      setPredictions([]);

      const { status } =
        type === 'gallery'
          ? await ImagePicker.requestMediaLibraryPermissionsAsync()
          : await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        showAlert({
          title: 'Error',
          message: 'Permission to access media library is required!',
        });

        return;
      }

      const pickerResult =
        type === 'gallery'
          ? await ImagePicker.launchImageLibraryAsync(imagePickerOptions)
          : await ImagePicker.launchCameraAsync(imagePickerOptions);

      if (pickerResult.canceled) return;
      const uri = pickerResult.assets[0].uri;
      setImageUri(uri);

      // Immediately start detection
      console.log('Starting object detection ...');
      await detectObjects(pickerResult.assets[0]);
    } catch (e) {
      console.error('Error selecting image:', e);
    }
  };

  //3. Perform object detection
  const detectObjects = async (asset: ImagePickerAsset) => {
    if (!asset) return;

    try {
      const body = JSON.stringify({
        requests: [
          {
            features: [{ type: 'LABEL_DETECTION', maxResults: 10 }],
            image: {
              content: asset.base64,
            },
          },
        ],
      });

      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${process.env.EXPO_PUBLIC_GCP_API_KEY}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body,
        }
      );

      const responseJson = await response.json();
      console.log(responseJson);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Box
      className={'flex-1 bg-white dark:bg-black justify-center items-center'}
    >
      <Text
        className={'text-base font-medium text-gray-900 dark:text-white mb-3'}
      >
        OpenAI
      </Text>
      <Button
        title={'Chose an image'}
        onPress={() =>
          Platform.OS === 'web'
            ? getAnImage({ type: 'gallery' })
            : setModalVisible(true)
        }
        disabled={isLoading}
      ></Button>

      {imageUri && imageWidthAndHeight && (
        <View className={'relative'}>
          {model &&
            predictions &&
            predictions.map((p, index) => {
              return (
                <View
                  key={index}
                  style={{
                    zIndex: 1,
                    elevation: 1,
                    left: p.bbox[0] / ratio,
                    top: p.bbox[1] / ratio,
                    width: p.bbox[2] / ratio,
                    height: p.bbox[3] / ratio,
                    borderWidth: 2,
                    borderColor: borderColors[index % 5],
                    backgroundColor: 'transparent',
                    position: 'absolute',
                  }}
                />
              );
            })}

          <View style={{ zIndex: 0, elevation: 0 }}>
            <Image
              source={{ uri: imageUri }}
              style={{
                width: imageWidthAndHeight.width / ratio,
                height: imageWidthAndHeight.height / ratio,
              }}
            />
          </View>
        </View>
      )}

      {isLoading && (
        <ActivityIndicator
          size={'large'}
          color={'$ff0000'}
          className={'my-5'}
        />
      )}

      {predictions.length > 0 && (
        <View className={'mt-5 w-full items-start px-5'}>
          <Text
            className={'text-lg font-bold mb-1.5 text-black dark:text-white'}
          >
            Detections:
          </Text>
          {predictions.map((p: DetectedObject, index) => (
            <VStack space={'xs'} key={`v-${index}`}>
              <Text key={index} className={'uppercase'}>
                {p.class} ({Math.round(p.score * 100)}%):
              </Text>
              <Text key={`0-${index}`}>
                {'\u2022'} LEFT: {p.bbox[0]}
              </Text>
              <Text key={`1-${index}`}>
                {'\u2022'} TOP: {p.bbox[1]}
              </Text>
              <Text key={`2-${index}`}>
                {'\u2022'} RIGHT: {p.bbox[2]}
              </Text>
              <Text key={`3-${index}`}>
                {'\u2022'} BOTTOM: {p.bbox[3]}
              </Text>
            </VStack>
          ))}
        </View>
      )}

      {imageUri && predictions.length === 0 && !isLoading && (
        <Text className={'mt-5 text-sm text-gray-500'}>
          No objects detected.
        </Text>
      )}

      <Actionsheet isOpen={modalVisible} onClose={() => setModalVisible(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          {[
            {
              text: 'Pick from a gallery',
              press: () => getAnImage({ type: 'gallery' }),
            },
            {
              text: 'Take a photo',
              press: () => getAnImage({ type: 'camera' }),
            },
            { text: 'Cancel', press: () => {} },
          ].map((action, index) => (
            <ActionsheetItem
              key={index}
              onPress={() => {
                action.press();
                setModalVisible(false);
              }}
            >
              <ActionsheetItemText>{action.text}</ActionsheetItemText>
            </ActionsheetItem>
          ))}
        </ActionsheetContent>
      </Actionsheet>
    </Box>
  );
}
