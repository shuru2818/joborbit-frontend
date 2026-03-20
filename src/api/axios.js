import axios from "axios";

const BASE_URL = window.location.hostname === 'localhost' 
? 'http://localhost:3200/api'
:"https://joborbit-backend.onrender.com/api"

const API = axios.create({
  baseURL:  BASE_URL
})

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export default API;