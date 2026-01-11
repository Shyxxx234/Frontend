import React from "react"
import styles from "../SpeakerNotesModalWindow.module.css"

interface AIQuerySectionProps {
    aiQuery: string
    isProcessingCommand: boolean
    bufferSize: number
    onAiQueryChange: (query: string) => void
    textAreaRef: React.RefObject<HTMLTextAreaElement> 
}

export const AIQuerySection: React.FC<AIQuerySectionProps> = ({
    aiQuery,
    onAiQueryChange,
    textAreaRef
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onAiQueryChange(e.target.value)
    }

    return (
        <div className={styles.aiQuerySection}>
            <h3 className={styles.sectionTitle}>Запрос для AI помощника</h3>
            <textarea
                ref={textAreaRef}
                className={styles.aiQueryTextarea}
                value={aiQuery}
                onChange={handleChange}
                placeholder="Запрос будет добавляться автоматически из голосового ввода. Скажите 'Хороший вопрос' для активации AI."
                rows={4}
            />
        </div>
    )
}