import axios from "axios";

// URL da api: https://api.themoviedb.org/3/movie/now_playing?api_key=3afcecd6e3a27d3b4c7a657b515fc23f&language=en-US&page=1
// base da url: https://api.themoviedb.org/3

const api = axios.create({
    //baseURL: 'https://localhost:7119/api'
    baseURL: 'https://apisunsale.azurewebsites.net/api'
})
api.defaults.headers.common['Referer'] = `tabuadadivertida`;

export default api;