import React from "react";
import styles from "../SpeakerNotesModalWindow.module.css";

interface TimerSectionProps {
    isTimerRunning: boolean;
    onToggleTimer: () => void;
    onResetTimer: () => void;
    timer: number;
}

export const TimerSection: React.FC<TimerSectionProps> = ({
    isTimerRunning,
    onToggleTimer,
    onResetTimer,
    timer
}) => {
    const formatTime = (seconds: number): string => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={styles.timerSection}>
            <h3 className={styles.sectionTitle}>Таймер</h3>
            <div className={styles.timerDisplay}>
                {formatTime(timer)}
            </div>
            <div className={styles.timerControls}>
                <button
                    className={styles.timerButton}
                    onClick={onToggleTimer}
                >
                    {isTimerRunning ? 'Пауза' : 'Старт'}
                </button>
                <button
                    className={styles.timerButton}
                    onClick={onResetTimer}
                >
                    Сброс
                </button>
            </div>
            <div className={styles.timerHotkey}>
                Горячая клавиша: ~
            </div>
        </div>
    );
};