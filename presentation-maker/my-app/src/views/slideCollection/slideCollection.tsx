import { ShowSlide } from "../../common/showSlide"
import { type Presentation } from "../../store/typeAndFunctions"
import styles from "./slideCollection.module.css"

type SlideCollectionProps = {
    presentation: Presentation,
    onSlideSelect: (slideIndex: number) => void;
}

export function SlideCollection(props: SlideCollectionProps) {
    const handleSlideClick = (slideIndex: number, slideId: number) => {
        console.log("Clicked slide index:", slideIndex)
        console.log("Slide number: ", slideId)
        props.onSlideSelect(slideIndex)
    }

    return (
        <div className={styles.slideCollection}>
            {props.presentation.slides.map((slide, index) => (
                <div 
                    className={`${styles.slideCollectionObject} ${
                        props.presentation.selectedSlide === Number(slide.id) ? styles.slideCollectionObjectSelected : ''
                    }`} 
                    key={slide.id}
                    onClick={() => handleSlideClick(index, Number(slide.id))}
                >
                    
                    <div className={styles.slideContainer}>
                        <ShowSlide 
                            slide={slide} 
                            disableObjectClicks={true}
                            className={styles.slide}
                        />
                    </div>
                    <div className={styles.counter}>
                        {index + 1}
                    </div>
                </div>
            ))}
        </div>
    )
}