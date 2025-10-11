import { blankSlide } from '../views/sidePanel/sidePanel';
import {type Presentation, 
    changeBackgroundToColor,
    changePresentationName,
    addSlide,
    replaceSlide, 
    removeSlide,
    addSlideObject,
    changePlainTextContent, 
    blankText,
    changePlainTextFontFamily, 
    changePlainTextScale, 
    changeBackgroundToImage,
    changeSlideObjectPosition, 
    changeSlideObjectScale,
    removeSlideObject,
    } from './typeAndFunctions';

export let presentationMin: Presentation = {
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
    selectedSlide: "0"
}

export let presentationMax: Presentation = {
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
                    id: "1"
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
                    id: "2"
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
                    id: "3"
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
                    id: "5"
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
                    id: "6"
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
                    id: "7"
                }
            ],
            id: "4"
        },
        {
            background: {
                type: "picture",
                src: "images/image.png" //url
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
                    id: "9"
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
                    id: "10"
                },
            ],
            id: "8"
        },
    ],
    selectedObjects: [],
    selectedSlide: "0"
}

console.log("Change name: ", JSON.stringify(presentationMin, null, 2));
presentationMin = changePresentationName(presentationMin, "My");
presentationMax = changePresentationName(presentationMax, "GG");

console.log("Add slide:", JSON.stringify(presentationMin, null, 2))
presentationMin = addSlide(presentationMin, blankSlide, true);
presentationMax = addSlide(presentationMax, blankSlide, presentationMax.slides.length, true);

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