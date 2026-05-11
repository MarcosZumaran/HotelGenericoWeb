import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    LayoutDashboard, Bed, Users, Receipt,
    FileText, TrendingUp, Package, ShoppingCart, DoorOpen
} from 'lucide-react';
import api from '../../api/axios';

const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Administrador', 'Recepcionista', 'Limpieza'] },
    { path: '/habitaciones', label: 'Habitaciones', icon: Bed, roles: ['Administrador', 'Recepcionista', 'Limpieza'] },
    { path: '/clientes', label: 'Clientes', icon: Users, roles: ['Administrador', 'Recepcionista'] },
    { path: '/productos', label: 'Productos', icon: Package, roles: ['Administrador'] },
    { path: '/comprobantes', label: 'Comprobantes', icon: Receipt, roles: ['Administrador'] },
    { path: '/reportes/cierre-caja', label: 'Cierre de Caja', icon: TrendingUp, roles: ['Administrador'] },
    { path: '/ventas', label: 'Ventas', icon: ShoppingCart, roles: ['Administrador', 'Recepcionista'] },
    { path: '/ventas/historial', label: 'Historial de Ventas', icon: ShoppingCart, roles: ['Administrador', 'Recepcionista'] },
    { path: '/estancias/historial', label: 'Historial de Estancias', icon: DoorOpen, roles: ['Administrador', 'Recepcionista'] },
];

function SidebarLink({ to, icon: Icon, label, isActive }) {
    return (
        <li>
            <Link
                to={to}
                className={`
                        flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                        ${isActive
                        ? 'bg-primary/10 text-primary border-l-4 border-primary pl-3'
                        : 'text-base-content/70 hover:bg-base-200 hover:text-base-content border-l-4 border-transparent pl-3'
                    }
        `}
            >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                <span>{label}</span>
            </Link>
        </li>
    );
}

export default function Sidebar() {
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
        <aside className="w-64 bg-base-100 border-r border-base-300 min-h-screen flex flex-col">
            {/* Cabecera del Sidebar */}
            <div className="px-5 pt-6 pb-4">
                <h1 className="text-xl font-bold text-base-content leading-tight break-words">
                    {nombreHotel}
                </h1>
                <p className="text-xs text-base-content/60 mt-1">{user?.nombreRol}</p>
            </div>

            {/* Menú de navegación */}
            <nav className="flex-1 px-3">
                <ul className="space-y-1">
                    {menuItems
                        .filter(item => item.roles.includes(user?.nombreRol || ''))
                        .map(item => (
                            <SidebarLink
                                key={item.path}
                                to={item.path}
                                icon={item.icon}
                                label={item.label}
                                isActive={location.pathname === item.path}
                            />
                        ))}
                </ul>
            </nav>

            {/* Footer */}
            <div className="px-5 pb-4 pt-2 border-t border-base-200">
                <p className="text-xs text-base-content/50">HotelGenérico v1.0</p>
            </div>
        </aside>
    );
}