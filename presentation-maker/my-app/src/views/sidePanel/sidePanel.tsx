import { Button } from "../../common/Button"
import { dispatch } from "../../presentation"
import { 
    addSlide, 
    createBlankSlide, 
    removeSlide,
    addTextObject,
    addImageObject,
    removeObject,
    changeBackgroundToColor,
    type Slide
} from "../../store/typeAndFunctions"
import styles from "./sidePanel.module.css"

type SidePanelProps = {
    slides: Array<Slide>,
    selectedSlideId: string,
    selectedObjects: Array<string>
}

export function SidePanel(props: SidePanelProps) {

    const handleAddSlide = () => {
        dispatch(addSlide, [
            createBlankSlide(),
            props.slides.length,
        ])
    }

    const handleRemoveSlide = () => {
        if (props.selectedSlideId) {
            dispatch(removeSlide, [props.selectedSlideId])
        }
    }

    const handleAddText = () => {
        if (props.selectedSlideId) {
            dispatch(addTextObject, [props.selectedSlideId])
        }
    }

    const handleAddImage = () => {
        if (props.selectedSlideId) {
            const imageUrl = prompt("Введите URL изображения:", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWaFnicAytoRPP_Esi8F-TtEqcTnxdIh_sqA&s");
            if (imageUrl) {
                dispatch(addImageObject, [props.selectedSlideId, imageUrl])
            }
        }
    }

    const handleRemoveObject = () => {
        if (props.selectedSlideId && props.selectedObjects.length > 0) {
            const objectId = props.selectedObjects[0];
            dispatch(removeObject, [objectId, props.selectedSlideId])
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
                    disabled={props.selectedObjects.length === 0}
                >
                    Удалить объект
                </Button>
                <input type="color"  onChange={(event) => {
                    const target = event.target as HTMLInputElement
                    dispatch(changeBackgroundToColor, [target.value, props.selectedSlideId])
                }} />
            </div>
        </div>
    )
}