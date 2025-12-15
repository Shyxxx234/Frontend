import { Client, Account } from "appwrite"
import { generateTimestampId } from "../store/utils"

const client = new Client()
    .setEndpoint("https://nyc.cloud.appwrite.io/v1")
    .setProject("692c3653001826a25ad9")

const account = new Account(client)

async function signIn(email: string, password: string) {
    const result = await account.createEmailPasswordSession({
        email: email,
        password: password
    })
    return result
}

async function register(email: string, password: string, name?: string) {
    const user = await account.create({
        userId: generateTimestampId(),
        email,
        password,
        name
    })
    console.log(user)
    return user
}

async function getCurrentUser() {
    const user = await account.get()
    return user
}

async function signOut() {
    await account.deleteSession({
        sessionId: 'current'
    })
}

export {
    signIn,
    register,
    getCurrentUser,
    signOut,
    account
}