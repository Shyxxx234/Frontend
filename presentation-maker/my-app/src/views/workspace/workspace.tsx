import { ShowSlide } from "../../common/showSlide"
import type { Presentation, Slide } from "../../store/typeAndFunctions"
import styles from "./workspace.module.css"

type WorkspaceProps = {
    presentation: Presentation,
}

export function Workspace(props: WorkspaceProps) {
    const slideIndex = props.presentation.slides.findIndex(
        slideItem => Number(slideItem.id) === props.presentation.selectedSlide
    )
    const handleSlideObjectClick = (slide: Slide) =>
    {   
        if(slide.background.type === 'color') console.log("Slide color: ", slide.background.color)
    }
    const slide = props.presentation.slides[slideIndex]
    
    return (
        <div 
            className={styles.workspace}
            style={{
                backgroundColor: slide.background.type === 'color' ? slide.background.color : 'none',
                backgroundImage: slide.background.type === 'picture' ? `url(${slide.background.src})` : 'none',
            }}
            onClick={() => handleSlideObjectClick(slide)}
        >
            <ShowSlide 
                slide={slide} 
                className={styles.slide} 
                disableObjectClicks={false}
            />
        </div>
    )
}