import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';

export default function Index() {
  return (
    <Box
      className={'flex-1 bg-white dark:bg-black justify-center items-center'}
    >
      <Text
        className={'text-base font-medium text-gray-900 dark:text-white mb-3'}
      >
        Hello!
      </Text>
    </Box>
  );
}
