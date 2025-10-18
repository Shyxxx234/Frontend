import type { Slide } from "../store/typeAndFunctions";
import { dispatch } from "../presentation";
import { selectObject } from "../store/typeAndFunctions";

type ShowSlideProps = {
    slide: Slide;
    disableObjectClicks: boolean;
    className?: string;
    isSelected?: boolean;
    slideId: string;
    objSelection?: Array<string>;
}

export function ShowSlide(props: ShowSlideProps) {
    const handleObjectClick = (event: React.MouseEvent, objId: string) => {
        if (props.disableObjectClicks) return;
        event.stopPropagation();
        
        dispatch(selectObject, [objId]);
        console.log("Clicked object ID:", objId);
    };

    const handleSlideClick = () => {
        if (props.disableObjectClicks) return;
        dispatch(selectObject, [""]);
    };

    const objSelection = props.objSelection || [];
    const slideObjects = props.slide.slideObject || [];

    return (
        <div
            className={props.className}
            onClick={handleSlideClick}
            style={{
                position: 'relative',
                width: '100wv',
                height: '100%',
                backgroundColor: props.slide.background.type === 'color' ? props.slide.background.color : 'transparent',
                backgroundImage: props.slide.background.type === 'picture' ? `url(${props.slide.background.src})` : 'none',
                backgroundPosition: 'center',
                cursor: 'pointer',
                backgroundSize: 'cover'
            }}
        >
            {slideObjects.map(obj => {
                if (!obj) return null;
                
                const isSelected = objSelection.includes(obj.id);
                
                return (
                    <div
                        key={obj.id}
                        onClick={(event) => handleObjectClick(event, obj.id)}
                        style={{
                            position: 'absolute',
                            left: obj.rect.x || 0,
                            top: obj.rect.y || 0,
                            width: obj.rect.width || 100,
                            height: obj.rect.height || 100,
                            cursor: 'pointer',
                            outline: isSelected ? '1px solid #FFFFFF' : 'none'
                        }}
                    >
                        {obj.type === 'plain_text' && (
                            <div
                                style={{
                                    fontFamily: obj.fontFamily || 'Arial',
                                    fontWeight: obj.weight || 400,
                                    fontSize: `${obj.scale || 1}em`,
                                    width: '100%',
                                    height: '100%',
                                }}
                            >
                                {obj.content || ''}
                            </div>
                        )}
                        {obj.type === 'picture' && (
                            <img
                                src={obj.src || ''}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                }}
                                alt=""
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}