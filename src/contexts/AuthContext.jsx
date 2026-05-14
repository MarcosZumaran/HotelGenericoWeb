import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
    // Intentamos recuperar el token y los datos del usuario desde localStorage al montar el componente
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [isLoading, setIsLoading] = useState(false);

    // VALIDACIÓN DE EXPIRACIÓN DEL TOKEN AL INICIAR
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            try {
                const payload = JSON.parse(atob(storedToken.split('.')[1]));
                if (payload.exp * 1000 < Date.now()) {
                    // Token expirado: limpiar
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setToken(null);
                    setUser(null);
                }
            } catch (e) {
                // Token corrupto: limpiar
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setToken(null);
                setUser(null);
            }
        }
    }, []);

    // Sincronizamos el token con localStorage cada vez que cambie
    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }, [token]);

    // Sincronizamos el usuario con localStorage cada vez que cambie
    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }, [user]);

    const login = async (username, password) => {
        const res = await api.post('/Usuario/login', { username, password });
        const { token: jwt, usuario } = res.data;
        setToken(jwt);
        setUser(usuario);
        return usuario; // Devolvemos el usuario para que el Login pueda redirigir según el rol
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    useEffect(() => {
        const handleUnauthorized = () => {
            logout();
        };
        window.addEventListener('auth:unauthorized', handleUnauthorized);
        return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
    return context;
}