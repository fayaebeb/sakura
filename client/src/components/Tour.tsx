import { tourState } from "@/state/tourState";
import React from "react";
import Joyride, { ACTIONS, CallBackProps, EVENTS, STATUS } from "react-joyride";
import { useRecoilState } from "recoil";

const Tour = () => {
  const [state, setState] = useRecoilState(tourState);

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

  return <Joyride {...state} callback={callback} />;
};

export default Tour;
