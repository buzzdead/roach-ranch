import { useShallow } from "zustand/shallow"
import { useGameEffectsStore } from "./store/gameEffectsStore"
import { useEffect } from "react"

const Test = () => {
    const addEnemy = useGameEffectsStore(useShallow((state) => state.addEnemy))
    useEffect(() => {
        addEnemy("roach", [0, 0, -10])
        addEnemy("chicken", [5, 0, -10])
        addEnemy("mootant", [10, 0, -10])
        addEnemy("warhog", [15, 0, -10])
    }, [])
    return null;
}

export default Test