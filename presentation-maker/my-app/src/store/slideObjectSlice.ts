import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { generateTimestampId } from './utils'
import type { SlideObject, PlainText, Image, CodeBlock } from './types'

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
const defaultCodeBlockWidth = 400
const defaultCodeBlockHeight = 300
const defaultCodeContent = "// Введите код\nconsole.log('Hello World');"
const defaultLanguage = "typescript"

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
        color: 'white',
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

    addCodeBlockObject: (state, action: PayloadAction<{
      slideId: string;
      language?: string;
      content?: string;
      theme?: string;
      fontSize?: number;
      showLineNumbers?: boolean;
      rect?: {
        x: number;
        y: number;
        width: number;
        height: number;
      }
    }>) => {
      const { 
        slideId, 
        language = defaultLanguage, 
        content = defaultCodeContent,
        theme = "vs-dark",
        fontSize = 14,
        showLineNumbers = true,
        rect 
      } = action.payload
      
      const newCodeBlock: CodeBlock = {
        type: "code_block",
        content: content,
        language: language,
        theme: theme,
        fontSize: fontSize,
        showLineNumbers: showLineNumbers,
        rect: rect || {
          x: defaultSlideObjectPositionX,
          y: defaultSlideObjectPositionY,
          width: defaultCodeBlockWidth,
          height: defaultCodeBlockHeight
        },
        id: generateTimestampId()
      }

      if (!state.objects[slideId]) {
        state.objects[slideId] = []
      }
      state.objects[slideId].push(newCodeBlock)
    },

    updateCodeBlockContent: (state, action: PayloadAction<{
      objectId: string;
      slideId: string;
      content: string;
      language?: string;
      theme?: string;
      fontSize?: number;
      showLineNumbers?: boolean;
    }>) => {
      const { 
        objectId, 
        slideId, 
        content, 
        language, 
        theme, 
        fontSize, 
        showLineNumbers 
      } = action.payload

      if (state.objects[slideId]) {
        const obj = state.objects[slideId].find(o => o.id === objectId)
        if (obj && obj.type === 'code_block') {
          obj.content = content
          
          if (language !== undefined) {
            obj.language = language
          }
          if (theme !== undefined) {
            obj.theme = theme
          }
          if (fontSize !== undefined) {
            obj.fontSize = fontSize
          }
          if (showLineNumbers !== undefined) {
            obj.showLineNumbers = showLineNumbers
          }
        }
      }
    },

    updateCodeBlockTheme: (state, action: PayloadAction<{
      objectId: string;
      slideId: string;
      theme: string;
    }>) => {
      const { objectId, slideId, theme } = action.payload

      if (state.objects[slideId]) {
        const obj = state.objects[slideId].find(o => o.id === objectId)
        if (obj && obj.type === 'code_block') {
          obj.theme = theme
        }
      }
    },

    updateCodeBlockFontSize: (state, action: PayloadAction<{
      objectId: string;
      slideId: string;
      fontSize: number;
    }>) => {
      const { objectId, slideId, fontSize } = action.payload

      if (state.objects[slideId]) {
        const obj = state.objects[slideId].find(o => o.id === objectId)
        if (obj && obj.type === 'code_block') {
          obj.fontSize = fontSize
        }
      }
    },

    updateCodeBlockLineNumbers: (state, action: PayloadAction<{
      objectId: string;
      slideId: string;
      showLineNumbers: boolean;
    }>) => {
      const { objectId, slideId, showLineNumbers } = action.payload

      if (state.objects[slideId]) {
        const obj = state.objects[slideId].find(o => o.id === objectId)
        if (obj && obj.type === 'code_block') {
          obj.showLineNumbers = showLineNumbers
        }
      }
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

    changePlainTextWeight: (state, action: PayloadAction<{
      weight: number;
      objectId: string;
      slideId: string
    }>) => {
      const { weight, objectId, slideId } = action.payload

      if (state.objects[slideId]) {
        const obj = state.objects[slideId].find(o => o.id === objectId)
        if (obj && obj.type === 'plain_text') {
          obj.weight = weight
        }
      }
    },

    changePlainTextColor: (state, action: PayloadAction<{
      color: string;
      objectId: string;
      slideId: string
    }>) => {
      const { color, objectId, slideId } = action.payload

      if (state.objects[slideId]) {
        const obj = state.objects[slideId].find(o => o.id === objectId)
        if (obj && obj.type === 'plain_text') {
          obj.color = color
        }
      }
    },

    changePlainTextAlignment: (state, action: PayloadAction<{
      alignment: 'left' | 'center' | 'right' | 'justify';
      objectId: string;
      slideId: string
    }>) => {
      const { alignment, objectId, slideId } = action.payload

      if (state.objects[slideId]) {
        const obj = state.objects[slideId].find(o => o.id === objectId)
        if (obj && obj.type === 'plain_text') {
          obj.alignment = alignment
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
  addCodeBlockObject,
  updateCodeBlockContent,
  updateCodeBlockTheme,
  updateCodeBlockFontSize,
  updateCodeBlockLineNumbers,
  addImageObject,
  removeObject,
  moveObject,
  resizeObject,
  restoreObjects,
  changePlainTextContent,
  changePlainTextFontFamily,
  changePlainTextScale,
  changePlainTextAlignment,
  changePlainTextColor,
  changePlainTextWeight
} = slideObjectSlice.actions

export default slideObjectSlice.reducer