import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { initialPresentation } from './utils'
import type { Presentation } from './types'

const presentationSlice = createSlice({
  name: 'presentation',
  initialState: initialPresentation,
  reducers: {
    selectSlide: (state, action: PayloadAction<string>) => {
      const slideId = action.payload
      state.selectedSlide = slideId
      state.selectedObjects = []
    },

    changePresentationName: (state, action: PayloadAction<string>) => {
      state.title = action.payload
    },
    
    restorePresentation: (state, action: PayloadAction<Presentation>) => {
      state.selectedSlide = action.payload.selectedSlide;
      state.selectedObjects = action.payload.selectedObjects || [];
      state.title = action.payload.title;
    },

    selectObject: (state, action: PayloadAction<string[]>) => {
      state.selectedObjects = action.payload
    },
  },
})

export const {
  selectSlide,
  changePresentationName,
  restorePresentation,
  selectObject,
} = presentationSlice.actions

export default presentationSlice.reducer