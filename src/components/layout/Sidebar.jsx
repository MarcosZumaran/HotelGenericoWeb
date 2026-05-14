import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    LayoutDashboard, Bed, Users, Receipt,
    FileText, TrendingUp, Package, ShoppingCart, DoorOpen,
    Brush, X
} from 'lucide-react';
import api from '../../api/axios';

const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Administrador', 'Recepcion'] },
    { path: '/habitaciones', label: 'Habitaciones', icon: Bed, roles: ['Administrador', 'Recepcion'] },
    { path: '/limpieza', label: 'Limpieza', icon: Brush, roles: ['Administrador', 'Limpieza', 'Recepcion'] },
    { path: '/clientes', label: 'Clientes', icon: Users, roles: ['Administrador', 'Recepcion'] },
    { path: '/productos', label: 'Productos', icon: Package, roles: ['Administrador'] },
    { path: '/comprobantes', label: 'Comprobantes', icon: Receipt, roles: ['Administrador'] },
    { path: '/reportes/cierre-caja', label: 'Cierre de Caja', icon: TrendingUp, roles: ['Administrador'] },
    { path: '/ventas', label: 'Ventas', icon: ShoppingCart, roles: ['Administrador', 'Recepcion'] },
    { path: '/ventas/historial', label: 'Historial de Ventas', icon: ShoppingCart, roles: ['Administrador', 'Recepcion'] },
    { path: '/estancias/historial', label: 'Historial de Estancias', icon: DoorOpen, roles: ['Administrador', 'Recepcion'] },
];

function SidebarLink({ to, icon: Icon, label, isActive, collapsed, onNavigate, title }) {
    return (
        <li>
            <Link
                to={to}
                onClick={onNavigate}
                className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive
                                ? 'bg-primary/10 text-primary border-l-4 border-primary'
                                : 'text-base-content/70 hover:bg-base-200 hover:text-base-content border-l-4 border-transparent'
                            }
                ${collapsed ? 'justify-center' : ''}
                `}
                title={title}
            >
                <Icon size={collapsed ? 50 : 22} strokeWidth={isActive ? 2.5 : 1.5} />
                {!collapsed && <span className="text-base">{label}</span>}
            </Link>
        </li>
    );
}

export default function Sidebar({ collapsed, onToggle, onNavigate }) {
    const location = useLocation();
    const { user } = useAuth();
    const [nombreHotel, setNombreHotel] = useState('Hotel');

    useEffect(() => {
        const cargarConfiguracion = async () => {
            try {
                const res = await api.get('/ConfiguracionHotel');
                setNombreHotel(res.data.nombre);
            } catch (error) {
                console.error('No se pudo cargar la configuración del hotel', error);
            }
        };
        cargarConfiguracion();
    }, []);

    return (
        <aside className="relative flex flex-col h-full bg-base-100">
            {/* Botón de cierre para móvil (solo si se proporciona onToggle) */}
            {onToggle && (
                <button
                    onClick={onToggle}
                    className="absolute top-4 right-4 btn btn-ghost btn-circle btn-sm z-10"
                    title="Cerrar menú"
                >
                    <X size={28} />
                </button>
            )}

            {/* Cabecera con nombre del hotel */}
            <div className="px-4 pt-4 pb-4 flex items-center justify-center">
                {!collapsed && (
                    <div>
                        <h1 className="text-lg font-bold text-base-content leading-tight break-words text-center">
                            {nombreHotel}
                        </h1>
                        <p className="text-xs text-base-content/60 mt-1 text-center">
                            {user?.nombreRol}
                        </p>
                    </div>
                )}
                {collapsed && (
                    <span className="text-xl font-bold">
                        {nombreHotel.charAt(0)}
                    </span>
                )}
            </div>

            {/* Menú de navegación */}
            <nav className="flex-1 px-2">
                <ul className="space-y-1">
                    {menuItems
                        .filter(item => !item.oculto && item.roles.includes(user?.nombreRol || ''))
                        .map(item => (
                            <SidebarLink
                                key={item.path}
                                to={item.path}
                                icon={item.icon}
                                label={item.label}
                                isActive={location.pathname === item.path}
                                collapsed={collapsed}
                                onNavigate={onNavigate}
                                title={collapsed ? item.label : undefined}
                            />
                        ))}
                </ul>
            </nav>

            {/* Footer */}
            <div className="px-4 pb-4 pt-2 border-t border-base-200">
                {!collapsed && (
                    <p className="text-xs text-base-content/50 text-center">
                        HotelGenérico v1.0
                    </p>
                )}
            </div>
        </aside>
    );
}