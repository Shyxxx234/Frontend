import { ShowSlide } from "../../common/showSlide"
import type { Presentation } from "../../store/typeAndFunctions"
import styles from "./workspace.module.css"  // ✅ Правильный импорт

type WorkspaceProps = {
    presentation: Presentation,
}

export function Workspace(props: WorkspaceProps) {
    const slideIndex = props.presentation.slides.findIndex(
        slideItem => Number(slideItem.id) === props.presentation.selectedSlide
    )
    
    // ✅ Добавляем проверку на случай, если слайд не найден
    if (slideIndex === -1) {
        return <div className={styles.workspace}>Слайд не найден</div>
    }
    
    const slide = props.presentation.slides[slideIndex]
    
    return (
        <div 
            className={styles.workspace}
            style={{
                backgroundColor: slide.background.type === 'color' ? slide.background.color : 'none',
                backgroundImage: slide.background.type === 'picture' ? `url(${slide.background.src})` : 'none',
            }}
        >
            <ShowSlide 
                slide={slide} 
                className={styles.slide} 
                disableObjectClicks={false}
            />
        </div>
    )
}