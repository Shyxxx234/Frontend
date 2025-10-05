import { useState } from "react";
import './toolbar.css'
import type { Presentation } from "../../store/typeAndFunctions";
import { Button } from "../../common/button";

type toolbarProps = {
    presentation: Presentation
}

export function Toolbar(props: toolbarProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(props.presentation.title);

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
        <div className="toolbar">
            <div className="system-option">
                <Button
                    onClick={() => console.log("File")}
                    className="button"
                >
                    Файл
                </Button>

                <Button
                    onClick={() => console.log("Insert")}
                    className="button"
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
                        className="title"
                        autoFocus
                    />
                ) : (
                    <Button
                        onClick={handleTitleClick}
                        className="button title"
                    >
                        {title || "Название презентации"}
                    </Button>
                )}

            <Button
                onClick={() => console.log("Slide-Show")}
                className="button slide-show"
            >
                Слайд-шоу
            </Button>
        </div>
    )
}