import type { Slide } from "../store/typeAndFunctions";
import { SlideThumbnail } from "./SlideThumbnail";

type SlideListProps {
    slides: Array<Slide>
}

function SlideList(props: SlideListProps)
{
    return (
        <div>
            {props.slides.map(slide => <SlideThumbnail key={slide.id}></SlideThumbnail>)}
        </div>
    )
}