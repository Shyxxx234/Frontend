import React from "react";
import styles from "../SpeakerNotesModalWindow.module.css";

interface SpeechInputSectionProps {
    isListening: boolean;
    isSpeechSupported: boolean;
    isProcessingCommand: boolean;
    interimTranscript: string;
    finalTranscript: string;
    recognitionError: string;
    audioLevel: number;
    speechBuffer: string;
    bufferSize: number;
    onToggleListening: () => void;
    onClearSpeech: () => void;
    onAddBufferToQuery: () => void;
}

export const SpeechInputSection: React.FC<SpeechInputSectionProps> = ({
    isListening,
    isSpeechSupported,
    isProcessingCommand,
    interimTranscript,
    finalTranscript,
    recognitionError,
    audioLevel,
    speechBuffer,
    bufferSize,
    onToggleListening,
    onClearSpeech,
    onAddBufferToQuery
}) => {

    return (
        <div className={styles.speechSection}>
            <h3 className={styles.sectionTitle}>
                Голосовой ввод для AI
                {!isSpeechSupported && (
                    <span className={styles.unsupportedBadge}>Не поддерживается</span>
                )}
            </h3>
            
            {isProcessingCommand && (
                <div className={styles.commandProcessing}>
                    <div className={styles.processingSpinner}></div>
                    <span>Команда распознана! Добавляю буфер в AI запрос и отправляю...</span>
                </div>
            )}
            
            <div className={styles.speechControls}>
                <button
                    className={`${styles.speechButton} ${isListening ? styles.listening : ''}`}
                    onClick={onToggleListening}
                    disabled={!isSpeechSupported}
                    title={isListening ? "Остановить распознавание" : "Начать распознавание речи"}
                >
                    {isListening ? (
                        <>
                            <div className={styles.micIcon}>
                                <div 
                                    className={styles.micLevel}
                                    style={{ height: `${audioLevel * 100}%` }}
                                />
                            </div>
                            <span>Остановить</span>
                        </>
                    ) : (
                        <>
                            <div className={styles.micIcon}>🎤</div>
                            <span>Говорить</span>
                        </>
                    )}
                </button>
                
                <div className={styles.speechCommands}>
                    <div className={styles.commandsTitle}>Команда активации:</div>
                    <div className={styles.commandsList}>
                        "Хороший вопрос"
                    </div>
                    <div className={styles.hotkeyHint}>
                        Ctrl+V: включить/выключить
                    </div>
                    <div className={styles.hotkeyHint}>
                        Ctrl+A: добавить буфер в AI и отправить
                    </div>
                </div>
                
                <button
                    className={styles.clearSpeechButton}
                    onClick={onClearSpeech}
                    disabled={!interimTranscript && !finalTranscript && !speechBuffer}
                    title="Очистить распознанный текст"
                >
                    Очистить
                </button>
            </div>
            
            {speechBuffer && (
                <div className={styles.manualAddSection}>
                    <button
                        className={styles.manualAddButton}
                        onClick={onAddBufferToQuery}
                        title="Добавить ВЕСЬ буфер в запрос AI и отправить"
                    >
                        Добавить буфер в AI и отправить ({bufferSize}/500)
                    </button>
                </div>
            )}
            
            {isListening && (
                <div className={styles.audioVisualizer}>
                    <div className={styles.audioLevelBar}>
                        <div 
                            className={styles.audioLevelFill}
                            style={{ width: `${audioLevel * 100}%` }}
                        />
                    </div>
                    <div className={styles.audioLevelText}>
                        Уровень звука: {Math.round(audioLevel * 100)}%
                    </div>
                </div>
            )}
            
            {(interimTranscript || finalTranscript) && (
                <div className={styles.transcriptContainer}>
                    <h4>Последняя распознанная речь:</h4>
                    <div className={styles.transcriptContent}>
                        <span className={styles.finalTranscript}>{finalTranscript}</span>
                        <span className={styles.interimTranscript}>{interimTranscript}</span>
                    </div>
                </div>
            )}
            
            {recognitionError && (
                <div className={styles.errorMessage}>
                    {recognitionError}
                </div>
            )}
        </div>
    );
};