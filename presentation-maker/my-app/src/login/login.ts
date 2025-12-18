import { account } from "../store/appwriteClient"
import { generateTimestampId } from "../store/utils"
import { AppwriteException, type Models } from "appwrite"

async function signIn(email: string, password: string): Promise<Models.Session> {
    try {
        try {
            await account.get()
        } catch {
            console.log('No active session, creating new one...')
        }
        
        const result = await account.createEmailPasswordSession({
            email: email,
            password: password
        })
        return result
    } catch (error: unknown) {
        if (error instanceof AppwriteException && error.code === 409) {
            try {
                await account.deleteSession({sessionId:'current'})
                const result = await account.createEmailPasswordSession({
                    email: email,
                    password: password
                })
                return result
            } catch  {
                console.log()
            }
        }
        throw error
    }
}

async function register(email: string, password: string, name?: string): Promise<Models.User<Models.Preferences>> {
    const user = await account.create({
        userId: generateTimestampId(),
        email,
        password,
        name
    })
    console.log('User registered:', user)
    return user
}

async function getCurrentUser(): Promise<Models.User<Models.Preferences> | null> {
    try {
        const user = await account.get()
        return user
    } catch {
        return null
    }
}

async function signOut(): Promise<void> {
    try {
        await account.deleteSession({sessionId: 'current'})
    } catch (error) {
        console.error('Error during sign out:', error)
    }
}

export {
    signIn,
    register,
    getCurrentUser,
    signOut,
    account,
}