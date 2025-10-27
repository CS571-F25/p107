import { createContext, use, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext();

export default ThemeContext;


export function ThemeProvider({ children }) {
    // Initialize theme state from localStorage or default to 'light'
	const [theme, setTheme] = useState(
        localStorage.getItem('theme') || 'light'
    );

    useEffect(() => {
        localStorage.setItem('theme', theme);
        document.documentElement.setAttribute('data-bs-theme', theme);
    }, [theme]);

    // Toggle theme between 'light' and 'dark'
    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    // Memoize context value to optimize performance
	const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

	return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
	);
}