import { useShallow } from "zustand/shallow"
import { useGameEffectsStore } from "../../../store/gameEffectsStore"
import { Box } from "@react-three/drei"
import { useRef, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"

const PlayerHealth = ({ modelRef, damageRef }) => {
    const groupRef = useRef()
    const filledBoxRef = useRef()
    const { camera } = useThree()
    const { maxHealth, setGameOver, gameOver } = useGameEffectsStore(useShallow((state) => ({
        maxHealth: state.player.maxHealth,
        setGameOver: state.setGameOver,
        gameOver: state.gameOver
    })))
    
    const barWidth = 0.5
    const barHeight = 0.05
    
    // Position the health bar above the player's head and make it face the camera
    useFrame(() => {
        if(gameOver) return
        if (modelRef.current && groupRef.current) {
            // Get the player's position
            const playerPosition = modelRef.current.position
            
            // Set the health bar position above the player
            groupRef.current.position.x = playerPosition.x
            groupRef.current.position.y = playerPosition.y + 2
            groupRef.current.position.z = playerPosition.z
            
            // Make the health bar face the camera
            groupRef.current.lookAt(camera.position)
            
            // Calculate current health
            const currentHealth = Math.max(0, maxHealth - (damageRef.current || 0))
            if(currentHealth <= 0) setGameOver()
            
            // Calculate health percentage
            const healthPercentage = Math.max(0, Math.min(1, (currentHealth / maxHealth)))
            
            // Update the filled bar width
            if (filledBoxRef.current) {
                // Update width
                filledBoxRef.current.scale.x = healthPercentage
                
                // Update color
                const barColor = 
                    healthPercentage > 0.6 ? "green" : 
                    healthPercentage > 0.3 ? "yellow" : 
                    "red"
                
                if (filledBoxRef.current.material) {
                    filledBoxRef.current.material.color.set(barColor)
                }
                
                // Update position to keep it aligned left
                filledBoxRef.current.position.x = (healthPercentage - 1) * barWidth / 2
            }
        }
    })

    return (
        <group ref={groupRef}>
            {/* Background/empty bar */}
            <Box args={[barWidth, barHeight, 0.01]} position={[0, 0, 0]}>
                <meshBasicMaterial color="darkgray" transparent opacity={0.5} />
            </Box>
            
            {/* Filled portion of health bar - full width initially */}
            <Box 
                ref={filledBoxRef}
                args={[barWidth, barHeight, 0.02]} 
                position={[0, 0, 0.01]}
            >
                <meshBasicMaterial transparent opacity={0.75} color="green" />
            </Box>
        </group>
    )
}

export default PlayerHealth