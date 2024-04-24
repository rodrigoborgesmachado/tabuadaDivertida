import axios from "axios";

// URL da api: https://api.themoviedb.org/3/movie/now_playing?api_key=3afcecd6e3a27d3b4c7a657b515fc23f&language=en-US&page=1
// base da url: https://api.themoviedb.org/3

var apiUrl = window.location.href.includes("localhost") ? 'https://localhost:7119/api' : 'https://apisunsale.azurewebsites.net/api';

const api = axios.create({
    baseURL: apiUrl,
})

api.interceptors.request.use(config => {
    // Modify headers before request is sent
    config.headers['Referer'] = "https://www.tabuadadivertida.com/";
    return config;
}, error => {
    // Handle request error
    return Promise.reject(error);
});

export default api;