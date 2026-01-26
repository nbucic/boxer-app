import { VStack } from '@/components/ui/vstack';
import { AlertCircleIcon } from 'lucide-react-native';
import { Heading } from '@/components/ui/heading';
import { Text } from 'react-native';

export const MaintenanceScreen = ({
  missingVars,
}: {
  missingVars: string[];
}) => {
  const isProduction = missingVars.length === 0;

  return (
    <VStack
      className="flex-1 justify-center items-center bg-background-0 p-10"
      space="lg"
    >
      <AlertCircleIcon size="xl" className="text-error-500" />
      <Heading size="xl" className="text-center">
        {isProduction ? 'Application maintenance' : 'Configuration Error'}
      </Heading>
      <Text className="text-center text-typography-500">
        {isProduction
          ? 'The application is currently under maintenance.'
          : 'The application is missing required configuration properties:'}
      </Text>
      {!isProduction && (
        <>
          {missingVars.map((v) => (
            <Text key={v} className="text-xs font-mono text-error-600 pt-1">
              • {v}
            </Text>
          ))}
        </>
      )}

      {!isProduction && (
        <Text className="text-center text-xs text-typography-400 mt-4">
          Please check your .env file and restart the development server.
        </Text>
      )}
    </VStack>
  );
};
