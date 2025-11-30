import type { Middleware } from '@reduxjs/toolkit'
import type { PresentationData } from '../store/store'
import { historyManager } from '../store/history'

const CONTENT_CHANGE_ACTIONS = [
  'slides/addSlide',
  'slides/removeSlide',
  'slides/replaceSlide',
  'slides/changeBackgroundToColor',
  'slideObjects/addTextObject',
  'slideObjects/addImageObject',
  'slideObjects/removeObject',
  'slideObjects/moveObject',
  'slideObjects/resizeObject',
  'slideObjects/changePlainTextContent',
  'slideObjects/changePlainTextFontFamily',
  'slideObjects/changePlainTextScale',
  'presentation/changePresentationName'
]

export const historyMiddleware: Middleware = (store) => (next) => (action) => {
  const actionObj = action as { type?: string }
  
  // Обработка undo/redo
  if (actionObj.type === 'history/undo') {
    const previousState = historyManager.undo()
    if (previousState) {
      const { presentation, slides, slideObjects } = previousState
      
      store.dispatch({
        type: 'slides/restoreSlides',
        payload: slides
      })
      
      store.dispatch({
        type: 'slideObjects/restoreObjects', 
        payload: slideObjects
      })
      
      store.dispatch({
        type: 'presentation/restorePresentation',
        payload: presentation
      })
    }
    return next(action)
  }
  
  if (actionObj.type === 'history/redo') {
    const nextState = historyManager.redo()
    if (nextState) {
      const { presentation, slides, slideObjects } = nextState
      
      store.dispatch({
        type: 'slides/restoreSlides',
        payload: slides
      })
      
      store.dispatch({
        type: 'slideObjects/restoreObjects', 
        payload: slideObjects
      })
      
      store.dispatch({
        type: 'presentation/restorePresentation',
        payload: presentation
      })
    }
    return next(action)
  }
  
  const result = next(action)
  
  // Сохраняем состояние после изменений
  if (actionObj.type && CONTENT_CHANGE_ACTIONS.includes(actionObj.type)) {
    const currentState = store.getState()
    
    const presentationData: PresentationData = {
      presentation: currentState.presentation,
      slides: currentState.slides,
      slideObjects: currentState.slideObjects
    }
    
    historyManager.saveState(presentationData)
  }
  
  return result
}