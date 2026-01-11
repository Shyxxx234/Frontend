import { useState, useEffect, useCallback } from "react"

export const useTimer = () => {
    const [timer, setTimer] = useState<number>(0)
    const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false)

    useEffect(() => {
        let interval: number | null = null

        if (isTimerRunning) {
            interval = window.setInterval(() => {
                setTimer(prev => prev + 1)
            }, 1000)
        }

        return () => {
            if (interval !== null) {
                window.clearInterval(interval)
            }
        }
    }, [isTimerRunning])

    const toggleTimer = useCallback(() => {
        setIsTimerRunning(prev => !prev)
    }, [])

    const resetTimer = useCallback(() => {
        setTimer(0)
        setIsTimerRunning(false)
    }, [])

    return {
        timer,
        isTimerRunning,
        toggleTimer,
        resetTimer
    }
}