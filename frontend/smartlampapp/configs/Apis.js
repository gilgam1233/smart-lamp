import axios from "axios";

const SERVER_URL = process.env.EXPO_PUBLIC_API_URL;

export const endpoints = {
    // ==========================================
    // 1. BASE ROUTES (Các đường dẫn gốc)
    // ==========================================
    'users': '/users/',
    'lamps': '/lamps/',

    // ==========================================
    // 2. ACCOUNTS & PROFILES (Tài khoản)
    // ==========================================
    'login': '/o/token/',
    'register': '/users/',
    'current-user': '/users/profile/',
   

};

export const authApis = (token) => {
    return axios.create({
        baseURL: SERVER_URL,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
};

export default axios.create({
    baseURL: SERVER_URL
});