import { Query } from 'appwrite'
import { getCurrentUser } from '../login/login'
import type { RootState } from "../store/store"
import { generateTimestampId } from "../store/utils"
import { validatePresentation } from "../store/valiadatorAJV"
import { DataBaseID, TabelID, tablesDB } from '../store/appwriteClient'

type SaveToDBParams = {
  title: string
  presentation: RootState['presentation']
  slides: RootState['slides']
  slideObjects: RootState['slideObjects']
}

const PRESENTATION_ID_KEY = 'current_presentation_id'

async function getCurrentUserEmail(): Promise<string> {
  const user = await getCurrentUser()
  if (user && user.email) return user.email

  let tempEmail = localStorage.getItem('temp_user_email')
  if (!tempEmail) {
    const timestamp = new Date().toISOString().split('T')[0]
    const randomId = generateTimestampId()
    tempEmail = `temp-${timestamp}-${randomId}@session.com`
    localStorage.setItem('temp_user_email', tempEmail)
  }
  return tempEmail
}

export function getPresentationId(): string {
  let presentationId = localStorage.getItem(PRESENTATION_ID_KEY)
  if (!presentationId) {
    presentationId = generateTimestampId()
    localStorage.setItem(PRESENTATION_ID_KEY, presentationId)
  }
  return presentationId
}

export async function createEmptyPresentation() {
  const presentationId = generateTimestampId();
  const userEmail = await getCurrentUserEmail();

  const initialData = {
    title: 'Новая презентация',
    presentation: {
      title: 'Новая презентация',
      slides: [],
      selectedSlide: null,
      selectedObjects: []
    },
    slides: { slides: [] },
    slideObjects: { objects: {} }
  };

  if (!validatePresentation(initialData.presentation)) return

  const result = await tablesDB.createRow({
    databaseId: DataBaseID,
    tableId: TabelID,
    rowId: presentationId,
    data: {
      title: 'Новая презентация',
      owner: userEmail,
      content: JSON.stringify(initialData)
    },
  });

  localStorage.setItem(PRESENTATION_ID_KEY, presentationId);
  return result;
}

export async function getUserPresentations() {
  const userEmail = await getCurrentUserEmail()
  const result = await tablesDB.listRows({
    databaseId: DataBaseID,
    tableId: TabelID,
    queries: [
      Query.equal('owner', userEmail),
    ]
  })

  return result.rows
}

export async function loadPresentation(presentationId: string) {
  localStorage.setItem(PRESENTATION_ID_KEY, presentationId)

  const result = await tablesDB.getRow({
    databaseId: DataBaseID,
    tableId: TabelID,
    rowId: presentationId
  })

  if (result.content) {
    const parsedData = JSON.parse(result.content) as RootState

    if (parsedData.presentation && !validatePresentation(parsedData.presentation)) {
      return null
    }

    return parsedData
  }
  return null
}

export async function saveToDB(data: SaveToDBParams, createNewPresentation: boolean) {
  if (!validatePresentation(data.presentation)) return

  const presentationId = getPresentationId()
  const userEmail = await getCurrentUserEmail()

  if (!createNewPresentation) {
    return await tablesDB.upsertRow({
      databaseId: DataBaseID,
      tableId: TabelID,
      rowId: presentationId,
      data: {
        title: data.title || 'Без названия',
        owner: userEmail,
        content: JSON.stringify(data)
      },
    })
  } else {
    const newId = generateTimestampId();
    return await tablesDB.createRow({
      databaseId: DataBaseID,
      tableId: TabelID,
      rowId: newId,
      data: {
        title: data.title || 'Новая презентация',
        owner: userEmail,
        content: JSON.stringify(data)
      },
    })
  }
}
