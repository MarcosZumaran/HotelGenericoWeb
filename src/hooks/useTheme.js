import { useState, useEffect } from 'react';

const useTheme = () => {
    // Al iniciar, leer localStorage o usar 'dark' por defecto
    const [theme, setTheme] = useState(
        localStorage.getItem('theme') === 'light' ? 'light' : 'dark'
    );

    // Cada vez que cambia el tema, actualizar el atributo data-theme del <html>
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Función que se llamará desde el toggle
    const toggleTheme = (isDark) => {
        setTheme(isDark ? 'dark' : 'light');
    };

    return { theme, toggleTheme };
};

export default useTheme;