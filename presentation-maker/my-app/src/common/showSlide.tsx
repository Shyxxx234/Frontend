import type { Slide } from "../store/typeAndFunctions";

type ShowSlideProps = {
    slide: Slide;
    className: string;
    coef: number;
}

export function ShowSlide(props: ShowSlideProps) {
    const { slide } = props;

    return (
        <div
            className={props.className}
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                backgroundColor: slide.background.type === 'color' ? slide.background.color : 'transparent',
                backgroundImage: slide.background.type === 'picture' ? `url(${slide.background.src})` : 'none',
                backgroundPosition: 'center'
            }}
        >
            {slide.slideObject.map(obj => (
                <div
                    key={obj.id}
                    style={{
                        position: 'absolute',
                        left: obj.rect.x / props.coef,
                        top: obj.rect.y / props.coef,
                        width: obj.rect.width / props.coef,
                        height: obj.rect.height / props.coef
                    }}
                >
                    {obj.type === 'plain_text' && (
                        <div
                            style={{
                                fontFamily: obj.fontFamily,
                                fontWeight: obj.weight,
                                fontSize: `${obj.scale / props.coef}em`,
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
                            }}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}