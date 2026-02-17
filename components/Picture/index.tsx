import { Image, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/ui/icon';
import {
  LucideIcon,
  PackageOpenIcon,
  Pencil,
  UserIcon,
} from 'lucide-react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { useNotify } from '@/hooks/useNotify';

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
    <View className={'relative self-center'}>
      <View
        className={
          'w-48 aspect-square rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 shadow-sm'
        }
      >
        {uri ? (
          <Image
            source={{ uri }}
            accessibilityLabel={'image'}
            className={'w-full h-full'}
            resizeMode={'contain'}
          />
        ) : (
          <View className={'flex-1 justify-center items-center'}>
            <Icon
              as={icon}
              className={'text-gray-400 dark:text-gray-500 w-12 h-12'}
            />
          </View>
        )}
      </View>
      <TouchableOpacity
        onPress={pickImage}
        disabled={isUploading}
        activeOpacity={0.8}
        className={
          'absolute -bottom-2 -right-2 bg-blue-600 p-3 rounded-xl shadow-lg border-2 border-white dark:border-gray-900'
        }
      >
        <Icon as={editIcon} className={'text-white'} size={'xs'} />
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

export const Picture = ({
  type = 'avatar',
  avatarUrl,
  onImageChange,
}: Props) => {
  const notify = useNotify();
  const [isUploading, setIsUploading] = useState(false);

  const pickImage = async () => {
    setIsUploading(true);
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      notify.warn(
        'Permission denied',
        'Permission to access camera roll is required.'
      );
      return;
    }

    try {
      const cameraType =
        type === 'avatar'
          ? ImagePicker.CameraType.front
          : ImagePicker.CameraType.back;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        cameraType,
        allowsMultipleSelection: false,
        allowsEditing: true,
        shape: type === 'avatar' ? 'oval' : 'rectangle',
        exif: false,
        aspect: [1, 1],
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const imageManipulator = ImageManipulator.manipulate(
        result.assets[0].uri
      );
      imageManipulator.resize({ width: 500 });
      const renderedImage = await imageManipulator.renderAsync();
      const resizedImage = await renderedImage.saveAsync({
        format: SaveFormat.WEBP,
        compress: 0.8,
      });

      onImageChange(resizedImage);
    } catch (e) {
      notify.error('Error', 'Could not pick image.');
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
