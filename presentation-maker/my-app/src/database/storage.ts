import { Client, Storage } from "appwrite"

export const Endpoint = 'https://nyc.cloud.appwrite.io/v1'
export const ProjectID = '692c3653001826a25ad9'
export const StorageID = '692c55ce002c99383afa'

const client = new Client().setEndpoint(Endpoint).setProject(ProjectID)
const storage = new Storage(client)

export async function uploadImage(file: File): Promise<string> {
    const result = await storage.createFile(
        StorageID,
        'unique()',
        file,
    )
    const fileUrl = `${Endpoint}/storage/buckets/${StorageID}/files/${result.$id}/view?project=${ProjectID}`
    return fileUrl
}

export async function uploadImageFromUrl(imageUrl: string): Promise<string> {
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    const fileName = imageUrl.split('/').pop() || 'image.jpg'
    const file = new File([blob], fileName, { type: blob.type })
    return await uploadImage(file)
}

export async function deleteImage(fileId: string): Promise<void> {
    await storage.deleteFile(StorageID, fileId)
}