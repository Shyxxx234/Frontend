import { ShowSlide } from "../../common/showSlide"
import type { Presentation, Slide } from "../../store/typeAndFunctions"
import { dispatch } from "../../presentation"
import { selectSlide } from "../../store/typeAndFunctions"
import styles from "./workspace.module.css"

type WorkspaceProps = {
    presentation: Presentation,
}

export function Workspace(props: WorkspaceProps) {
    const slideIndex = props.presentation.slides.findIndex(
        slideItem => slideItem.id === props.presentation.selectedSlide
    )
    
    const slide = props.presentation.slides[slideIndex]

    

    const handleSlideObjectClick = (slide: Slide) => {   
        if(slide.background.type === 'color') console.log("Slide color: ", slide.background.color)
    }

    const goToPreviousSlide = () => {
        if (slideIndex > 0) {
            const prevSlide = props.presentation.slides[slideIndex - 1]
            dispatch(selectSlide, [prevSlide.id])
        }
    }

    const goToNextSlide = () => {
        if (slideIndex < props.presentation.slides.length - 1) {
            const nextSlide = props.presentation.slides[slideIndex + 1]
            dispatch(selectSlide, [nextSlide.id])
        }
    }
    
    return (
        <div className={styles.workspaceContainer}>
            <div className={styles.workspaceNavigation}>
                <button 
                    className={styles.navButton}
                    onClick={goToPreviousSlide}
                    disabled={slideIndex <= 0}
                >
                    ◀ Предыдущий
                </button>
                <div className={styles.slideInfo}>
                    Слайд {slideIndex + 1} из {props.presentation.slides.length}
                </div>
                <button 
                    className={styles.navButton}
                    onClick={goToNextSlide}
                    disabled={slideIndex >= props.presentation.slides.length - 1}
                >
                    Следующий ▶
                </button>
            </div>

            <div 
                className={styles.workspace}
                style={{
                    backgroundColor: slide.background.type === 'color' ? slide.background.color : 'none',
                    backgroundImage: slide.background.type === 'picture' ? `url(${slide.background.src})` : 'none',
                    backgroundSize: 'contain'
                }}
                onClick={() => slide && handleSlideObjectClick(slide)}
            >
                {slide ? (
                    <ShowSlide 
                        slide={slide}
                        className={styles.slide}
                        disableObjectClicks={false} 
                        slideId={slide.id}
                        objSelection={props.presentation.selectedObjects}
                    />
                ) : (
                    <div className={styles.noSlide}>Нет слайдов</div>
                )}
            </div>

        </div>
    )
}