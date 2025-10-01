import { ShowSlide } from "../../common/showSlide"
import type { Presentation } from "../../store/typeAndFunctions"
import "./slideCollection.css"

type SlideCollectionProps = {
    presentation: Presentation,
}

export function SlideCollection(props: SlideCollectionProps) {
    return (
        <div className="slide-collection" style={{ display: 'flex', gap: '10px', padding: '10px', overflowX: 'auto' }}>
            {props.presentation.slides.map((slide, index) => (
                <>
                    <ShowSlide slide={slide} className="slide-collection__slide" coef={3.5}/>
                    <div className="slide-collection__counter">
                        {index + 1}
                    </div>
                </>

            ))}
        </div>
    )
}