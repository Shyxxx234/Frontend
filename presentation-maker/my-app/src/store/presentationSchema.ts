import type { JSONSchemaType } from "ajv"
import type { Background, Color, ImageObject, Picture, PlainText, Presentation, Rect, Slide } from "./types"


type SlideObjectForSchema = PlainText | ImageObject

const colorSchema: JSONSchemaType<Color> = {
  type: "object",
  properties: {
    type: { type: "string", const: "color" },
    color: { type: "string" }
  },
  required: ["type", "color"],
}

const pictureBackgroundSchema: JSONSchemaType<Picture> = {
  type: "object",
  properties: {
    type: { type: "string", const: "picture" },
    src: { type: "string" }
  },
  required: ["type", "src"],
}

const backgroundSchema: JSONSchemaType<Background> = {
  type: "object",
  oneOf: [colorSchema, pictureBackgroundSchema]
}

const rectSchema: JSONSchemaType<Rect> = {
  type: "object",
  properties: {
    x: { type: "number" },
    y: { type: "number" },
    width: { type: "number" },
    height: { type: "number" }
  },
  required: ["x", "y", "width", "height"],
}

const plainTextSchema: JSONSchemaType<PlainText> = {
  type: "object",
  properties: {
    type: { type: "string", const: "plain_text" },
    content: { type: "string" },
    fontFamily: { type: "string" },
    weight: { type: "number" },
    scale: { type: "number" },
    rect: rectSchema,
    id: { type: "string" }
  },
  required: ["type", "content", "fontFamily", "weight", "scale", "rect", "id"],
}

const imageSchema: JSONSchemaType<ImageObject> = {
  type: "object",
  properties: {
    type: { type: "string", const: "image" },
    src: { type: "string" },
    rect: rectSchema,
    id: { type: "string" }
  },
  required: ["type", "src", "rect", "id"],
}

const slideObjectSchema: JSONSchemaType<SlideObjectForSchema> = {
  type: "object",
  oneOf: [plainTextSchema, imageSchema]
}

const slideSchema = {
  type: "object",
  properties: {
    background: backgroundSchema,
    slideObject: {
      type: "array",
      items: slideObjectSchema
    },
    id: { type: "string" },
  },
  required: ["background", "slideObject", "id"],
} as JSONSchemaType<Slide>

export const presentationSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    slides: {
      type: "array",
      items: slideSchema
    },
    selectedSlide: { 
      type: ["string", "null"]
    },
    selectedObjects: {
      type: "array",
      items: { type: "string" }
    }
  },
  required: ["title", "slides", "selectedObjects"],
} as JSONSchemaType<Presentation>