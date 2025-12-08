import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createBlankSlide } from './utils'
import { type Slide, type SlideCollection } from './types'

type SlideState = {
  slides: Slide[]
}

const initialState: SlideState = {
  slides: []
}

const slideSlice = createSlice({
  name: 'slides',
  initialState,
  reducers: {
    addSlide: (state, action: PayloadAction<{ slide?: Slide; idx: number }>) => {
      const { slide, idx } = action.payload
      const newSlide = slide || createBlankSlide()

      const safeIdx = Math.max(0, Math.min(idx, state.slides.length))
      state.slides.splice(safeIdx, 0, newSlide)
    },

    removeSlide: (state, action: PayloadAction<string>) => {
      const slideId = action.payload
      if (state.slides.length === 0) return

      state.slides = state.slides.filter(slide => slide.id !== slideId)
    },

    replaceSlide: (state, action: PayloadAction<{ dragItemId: number; insertSpot: number }>) => {
      const { dragItemId, insertSpot } = action.payload
      if (state.slides.length === 0) return

      const [movedSlide] = state.slides.splice(dragItemId, 1)
      state.slides.splice(insertSpot, 0, movedSlide)
    },

    restoreSlides: (state, action: PayloadAction<SlideCollection>) => {
      state.slides = action.payload.slides || [];
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

    // Добавляем новый редьюсер для изображений на фон
    changeBackgroundToImage: (state, action: PayloadAction<{ imageUrl: string; slideId: string }>) => {
      const { imageUrl, slideId } = action.payload
      const slide = state.slides.find(s => s.id === slideId)

      if (slide) {
        slide.background = {
          type: 'picture',
          src: imageUrl
        }
      }
    },
  }
})

export const {
  addSlide,
  removeSlide,
  replaceSlide,
  restoreSlides,
  changeBackgroundToColor,
  changeBackgroundToImage,
} = slideSlice.actions

export default slideSlice.reducer