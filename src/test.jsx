import { useShallow } from "zustand/shallow"
import { useGameEffectsStore } from "./store/gameEffectsStore"
import { useEffect } from "react"

const Test = () => {
    const addEnemy = useGameEffectsStore(useShallow((state) => state.addEnemy))
    useEffect(() => {
        addEnemy("chicken", [0,0,-10])
        addEnemy("roach", [5, 0, -10])
    }, [])
    return null;
}

export default Test