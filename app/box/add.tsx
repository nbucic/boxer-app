import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {CameraType, launchCameraAsync} from 'expo-image-picker';
import {router} from 'expo-router';
import React, {useState} from 'react';
import {Alert, Image, Platform, Text, TextInput, TouchableOpacity, View} from 'react-native';

const isWeb = Platform.OS === 'web';

export default function AddBoxScreen() {

  const [boxName, setBoxName] = useState<string>();
  const [imageUri, setImageUri] = useState<string>();
  const [location, setLocation] = useState<string>();
  const [description, setDescription] = useState<string>();

  const takePhoto = async () => {
    let result = await launchCameraAsync({
      mediaTypes: 'images',
      cameraType: CameraType.back,
      allowsEditing: true,
      base64: isWeb,
    })

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }

    return null;
  }

  const saveBox = () => {
    Alert.alert('Trying to save this box :-)');
  }

  const testBorder = false;

  return (
    <View className='flex-1 bg-white'>
      <View className="flex-1">
        <View className={`px-10 pt-5 ${testBorder ? 'border border-black' : ''}`}>
          <TextInput
            className='h-14  border border-slate-400 rounded-md px-3 mb-5'
            placeholder={'Box name'}
            value={boxName}
            onChangeText={setBoxName}
          />
        </View>
        <View className={`px-10 pt-3 ${testBorder ? 'border border-black' : ''}`}>
          <Text className="text-gray-500 text-left mb-4">
            Give your box a picture to be easily recognizable amongst other boxes
          </Text>
          <View className="w-full h-48 my-2">
            {!imageUri ? (
              <TouchableOpacity onPress={takePhoto}
                                className="w-full h-full bg-gray-200 rounded-lg justify-center items-center">
                <Ionicons name="add" size={64} color="gray"/>
              </TouchableOpacity>
            ) : (
              <View className="w-full h-full">
                <Image source={{uri: imageUri}} className='w-full h-full border rounded-lg'/>
                <TouchableOpacity onPress={takePhoto}
                                  className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md">
                  <MaterialCommunityIcons name="lead-pencil" size={24} className='text-primary'/>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        <View className={`px-10 pt-3 ${testBorder ? 'border border-black' : ''}`}>
          <Text className='text-gray-500 text-left mb-4'>
            Add a location of your box. You&#39;ll find it easier when you know location of the box{' '}
            <Text className="italic">(optional)</Text>
          </Text>
          <TextInput
            className='h-14 border border-gray-400 rounded-md px-3 mb-5'
            placeholder={'Location'}
            value={location}
            onChangeText={setLocation}
          />
        </View>
        <View className={`px-10 pt-3 ${testBorder ? 'border border-black' : ''}`}>
          <Text className='text-gray-500 text-left mb-4'>
            Whether you need some explanation or clarification for your box, this is the place where to put
            everything.{' '}<Text className='italic'>(optional)</Text>
          </Text>
          <TextInput
            className='h-14 border border-gray-400 rounded-md px-3 mb-5'
            placeholder='Description'
            value={description}
            onChangeText={setDescription}
          />

        </View>
      </View>
      <View className='flex flex-row items-center justify-between p-10 pt-0'>
        <TouchableOpacity onPress={() => router.navigate('/')}
                          className="bg-red-600 p-4 rounded-lg shadow-md w-2/5 items-center">
          <Text className="text-white font-bold">Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={saveBox}
          disabled={!boxName || !imageUri}
          className={`p-4 rounded-lg shadow-md w-2/5 items-center ${(!boxName || !imageUri) ? 'bg-blue-300' : 'bg-blue-500'}`}
        >
          <Text className="text-white font-bold">Save Box</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
