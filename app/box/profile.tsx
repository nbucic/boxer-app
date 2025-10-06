import { useUserIdContext } from '@/services/userIdContext'
import React from 'react'
import { Image, Text, View } from 'react-native'

const Profile = () => {
  const {userId} = useUserIdContext();

  return (
    <View className='flex-1 px-10'>
      <View className='flex justify-center items-center flex-1 flex-col gap-5'>
        <Image className='size-10' tintColor={'#000'} />
        <Text className='text-gray-500 text-base'>Profile</Text>
        <Text className='text-gray-500 text-base'>{userId}</Text>
      </View>
    </View>
  )
}

export default Profile