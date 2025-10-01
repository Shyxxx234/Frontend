"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blankImage = exports.blankText = exports.blankSlide = void 0;
exports.structuredClonePresentation = structuredClonePresentation;
exports.changePresentationName = changePresentationName;
exports.addSlide = addSlide;
exports.removeSlide = removeSlide;
exports.replaceSlide = replaceSlide;
exports.addSlideObject = addSlideObject;
exports.removeSlideObject = removeSlideObject;
exports.replaceSlideObject = replaceSlideObject;
exports.changePlainTextContent = changePlainTextContent;
exports.changePlainTextScale = changePlainTextScale;
exports.changePlainTextFontFamily = changePlainTextFontFamily;
exports.changeBackgroundToColor = changeBackgroundToColor;
exports.changeBackgroundToImage = changeBackgroundToImage;
exports.changeSlideObjectScale = changeSlideObjectScale;
exports.changeSlideObjectPosition = changeSlideObjectPosition;
exports.blankSlide = {
    background: {
        type: "color",
        color: "#FFFFFF",
    },
    slideObject: [],
    id: ""
};
exports.blankText = {
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
};
exports.blankImage = {
    type: "picture",
    src: "",
    rect: {
        x: 0,
        y: 0,
        width: 255,
        height: 50
    },
    id: ""
};
function generateTimestampId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
function structuredClonePresentation(presentation) {
    return JSON.parse(JSON.stringify(presentation));
}
function changePresentationName(presentation, name) {
    var presentationCopy = structuredClonePresentation(presentation);
    presentationCopy.title = name;
    return presentationCopy;
}
function addSlide(presentation, slide, idx, createId) {
    if (createId === void 0) { createId = true; }
    var presentationCopy = structuredClonePresentation(presentation);
    if (createId)
        slide.id = generateTimestampId();
    if (presentation.slides.length > 0) {
        presentationCopy.slides.splice(idx, 0, slide);
    }
    return presentationCopy;
}
function removeSlide(presentation, idx) {
    var presentationCopy = structuredClonePresentation(presentation);
    if (presentation.slides.length > 0) {
        presentationCopy.slides.splice(idx, 1);
    }
    return presentationCopy;
}
function replaceSlide(presentation, slide, insertSpot) {
    var presentationCopy = structuredClonePresentation(presentation);
    if (presentation.slides.length > 0) {
        presentationCopy = removeSlide(presentationCopy, Number(slide.id));
        presentationCopy = addSlide(presentationCopy, slide, insertSpot, false);
    }
    return presentationCopy;
}
function addSlideObject(presentation, slideObject, idx, slideId, createId) {
    if (createId === void 0) { createId = true; }
    var presentationCopy = structuredClonePresentation(presentation);
    if (createId)
        slideObject.id = generateTimestampId();
    presentationCopy.slides[slideId].slideObject.splice(idx, 0, slideObject);
    return presentationCopy;
}
function removeSlideObject(presentation, id, slideId) {
    var presentationCopy = structuredClonePresentation(presentation);
    presentationCopy.slides[slideId].slideObject.splice(id, 1);
    return presentationCopy;
}
function replaceSlideObject(presentation, slideObj, slideId, insertSpot) {
    var presentationCopy = structuredClonePresentation(presentation);
    if (presentation.slides.length > 0) {
        presentationCopy = removeSlideObject(presentationCopy, Number(slideObj.id), Number(slideId));
        presentationCopy = addSlideObject(presentationCopy, slideObj, insertSpot, slideId, false);
    }
    return presentationCopy;
}
function changePlainTextContent(presentation, content, id, slideId) {
    var presentationCopy = structuredClonePresentation(presentation);
    var slideObj = presentationCopy.slides[slideId].slideObject[id];
    if (slideObj.type === 'plain_text') {
        slideObj.content = content;
    }
    return presentationCopy;
}
function changePlainTextScale(presentation, scale, id, slideId) {
    var presentationCopy = structuredClonePresentation(presentation);
    var slideObj = presentationCopy.slides[slideId].slideObject[id];
    if (slideObj.type === 'plain_text') {
        slideObj.scale = scale;
    }
    return presentationCopy;
}
function changePlainTextFontFamily(presentation, fontFamily, id, slideId) {
    var presentationCopy = structuredClonePresentation(presentation);
    var slideObj = presentationCopy.slides[slideId].slideObject[id];
    if (slideObj.type === 'plain_text') {
        slideObj.fontFamily = fontFamily;
    }
    return presentationCopy;
}
function changeBackgroundToColor(presentation, color, slideId) {
    var presentationCopy = structuredClonePresentation(presentation);
    presentationCopy.slides[slideId].background = {
        type: 'color',
        color: color
    };
    return presentationCopy;
}
function changeBackgroundToImage(presentation, imageSrc, slideId) {
    var presentationCopy = structuredClonePresentation(presentation);
    presentationCopy.slides[slideId].background = {
        type: "picture",
        src: imageSrc
    };
    return presentationCopy;
}
function changeSlideObjectScale(presentation, height, width, id, slideId) {
    var presentationCopy = structuredClonePresentation(presentation);
    presentationCopy.slides[slideId].slideObject[id].rect.height = height;
    presentationCopy.slides[slideId].slideObject[id].rect.width = width;
    return presentationCopy;
}
function changeSlideObjectPosition(presentation, x, y, id, slideId) {
    var presentationCopy = structuredClonePresentation(presentation);
    presentationCopy.slides[slideId].slideObject[id].rect.x = x;
    presentationCopy.slides[slideId].slideObject[id].rect.y = y;
    return presentationCopy;
}
