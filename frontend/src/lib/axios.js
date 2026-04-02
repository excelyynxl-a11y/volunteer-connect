import axios from 'axios';

export const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api", // we are using port 5001 because we have set the backend/.env PORT=5001, which is where the backend server will be running at
    withCredentials: true,
})