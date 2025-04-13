import { Text, View } from 'react-native';

type StepperProps = {
  steps: string[];
  currentStep: number;
  showProgressText?: boolean;
};

export default function Stepper({
  steps,
  currentStep,
  showProgressText = false,
}: StepperProps) {
  return (
    <View className="mb-6 px-2">
      {/* Optional progress text */}
      {showProgressText && (
        <Text className="text-center text-xs text-gray-500 mb-2">
          Step {currentStep + 1} of {steps.length}
        </Text>
      )}

      <View className="flex-row justify-between items-center">
        {steps.map((stepLabel, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <View key={index} className="flex-1 items-center">
              <View className="relative items-center">
                <View
                  className={`w-8 h-8 rounded-full justify-center items-center ${
                    isActive
                      ? 'bg-black'
                      : isCompleted
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                  }`}
                >
                  <Text className="text-white font-bold">{index + 1}</Text>
                </View>
                <Text
                  className={`text-xs mt-2 text-center ${
                    isActive ? 'text-black font-semibold' : 'text-gray-500'
                  }`}
                >
                  {stepLabel}
                </Text>
              </View>

              {/* Connector line between steps */}
              {index < steps.length - 1 && (
                <View className="absolute top-4 left-full w-full h-0.5 bg-gray-300" />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
