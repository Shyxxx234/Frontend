import type React from "react"
import { Button } from "../../common/Button"
import { createBlankSlide } from "../../store/typeAndFunctions"
import styles from "./sidePanel.module.css"
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../../store/store'
import { 
    addSlide, 
    removeSlide,
    addTextObject,
    addImageObject,
    removeObject,
    changeBackgroundToColor
} from '../../store/presentationSlice'

export function SidePanel() {
    const dispatch = useDispatch()
    const presentation = useSelector((state: RootState) => state.presentation)
    const slides = presentation.slides
    const selectedSlideId = presentation.selectedSlide
    const selectedObjects = presentation.selectedObjects

    const handleAddSlide = () => {
        dispatch(addSlide({ 
            slide: createBlankSlide(),
            idx: slides.length 
        }))
    }

    const handleRemoveSlide = () => {
        if (selectedSlideId) {
            dispatch(removeSlide(selectedSlideId))
        }
    }

    const handleAddText = () => {
        if (selectedSlideId) {
            dispatch(addTextObject(selectedSlideId))
        }
    }

    const handleAddImage = () => {
        if (selectedSlideId) {
            const imageUrl = prompt("Введите URL изображения:", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWaFnicAytoRPP_Esi8F-TtEqcTnxdIh_sqA&s")
            if (imageUrl) {
                dispatch(addImageObject({ slideId: selectedSlideId, imageUrl }))
            }
        }
    }

    const handleRemoveObject = () => {
        if (selectedSlideId && selectedObjects.length > 0) {
            const objectId = selectedObjects[0]
            dispatch(removeObject({ objectId, slideId: selectedSlideId }))
        }
    }

    const handleChangeBackgroundColor = (e: React.ChangeEvent) => {
        const target = e.target as HTMLInputElement
        if (selectedSlideId) {
            dispatch(changeBackgroundToColor({ color: target.value, slideId: selectedSlideId }))
        }
    }

    return (
        <div className={styles.sidePanel}>
            <div className={styles.section}>
                <h3 className={styles.text}>Слайды</h3>
                <Button className={styles.button} onClick={handleAddSlide}>
                    + Добавить слайд
                </Button>
                <Button className={styles.button} onClick={handleRemoveSlide}>
                    - Удалить слайд
                </Button>
            </div>

            <div className={styles.section}>
                <h3 className={styles.text}>Объекты</h3>
                <Button className={styles.button} onClick={handleAddText}>
                    Добавить текст
                </Button>
                <Button className={styles.button} onClick={handleAddImage}>
                    Добавить изображение
                </Button>
                <Button 
                    className={styles.button} 
                    onClick={handleRemoveObject}
                    disabled={selectedObjects.length === 0}
                >
                    Удалить объект
                </Button>
                <input type="color" onChange={handleChangeBackgroundColor} />
            </div>
        </div>
    )
}