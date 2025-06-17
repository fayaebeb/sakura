import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { isMobileState } from "@/state/isMobileState";

const useIsMobile = () => {
  const setIsMobile = useSetRecoilState(isMobileState);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);

    update(); // initial

    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [setIsMobile]);
};

export default useIsMobile;
