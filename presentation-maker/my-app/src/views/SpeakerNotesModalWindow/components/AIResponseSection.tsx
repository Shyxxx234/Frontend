import React from "react";
import styles from "../SpeakerNotesModalWindow.module.css";

interface AIResponseSectionProps {
    aiResponse: string;
    isGenerating: boolean;
    onGenerateResponse: () => void;
    onStopGeneration: () => void;
    onClearResponse: () => void;
    onCopyToClipboard: () => void;
    onUseAIResponse: () => void;
}

const parseMarkdown = (text: string): string => {
    return text
        // Заголовки
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        // Жирный текст
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/__(.*)__/gim, '<strong>$1</strong>')
        // Курсив
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/_(.*)_/gim, '<em>$1</em>')
        // Списки
        .replace(/^\s*\* (.*$)/gim, '<li>$1</li>')
        .replace(/^\s*- (.*$)/gim, '<li>$1</li>')
        // Перенос строки
        .replace(/\n$/gim, '<br />')
        // Абзацы
        .replace(/^\s*$/gim, '</p><p>')
        // Начало и конец параграфа
        .replace(/^/, '<p>')
        .replace(/$/, '</p>')
        // Лишние <p>
        .replace(/<p><\/p>/g, '')
        .replace(/<p><\/p><p>/g, '<p>');
};

export const AIResponseSection: React.FC<AIResponseSectionProps> = ({
    aiResponse,
    isGenerating,
    onGenerateResponse,
    onStopGeneration,
    onClearResponse,
    onCopyToClipboard,
    onUseAIResponse
}) => {
    const htmlContent = parseMarkdown(aiResponse);

    return (
        <div className={styles.aiResponseSection}>
            <h3 className={styles.sectionTitle}>Ответ AI помощника</h3>
            <div className={styles.aiControls}>
                <button
                    className={styles.aiButton}
                    onClick={onGenerateResponse}
                    disabled={isGenerating}
                >
                    {isGenerating ? 'Генерация...' : 'Отправить запрос'}
                </button>
                
                {isGenerating && (
                    <button
                        className={styles.stopButton}
                        onClick={onStopGeneration}
                    >
                        Остановить
                    </button>
                )}
                
                <button
                    className={styles.clearButton}
                    onClick={onClearResponse}
                    disabled={!aiResponse || isGenerating}
                >
                    Очистить
                </button>
                <button
                    className={styles.actionButton}
                    onClick={onCopyToClipboard}
                    disabled={!aiResponse || isGenerating}
                >
                    Копировать
                </button>
                <button
                    className={styles.actionButton}
                    onClick={onUseAIResponse}
                    disabled={!aiResponse || isGenerating}
                >
                    Добавить в заметки
                </button>
            </div>

            <div className={styles.aiResponseContainer}>
                {aiResponse ? (
                    <>
                        <h4>Советы по презентации:</h4>
                        <div className={styles.responseContent}>
                            <div 
                                className={styles.markdownContent}
                                dangerouslySetInnerHTML={{ __html: htmlContent }}
                            />
                            {isGenerating && (
                                <span className={styles.typingIndicator}>▌</span>
                            )}
                        </div>
                    </>
                ) : (
                    <div className={styles.emptyResponse}>
                        {isGenerating ? (
                            <div className={styles.generatingMessage}>
                                <div className={styles.generatingSpinner}></div>
                                <span>AI генерирует ответ...</span>
                                <span className={styles.typingIndicator}>▌</span>
                            </div>
                        ) : (
                            <></>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};