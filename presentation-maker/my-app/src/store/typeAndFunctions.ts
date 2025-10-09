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
    selectedSlide: number;
    selectedObjects: Array<number>;
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

export const blankSlide: Slide = {
    background: {
        type: "color",
        color: "#FFFFFF",
    },
    slideObject: [],
    id: ""
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

function generateTimestampId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function selectSlide(presentation: Presentation, sldieId: number): Presentation {
    return {
        ...presentation,
        selectedSlide: sldieId
    }
}

export function changePresentationName(presentation: Presentation, name: string): Presentation {
    return {
        ...presentation,
        title: name
    }
}

export function addSlide(presentation: Presentation, slide: Slide, idx: number, createId = true): Presentation {
    const newSlide = createId ? { ...slide, id: generateTimestampId() } : { ...slide };
    const newSlides = [...presentation.slides];
    
    if (newSlides.length > 0) {
        newSlides.splice(idx, 0, newSlide);
    } else {
        newSlides.push(newSlide);
    }
    
    return {
        ...presentation,
        slides: newSlides
    };
}

export function removeSlide(presentation: Presentation, idx: number): Presentation {
    if (presentation.slides.length === 0) {
        return presentation;
    }
    
    const newSlides = presentation.slides.filter((_, index) => index !== idx);
    
    return {
        ...presentation,
        slides: newSlides
    };
}
/*
function rmSlide(editor: Editor):Editor {//selection
    return {
        ...editor, 
        presntation: {
            ...editor.presentation,
            slides: editor.presentation.slides.filter(slide => slide.id != editor.selection.selectedSlide)
        }
    }
}

function selecteSlideObject(editor: Editor, SelectedObjectId: number): Editor
{
    return {
        ...editor,
        selection: {
            ...editor.selection,
            selectedSlideObjectId,
        }
    }
}

function moveSlide(editor: TextEncoderEncodeIntoResult, targetSlideIndex: number): Editor
{   
    const movedSlide = editor.presentation.slide.find(slide => slide.id == editor.selection.selectedSlideId)
    if(!moveSlide)
    {
        return editor
    }

    const newSlides: Array<Slide> = {
        //copy before target slide
        ...changeSlideObjectScale.slice(0, targetSlideIndex).filter(slide => slide.id != Selection.selectedSlideIndex),
        movedSlide,
        ..slides.slice(targetSlideINdex + 1).filter(slide => slide.id != Selection.selectedSlideIndex)
        //copy after target slide
    }
    return {
        ...editor,
        presentation : {
            ...editor.presentation,
            slides: newSlides,
        }
    }
}*/

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