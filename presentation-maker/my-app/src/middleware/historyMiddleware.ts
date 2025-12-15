import type { Middleware } from '@reduxjs/toolkit'
import type { PresentationData, RootState } from '../store/store'
import { historyManager } from '../store/history'

export const historyMiddleware: Middleware = (store) => (next) => (action) => {
  const actionObj = action as { type?: string; meta?: { skipHistory?: boolean } }
  const actionType = actionObj.type
  
  if (actionType === 'history/undo' || actionType === 'history/redo') {
    const newState = actionType === 'history/undo' 
      ? historyManager.undo() 
      : historyManager.redo()
    
    if (newState) {
      const { presentation, slides, slideObjects } = newState
      
      store.dispatch({
        type: 'slides/restoreSlides',
        payload: slides,
        meta: { skipHistory: true }
      })
      
      store.dispatch({
        type: 'slideObjects/restoreObjects', 
        payload: slideObjects,
        meta: { skipHistory: true }
      })
      
      store.dispatch({
        type: 'presentation/restorePresentation',
        payload: presentation,
        meta: { skipHistory: true }
      })
    }
    return next(action)
  }
  
  if (actionObj.meta?.skipHistory) {
    return next(action)
  }
  
  const stateBefore = store.getState() as RootState
  const result = next(action)
  const stateAfter = store.getState() as RootState
  
  const slidesChanged = stateBefore.slides !== stateAfter.slides
  const slideObjectsChanged = stateBefore.slideObjects !== stateAfter.slideObjects
  const titleChanged = stateBefore.presentation.title !== stateAfter.presentation.title
  
  if (slidesChanged || titleChanged || slideObjectsChanged) {
    const presentationData: PresentationData = {
      presentation: stateAfter.presentation,
      slides: stateAfter.slides,
      slideObjects: stateAfter.slideObjects
    }
    historyManager.saveState(presentationData)
  }
  
  return result
}