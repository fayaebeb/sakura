import Joyride, { CallBackProps, STATUS, Status, EVENTS } from "react-joyride";
import { useState, useRef, useEffect } from "react";
import { useRecoilState } from "recoil";
import { onboardingRunState, onboardingStepsState } from "@/state/onBoardingState";
import { OnboardingProgress } from "./OnBoardingProgress";

// Type guard
const isFinishedOrSkipped = (status: Status): status is "finished" | "skipped" =>
  status === STATUS.FINISHED || status === STATUS.SKIPPED;

export const OnboardingProvider = () => {
  const [run, setRun] = useRecoilState(onboardingRunState);
  const [steps] = useRecoilState(onboardingStepsState);
  const [stepIndex, setStepIndex] = useState(0);
  const prevIndexRef = useRef(0);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index, type } = data;

    if (isFinishedOrSkipped(status)) {
      setRun(false);
      setStepIndex(0);
      return;
    }

    if (type === EVENTS.STEP_AFTER) {
      if (index < prevIndexRef.current) {
        setStepIndex(index);
      } else {
        setStepIndex(index + 1);
      }
      prevIndexRef.current = index;
    }
  };

  // ✨ Ensure blur class is always applied
  

  return (
    <>
      <OnboardingProgress currentStep={stepIndex + 1} totalSteps={steps.length} />
      <Joyride
        steps={steps}
        run={run}
        stepIndex={stepIndex}
        callback={handleJoyrideCallback}
        showSkipButton
        continuous
        showProgress
        scrollToFirstStep
        styles={{
          options: {
            primaryColor: "#6366F1",
            zIndex: 9999,
          },
        }}
        tooltipComponent={({ step, index, primaryProps, backProps }) => {
          return (
            <div className="bg-white p-4 rounded-xl shadow-lg text-center max-w-sm">
              <p className="text-gray-700">{step.content}</p>
              <div className="mt-4 flex justify-between">
                <button {...backProps} className="text-sm text-gray-500 hover:underline">
                  Back
                </button>
                <button {...primaryProps} className="bg-indigo-600 text-white px-4 py-2 rounded">
                  Next
                </button>
              </div>
            </div>
          );
        }}
      />
    </>
  );
};
