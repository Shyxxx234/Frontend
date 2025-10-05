import type { Slide } from "../store/typeAndFunctions";

type ShowSlideProps = {
    slide: Slide;
    disableObjectClicks: boolean;
    className?: string;
}

export function ShowSlide(props: ShowSlideProps) {
    const handleObjectClick = (event: React.MouseEvent, objId: string) => {
        if (props.disableObjectClicks) return;
        event.stopPropagation();
        console.log("Clicked object ID:", objId);
    };

    return (
        <div
            className={props.className}
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                backgroundColor: props.slide.background.type === 'color' ? props.slide.background.color : 'transparent',
                backgroundImage: props.slide.background.type === 'picture' ? `url(${props.slide.background.src})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            {props.slide.slideObject.map(obj => (
                <div
                    key={obj.id}
                    onClick={(event) => handleObjectClick(event, obj.id)}
                    style={{
                        position: 'absolute',
                        left: obj.rect.x,
                        top: obj.rect.y,
                        width: obj.rect.width,
                        height: obj.rect.height,
                        cursor: 'pointer'
                    }}
                >
                    {obj.type === 'plain_text' && (
                        <div
                            style={{
                                fontFamily: obj.fontFamily,
                                fontWeight: obj.weight,
                                fontSize: `${obj.scale}em`,
                                width: '100%',
                                height: '100%'
                            }}
                        >
                            {obj.content}
                        </div>
                    )}
                    {obj.type === 'picture' && (
                        <img
                            src={obj.src}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain'
                            }}
                            alt=""
                        />
                    )}
                </div>
            ))}
        </div>
    );
}