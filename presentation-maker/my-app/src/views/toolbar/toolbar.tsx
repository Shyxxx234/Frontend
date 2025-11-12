import { useState } from "react"
import './toolbar.module.css'
import { Button } from "../../common/Button"
import styles from "./toolbar.module.css"
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../../store/store'
import { changePresentationName } from '../../store/presentationSlice'

type ToolbarProps = {
    onStartSlideShow: () => void,
}

export function Toolbar(props: ToolbarProps) {
    const dispatch = useDispatch()
    const presentation = useSelector((state: RootState) => state.presentation)
    const [isEditing, setIsEditing] = useState(false)
    const [title, setTitle] = useState(presentation.title)

    const handleTitleClick = () => {
        setIsEditing(true)
    }

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value)
    }

    const handleTitleBlur = () => {
        setIsEditing(false)
        if (title !== presentation.title) {
            dispatch(changePresentationName(title))
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleTitleBlur()
        }
    }

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
                    {presentation.title || "Название презентации"}
                </Button>
            )}

            <Button
                onClick={props.onStartSlideShow}
                className={`${styles.button} ${styles.slide_show}`}
            >
                Слайд-шоу
            </Button>
        </div>
    )
}