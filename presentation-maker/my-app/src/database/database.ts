import { Client, TablesDB } from "appwrite"
import { generateTimestampId } from "../store/utils"
import { getCurrentUser as getAppwriteUser } from '../login/login'
import type { RootState } from '../store/store'

type SaveToDBParams = {
  title: string
  presentation: RootState['presentation']
  slides: RootState['slides']
  slideObjects: RootState['slideObjects']
  _metadata?: {
    savedAt: string
    action: string
    version: string
  }
}

type UserInfo = {
  email: string
  name: string | null
  id: string | null
  isAuthenticated: boolean
  presentationId: string | null
}

interface TableRow {
  owner?: string
  userEmail?: string
  userId?: string
  content?: string
  [key: string]: unknown
}

export const Endpoint = 'https://nyc.cloud.appwrite.io/v1'
export const ProjectID = '692c3653001826a25ad9'
export const DataBaseID = '692c53a700225555587a'
export const TabelID = 'presentation'

const client = new Client().setEndpoint(`${Endpoint}`).setProject(`${ProjectID}`)
const tablesDB = new TablesDB(client)

const PRESENTATION_ID_KEY = 'current_presentation_id'

async function getCurrentUserEmail(): Promise<string> {
    const user = await getAppwriteUser()
    if (user && user.email) {
      return user.email
    }
  
  return getTemporaryUserEmail()
}

function getTemporaryUserEmail(): string {
  let tempEmail = localStorage.getItem('temp_user_email')
  
  if (!tempEmail) {
    const timestamp = new Date().toISOString().split('T')[0]
    const randomId = Math.random().toString(36).substring(2, 8)
    tempEmail = `temp-${timestamp}-${randomId}@session.com`
    localStorage.setItem('temp_user_email', tempEmail)
  }
  
  return tempEmail
}

function clearTemporarySession(): void {
  localStorage.removeItem('temp_user_email')
}

async function getCurrentUserInfo(): Promise<UserInfo> {
    const user = await getAppwriteUser()
    if (user && user.email) {
      return {
        email: user.email,
        name: user.name || null,
        id: user.$id,
        isAuthenticated: true,
        presentationId: localStorage.getItem(PRESENTATION_ID_KEY)
      }
    }
  
  return {
    email: getTemporaryUserEmail(),
    name: 'Guest',
    id: null,
    isAuthenticated: false,
    presentationId: localStorage.getItem(PRESENTATION_ID_KEY)
  }
}

function getPresentationId(): string {
  let presentationId = localStorage.getItem(PRESENTATION_ID_KEY)
  
  if (!presentationId) {
    presentationId = generateTimestampId()
    localStorage.setItem(PRESENTATION_ID_KEY, presentationId)
  } 
  
  return presentationId
}

function resetPresentationId(): void {
  localStorage.removeItem(PRESENTATION_ID_KEY)
}

async function saveToDB(data: SaveToDBParams): Promise<unknown> {
    const presentationId = getPresentationId()
    const userEmail = await getCurrentUserEmail()
    
    const result = await tablesDB.upsertRow({
      databaseId: DataBaseID,
      tableId: TabelID,
      rowId: presentationId,
      data: {
        title: data.title || 'Без названия',
        owner: userEmail,
        content: JSON.stringify(data),
      },
    })

    return result
}

async function getUserPresentations(): Promise<TableRow[]> {
    const userEmail = await getCurrentUserEmail()
    const userInfo = await getCurrentUserInfo()
    const result = await tablesDB.listRows({
      databaseId: DataBaseID,
      tableId: TabelID,
    })

    const userPresentations = result.rows.filter((row: TableRow) => 
      row.owner === userEmail || 
      row.userEmail === userEmail ||
      (userInfo.isAuthenticated && row.userId === userInfo.id)
    )

    return userPresentations
}

async function getAuthenticatedUserPresentations(): Promise<TableRow[]> {
    const userInfo = await getCurrentUserInfo()
    if (!userInfo.isAuthenticated) {
      return []
    }

    const result = await tablesDB.listRows({
      databaseId: DataBaseID,
      tableId: TabelID,
    })

    const userPresentations = result.rows.filter((row: TableRow) => 
      row.userId === userInfo.id
    )

    return userPresentations
}

async function getRows(): Promise<{ rows: TableRow[] }> {
    const result = await tablesDB.listRows({
      databaseId: DataBaseID,
      tableId: TabelID,
    })

    return result
}

async function loadPresentation(presentationId: string): Promise<SaveToDBParams | null> {
    localStorage.setItem(PRESENTATION_ID_KEY, presentationId)
    
    const result = await tablesDB.getRow({
      databaseId: DataBaseID,
      tableId: TabelID,
      rowId: presentationId,
    })
    
    if (result.content) {
      return JSON.parse(result.content) as SaveToDBParams
    }
    return null
}

export { 
  saveToDB, 
  getRows, 
  loadPresentation, 
  resetPresentationId, 
  getPresentationId,
  getUserPresentations,
  getAuthenticatedUserPresentations,
  getCurrentUserInfo,
  clearTemporarySession
}