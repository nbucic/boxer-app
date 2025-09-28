import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, Alert, Image } from "react-native";
import { images } from "@/constants/images";

export default function AddMovie() {
  const router = useRouter();

  const handleSave = () => {
    Alert.alert("Movie Saved", "You saved the movie");
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="absolute w-full z-0"
        resizeMode="cover"
      />
      <View className="flex-1 px-5 mt-20">
        <Text className="text-2xl text-white font-bold text-center mb-10">
          Add a New Movie
        </Text>
        {/* Add your form fields here */}
        <View className="flex-row justify-around mt-10">
          <TouchableOpacity
            onPress={handleCancel}
            className="bg-gray-500 py-3 px-10 rounded-lg"
          >
            <Text className="text-white font-bold">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSave}
            className="bg-secondary py-3 px-10 rounded-lg"
          >
            <Text className="text-white font-bold">Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
