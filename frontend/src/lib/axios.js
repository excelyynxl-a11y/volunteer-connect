import axios from 'axios';

const configuredApiUrl = import.meta.env.VITE_API_URI?.trim();
const defaultApiUrl = import.meta.env.MODE === "development"
    ? "http://localhost:5001"
    : "";
const apiUrl = (configuredApiUrl || defaultApiUrl).replace(/\/+$/, "");

export const axiosInstance = axios.create({
    baseURL: apiUrl.endsWith("/api") ? apiUrl : `${apiUrl}/api`,
    withCredentials: true,
})
