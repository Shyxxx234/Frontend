import type { Middleware } from '@reduxjs/toolkit'
import type { RootState } from '../store/store'
import { saveToDB } from '../database/database'

type ReduxAction = {
  type: string
  payload?: unknown
}

type SaveResult = {
  $id?: string
  [key: string]: unknown
}

const AUTO_SAVE_ACTIONS = [
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

let saveTimeout: number | null = null
const SAVE_DELAY = 2000

export const autoSaveMiddleware: Middleware = (store) => (next) => (action) => {
    const typedAction = action as ReduxAction
    
    const result = next(action)
    
    if (typeof action === 'object' && action !== null && 'type' in action) {
        const actionType = typedAction.type
        
        if (AUTO_SAVE_ACTIONS.includes(actionType)) {
            
            if (saveTimeout) {
                clearTimeout(saveTimeout)
            }
            
            saveTimeout = window.setTimeout(async () => {
                try {
                    const state = store.getState() as RootState
                    
                    const dataToSave = {
                        title: state.presentation?.title || 'Без названия',
                        presentation: state.presentation,
                        slides: state.slides,
                        slideObjects: state.slideObjects,
                        _metadata: {
                            savedAt: new Date().toISOString(),
                            action: actionType,
                            version: '1.0'
                        }
                    }
                    
                    const saveResult = await saveToDB(dataToSave) as SaveResult
                    
                    console.log('Auto-save successful! Document ID:', saveResult?.$id)
                    
                } finally {
                    saveTimeout = null
                }
            }, SAVE_DELAY)
            
        }
    }
    
    return result
}