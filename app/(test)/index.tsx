import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';

export default function TestIndexPage() {
  return (
    <View
      className={
        'flex-1 justify-center items-center bg-white dark:bg-background-dark'
      }
    >
      <Text className={'text-typography-black dark:text-typography-white mb-5'}>
        LLM test bed
      </Text>
      <VStack space={'lg'}>
        {[
          {
            link: '/llm/cocoSsd',
            text: 'COCO-SSD',
          },
          {
            link: '/llm/mobileNet',
            text: 'mobileNet',
          },
          {
            link: '/llm/yolov5',
            text: 'YOLO v5',
          },
          {
            link: '/llm/gpt-4o',
            text: 'OpenAI GPT',
          },
        ].map((item, index) => (
          <Button
            key={index}
            variant="solid"
            action={'positive'}
            onPress={() => router.push(item.link as any)}
          >
            <ButtonText>{item.text}</ButtonText>
          </Button>
        ))}
      </VStack>
    </View>
  );
}
