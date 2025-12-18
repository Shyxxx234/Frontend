import { Client, Storage, TablesDB, Account } from "appwrite"

const Endpoint = 'https://nyc.cloud.appwrite.io/v1'
const ProjectID = '692c3653001826a25ad9'
export const DataBaseID = '692c53a700225555587a'
export const TabelID = 'presentation'
export const StorageID = '692c55ce002c99383afa'

export const client = new Client().setEndpoint(`${Endpoint}`).setProject(`${ProjectID}`)
export const tablesDB = new TablesDB(client)
export const storage = new Storage(client)
export const account = new Account(client)
