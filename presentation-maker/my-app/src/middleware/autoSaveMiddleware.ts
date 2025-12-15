import type { Middleware } from '@reduxjs/toolkit'
import type { RootState } from '../store/store'
import { saveToDB } from '../database/database'

let saveTimeout: number | null = null
const SAVE_DELAY = 10000

export const autoSaveMiddleware: Middleware = (store) => (next) => (action) => {
    const stateBefore = store.getState() as RootState
    const result = next(action)
    const stateAfter = store.getState() as RootState

    const slidesChanged = stateBefore.slides !== stateAfter.slides
    const slideObjectsChanged = stateBefore.slideObjects !== stateAfter.slideObjects
    const titleChanged = stateBefore.presentation.title !== stateAfter.presentation.title

    if (slidesChanged || titleChanged || slideObjectsChanged) {
        if (saveTimeout) clearTimeout(saveTimeout)

        saveTimeout = window.setTimeout(async () => {
            try {
                const state = store.getState() as RootState
                await saveToDB({
                    title: state.presentation?.title || 'Без названия',
                    presentation: state.presentation,
                    slides: state.slides,
                    slideObjects: state.slideObjects,
                }, false)
            } finally {
                saveTimeout = null
            }
        }, SAVE_DELAY)
    }

    return result
}