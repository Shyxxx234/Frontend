export type Presentation = SlideCollection & ElementSelection & {
    title: string;
}

export type Slide = {
    background: Background;
    slideObject: Array<SlideObject>;
    id: string;
}

export type Background = Color | Picture;

export type Color = {
    type: 'color';
    color: string;
}

export type Picture = {
    type: 'picture';
    src: string;
}

export type SlideCollection = {
    slides: Array<Slide>;
}

export type ElementSelection = {
    selectedSlide: string;
    selectedObjects: Array<string>;
}

export type SlideObject = PlainText | Image;

export type PlainText = BaseSlideObject & {
    type: 'plain_text';
    content: string;
    fontFamily: string;
    weight: number;
    scale: number;
}

export type Image = BaseSlideObject & Picture;

export type BaseSlideObject = {
    rect: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    id: string;
}

export const blankText: SlideObject = {
    type: "plain_text",
    content: "",
    fontFamily: "Arial",
    weight: 400,
    scale: 1.0,
    rect: {
        x: 0,
        y: 0,
        width: 255,
        height: 50
    },
    id: ""
}

export const blankImage: SlideObject = {
    type: "picture",
    src: "",
    rect: {
        x: 0,
        y: 0,
        width: 255,
        height: 50
    },
    id: ""
}

export function generateTimestampId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function selectSlide(presentation: Presentation, [slideId]: [string]): Presentation {
    console.log("selectSlide called with ID:", slideId)
    return {
        ...presentation,
        selectedSlide: slideId,
        selectedObjects: []
    }
}

export function changePresentationName(presentation: Presentation, name: string): Presentation {
    return {
        ...presentation,
        title: name
    }
}

export function addSlide(presentation: Presentation, [slide, idx]: [Slide, number]): Presentation {
    console.log('Adding slide:', slide);
    console.log('At index:', idx);

    const newSlide: Slide = {
        background: { ...slide.background }, 
        slideObject: [...slide.slideObject], 
        id: slide.id
    };
    
    console.log('New slide structure:', newSlide);
    
    const newSlides = [...presentation.slides];
    const safeIdx = Math.max(0, Math.min(idx, newSlides.length));
    newSlides.splice(safeIdx, 0, newSlide);
    
    return {
        ...presentation,
        slides: newSlides,
        selectedSlide: newSlide.id 
    };
}
export function createBlankSlide(): Slide {
    return {
        background: {
            type: "color" as const,
            color: "#FFFFFF",
        },
        slideObject: [],
        id: generateTimestampId()
    };
}

export function removeSlide(presentation: Presentation, [slideId]: [string]): Presentation {
    if (presentation.slides.length === 0) {
        return presentation;
    }

    const newSlides = presentation.slides.filter(slide => slide.id !== slideId);


    return {
        ...presentation,
        slides: newSlides,
        selectedSlide: newSlides.length != 0 ? newSlides[0].id : ""
    };
}

export function replaceSlide(presentation: Presentation, slide: Slide, insertSpot: number): Presentation {
    if (presentation.slides.length === 0) {
        return presentation;
    }

    const newSlides = presentation.slides.filter(s => s.id !== slide.id);
    newSlides.splice(insertSpot, 0, { ...slide });

    return {
        ...presentation,
        slides: newSlides
    };
}

export function addSlideObject(presentation: Presentation, slideObject: SlideObject, idx: number, slideId: number, createId = true): Presentation {
    const newSlideObject = createId ? { ...slideObject, id: generateTimestampId() } : { ...slideObject };
    const newSlides = presentation.slides.map((slide, index) => {
        if (index === slideId) {
            const newSlideObjects = [...slide.slideObject];
            newSlideObjects.splice(idx, 0, newSlideObject);
            return {
                ...slide,
                slideObject: newSlideObjects
            };
        }
        return slide;
    });

    return {
        ...presentation,
        slides: newSlides
    };
}

export function removeSlideObject(presentation: Presentation, id: number, slideId: number): Presentation {
    const newSlides = presentation.slides.map((slide, index) => {
        if (index === slideId) {
            const newSlideObjects = slide.slideObject.filter((_, objIndex) => objIndex !== id);
            return {
                ...slide,
                slideObject: newSlideObjects
            };
        }
        return slide;
    });

    return {
        ...presentation,
        slides: newSlides
    };
}

export function replaceSlideObject(presentation: Presentation, slideObj: SlideObject, slideId: number, insertSpot: number): Presentation {
    if (presentation.slides.length === 0) {
        return presentation;
    }

    const newSlides = presentation.slides.map((slide, index) => {
        if (index === slideId) {
            // Удаляем объект по ID и добавляем на новую позицию
            const newSlideObjects = slide.slideObject.filter(obj => obj.id !== slideObj.id);
            newSlideObjects.splice(insertSpot, 0, { ...slideObj });
            return {
                ...slide,
                slideObject: newSlideObjects
            };
        }
        return slide;
    });

    return {
        ...presentation,
        slides: newSlides
    };
}

export function changePlainTextContent(presentation: Presentation, content: string, id: number, slideId: number): Presentation {
    const newSlides = presentation.slides.map((slide, index) => {
        if (index === slideId) {
            const newSlideObjects = slide.slideObject.map((obj, objIndex) => {
                if (objIndex === id && obj.type === 'plain_text') {
                    return {
                        ...obj,
                        content: content
                    };
                }
                return obj;
            });
            return {
                ...slide,
                slideObject: newSlideObjects
            };
        }
        return slide;
    });

    return {
        ...presentation,
        slides: newSlides
    };
}

export function changePlainTextScale(presentation: Presentation, scale: number, id: number, slideId: number): Presentation {
    const newSlides = presentation.slides.map((slide, index) => {
        if (index === slideId) {
            const newSlideObjects = slide.slideObject.map((obj, objIndex) => {
                if (objIndex === id && obj.type === 'plain_text') {
                    return {
                        ...obj,
                        scale: scale
                    };
                }
                return obj;
            });
            return {
                ...slide,
                slideObject: newSlideObjects
            };
        }
        return slide;
    });

    return {
        ...presentation,
        slides: newSlides
    };
}

export function changePlainTextFontFamily(presentation: Presentation, fontFamily: string, id: number, slideId: number): Presentation {
    const newSlides = presentation.slides.map((slide, index) => {
        if (index === slideId) {
            const newSlideObjects = slide.slideObject.map((obj, objIndex) => {
                if (objIndex === id && obj.type === 'plain_text') {
                    return {
                        ...obj,
                        fontFamily: fontFamily
                    };
                }
                return obj;
            });
            return {
                ...slide,
                slideObject: newSlideObjects
            };
        }
        return slide;
    });

    return {
        ...presentation,
        slides: newSlides
    };
}

export function changeBackgroundToColor(presentation: Presentation, color: string, slideId: number): Presentation {
    const newSlides = presentation.slides.map((slide, index) => {
        if (index === slideId) {
            const newBackground: Color = {
                type: 'color',
                color: color
            };
            return {
                ...slide,
                background: newBackground
            };
        }
        return slide;
    });

    return {
        ...presentation,
        slides: newSlides
    };
}

export function changeBackgroundToImage(presentation: Presentation, imageSrc: string, slideId: number): Presentation {
    const newSlides = presentation.slides.map((slide, index) => {
        if (index === slideId) {
            const newBackground: Picture = {
                type: "picture",
                src: imageSrc
            };
            return {
                ...slide,
                background: newBackground
            };
        }
        return slide;
    });

    return {
        ...presentation,
        slides: newSlides
    };
}

export function changeSlideObjectScale(presentation: Presentation, height: number, width: number, id: number, slideId: number): Presentation {
    const newSlides = presentation.slides.map((slide, index) => {
        if (index === slideId) {
            const newSlideObjects = slide.slideObject.map((obj, objIndex) => {
                if (objIndex === id) {
                    return {
                        ...obj,
                        rect: {
                            ...obj.rect,
                            height: height,
                            width: width
                        }
                    };
                }
                return obj;
            });
            return {
                ...slide,
                slideObject: newSlideObjects
            };
        }
        return slide;
    });

    return {
        ...presentation,
        slides: newSlides
    };
}

export function changeSlideObjectPosition(presentation: Presentation, x: number, y: number, id: number, slideId: number): Presentation {
    const newSlides = presentation.slides.map((slide, index) => {
        if (index === slideId) {
            const newSlideObjects = slide.slideObject.map((obj, objIndex) => {
                if (objIndex === id) {
                    return {
                        ...obj,
                        rect: {
                            ...obj.rect,
                            x: x,
                            y: y
                        }
                    };
                }
                return obj;
            });
            return {
                ...slide,
                slideObject: newSlideObjects
            };
        }
        return slide;
    });

    return {
        ...presentation,
        slides: newSlides
    };
}

// Функции для добавления текста и картинок
export function addTextObject(presentation: Presentation, [slideId]: [string]): Presentation {
    const newTextObject: PlainText = {
        type: "plain_text",
        content: "Новый текст",
        fontFamily: "Arial",
        weight: 400,
        scale: 1.0,
        rect: {
            x: 100,
            y: 100,
            width: 200,
            height: 50
        },
        id: generateTimestampId()
    };

    const newSlides = presentation.slides.map(slide => {
        if (slide.id === slideId) {
            return {
                ...slide,
                slideObject: [...slide.slideObject, newTextObject]
            };
        }
        return slide;
    });

    return {
        ...presentation,
        slides: newSlides,
        selectedObjects: [newTextObject.id]
    };
}

export function addImageObject(presentation: Presentation, [slideId, imageUrl]: [string, string]): Presentation {
    const newImageObject: Image = {
        type: "picture",
        src: imageUrl || "https://via.placeholder.com/300x200",
        rect: {
            x: 100,
            y: 100,
            width: 300,
            height: 200
        },
        id: generateTimestampId()
    };

    const newSlides = presentation.slides.map(slide => {
        if (slide.id === slideId) {
            return {
                ...slide,
                slideObject: [...slide.slideObject, newImageObject]
            };
        }
        return slide;
    });

    return {
        ...presentation,
        slides: newSlides,
        selectedObjects: [newImageObject.id]
    };
}

export function removeObject(presentation: Presentation, [objectId, slideId]: [string, string]): Presentation {
    const newSlides = presentation.slides.map(slide => {
        if (slide.id === slideId) {
            const newSlideObjects = slide.slideObject.filter(obj => obj.id !== objectId);
            return {
                ...slide,
                slideObject: newSlideObjects
            };
        }
        return slide;
    });

    const newSelectedObjects = presentation.selectedObjects.filter(id => id !== objectId);

    return {
        ...presentation,
        slides: newSlides,
        selectedObjects: newSelectedObjects
    };
}

export function selectObject(presentation: Presentation, [objectId]: [string]): Presentation {
    return {
        ...presentation,
        selectedObjects: objectId != "" ? [objectId] : []
    };
}

export function updateTextContent(presentation: Presentation, [objectId, slideId, content]: [string, string, string]): Presentation {
    const newSlides = presentation.slides.map(slide => {
        if (slide.id === slideId) {
            const newSlideObjects = slide.slideObject.map(obj => {
                if (obj.id === objectId && obj.type === 'plain_text') {
                    return {
                        ...obj,
                        content: content
                    };
                }
                return obj;
            });
            return {
                ...slide,
                slideObject: newSlideObjects
            };
        }
        return slide;
    });

    return {
        ...presentation,
        slides: newSlides
    };
}

export function updateImageSource(presentation: Presentation, [objectId, slideId, src]: [string, string, string]): Presentation {
    const newSlides = presentation.slides.map(slide => {
        if (slide.id === slideId) {
            const newSlideObjects = slide.slideObject.map(obj => {
                if (obj.id === objectId && obj.type === 'picture') {
                    return {
                        ...obj,
                        src: src
                    };
                }
                return obj;
            });
            return {
                ...slide,
                slideObject: newSlideObjects
            };
        }
        return slide;
    });

    return {
        ...presentation,
        slides: newSlides
    };
}

// Функция для изменения размера объектов
export function resizeObject(presentation: Presentation, [objectId, slideId, width, height]: [string, string, number, number]): Presentation {
    const newSlides = presentation.slides.map(slide => {
        if (slide.id === slideId) {
            const newSlideObjects = slide.slideObject.map(obj => {
                if (obj.id === objectId) {
                    return {
                        ...obj,
                        rect: {
                            ...obj.rect,
                            width: width,
                            height: height
                        }
                    };
                }
                return obj;
            });
            return {
                ...slide,
                slideObject: newSlideObjects
            };
        }
        return slide;
    });

    return {
        ...presentation,
        slides: newSlides
    };
}


export function moveObject(presentation: Presentation, [objectId, slideId, x, y]: [string, string, number, number]): Presentation {
    const newSlides = presentation.slides.map(slide => {
        if (slide.id === slideId) {
            const newSlideObjects = slide.slideObject.map(obj => {
                if (obj.id === objectId) {
                    return {
                        ...obj,
                        rect: {
                            ...obj.rect,
                            x: x,
                            y: y
                        }
                    };
                }
                return obj;
            });
            return {
                ...slide,
                slideObject: newSlideObjects
            };
        }
        return slide;
    });

    return {
        ...presentation,
        slides: newSlides
    };
}