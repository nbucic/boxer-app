import '@tensorflow/tfjs-react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { ImagePickerOptions } from 'expo-image-picker';
import { ActivityIndicator, Button, Image, Platform, View } from 'react-native';
import { showAlert } from '@/lib/helpers/alert';
import * as tf from '@tensorflow/tfjs';
import * as mobileNet from '@tensorflow-models/mobilenet';
import { decodeJpeg } from '@tensorflow/tfjs-react-native';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
} from '@/components/ui/actionsheet';
import { MobileNet } from '@tensorflow-models/mobilenet';

export default function TensorScreen() {
  const [isTfReady, setIsTfReady] = useState(false);
  const [model, setModel] = useState<MobileNet | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<
    Array<{
      className: string;
      probability: number;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const imagePickerOptions: ImagePickerOptions = {
    mediaTypes: 'images',
    allowsEditing: false,
    aspect: [4, 3],
    quality: 1,
  };

  //1. Initialize  TFJS and load the model
  useEffect(() => {
    const prepare = async () => {
      try {
        // Initialize the TFJS backend for React Native
        await tf.ready();
        setIsTfReady(true);
        console.log('TensorFlow.js ready!');

        // Load the COCO-SSD object detection model
        const loadedModel = await mobileNet.load();
        // const loadedModel = await cocoSsd.load();
        setModel(loadedModel);
        console.log('MobileNet Model loaded!');
        // console.log('COCO-SSD Model loaded!');
      } catch (error) {
        console.error('Error initializing ML:', error);
      }
    };

    void prepare();
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
      await detectObjects();
    } catch (e) {
      console.error('Error selecting image:', e);
    }
  };

  //3. Perform object detection
  const detectObjects = async () => {
    if (!model || !imageUri) return;

    setIsLoading(true);

    try {
      console.log('Trying to detect some objects');
      console.log('Fetching image', imageUri);
      const response = await fetch(imageUri);
      const rawImageData = await response.arrayBuffer();
      const imageData = new Uint8Array(rawImageData);
      const imageTensor = decodeJpeg(imageData);

      const newPredictions = await model.classify(imageTensor, 5);
      console.log('Finished. Found', newPredictions.length, 'objects');
      setPredictions(newPredictions);

      tf.dispose(imageTensor);
    } catch (e) {
      console.error('Detection error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isTfReady || !model) {
    return (
      <View className={'flex-1 justify-center items-center gap-2'}>
        <ActivityIndicator size={'large'} />
        <Text className={'dark:text-white '}>Loading ML Model...</Text>
      </View>
    );
  }

  return (
    <Box
      className={'flex-1 bg-white dark:bg-black justify-center items-center'}
    >
      <Text
        className={'text-base font-medium text-gray-900 dark:text-white mb-3'}
      >
        Tensor
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

      {imageUri && (
        <View className={'mx-5 border border-red-500'}>
          <Image source={{ uri: imageUri }} className={'w-[300] h-[225]'} />
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
          {predictions.map(
            (
              p: {
                className: string;
                probability: number;
              },
              index
            ) => (
              <Text key={index} className={'text-sm'}>
                - {p.className} ({Math.round(p.probability * 100)}%)
              </Text>
            )
          )}
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
