import { ShowSlide } from "../../common/ShowSlide"
import type { Slide } from "../../store/typeAndFunctions"
import { dispatch } from "../../presentation"
import { selectSlide } from "../../store/typeAndFunctions"
import styles from "./workspace.module.css"

type WorkspaceProps = {
    slides: Array<Slide>,
    slideIndex: number,
    selectedObjects: Array<string>
}

export function Workspace(props: WorkspaceProps) {
    const slide = props.slides[props.slideIndex]

    const handleSlideObjectClick = (slide: Slide) => {
        if (slide.background.type === 'color') console.log("Slide color: ", slide.background.color)
    }

    const goToPreviousSlide = () => {
        if (props.slideIndex > 0) {
            const prevSlide = props.slides[props.slideIndex - 1]
            dispatch(selectSlide, [prevSlide.id])
        }
    }

    const goToNextSlide = () => {
        if (props.slideIndex < props.slides.length - 1) {
            const nextSlide = props.slides[props.slideIndex + 1]
            dispatch(selectSlide, [nextSlide.id])
        }
    }

    return (
        <div className={styles.workspaceContainer}>
            <div className={styles.workspaceNavigation}>
                <button
                    className={styles.navButton}
                    onClick={goToPreviousSlide}
                    disabled={props.slideIndex <= 0}
                >
                    ◀ Предыдущий
                </button>
                <div className={styles.slideInfo}>
                    Слайд {props.slideIndex + 1} из {props.slides.length}
                </div>
                <button
                    className={styles.navButton}
                    onClick={goToNextSlide}
                    disabled={props.slideIndex >= props.slides.length - 1}
                >
                    Следующий ▶
                </button>
            </div>

            <div
                className={styles.workspace}
                onClick={() => slide && handleSlideObjectClick(slide)}
            >
                {slide ? (
                    <ShowSlide
                        slide={slide}
                        className={styles.slide}
                        disableObjectClicks={false}
                        slideId={slide.id}
                        objSelection={props.selectedObjects}
                    />
                ) : (
                    <div className={styles.noSlide}>Нет слайдов</div>
                )}
            </div>
        </div>
    )
}