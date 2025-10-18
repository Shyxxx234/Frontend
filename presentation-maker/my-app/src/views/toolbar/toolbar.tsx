import { useState } from "react";
import './toolbar.module.css'
import { Button } from "../../common/Button";
import styles from "./toolbar.module.css"

type toolbarProps = {
    title: string,
}

export function Toolbar(props: toolbarProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(props.title);

    const handleTitleClick = () => {
        setIsEditing(true);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        console.log(e.target.value)
    };

    const handleTitleBlur = () => {
        setIsEditing(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleTitleBlur();
        }
    };

    return (
        <div className={styles.toolbar}>
            <div>
                <Button
                    onClick={() => console.log("File")}
                    className={styles.button}
                >
                    Файл
                </Button>

                <Button
                    onClick={() => console.log("Insert")}
                    className={styles.button}
                >
                    Вставка
                </Button>

            </div>

            {isEditing ? (
                    <input
                        type="text"
                        value={title}
                        onChange={handleTitleChange}
                        onBlur={handleTitleBlur}
                        onKeyDown={handleKeyPress}
                        className={styles.title}
                        autoFocus
                    />
                ) : (
                    <Button
                        onClick={handleTitleClick}
                        className={`${styles.button} ${styles.title}`}
                    >
                        {title || "Название презентации"}
                    </Button>
                )}

            <Button
                onClick={() => console.log("Slide-Show")}
                className={`${styles.button} ${styles.slide_show}`}
            >
                Слайд-шоу
            </Button>
        </div>
    )
}