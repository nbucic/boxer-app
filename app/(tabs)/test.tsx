import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { ActivityIndicator, Button, Image, View } from 'react-native';
import { showAlert } from '@/lib/helpers/alert';
import { StyleSheet } from 'nativewind';

const imageToTensor = (rawImageData: ArrayBuffer) => {
  // Decode the image data into a buffer
  // return decodeJpeg(new Uint8Array(rawImageData));
  /*const buffer = new Uint8Array(width * height * 3);
  let offset = 0;
  for (let i = 0; i < buffer.length; i += 3) {
    buffer[i] = data[offset];
    buffer[i + 1] = data[offset + 1];
    buffer[i + 2] = data[offset + 2];
    offset += 4;
  }

  // Create the tensor
  return tf.tensor3d(buffer, [height, width, 3]);*/
};

function TestScreen() {
  const [isTfReady, setIsTfReady] = useState(false);
  const [model, setModel] = useState<any>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  //1. Initialize  TFJS and load the model
  useEffect(() => {
    async function prepare() {
      try {
        // Initialize the TFJS backend for React Native
        // await tf.ready();
        setIsTfReady(true);
        console.log('TensorFlow.js is ready!');

        // Load the COCO-SSD object detection model
        // const loadedModel = await cocoSsd.load();
        // setModel(loadedModel);
        console.log('COCO-SSD Model loaded!');
      } catch (error) {
        console.error('Error initializing ML:', error);
      }
    }

    void prepare();
  }, []);

  // 2. Select an image and convert it to a tensor
  const selectImage = async () => {
    try {
      // Clear previous results
      setImageUri(null);
      setPredictions([]);

      // Request permission and open the image picker
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showAlert({
          title: 'Error',
          message: 'Permission to access media library is required!',
        });

        return;
      }

      let pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (pickerResult.canceled) return;

      const uri = pickerResult.assets[0].uri;
      setImageUri(uri);

      // Immediately start detection
      await detectObjects(uri);
    } catch (e) {
      console.error('Error selecting image: ', e);
    }
  };

  // 3. Perform object detection
  const detectObjects = async (uri: string) => {
    if (!model) return;

    setIsLoading(true);

    try {
      // Fetch the image data as a byte array
      // const response = await fetch(uri);
      const arrayBuffer = await fetch(uri).then((res) => res.arrayBuffer());

      // const rawImageData = await response.arrayBuffer();

      // Convert image data to tensor
      // const imageTensor = imageToTensor(arrayBuffer);

      // Run the detection model
      // const newPredictions = await model.detect(imageTensor);
      // setPredictions(newPredictions);

      // Clean up the tensor from memory
      // tf.dispose(imageTensor);
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
        <Text>Loading ML Model...</Text>
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
        TFJS Object Detector
      </Text>
      <Button
        title={'Pick an image from gallery'}
        onPress={selectImage}
        disabled={isLoading}
      />

      {imageUri && (
        <View className={'mx-5 border border-["#cccccc"]'}>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </View>
      )}

      {isLoading && (
        <ActivityIndicator
          size={'large'}
          color={'#ff0000'}
          className={'my-5'}
        />
      )}

      {predictions.length > 0 && (
        <View className={'mt-5 w-full items-start px-5'}>
          <Text className={'text-lg font-bold mb-1.5'}>Detections:</Text>
          {predictions.map((p, index) => (
            <Text key={index} className={'text-sm'}>
              {p}
              {/*- {p.class} ({Math.round(p.score * 100)}%)*/}
            </Text>
          ))}
        </View>
      )}

      {imageUri && predictions.length === 0 && !isLoading && (
        <Text className={'mt-5 text-sm text-gray-500'}>
          No objects detected.
        </Text>
      )}
    </Box>
  );
}

export default TestScreen;

const styles = StyleSheet.create({
  image: {
    width: 300,
    height: 225, // Adjust based on your expected aspect ratio
    resizeMode: 'contain',
  },
});
