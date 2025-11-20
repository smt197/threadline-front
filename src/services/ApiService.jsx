import axios from 'axios'

class ApiService {

    constructor() {
        this.api = axios.create({
            //  baseURL: 'http://localhost:8000/api/v1',
            baseURL: 'https://beyond-fashion-api-ts-8ruc.onrender.com/api/v1',
        });

        // Intercepteur de requête : ajouter automatiquement le token
        this.api.interceptors.request.use(
            (config) => {
                const user = JSON.parse(localStorage.getItem('user'));
                if (user && user.token) {
                    config.headers.Authorization = `Bearer ${user.token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Intercepteur de réponse : gérer les erreurs 401
        this.api.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    console.log('❌ 401 Unauthorized - Token invalide ou expiré');
                    // Nettoyer le localStorage
                    localStorage.removeItem('user');
                    // Rediriger vers la page de login
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login';
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    async request (method, url, data = null, token = null) {
        const config = {
            method,
            url,
            data
        };
        
        // Si un token est fourni explicitement, l'utiliser (pour les cas spéciaux)
        if (token) {
            config.headers = { Authorization: `Bearer ${token}` };
        }
        
        try{
            const response = await this.api.request(config);
            return response.data;
        }catch(err){
            throw err.response ? err.response.data : new Error('Une erreur est survenue');
        }
    }
}

const apiService = new ApiService();

export default apiService
