"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var typeAndFunctions_js_1 = require("./typeAndFunctions.js");
var presentationMin = {
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
};
var presentationMax = {
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
};
console.log("Change name: ", JSON.stringify(presentationMin, null, 2));
presentationMin = (0, typeAndFunctions_js_1.changePresentationName)(presentationMin, "My");
presentationMax = (0, typeAndFunctions_js_1.changePresentationName)(presentationMax, "GG");
console.log("Add slide:", JSON.stringify(presentationMin, null, 2));
presentationMin = (0, typeAndFunctions_js_1.addSlide)(presentationMin, typeAndFunctions_js_1.blankSlide, presentationMin.slides.length);
presentationMax = (0, typeAndFunctions_js_1.addSlide)(presentationMax, typeAndFunctions_js_1.blankSlide, presentationMax.slides.length);
console.log("Replace slide: ", JSON.stringify(presentationMin, null, 2));
presentationMin = (0, typeAndFunctions_js_1.replaceSlide)(presentationMin, presentationMin.slides[0], 1);
console.log("Remove slide: ", JSON.stringify(presentationMin, null, 2));
presentationMin = (0, typeAndFunctions_js_1.removeSlide)(presentationMin, presentationMin.slides.length - 1);
presentationMax = (0, typeAndFunctions_js_1.removeSlide)(presentationMax, presentationMax.slides.length - 1);
console.log("Add slide object: ", JSON.stringify(presentationMin, null, 2));
presentationMin = (0, typeAndFunctions_js_1.addSlideObject)(presentationMin, typeAndFunctions_js_1.blankText, 0, 0);
presentationMax = (0, typeAndFunctions_js_1.addSlideObject)(presentationMax, typeAndFunctions_js_1.blankText, 0, 0);
console.log("Change text content: ", JSON.stringify(presentationMin, null, 2));
presentationMin = (0, typeAndFunctions_js_1.changePlainTextContent)(presentationMin, "Привет", 0, 0);
presentationMax = (0, typeAndFunctions_js_1.changePlainTextContent)(presentationMax, "Привет", 0, 0);
console.log("Change text scale: ", JSON.stringify(presentationMin, null, 2));
presentationMin = (0, typeAndFunctions_js_1.changePlainTextScale)(presentationMin, 1.5, 0, 0);
presentationMax = (0, typeAndFunctions_js_1.changePlainTextScale)(presentationMax, 0.8, 0, 0);
console.log("Change text family: ", JSON.stringify(presentationMin, null, 2));
presentationMin = (0, typeAndFunctions_js_1.changePlainTextFontFamily)(presentationMin, "Colibri", 0, 0);
presentationMax = (0, typeAndFunctions_js_1.changePlainTextFontFamily)(presentationMax, "Colibri", 0, 0);
console.log("Change slide object scale", JSON.stringify(presentationMin, null, 2));
presentationMin = (0, typeAndFunctions_js_1.changeSlideObjectScale)(presentationMin, 500, 250, 0, 0);
presentationMax = (0, typeAndFunctions_js_1.changeSlideObjectScale)(presentationMax, 500, 250, 0, 0);
console.log("Change slide object position: ", JSON.stringify(presentationMin, null, 2));
presentationMin = (0, typeAndFunctions_js_1.changeSlideObjectPosition)(presentationMin, 100, 100, 0, 0);
presentationMax = (0, typeAndFunctions_js_1.changeSlideObjectPosition)(presentationMax, 100, 100, 0, 0);
console.log("Remove slide object: ", JSON.stringify(presentationMin, null, 2));
presentationMin = (0, typeAndFunctions_js_1.removeSlideObject)(presentationMin, 0, 0);
presentationMax = (0, typeAndFunctions_js_1.removeSlideObject)(presentationMax, 0, 0);
console.log("Change background to color: ", JSON.stringify(presentationMin, null, 2));
presentationMin = (0, typeAndFunctions_js_1.changeBackgroundToColor)(presentationMin, "#FFF4FF", 0);
presentationMax = (0, typeAndFunctions_js_1.changeBackgroundToColor)(presentationMax, "#FFF5FF", 1);
console.log("Change background to image: ", JSON.stringify(presentationMin, null, 2));
presentationMin = (0, typeAndFunctions_js_1.changeBackgroundToImage)(presentationMin, "images/image.png", 0);
presentationMax = (0, typeAndFunctions_js_1.changeBackgroundToImage)(presentationMax, "images/image.png", 0);
console.log("End", JSON.stringify(presentationMin, null, 2));
