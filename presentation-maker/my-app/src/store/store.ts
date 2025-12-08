import { configureStore } from '@reduxjs/toolkit'
import presentationReducer from './presentationSlice'
import slideReducer from './slideSlice'
import slideObjectReducer from './slideObjectSlice'
import { historyMiddleware } from '../middleware/historyMiddleware'
import { autoSaveMiddleware } from '../middleware/autoSaveMiddleware'


export const store = configureStore({
  reducer: {
    presentation: presentationReducer,
    slides: slideReducer,
    slideObjects: slideObjectReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      historyMiddleware,
      autoSaveMiddleware
    )
})

export type PresentationData = {
  presentation: RootState['presentation']
  slides: RootState['slides']
  slideObjects: RootState['slideObjects']
}

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch