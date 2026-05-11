import { useAuth } from '../../contexts/AuthContext';
import useTheme from '../../hooks/useTheme';
import { LogOut, Menu, Sun, Moon } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="navbar bg-base-100 border-b border-base-300 shadow-sm sticky top-0 z-50 h-16">
            <div className="flex-1">
                <label htmlFor="drawer-toggle" className="btn btn-ghost drawer-button lg:hidden">
                    <Menu size={24} />
                </label>
            </div>
            <div className="flex-none gap-4 items-center">
                {/* Toggle de tema con animación */}
                <button className="btn btn-ghost btn-circle" onClick={toggleTheme}>
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>

                <div className="hidden sm:flex items-center gap-2">
                    <div className="avatar placeholder">
                        <div className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center">
                            <span className="text-sm font-semibold">{user?.username?.[0]?.toUpperCase()}</span>
                        </div>
                    </div>
                    <span className="text-sm font-medium text-base-content/70">{user?.username}</span>
                </div>
                <button className="btn btn-ghost btn-sm text-error/80 hover:text-error" onClick={logout}>
                    <LogOut size={18} /> Salir
                </button>
            </div>
        </header>
    );
}