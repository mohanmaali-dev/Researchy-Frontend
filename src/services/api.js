import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
})

export const request = async (method, url, data) => {
  try {
    const response = await api({ method, url, data })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Something went wrong')
  }
}
