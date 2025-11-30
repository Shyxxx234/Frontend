import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { generateTimestampId } from './utils'
import type { SlideObject, PlainText, Image } from './types'

const defaultFontWeight = 400
const defaultFontFamily = "Arial"
const defaultTextContent = "Новый текст"
const defaultFontScale = 1.0
const defaultSlideObjectPositionX = 100
const defaultSlideObjectPositionY = 100
const defaultFontWidth = 200
const defaultFontHeight = 50
const defaultImageWidth = 200
const defaultImageHeight = 200

type SlideObjectState = {
  objects: Record<string, SlideObject[]>
}

const initialState: SlideObjectState = {
  objects: {}
}

const slideObjectSlice = createSlice({
  name: 'slideObjects',
  initialState,
  reducers: {
    addTextObject: (state, action: PayloadAction<{ slideId: string }>) => {
      const { slideId } = action.payload
      const newTextObject: PlainText = {
        type: "plain_text",
        content: defaultTextContent,
        fontFamily: defaultFontFamily,
        weight: defaultFontWeight,
        scale: defaultFontScale,
        rect: {
          x: defaultSlideObjectPositionX,
          y: defaultSlideObjectPositionY,
          width: defaultFontWidth,
          height: defaultFontHeight
        },
        id: generateTimestampId()
      }

      if (!state.objects[slideId]) {
        state.objects[slideId] = []
      }
      state.objects[slideId].push(newTextObject)
    },

    restoreObjects: (state, action: PayloadAction<SlideObjectState>) => {
      state.objects = action.payload.objects || {};
    },

    addImageObject: (state, action: PayloadAction<{ slideId: string; imageUrl: string }>) => {
      const { slideId, imageUrl } = action.payload
      const newImageObject: Image = {
        type: "picture",
        src: imageUrl,
        rect: {
          x: defaultSlideObjectPositionX,
          y: defaultSlideObjectPositionY,
          width: defaultImageWidth,
          height: defaultImageHeight
        },
        id: generateTimestampId()
      }

      if (!state.objects[slideId]) {
        state.objects[slideId] = []
      }
      state.objects[slideId].push(newImageObject)
    },

    removeObject: (state, action: PayloadAction<{ objectId: string; slideId: string }>) => {
      const { objectId, slideId } = action.payload
      if (state.objects[slideId]) {
        state.objects[slideId] = state.objects[slideId].filter(obj => obj.id !== objectId)
      }
    },

    moveObject: (state, action: PayloadAction<{ objectId: string; slideId: string; x: number; y: number }>) => {
      const { objectId, slideId, x, y } = action.payload

      if (state.objects[slideId]) {
        const obj = state.objects[slideId].find(o => o.id === objectId)
        if (obj) {
          obj.rect.x = x
          obj.rect.y = y
        }
      }
    },

    resizeObject: (state, action: PayloadAction<{
      objectId: string;
      slideId: string;
      x: number;
      y: number;
      width: number;
      height: number
    }>) => {
      const { objectId, slideId, x, y, width, height } = action.payload

      if (state.objects[slideId]) {
        const obj = state.objects[slideId].find(o => o.id === objectId)
        if (obj) {
          obj.rect.x = x
          obj.rect.y = y
          obj.rect.width = width
          obj.rect.height = height
        }
      }
    },

    changePlainTextContent: (state, action: PayloadAction<{
      content: string;
      objectId: string;
      slideId: string
    }>) => {
      const { content, objectId, slideId } = action.payload

      if (state.objects[slideId]) {
        const obj = state.objects[slideId].find(o => o.id === objectId)
        if (obj && obj.type === 'plain_text') {
          obj.content = content
        }
      }
    },

    changePlainTextFontFamily: (state, action: PayloadAction<{
      fontFamily: string;
      objectId: string;
      slideId: string
    }>) => {
      const { fontFamily, objectId, slideId } = action.payload

      if (state.objects[slideId]) {
        const obj = state.objects[slideId].find(o => o.id === objectId)
        if (obj && obj.type === 'plain_text') {
          obj.fontFamily = fontFamily
        }
      }
    },
    

    changePlainTextScale: (state, action: PayloadAction<{
      scale: number;
      objectId: string;
      slideId: string
    }>) => {
      const { scale, objectId, slideId } = action.payload

      if (state.objects[slideId]) {
        const obj = state.objects[slideId].find(o => o.id === objectId)
        if (obj && obj.type === 'plain_text') {
          obj.scale = scale
        }
      }
    }
  }
})

export const {
  addTextObject,
  addImageObject,
  removeObject,
  moveObject,
  resizeObject,
  restoreObjects,
  changePlainTextContent,
  changePlainTextFontFamily,
  changePlainTextScale
} = slideObjectSlice.actions

export default slideObjectSlice.reducer