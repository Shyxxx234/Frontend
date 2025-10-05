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
    const presentationCopy = structuredClonePresentation(presentation);
    presentationCopy.selectedSlide = sldieId;
    return presentationCopy;
}

export function structuredClonePresentation(presentation: Presentation): Presentation {
    return JSON.parse(JSON.stringify(presentation));
}

export function changePresentationName(presentation: Presentation, name: string): Presentation {
    const presentationCopy = structuredClonePresentation(presentation);
    presentationCopy.title = name;
    return presentationCopy;
}

export function addSlide(presentation: Presentation, slide: Slide, idx: number, createId = true): Presentation {
    const presentationCopy = structuredClonePresentation(presentation);
    if (createId) slide.id = generateTimestampId();
    if (presentation.slides.length > 0) {
        presentationCopy.slides.splice(idx, 0, slide);
    }
    return presentationCopy;
}

export function removeSlide(presentation: Presentation, idx: number): Presentation {
    const presentationCopy= structuredClonePresentation(presentation);
    if (presentation.slides.length > 0) {
        presentationCopy.slides.splice(idx, 1);
    }
    return presentationCopy;
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
    let presentationCopy = structuredClonePresentation(presentation);
    if (presentation.slides.length > 0) {
        presentationCopy = removeSlide(presentationCopy, Number(slide.id));
        presentationCopy = addSlide(presentationCopy, slide, insertSpot, false);
    } 
    return presentationCopy;
}

export function addSlideObject(presentation: Presentation, slideObject: SlideObject, idx: number, slideId: number, createId = true): Presentation {
    const presentationCopy = structuredClonePresentation(presentation);
    if (createId) slideObject.id = generateTimestampId();
    presentationCopy.slides[slideId].slideObject.splice(idx, 0, slideObject);
    return presentationCopy;
}

export function removeSlideObject(presentation: Presentation, id: number, slideId: number): Presentation {
    const presentationCopy = structuredClonePresentation(presentation);
    presentationCopy.slides[slideId].slideObject.splice(id, 1);
    return presentationCopy;
}

export function replaceSlideObject(presentation: Presentation, slideObj: SlideObject, slideId: number, insertSpot: number): Presentation {
    let presentationCopy = structuredClonePresentation(presentation);
    if (presentation.slides.length > 0) {
        presentationCopy = removeSlideObject(presentationCopy, Number(slideObj.id), Number(slideId));
        presentationCopy = addSlideObject(presentationCopy, slideObj, insertSpot, slideId, false);
    } 
    return presentationCopy;
}

export function changePlainTextContent(presentation: Presentation, content: string, id: number, slideId: number): Presentation {
    const presentationCopy = structuredClonePresentation(presentation);
    const slideObj = presentationCopy.slides[slideId].slideObject[id];
    if (slideObj.type === 'plain_text') {
        slideObj.content = content;
    }
    return presentationCopy;
}

export function changePlainTextScale(presentation: Presentation, scale: number, id: number, slideId: number): Presentation {
    const presentationCopy = structuredClonePresentation(presentation); 
    const slideObj = presentationCopy.slides[slideId].slideObject[id];
    if (slideObj.type === 'plain_text') {
        slideObj.scale = scale;
    }
    return presentationCopy;
}

export function changePlainTextFontFamily(presentation: Presentation, fontFamily: string, id: number, slideId: number): Presentation {
    const presentationCopy = structuredClonePresentation(presentation);
    const slideObj = presentationCopy.slides[slideId].slideObject[id];
    if (slideObj.type === 'plain_text') {
        slideObj.fontFamily = fontFamily;
    }
    return presentationCopy;
}

export function changeBackgroundToColor(presentation: Presentation, color: string, slideId: number): Presentation {
    const presentationCopy = structuredClonePresentation(presentation);
    presentationCopy.slides[slideId].background = {
        type: 'color',
        color: color
    };
    return presentationCopy;
}

export function changeBackgroundToImage(presentation: Presentation, imageSrc: string, slideId: number): Presentation {
    const presentationCopy = structuredClonePresentation(presentation);
    presentationCopy.slides[slideId].background = {
        type: "picture",
        src: imageSrc
    };
    return presentationCopy;
}

export function changeSlideObjectScale(presentation: Presentation, height: number, width: number, id: number, slideId: number): Presentation {
    const presentationCopy = structuredClonePresentation(presentation);
    presentationCopy.slides[slideId].slideObject[id].rect.height = height;
    presentationCopy.slides[slideId].slideObject[id].rect.width = width;
    return presentationCopy;
}

export function changeSlideObjectPosition(presentation: Presentation, x: number, y: number, id: number, slideId: number): Presentation {
    const presentationCopy = structuredClonePresentation(presentation);
    presentationCopy.slides[slideId].slideObject[id].rect.x = x;
    presentationCopy.slides[slideId].slideObject[id].rect.y = y;
    return presentationCopy;
}