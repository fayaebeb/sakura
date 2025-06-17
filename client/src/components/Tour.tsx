import { CustomJoyrideStep } from "@/lib/tourSteps";
import { dropdownOpenState } from "@/state/databaseDropdownState";
import { tourState } from "@/state/tourState";
import React, { useEffect, useRef } from "react";
import Joyride, { ACTIONS, CallBackProps, EVENTS, STATUS } from "react-joyride";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import ToolTipSwitcher from "@/components/TourSteps/toolTipSwitcher";
import { isMobileState } from "@/state/isMobileState";

const OPEN_DROPDOWN_INDEX = 5;
const DROPDOWN_CONTENT_INDEX = 6;
const CHAT_MESSAGE_STEP_INDEX = 1;

const Tour = () => {
  const [state, setState] = useRecoilState(tourState);
  const dropdownOpen = useRecoilValue(dropdownOpenState);
  const setDropdownOpen = useSetRecoilState(dropdownOpenState);
  const waitingForDropdownRef = useRef(false);
  // Watch for dropdown DOM appearing
  useEffect(() => {
    if (
      waitingForDropdownRef.current &&
      state.stepIndex === OPEN_DROPDOWN_INDEX &&
      dropdownOpen
    ) {
      const checkDOM = setInterval(() => {
        const el = document.getElementById("select-database-options");
        if (el) {
          clearInterval(checkDOM);
          waitingForDropdownRef.current = false;
          // Move to dropdown content step
          setState((prev) => ({ ...prev, stepIndex: DROPDOWN_CONTENT_INDEX }));
        }
      }, 100);

      return () => clearInterval(checkDOM);
    }
  }, [dropdownOpen, state.stepIndex]);

  const callback = (data: CallBackProps) => {
    const { action, index, type, status } = data;

    if (
      action === ACTIONS.CLOSE ||
      (status === STATUS.SKIPPED && state.run) ||
      status === STATUS.FINISHED
    ) {
      setState((prev) => ({ ...prev, run: false }));
    } else if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {

      setState((prev) => ({
        ...prev,
        stepIndex: index + (action === ACTIONS.PREV ? -1 : 1),
      }));
    }
  };


  const currentStep = state.steps?.[state.stepIndex] as CustomJoyrideStep | undefined;
  const customRadius = currentStep?.customRadius ?? "8px"; // default fallback

  return (
    <Joyride
      {...state}
      callback={callback}
      scrollToFirstStep
      disableScrolling
      continuous
      showSkipButton
      styles={{
        options: {
          zIndex: 9999,
        },
        spotlight: {
          borderRadius: customRadius, // 💡 dynamic border-radius
          transition: "all 0.3s ease",
        },

      }}
      disableOverlayClose={true}
      tooltipComponent={ToolTipSwitcher}

    />
  );
};

export default Tour;
