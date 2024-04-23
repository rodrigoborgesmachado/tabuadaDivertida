import axios from "axios";

// URL da api: https://api.themoviedb.org/3/movie/now_playing?api_key=3afcecd6e3a27d3b4c7a657b515fc23f&language=en-US&page=1
// base da url: https://api.themoviedb.org/3

var apiUrl = window.location.href.includes("localhost") ? 'https://localhost:7119/api' : 'https://apisunsale.azurewebsites.net/api';

const api = axios.create({
    baseURL: apiUrl,
})

export default api;