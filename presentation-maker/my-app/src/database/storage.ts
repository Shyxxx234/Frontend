import { storage, StorageID } from "../store/appwriteClient"
import { generateTimestampId } from "../store/utils"

export async function uploadImage(file: File): Promise<string> {
    const result = await storage.createFile({
        bucketId: StorageID,
        fileId: generateTimestampId(),
        file: file,
    }) 
    const fileUrl = storage.getFileView({bucketId: StorageID, fileId: result.$id})
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
    await storage.deleteFile({bucketId: StorageID, fileId})
}