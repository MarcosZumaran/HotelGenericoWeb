import { useAuth } from '../../contexts/AuthContext';
import useTheme from '../../hooks/useTheme';
import { LogOut, Menu, Sun, Moon } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="navbar bg-base-100 shadow-sm px-6 sticky top-0 z-50">
            <div className="flex-1">
                <label htmlFor="drawer-toggle" className="btn btn-ghost drawer-button lg:hidden">
                    <Menu size={24} />
                </label>
            </div>
            <div className="flex-none gap-4 items-center">
                {/* Toggle de tema */}
                <label className="swap swap-rotate">
                    <input
                        type="checkbox"
                        checked={theme === 'light'}
                        onChange={(e) => toggleTheme(!e.target.checked)}
                        className="hidden"
                    />
                    {/* Sol (cuando está en dark, muestra sol para pasar a light) */}
                    <Sun className="swap-on h-5 w-5 fill-current" />
                    {/* Luna (cuando está en light, muestra luna para pasar a dark) */}
                    <Moon className="swap-off h-5 w-5 fill-current" />
                </label>

                <span className="text-sm hidden sm:block">
                    {user?.username}
                </span>
                <button className="btn btn-ghost btn-sm" onClick={logout}>
                    <LogOut size={18} /> Salir
                </button>
            </div>
        </header>
    );
}