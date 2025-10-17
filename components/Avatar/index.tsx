import { Alert, Image, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/ui/icon';
import {
  LucideIcon,
  PackageOpenIcon,
  Pencil,
  UserIcon,
} from 'lucide-react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

type ImageProps = {
  uri?: string;
  icon: LucideIcon;
  editIcon: LucideIcon;
  pickImage: () => Promise<void>;
  isUploading: boolean;
};

// --- Local Circle Component ---
const Circle = ({
  uri,
  icon,
  editIcon,
  pickImage,
  isUploading,
}: ImageProps) => {
  return (
    <View className={'relative'}>
      {uri ? (
        <Image
          source={{ uri }}
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
          <Icon as={icon} className={'w-2/3 h-2/3'} />
        </View>
      )}
      <TouchableOpacity
        onPress={pickImage}
        disabled={isUploading}
        className={'absolute bottom-2 right-2 bg-gray-700 p-2 rounded-full'}
      >
        <Icon as={editIcon} color={'white'} size={'sm'} />
      </TouchableOpacity>
    </View>
  );
};

// --- Local RoundedBox Component ---
const RoundedBox = ({
  uri,
  icon,
  editIcon,
  pickImage,
  isUploading,
}: ImageProps) => {
  return (
    <View className={'relative w-full'}>
      <View className={'w-full aspect-square rounded-lg p-[10] bg-[#e5e5e5]'}>
        {uri ? (
          <Image
            source={{ uri }}
            accessibilityLabel={'Box Image'}
            className={'w-full h-full object-cover rounded-lg'}
          />
        ) : (
          <View
            className={
              'flex-1 justify-center items-center border-2 border-[#a3a3a3] border-dashed rounded-[4px]'
            }
          >
            <Icon as={icon} className={'text-neutral-400 w-[200] h-[200]'} />
          </View>
        )}
      </View>
      <TouchableOpacity
        onPress={pickImage}
        disabled={isUploading}
        className={
          'absolute bottom-2.5 right-2.5 bg-gray-700 p-2 rounded-br-[4px]'
        }
      >
        <Icon as={editIcon} color={'white'} size={'sm'} />
      </TouchableOpacity>
    </View>
  );
};

// --- Main Avatar Component ---
type Props = {
  type?: 'avatar' | 'box';
  avatarUrl: string | null | undefined;
  onImageChange: (image: ImagePicker.ImagePickerAsset) => void;
};

const Avatar = ({ type = 'avatar', avatarUrl, onImageChange }: Props) => {
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
      onImageChange(image);
    } catch (e) {
      console.error('Error picking image:', e);
      Alert.alert('Error', 'Could not pick image.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {type === 'avatar' ? (
        <Circle
          uri={avatarUrl ?? undefined}
          icon={UserIcon}
          editIcon={Pencil}
          pickImage={pickImage}
          isUploading={isUploading}
        />
      ) : (
        <RoundedBox
          uri={avatarUrl ?? undefined}
          icon={PackageOpenIcon}
          editIcon={Pencil}
          pickImage={pickImage}
          isUploading={isUploading}
        />
      )}
    </>
  );
};

export default Avatar;
