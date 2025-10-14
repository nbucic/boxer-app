import { Alert, Image, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { Pencil, UserIcon } from 'lucide-react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

type Props = {
  avatarUrl: string | null;
  onImageChange: (image: ImagePicker.ImagePickerAsset) => void;
};

const Avatar = ({ avatarUrl, onImageChange }: Props) => {
  const [isUploading, setIsUploading] = useState(false);
  const pickImage = async () => {
    setIsUploading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        cameraType: ImagePicker.CameraType.front,
        allowsMultipleSelection: false,
        allowsEditing: true,
        quality: 1,
        exif: false,
        aspect: [1, 1],
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const image = result.assets[0];
      // Pass the selected image asset up to the form.
      onImageChange(image);
    } catch (e) {
      console.error('Error picking image:', e);
      Alert.alert('Error', 'Could not pick image.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View className={'flex items-center justify-center'}>
      <View className={'relative'}>
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            accessibilityLabel={'Avatar'}
            className={
              'h-40 w-40 overflow-hidden max-w-full m-1.5 border rounded-full object-cover'
            }
          />
        ) : (
          <View
            className={
              'h-40 w-40 overflow-hidden max-w-full m-1.5 bg-gray-200 border rounded-full border-[rgb(200,200,200)] items-center justify-center'
            }
          >
            <Icon as={UserIcon} className={'w-2/3 h-2/3'} />
          </View>
        )}
        <TouchableOpacity
          onPress={pickImage}
          disabled={isUploading}
          className={'absolute bottom-2 right-2 bg-gray-700 p-2 rounded-full'}
        >
          <Icon as={Pencil} color={'white'} size={'sm'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Avatar;
