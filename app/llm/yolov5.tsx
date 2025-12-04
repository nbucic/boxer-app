import '@tensorflow/tfjs-react-native';
import { Text } from '@/components/ui/text';
import { ActivityIndicator, Button, Image, Platform, View } from 'react-native';
import { Box } from '@/components/ui/box';
import { useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import { GraphModel } from '@tensorflow/tfjs';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
} from '@/components/ui/actionsheet';
import * as ImagePicker from 'expo-image-picker';
import { showAlert } from '@/lib/helpers/alert';
import { ImagePickerOptions } from 'expo-image-picker';
import { decodeJpeg } from '@tensorflow/tfjs-react-native';

export default function TensorScreen() {
  const [isTfReady, setIsTfReady] = useState(false);
  const [model, setModel] = useState<GraphModel | null>();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState({ state: 'loading', progress: 0 });
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modelInputShape, setModelInputShape] = useState<number[]>([]);
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
  };

  const ratio = 3;

  useEffect(() => {
    setLoading({ state: 'loading', progress: 0 });
    const prepare = async () => {
      // Initialize the TFJS backend for React Native
      await tf.ready();
      setIsTfReady(true);
      console.log('TensorFlow.js ready!');

      tf.loadGraphModel(
        'https://etybmtbixvpakwxoymry.supabase.co/storage/v1/object/public/data/models/yolov5s_web_model/model.json',
        {
          onProgress: (fraction) => {
            setLoading({ state: 'loading', progress: fraction });
          },
        }
      ).then(async (yolov5) => {
        const inputShape = yolov5.inputs[0].shape;
        if (!testInputShape(inputShape)) {
          throw new Error('Invalid input shape');
        }
        setModelInputShape(inputShape);
        const dummyInput = tf.ones(inputShape);
        await yolov5.executeAsync(dummyInput).then((warmupResult) => {
          tf.dispose(warmupResult);
          tf.dispose(dummyInput);

          setModel(yolov5);
          setLoading({ state: 'ready', progress: 1 });
        });
      });
    };

    prepare().catch((error) => {
      console.error('Failed to load model', error);
    });
  }, []);

  const testInputShape = (shape: any) => {
    const isArray = Array.isArray(shape);

    return isArray && shape.every((el) => typeof el === 'number');
  };

  const getAnImage = async ({
    type = 'gallery',
  }: {
    type: 'gallery' | 'camera';
  }) => {
    try {
      // Clear previous results
      setImageUri(null);

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
      await detectObjects(uri);
    } catch (e) {
      console.error('Error selecting image:', e);
    }
  };

  const renderPrediction = (
    boxes_data: any,
    scores_data: any,
    classes_data: any
  ) => {
    console.log({ boxes_data, scores_data, classes_data });
  };

  const detectObjects = async (uri: string) => {
    if (!model) {
      return;
    }

    try {
      const response = await fetch(uri);
      const rawImageData = await response.arrayBuffer();
      const imageData = new Uint8Array(rawImageData);
      const imageTensor = decodeJpeg(imageData);
      setImageWidthAndHeight({
        height: imageTensor.shape[0],
        width: imageTensor.shape[1],
      });

      tf.engine().startScope();

      let [modelWidth, modelHeight] = modelInputShape.slice(1, 3);
      const input = tf.tidy(() => {
        return tf.image
          .resizeBilinear(imageTensor, [modelWidth, modelHeight])
          .div(255.0)
          .expandDims(0);
      });
      await model.executeAsync(input).then((res) => {
        // @ts-ignore
        const [boxes, scores, classes] = res.slice(0, 3);
        const boxes_data = boxes.dataSync();
        const scores_data = scores.dataSync();
        const classes_data = classes.dataSync();

        renderPrediction(boxes_data, scores_data, classes_data);
        tf.dispose(res);
      });

      tf.dispose(imageTensor);
      tf.engine().endScope();
    } catch (e) {
      console.error('Detection error:', e);
    } finally {
    }
  };

  if (!isTfReady || !model) {
    return (
      <View className={'flex-1 justify-center items-center gap-2'}>
        <ActivityIndicator size={'large'} />
        <Text className={'dark:text-white'}>Loading ML Model...</Text>
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
        disabled={loading.state === 'loading'}
      ></Button>

      {imageUri && imageWidthAndHeight && (
        <View className={'z-0 elevation-none'}>
          <Image
            source={{ uri: imageUri }}
            style={{
              width: imageWidthAndHeight.width / ratio,
              height: imageWidthAndHeight.height / ratio,
            }}
          />
        </View>
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
