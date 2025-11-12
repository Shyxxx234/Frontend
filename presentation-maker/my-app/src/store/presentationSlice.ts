import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { 
  type Slide, 
  type PlainText, 
  type Image,
  generateTimestampId,
  createBlankSlide,
  initialPresentation
} from './typeAndFunctions'

const presentationSlice = createSlice({
  name: 'presentation',
  initialState: initialPresentation,
  reducers: {
    selectSlide: (state, action: PayloadAction<string>) => {
      const slideId = action.payload
      const slideHTML = document.getElementById(slideId)
      slideHTML?.scrollIntoView({ block: "center", behavior: "smooth" })
      
      state.selectedSlide = slideId
      state.selectedObjects = []
    },

    changePresentationName: (state, action: PayloadAction<string>) => {
      state.title = action.payload
    },

    addSlide: (state, action: PayloadAction<{ slide?: Slide; idx: number }>) => {
      const { slide, idx } = action.payload
      const newSlide = slide || createBlankSlide()
      
      const safeIdx = Math.max(0, Math.min(idx, state.slides.length))
      state.slides.splice(safeIdx, 0, newSlide)
      state.selectedSlide = newSlide.id
    },

    removeSlide: (state, action: PayloadAction<string>) => {
      const slideId = action.payload
      if (state.slides.length === 0) return

      state.slides = state.slides.filter(slide => slide.id !== slideId)
      state.selectedSlide = state.slides.length > 0 ? state.slides[0].id : ""
    },

    replaceSlide: (state, action: PayloadAction<{ dragItemId: number; insertSpot: number }>) => {
      const { dragItemId, insertSpot } = action.payload
      if (state.slides.length === 0) return

      const [movedSlide] = state.slides.splice(dragItemId, 1)
      state.slides.splice(insertSpot, 0, movedSlide)
    },

    addTextObject: (state, action: PayloadAction<string>) => {
      const slideId = action.payload
      const newTextObject: PlainText = {
        type: "plain_text",
        content: "Новый текст",
        fontFamily: "Arial",
        weight: 400,
        scale: 1.0,
        rect: {
          x: 100,
          y: 100,
          width: 200,
          height: 50
        },
        id: generateTimestampId()
      }

      const slide = state.slides.find(s => s.id === slideId)
      if (slide) {
        slide.slideObject.push(newTextObject)
        state.selectedObjects = [newTextObject.id]
      }
    },

    addImageObject: (state, action: PayloadAction<{ slideId: string; imageUrl: string }>) => {
      const { slideId, imageUrl } = action.payload
      const newImageObject: Image = {
        type: "picture",
        src: imageUrl || "https://via.placeholder.com/300x200",
        rect: {
          x: 100,
          y: 100,
          width: 300,
          height: 200
        },
        id: generateTimestampId()
      }

      const slide = state.slides.find(s => s.id === slideId)
      if (slide) {
        slide.slideObject.push(newImageObject)
        state.selectedObjects = [newImageObject.id]
      }
    },

    removeObject: (state, action: PayloadAction<{ objectId: string; slideId: string }>) => {
      const { objectId, slideId } = action.payload
      const slide = state.slides.find(s => s.id === slideId)
      
      if (slide) {
        slide.slideObject = slide.slideObject.filter(obj => obj.id !== objectId)
        state.selectedObjects = state.selectedObjects.filter(id => id !== objectId)
      }
    },

    selectObject: (state, action: PayloadAction<string[]>) => {
      state.selectedObjects = action.payload
    },

    moveObject: (state, action: PayloadAction<{ objectId: string; x: number; y: number }>) => {
      const { objectId, x, y } = action.payload
      
      state.slides.forEach(slide => {
        const obj = slide.slideObject.find(o => o.id === objectId)
        if (obj) {
          obj.rect.x = x
          obj.rect.y = y
        }
      })
    },

    resizeObject: (state, action: PayloadAction<{ 
      objectId: string; 
      x: number; 
      y: number; 
      width: number; 
      height: number 
    }>) => {
      const { objectId, x, y, width, height } = action.payload
      
      state.slides.forEach(slide => {
        const obj = slide.slideObject.find(o => o.id === objectId)
        if (obj) {
          obj.rect.x = x
          obj.rect.y = y
          obj.rect.width = width
          obj.rect.height = height
        }
      })
    },

    changeBackgroundToColor: (state, action: PayloadAction<{ color: string; slideId: string }>) => {
      const { color, slideId } = action.payload
      const slide = state.slides.find(s => s.id === slideId)
      
      if (slide) {
        slide.background = {
          type: 'color',
          color: color
        }
      }
    },

    changePlainTextContent: (state, action: PayloadAction<{ 
      content: string; 
      objectId: string; 
      slideId: string 
    }>) => {
      const { content, objectId, slideId } = action.payload
      const slide = state.slides.find(s => s.id === slideId)
      
      if (slide) {
        const obj = slide.slideObject.find(o => o.id === objectId)
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
      const slide = state.slides.find(s => s.id === slideId)
      
      if (slide) {
        const obj = slide.slideObject.find(o => o.id === objectId)
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
      const slide = state.slides.find(s => s.id === slideId)
      
      if (slide) {
        const obj = slide.slideObject.find(o => o.id === objectId)
        if (obj && obj.type === 'plain_text') {
          obj.scale = scale
        }
      }
    }
  }
})

export const {
  selectSlide,
  changePresentationName,
  addSlide,
  removeSlide,
  replaceSlide,
  addTextObject,
  addImageObject,
  removeObject,
  selectObject,
  moveObject,
  resizeObject,
  changeBackgroundToColor,
  changePlainTextContent,
  changePlainTextFontFamily,
  changePlainTextScale
} = presentationSlice.actions

export default presentationSlice.reducer