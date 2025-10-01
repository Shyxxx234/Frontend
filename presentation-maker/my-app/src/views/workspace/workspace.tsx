import { ShowSlide } from "../../common/showSlide"
import type { Presentation } from "../../store/typeAndFunctions"
import "./workspace.css"

type WorkspaceProps = {

    presentation: Presentation,
}

export function Workspace(props: WorkspaceProps) {
    const slide = props.presentation.slides[props.presentation.selectedSlide]
    return (
        <div className="workspace" style={{
            backgroundColor: slide.background.type === 'color' ? slide.background.color : 'none',
            backgroundImage: slide.background.type === 'picture' ? `url(${slide.background.src})` : 'none',
        }}>
            <ShowSlide slide={slide} className="workspace__slide" coef={1}/>


        </div>
    )
}

