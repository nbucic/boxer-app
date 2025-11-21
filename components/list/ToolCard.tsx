import { Tool } from '@/types/tools';
import { memo } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { NameItem } from '@/components/box/NameItem';
import InfoItem from '@/components/box/InfoItem';
import { MapPinnedIcon, ScrollTextIcon } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { router } from 'expo-router';

type ToolCardProps = {
  tool: Tool;
  listType?: 'static';
};
export const ToolCard = memo((props: ToolCardProps) => {
  const { tool } = props;
  return (
    <Box
      className={`p-2 border-b border-outline-200 bg-background-0 my-1 max-h-[100px]`}
    >
      <TouchableOpacity onPress={() => router.navigate(`/tool/${tool.id}`)}>
        <HStack space={'lg'} className={'items-center gap-2'}>
          <View className={'h-full aspect-square flex-shrink-0'}>
            {tool.publicImageUrl ? (
              <Image
                source={{ uri: tool.publicImageUrl }}
                className={'w-full h-full rounded-lg'}
                resizeMode={'cover'}
              />
            ) : (
              <View className={'w-full h-full rounded-lg bg-neutral-200'} />
            )}
          </View>
          <VStack className={'flex-1 gap-0.5'}>
            <NameItem
              boxName={tool.name}
              containerClassName={'items-center gap-1'}
            />
            <InfoItem icon={MapPinnedIcon} text={tool.box.name} />
            {tool.description && (
              <InfoItem icon={ScrollTextIcon} text={tool.description} />
            )}
          </VStack>
        </HStack>
      </TouchableOpacity>
    </Box>
  );
});
