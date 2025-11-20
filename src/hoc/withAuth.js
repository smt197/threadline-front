import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/ApiService';

function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isValidToken, setIsValidToken] = useState(null); // null = loading, true = valid, false = invalid
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      validateToken();
    }, []);

    const validateToken = async () => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      
      if (storedUser && storedUser.token) {
        try {
          // Utiliser le nouveau endpoint GET /users/verify-token avec Authorization header
          const response = await apiService.request('GET', '/users/verify-token', null, storedUser.token);
          console.log("✅ Token valide, utilisateur restauré:", response);
          
          // Mettre à jour les données utilisateur si elles ont changé
          if (response.user) {
            const updatedUser = { ...response.user, token: response.token };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
          } else {
            setUser(storedUser);
          }
          
          setIsValidToken(true);
        } catch (error) {
          console.error('❌ Token validation failed:', error);
          // Token invalide ou expiré, nettoyer le localStorage
          localStorage.removeItem('user');
          setIsValidToken(false);
          setUser(null);
        }
      } else {
        // Pas de token stocké
        console.log('ℹ️ Aucun token trouvé');
        setIsValidToken(false);
        setUser(null);
      }
      
      setIsLoading(false);
    }

    // Afficher un loader pendant la vérification
    if (isLoading || isValidToken === null) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#CC8C87]"></div>
            <p className="mt-4 text-gray-600">Vérification de votre session...</p>
          </div>
        </div>
      );
    }

    // Si le token est invalide, afficher le message et rediriger
    if (isValidToken === false) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full">
            <div className="bg-white p-8 rounded-lg shadow-lg border-2 border-red-100">
              <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-[#CC8C87]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
                Session Expirée
              </h2>

              <p className="text-gray-600 text-center mb-6">
                Votre session a expiré. Veuillez vous reconnecter pour accéder à cette page.
              </p>

              <div className="flex justify-center">
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center px-6 py-3 bg-[#CC8C87] hover:bg-[#cc8c87d2] text-white rounded-md transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  <span>Connexion</span>
                  <svg
                    className="ml-2 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Token valide, afficher le composant
    return <Component user={user} {...props} />;
  };
}

export default withAuth;
