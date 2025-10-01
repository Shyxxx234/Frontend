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
            <div className="toolbar__system-option">
                {isEditing ? (
                    <input
                        type="text"
                        value={title}
                        onChange={handleTitleChange}
                        onBlur={handleTitleBlur}
                        onKeyDown={handleKeyPress}
                        className="toolbar__title"
                        autoFocus
                    />
                ) : (
                    <Button
                        onClick={handleTitleClick}
                        className="toolbar__button toolbar__title"
                    >
                        {title || "Название презентации"}
                    </Button>
                )}
                <Button
                    onClick={() => console.log("File")}
                    className="toolbar__button"
                >
                    Файл
                </Button>

                <Button
                    onClick={() => console.log("Insert")}
                    className="toolbar__button"
                >
                    Вставка
                </Button>

            </div>

            <Button
                onClick={() => console.log("Slide-Show")}
                className="toolbar__button button__slide-show"
            >
                Слайд-шоу
            </Button>
        </div>
    )
}