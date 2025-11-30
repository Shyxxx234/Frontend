import { Client, Account } from "appwrite";

const client = new Client()
    .setEndpoint("https://nyc.cloud.appwrite.io/v1")
    .setProject("692c3653001826a25ad9");

const account = new Account(client);

// Функция для входа (создания сессии)
async function signIn(email: string, password: string) {
    try {
        const result = await account.createEmailPasswordSession({
            email: email,
            password: password
        });
        console.log(result);
        return result;
    } catch (error) {
        console.error('Sign in error:', error);
        throw error;
    }
}

// Функция для регистрации (создания аккаунта)
async function register(email: string, password: string, name?: string) {
    try {
        const user = await account.create(
            'unique()', // Автоматическая генерация ID
            email,
            password,
            name // Опциональное имя пользователя
        );
        console.log(user);
        return user;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

// Функция для верификации email
async function verifyEmail(redirectUrl: string = 'https://example.com/verify') {
    try {
        const response = await account.createVerification(redirectUrl);
        console.log(response);
        return response;
    } catch (error) {
        console.error('Verification error:', error);
        throw error;
    }
}

// Функция для подтверждения верификации по токену
async function confirmVerification(userId: string, secret: string) {
    try {
        const response = await account.updateVerification(userId, secret);
        console.log(response);
        return response;
    } catch (error) {
        console.error('Confirm verification error:', error);
        throw error;
    }
}

// Получение текущего пользователя
async function getCurrentUser() {
    try {
        const user = await account.get();
        console.log(user);
        return user;
    } catch (error) {
        console.error('Get user error:', error);
        throw error;
    }
}

// Выход
async function signOut() {
    try {
        await account.deleteSession('current');
        console.log('Signed out successfully');
    } catch (error) {
        console.error('Sign out error:', error);
        throw error;
    }
}

// Смена пароля
async function updatePassword(newPassword: string, oldPassword?: string) {
    try {
        const response = await account.updatePassword(newPassword, oldPassword);
        console.log(response);
        return response;
    } catch (error) {
        console.error('Update password error:', error);
        throw error;
    }
}

// Восстановление пароля
async function recoverPassword(email: string, redirectUrl: string = 'https://example.com/recovery') {
    try {
        const response = await account.createRecovery(email, redirectUrl);
        console.log(response);
        return response;
    } catch (error) {
        console.error('Recovery password error:', error);
        throw error;
    }
}

// Подтверждение восстановления пароля
async function confirmRecovery(userId: string, secret: string, newPassword: string) {
    try {
        const response = await account.updateRecovery(userId, secret, newPassword);
        console.log(response);
        return response;
    } catch (error) {
        console.error('Confirm recovery error:', error);
        throw error;
    }
}

// Обновление email
async function updateEmail(email: string, password: string) {
    try {
        const response = await account.updateEmail(email, password);
        console.log(response);
        return response;
    } catch (error) {
        console.error('Update email error:', error);
        throw error;
    }
}

// Экспорт функций
export {
    signIn,
    register,
    verifyEmail,
    confirmVerification,
    getCurrentUser,
    signOut,
    updatePassword,
    recoverPassword,
    confirmRecovery,
    updateEmail,
    account
};