import { ShowSlide } from "../../common/ShowSlide"
import { type Slide } from "../../store/typeAndFunctions"

import styles from "./slideCollection.module.css"

type SlideCollectionProps = {
    slideCollection: Array<Slide>,
    selectedSlide: string,
    onSlideSelect: (slideId: string) => void;
}

export function SlideCollection(props: SlideCollectionProps) {

    const handleSlideClick = (slideId: string) => { 
        console.log("Clicked slide ID:", slideId)
        props.onSlideSelect(slideId)
    }


    return (
        <div className={styles.slideCollection}>
            
            <div>
                {props.slideCollection.map((slide, index) => (
                    <div 
                        className={`${styles.slideCollectionObject} ${
                            props.selectedSlide === slide.id ? styles.slideCollectionObjectSelected : ''
                        }`} 
                        key={slide.id}
                        id={slide.id}
                        onClick={() => handleSlideClick(slide.id)}
                    >
                        <div className={styles.slideContainer}>
                            <ShowSlide 
                                slide={slide} 
                                disableObjectClicks={true}
                                className={styles.slide}
                                slideId={slide.id}
                            />
                        </div>
                        <div className={styles.counter}>
                            {index + 1}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}