import { PointerLockControls } from "@react-three/drei"
import { useGameEffectsStore } from "./store/gameEffectsStore";
import { useShallow } from "zustand/shallow";

export const PLocks = () => {
    const setControls = useGameEffectsStore(useShallow(state => state.setControls));
    return <PointerLockControls  ref={controls => setControls(controls)} />
}