import { Button } from "../../common/button"
import { dispatch, getPresentation } from "../../presentation"
import { 
    addSlide, 
    createBlankSlide, 
    removeSlide,
    addTextObject,
    addImageObject,
    removeObject
} from "../../store/typeAndFunctions"
import styles from "./sidePanel.module.css"

export function SidePanel() {
    const currentPresentation = getPresentation();
    const selectedSlideId = currentPresentation.selectedSlide;

    const handleAddSlide = () => {
        dispatch(addSlide, [
            createBlankSlide(),
            currentPresentation.slides.length,
        ])
    }

    const handleRemoveSlide = () => {
        if (selectedSlideId) {
            dispatch(removeSlide, [selectedSlideId])
        }
    }

    const handleAddText = () => {
        if (selectedSlideId) {
            dispatch(addTextObject, [selectedSlideId])
        }
    }

    const handleAddImage = () => {
        if (selectedSlideId) {
            const imageUrl = prompt("Введите URL изображения:", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWaFnicAytoRPP_Esi8F-TtEqcTnxdIh_sqA&s");
            if (imageUrl) {
                dispatch(addImageObject, [selectedSlideId, imageUrl])
            }
        }
    }

    const handleRemoveObject = () => {
        if (selectedSlideId && currentPresentation.selectedObjects.length > 0) {
            const objectId = currentPresentation.selectedObjects[0];
            dispatch(removeObject, [objectId, selectedSlideId])
        }
    }

    return (
        <div className={styles.sidePanel}>
            <div className={styles.section}>
                <h3>Слайды</h3>
                <Button className={styles.button} onClick={handleAddSlide}>
                    + Добавить слайд
                </Button>
                <Button className={styles.button} onClick={handleRemoveSlide}>
                    - Удалить слайд
                </Button>
            </div>

            <div className={styles.section}>
                <h3>Объекты</h3>
                <Button className={styles.button} onClick={handleAddText}>
                    Добавить текст
                </Button>
                <Button className={styles.button} onClick={handleAddImage}>
                    Добавить изображение
                </Button>
                <Button 
                    className={styles.button} 
                    onClick={handleRemoveObject}
                    disabled={currentPresentation.selectedObjects.length === 0}
                >
                    Удалить объект
                </Button>
            </div>
        </div>
    )
}