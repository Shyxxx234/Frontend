import type { Middleware } from '@reduxjs/toolkit'
import type { RootState } from '../store/store'
import { saveToDB } from '../database/database'

let saveTimeout: number | null = null
const SAVE_DELAY = 10000

export const autoSaveMiddleware: Middleware = (store) => (next) => (action) => {
    const before = store.getState() as RootState
    const result = next(action)
    const after = store.getState() as RootState

    const changed = before.presentation.title !== after.presentation.title || before.slides !== after.slides
    if (changed) {
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