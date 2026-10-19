import axios from "axios"

const apiKey = import.meta.env.VITE_API_KEY

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://api-achados.jefersonqueiroga.com.br",
  headers: apiKey ? { "X-API-Key": apiKey } : {}
})

export default api
