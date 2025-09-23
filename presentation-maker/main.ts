type Presentation = SlideCollection & ElementSelection & {
    title: string;
}

type Slide = {
    background: Background;
    slideObject: Array<SlideObject>;
    id: string;
}

type Background = Color | Picture;

type Color = {
    type: 'color';
    color: string;
}

type Picture = {
    type: 'picture';
    src: string;
}

type SlideCollection = {
    slides: Array<Slide>;
}

type ElementSelection = {
    selectedSlide: number;
    selectedObjects: Array<number>;
}

type SlideObject = PlainText | Image;

type PlainText = BaseSlideObject & {
    type: 'plain_text';
    content: string;
    fontFamily: string;
    weight: number;
    scale: number;
} 

type Image = BaseSlideObject & Picture;

type BaseSlideObject = {
    rect: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    id: string;
}

const blankSlide: Slide = {
    background: {
        type: "color",
        color: "#FFFFFF",
    },
    slideObject: [],
    id: "0",
}

const blankText: SlideObject = {
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
    id: "0"
}

let presentationMin: Presentation = {
    title: "",
    slides: [
        {
            background: {
                type: "color",
                color: "#FF3FFF"
            },
            slideObject: [],
            id: "0"
        }
    ],
    selectedObjects: [],
    selectedSlide: 0
}

let presentationMax: Presentation = {
    title: "",
    slides: [
        {
            background: {
                type: "color",
                color: "#FF3FFF"
            },
            slideObject: [
                {
                    type: "plain_text",
                    content: "Hi",
                    fontFamily: "Arial",
                    weight: 400,
                    scale: 1.0,
                    rect: {
                        x: 100, 
                        y: 100,
                        width: 200,
                        height: 50
                    },
                    id: "0"
                },
                {
                    type: "plain_text",
                    content: "OOOO",
                    fontFamily: "Times New Roman",
                    weight: 600,
                    scale: 1.1,
                    rect: {
                        x: 150, 
                        y: 150,
                        width: 200,
                        height: 50
                    },
                    id: "1"
                },
                {
                    type: "picture",
                    src: "images/image.png",
                    rect: {
                        x: 0,
                        y: 0,
                        width: 500,
                        height: 500
                    },
                    id: "2"
                }
            ],
            id: "0"
        },
        {
            background: {
                type: "picture",
                src: "images/image.png"
            },
            slideObject: [
                {
                    type: "plain_text",
                    content: "Typescript",
                    fontFamily: "Comic Sans",
                    weight: 100,
                    scale: 2.0,
                    rect: {
                        x: 777, 
                        y: 777,
                        width: 340,
                        height: 57
                    },
                    id: "0"
                },
                {
                    type: "plain_text",
                    content: "OOOO",
                    fontFamily: "Times New Roman",
                    weight: 600,
                    scale: 1.1,
                    rect: {
                        x: 150, 
                        y: 150,
                        width: 200,
                        height: 50
                    },
                    id: "1"
                },
                {
                    type: "picture",
                    src: "images/image.png",
                    rect: {
                        x: 0,
                        y: 0,
                        width: 500,
                        height: 500
                    },
                    id: "2"
                }
            ],
            id: "1"
        },
        {
            background: {
                type: "picture",
                src: "images/image.png"
            },
            slideObject: [
                {
                    type: "plain_text",
                    content: "Typescript",
                    fontFamily: "Comic Sans",
                    weight: 100,
                    scale: 2.0,
                    rect: {
                        x: 777, 
                        y: 777,
                        width: 340,
                        height: 57
                    },
                    id: "0"
                },
                {
                    type: "plain_text",
                    content: "OOOO",
                    fontFamily: "Times New Roman",
                    weight: 600,
                    scale: 1.1,
                    rect: {
                        x: 150, 
                        y: 150,
                        width: 200,
                        height: 50
                    },
                    id: "1"
                },
            ],
            id: "2"
        },
    ],
    selectedObjects: [],
    selectedSlide: 0
}

function structuredClonePresentation(presentation: Presentation): Presentation {
    return JSON.parse(JSON.stringify(presentation));
}

function changePresentationName(presentation: Presentation, name: string): Presentation {
    const presentationCopy = structuredClonePresentation(presentation);
    presentationCopy.title = name;
    return presentationCopy;
}

function addSlide(presentation: Presentation, slide: Slide, idx: number): Presentation {
    const presentationCopy = structuredClonePresentation(presentation);
    if (presentation.slides.length > 0) {
        presentationCopy.slides.splice(idx, 0, slide);
    }
    return presentationCopy;
}

function removeSlide(presentation: Presentation, idx: number): Presentation {
    const presentationCopy= structuredClonePresentation(presentation);
    if (presentation.slides.length > 0) {
        presentationCopy.slides.splice(idx, 1);
    }
    return presentationCopy;
}

function replaceSlide(presentation: Presentation, slide: Slide, insertSpot: number): Presentation {
    let presentationCopy = structuredClonePresentation(presentation);
    if (presentation.slides.length > 0) {
        presentationCopy = removeSlide(presentationCopy, Number(slide.id));
        presentationCopy = addSlide(presentationCopy, slide, insertSpot);
    } 
    return presentationCopy;
}

function addSlideObject(presentation: Presentation, slideObject: SlideObject, idx: number, slideId: number): Presentation {
    const presentationCopy = structuredClonePresentation(presentation);
    presentationCopy.slides[slideId].slideObject.splice(idx, 0, slideObject);
    return presentationCopy;
}

function removeSlideObject(presentation: Presentation, id: number, slideId: number): Presentation {
    const presentationCopy = structuredClonePresentation(presentation);
    presentationCopy.slides[slideId].slideObject.splice(id, 1);
    return presentationCopy;
}

function changePlainTextContent(presentation: Presentation, content: string, id: number, slideId: number): Presentation {
    const presentationCopy = structuredClonePresentation(presentation);
    const slideObj = presentationCopy.slides[slideId].slideObject[id];
    if (slideObj.type === 'plain_text') {
        slideObj.content = content;
    }
    return presentationCopy;
}

function changePlainTextScale(presentation: Presentation, scale: number, id: number, slideId: number): Presentation {
    const presentationCopy = structuredClonePresentation(presentation); 
    const slideObj = presentationCopy.slides[slideId].slideObject[id];
    if (slideObj.type === 'plain_text') {
        slideObj.scale = scale;
    }
    return presentationCopy;
}

function changePlainTextFontFamily(presentation: Presentation, fontFamily: string, id: number, slideId: number): Presentation {
    const presentationCopy = structuredClonePresentation(presentation);
    const slideObj = presentationCopy.slides[slideId].slideObject[id];
    if (slideObj.type === 'plain_text') {
        slideObj.fontFamily = fontFamily;
    }
    return presentationCopy;
}

function changeBackgroundToColor(presentation: Presentation, color: string, slideId: number): Presentation {
    const presentationCopy = structuredClonePresentation(presentation);
    presentationCopy.slides[slideId].background = {
        type: 'color',
        color: color
    };
    return presentationCopy;
}

function changeBackgroundToImage(presentation: Presentation, imageSrc: string, slideId: number): Presentation {
    const presentationCopy = structuredClonePresentation(presentation);
    presentationCopy.slides[slideId].background = {
        type: "picture",
        src: imageSrc
    };
    return presentationCopy;
}

function changeSlideObjectScale(presentation: Presentation, height: number, width: number, id: number, slideId: number): Presentation {
    const presentationCopy = structuredClonePresentation(presentation);
    presentationCopy.slides[slideId].slideObject[id].rect.height = height;
    presentationCopy.slides[slideId].slideObject[id].rect.width = width;
    return presentationCopy;
}

function changeSlideObjectPosition(presentation: Presentation, x: number, y: number, id: number, slideId: number): Presentation {
    const presentationCopy = structuredClonePresentation(presentation);
    presentationCopy.slides[slideId].slideObject[id].rect.x = x;
    presentationCopy.slides[slideId].slideObject[id].rect.y = y;
    return presentationCopy;
}

console.log("Change name: ", JSON.stringify(presentationMin, null, 2));
presentationMin = changePresentationName(presentationMin, "My");
presentationMax = changePresentationName(presentationMax, "GG");

console.log("Add slide:", JSON.stringify(presentationMin, null, 2))
presentationMin = addSlide(presentationMin, blankSlide, presentationMin.slides.length);
presentationMax = addSlide(presentationMax, blankSlide, presentationMax.slides.length);

console.log("Replace slide: ", JSON.stringify(presentationMin, null, 2))
presentationMin = replaceSlide(presentationMin, presentationMin.slides[0], 1);

console.log("Remove slide: ", JSON.stringify(presentationMin, null, 2))
presentationMin = removeSlide(presentationMin, presentationMin.slides.length - 1);
presentationMax = removeSlide(presentationMax, presentationMax.slides.length - 1);

console.log("Add slide object: ", JSON.stringify(presentationMin, null, 2))
presentationMin = addSlideObject(presentationMin, blankText, 0, 0);
presentationMax = addSlideObject(presentationMax, blankText, 0, 0);

console.log("Change text content: ", JSON.stringify(presentationMin, null, 2))
presentationMin = changePlainTextContent(presentationMin, "Привет", 0, 0);
presentationMax = changePlainTextContent(presentationMax, "Привет", 0, 0);

console.log("Change text scale: ", JSON.stringify(presentationMin, null, 2))
presentationMin = changePlainTextScale(presentationMin, 1.5, 0, 0); 
presentationMax = changePlainTextScale(presentationMax, 0.8, 0, 0);

console.log("Change text family: ", JSON.stringify(presentationMin, null, 2))
presentationMin = changePlainTextFontFamily(presentationMin, "Colibri", 0, 0); 
presentationMax = changePlainTextFontFamily(presentationMax, "Colibri", 0, 0);

console.log("Change slide object scale", JSON.stringify(presentationMin, null, 2))
presentationMin = changeSlideObjectScale(presentationMin, 500, 250, 0, 0);
presentationMax = changeSlideObjectScale(presentationMax, 500, 250, 0, 0);

console.log("Change slide object position: ", JSON.stringify(presentationMin, null, 2))
presentationMin = changeSlideObjectPosition(presentationMin, 100, 100, 0, 0);
presentationMax = changeSlideObjectPosition(presentationMax, 100, 100, 0, 0);

console.log("Remove slide object: ", JSON.stringify(presentationMin, null, 2))
presentationMin = removeSlideObject(presentationMin, 0, 0);
presentationMax = removeSlideObject(presentationMax, 0, 0);

console.log("Change background to color: ", JSON.stringify(presentationMin, null, 2))
presentationMin = changeBackgroundToColor(presentationMin, "#FFF4FF", 0);
presentationMax = changeBackgroundToColor(presentationMax, "#FFF5FF", 1);

console.log("Change background to image: ", JSON.stringify(presentationMin, null, 2))
presentationMin = changeBackgroundToImage(presentationMin, "images/image.png", 0);
presentationMax = changeBackgroundToImage(presentationMax, "images/image.png", 0);

console.log("End", JSON.stringify(presentationMin, null, 2))