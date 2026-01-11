import React from "react";
import styles from "../SpeakerNotesModalWindow.module.css";

interface NotesSectionProps {
    currentSlideIndex: number;
    notes: string;
    onNotesChange: (notes: string) => void;
}

export const NotesSection: React.FC<NotesSectionProps> = ({
    currentSlideIndex,
    notes,
    onNotesChange
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onNotesChange(e.target.value);
    };

    return (
        <div className={styles.notesSection}>
            <h3 className={styles.sectionTitle}>
                Заметки к слайду {currentSlideIndex + 1}
            </h3>
            <textarea
                className={styles.notesTextarea}
                value={notes}
                onChange={handleChange}
                placeholder="Введите заметки для этого слайда..."
                rows={8}
            />
        </div>
    );
};