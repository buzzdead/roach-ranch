// useFrameInterval.js
import { useFrame } from "@react-three/fiber"
import { useRef } from "react" // You need to import useRef

function useFrameInterval(callback, interval = 10) {
  const frameCountRef = useRef(0)
  
  useFrame((state, delta) => {
    frameCountRef.current++
    
    if (frameCountRef.current % interval === 0) {
      callback(state, delta)
    }
  })
}

export default useFrameInterval