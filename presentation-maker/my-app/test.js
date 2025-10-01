"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.presentationMax = exports.presentationMin = void 0;
var typeAndFunctions_js_1 = require("./src/store/typeAndFunctions.js");
exports.presentationMin = {
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
exports.presentationMax = {
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
    selectedSlide: 0
};
console.log("Change name: ", JSON.stringify(exports.presentationMin, null, 2));
exports.presentationMin = (0, typeAndFunctions_js_1.changePresentationName)(exports.presentationMin, "My");
exports.presentationMax = (0, typeAndFunctions_js_1.changePresentationName)(exports.presentationMax, "GG");
console.log("Add slide:", JSON.stringify(exports.presentationMin, null, 2));
exports.presentationMin = (0, typeAndFunctions_js_1.addSlide)(exports.presentationMin, typeAndFunctions_js_1.blankSlide, exports.presentationMin.slides.length);
exports.presentationMax = (0, typeAndFunctions_js_1.addSlide)(exports.presentationMax, typeAndFunctions_js_1.blankSlide, exports.presentationMax.slides.length);
console.log("Replace slide: ", JSON.stringify(exports.presentationMin, null, 2));
exports.presentationMin = (0, typeAndFunctions_js_1.replaceSlide)(exports.presentationMin, exports.presentationMin.slides[0], 1);
console.log("Remove slide: ", JSON.stringify(exports.presentationMin, null, 2));
exports.presentationMin = (0, typeAndFunctions_js_1.removeSlide)(exports.presentationMin, exports.presentationMin.slides.length - 1);
exports.presentationMax = (0, typeAndFunctions_js_1.removeSlide)(exports.presentationMax, exports.presentationMax.slides.length - 1);
console.log("Add slide object: ", JSON.stringify(exports.presentationMin, null, 2));
exports.presentationMin = (0, typeAndFunctions_js_1.addSlideObject)(exports.presentationMin, typeAndFunctions_js_1.blankText, 0, 0);
exports.presentationMax = (0, typeAndFunctions_js_1.addSlideObject)(exports.presentationMax, typeAndFunctions_js_1.blankText, 0, 0);
console.log("Change text content: ", JSON.stringify(exports.presentationMin, null, 2));
exports.presentationMin = (0, typeAndFunctions_js_1.changePlainTextContent)(exports.presentationMin, "Привет", 0, 0);
exports.presentationMax = (0, typeAndFunctions_js_1.changePlainTextContent)(exports.presentationMax, "Привет", 0, 0);
console.log("Change text scale: ", JSON.stringify(exports.presentationMin, null, 2));
exports.presentationMin = (0, typeAndFunctions_js_1.changePlainTextScale)(exports.presentationMin, 1.5, 0, 0);
exports.presentationMax = (0, typeAndFunctions_js_1.changePlainTextScale)(exports.presentationMax, 0.8, 0, 0);
console.log("Change text family: ", JSON.stringify(exports.presentationMin, null, 2));
exports.presentationMin = (0, typeAndFunctions_js_1.changePlainTextFontFamily)(exports.presentationMin, "Colibri", 0, 0);
exports.presentationMax = (0, typeAndFunctions_js_1.changePlainTextFontFamily)(exports.presentationMax, "Colibri", 0, 0);
console.log("Change slide object scale", JSON.stringify(exports.presentationMin, null, 2));
exports.presentationMin = (0, typeAndFunctions_js_1.changeSlideObjectScale)(exports.presentationMin, 500, 250, 0, 0);
exports.presentationMax = (0, typeAndFunctions_js_1.changeSlideObjectScale)(exports.presentationMax, 500, 250, 0, 0);
console.log("Change slide object position: ", JSON.stringify(exports.presentationMin, null, 2));
exports.presentationMin = (0, typeAndFunctions_js_1.changeSlideObjectPosition)(exports.presentationMin, 100, 100, 0, 0);
exports.presentationMax = (0, typeAndFunctions_js_1.changeSlideObjectPosition)(exports.presentationMax, 100, 100, 0, 0);
console.log("Remove slide object: ", JSON.stringify(exports.presentationMin, null, 2));
exports.presentationMin = (0, typeAndFunctions_js_1.removeSlideObject)(exports.presentationMin, 0, 0);
exports.presentationMax = (0, typeAndFunctions_js_1.removeSlideObject)(exports.presentationMax, 0, 0);
console.log("Change background to color: ", JSON.stringify(exports.presentationMin, null, 2));
exports.presentationMin = (0, typeAndFunctions_js_1.changeBackgroundToColor)(exports.presentationMin, "#FFF4FF", 0);
exports.presentationMax = (0, typeAndFunctions_js_1.changeBackgroundToColor)(exports.presentationMax, "#FFF5FF", 1);
console.log("Change background to image: ", JSON.stringify(exports.presentationMin, null, 2));
exports.presentationMin = (0, typeAndFunctions_js_1.changeBackgroundToImage)(exports.presentationMin, "images/image.png", 0);
exports.presentationMax = (0, typeAndFunctions_js_1.changeBackgroundToImage)(exports.presentationMax, "images/image.png", 0);
console.log("End", JSON.stringify(exports.presentationMin, null, 2));
