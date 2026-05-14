import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function DashboardLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const closeMobile = () => setMobileOpen(false);

    return (
        <div className="drawer h-screen overflow-hidden bg-base-200">
            {/* El input se mantiene por compatibilidad pero usamos estado manual */}
            <input
                id="drawer-toggle"
                type="checkbox"
                className="drawer-toggle"
                checked={mobileOpen}
                readOnly
            />

            <div className="drawer-content flex h-full">
                {/* Sidebar de escritorio (visible desde lg hacia arriba) */}
                <div className="relative hidden lg:block h-full z-50">
                    <aside
                        className={`h-full flex flex-col bg-base-100 border-r border-base-300 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'
                            }`}
                    >
                        <Sidebar collapsed={collapsed} />
                    </aside>

                    {/* Botón circular flotante para colapsar/expandir en escritorio */}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="absolute top-4 right-0 translate-x-1/2 z-50 btn btn-circle shadow-lg bg-base-100 hover:bg-base-200 border border-base-300"
                        title={collapsed ? 'Expandir menú' : 'Contraer menú'}
                    >
                        {collapsed ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
                    </button>
                </div>

                {/* Contenido principal (Navbar + páginas) */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Navbar onMenuClick={() => setMobileOpen(true)} />
                    <main className="flex-1 overflow-y-auto p-6 bg-base-200">
                        <Outlet />
                    </main>
                </div>
            </div>

            {/* Overlay + drawer móvil manual (cierre garantizado) */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    {/* Overlay oscuro: clic fuera cierra */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={closeMobile}
                    ></div>

                    {/* Panel lateral */}
                    <div className="relative w-64 h-full bg-base-100 overflow-y-auto shadow-xl">
                        <Sidebar
                            collapsed={false}
                            onToggle={closeMobile}
                            onNavigate={closeMobile}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}