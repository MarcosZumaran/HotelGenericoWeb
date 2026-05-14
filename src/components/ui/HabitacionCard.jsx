import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Bed, User, Bell, AlertTriangle, CheckCircle, Wrench, Brush } from 'lucide-react';

// PALETA DE COLORES  
const STATE_COLORS = {
    1: {
        light: {
            main: '#16a34a', bgGradientFrom: '#e5fdef', bgGradientTo: '#ccf0d6',
            pillBg: '#16a34a', pillText: '#ffffff', emptyIconColor: '#16a34a', emptyTextColor: '#16a34a'
        },
        dark: {
            main: '#4ade80', bgGradientFrom: '#064e3b', bgGradientTo: '#022c22',
            pillBg: '#166534', pillText: '#f0fdf4', emptyIconColor: '#4ade80', emptyTextColor: '#bbf7d0'
        },
        icon: CheckCircle,
        label: 'Disponible'
    },
    2: {
        light: {
            main: '#e11d48', bgGradientFrom: '#fff1f2', bgGradientTo: '#fce8f3',
            pillBg: '#e11d48', pillText: '#ffffff',
            entradaTitleColor: '#258bf2', entradaBg: '#f2f7fe',
            salidaTitleColor: '#ea585d', salidaBg: '#fff8f0'
        },
        dark: {
            main: '#fb7185', bgGradientFrom: '#4c0519', bgGradientTo: '#2d0012',
            pillBg: '#9f1239', pillText: '#ffe4e6',
            entradaTitleColor: '#60a5fa', entradaBg: '#1e293b',
            salidaTitleColor: '#f87171', salidaBg: '#1e293b'
        },
        icon: Bed,
        label: 'Ocupada'
    },
    3: {
        light: {
            main: '#d97706', bgGradientFrom: '#fffbeb', bgGradientTo: '#fde68a',
            pillBg: '#d97706', pillText: '#ffffff', emptyIconColor: '#d97706', emptyTextColor: '#d97706'
        },
        dark: {
            main: '#fbbf24', bgGradientFrom: '#422006', bgGradientTo: '#1c0e00',
            pillBg: '#92400e', pillText: '#fef3c7', emptyIconColor: '#fbbf24', emptyTextColor: '#fde68a'
        },
        icon: Brush,
        label: 'En limpieza'
    },
    4: {
        light: {
            main: '#4b5563', bgGradientFrom: '#f3f4f6', bgGradientTo: '#e5e7eb',
            pillBg: '#4b5563', pillText: '#ffffff', emptyIconColor: '#4b5563', emptyTextColor: '#4b5563'
        },
        dark: {
            main: '#9ca3af', bgGradientFrom: '#111827', bgGradientTo: '#0f172a',
            pillBg: '#374151', pillText: '#e5e7eb', emptyIconColor: '#9ca3af', emptyTextColor: '#d1d5db'
        },
        icon: Wrench,
        label: 'En mantenimiento'
    },
    5: {
        light: {
            main: '#2563eb', bgGradientFrom: '#eff6ff', bgGradientTo: '#dbeafe',
            pillBg: '#2563eb', pillText: '#ffffff', emptyIconColor: '#2563eb', emptyTextColor: '#2563eb'
        },
        dark: {
            main: '#60a5fa', bgGradientFrom: '#1e3a5f', bgGradientTo: '#0f2442',
            pillBg: '#1d4ed8', pillText: '#dbeafe', emptyIconColor: '#60a5fa', emptyTextColor: '#bfdbfe'
        },
        icon: Bed,
        label: 'En Reserva'
    },
    vencido: {
        light: {
            main: '#e11d48', bgGradientFrom: '#fee2e2', bgGradientTo: '#fecaca',
            pillBg: '#e11d48', pillText: '#ffffff',
            entradaTitleColor: '#258bf2', entradaBg: '#f2f7fe',
            salidaTitleColor: '#ea585d', salidaBg: '#fff8f0'
        },
        dark: {
            main: '#fb7185', bgGradientFrom: '#4c0519', bgGradientTo: '#2d0012',
            pillBg: '#9f1239', pillText: '#ffe4e6',
            entradaTitleColor: '#60a5fa', entradaBg: '#1e293b',
            salidaTitleColor: '#f87171', salidaBg: '#1e293b'
        },
        icon: Bed,
        label: 'Vencido',
        warning: true
    }
};

export default function HabitacionCard({ habitacion, onCardClick, extraActions, allHover = true }) {
    // Leer el tema directamente del DOM, con sondeo ligero
    const [theme, setTheme] = useState(() => {
        if (typeof window === 'undefined') return 'light';
        return document.documentElement.getAttribute('data-theme') || 'light';
    });

    useEffect(() => {
        const interval = setInterval(() => {
            const current = document.documentElement.getAttribute('data-theme');
            if (current === 'light' || current === 'dark') {
                setTheme(prev => (prev !== current ? current : prev));
            }
        }, 200);
        return () => clearInterval(interval);
    }, []);

    if (!habitacion) return null;

    const esVencida = habitacion.idEstado === 2 && habitacion.fechaCheckoutPrevista && new Date(habitacion.fechaCheckoutPrevista) < new Date();
    const stateKey = esVencida ? 'vencido' : (habitacion.idEstado || 1);
    const state = STATE_COLORS[stateKey] || STATE_COLORS[1];
    const style = state[theme] || state.light;
    const IconoEstado = state.icon;
    const idEstado = esVencida ? 'vencido' : habitacion.idEstado;

    const handleClick = () => {
        if (onCardClick) onCardClick(habitacion);
    };

    return (
        <div
            onClick={handleClick}
            className={`
                relative overflow-hidden border-2 border-base-300 rounded-xl
                group
                ${idEstado === 3
                    ? 'animate-limpieza-card'
                    : 'shadow-sm hover:shadow-md transition-all duration-300'
                }
                ${allHover ? 'cursor-pointer hover:-translate-y-1' : ''}
            `}
            style={{ backgroundImage: `linear-gradient(to bottom right, ${style.bgGradientFrom}, ${style.bgGradientTo})` }}
        >
            {/* Cabecera */}
            <div className="p-4 flex items-center gap-3">
                <Bed size={32} style={{ color: style.main }} />
                <div className="flex-1">
                    <h3 className="text-2xl font-bold text-base-content">{habitacion.numeroHabitacion}</h3>
                    <p className="text-base text-base-content/70">{habitacion.nombreTipo}</p>
                </div>
                <span
                    className="px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1"
                    style={{ backgroundColor: style.pillBg, color: style.pillText }}
                >
                    {esVencida && <AlertTriangle size={14} />}
                    {state.label}
                </span>
            </div>

            {/* Cuerpo según estado */}
            {idEstado !== 2 && idEstado !== 5 && idEstado !== 'vencido' && (
                <div className="flex flex-col items-center justify-center p-6 pb-8 pt-2">
                    <IconoEstado size={64} style={{ color: style.emptyIconColor, opacity: 0.8 }} />
                    <p className="text-lg font-semibold mt-2" style={{ color: style.emptyTextColor }}>
                        {state.label}
                    </p>
                </div>
            )}

            {idEstado === 5 && habitacion.fechaReservaEntrada && (
                <div className="px-4 pb-4">
                    {/* Fondo del sub‑card adaptativo */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 flex items-center gap-3 shadow-sm border border-base-200 animate-quick-pulse">
                        <div className="w-10 h-10 bg-orange-100 dark:bg-amber-900 rounded-full flex items-center justify-center animate-bell">
                            <Bell size={22} className="text-orange-500 dark:text-amber-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                            {habitacion.clienteHuesped && (
                                <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{habitacion.clienteHuesped}</p>
                            )}
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                Llega: {format(new Date(habitacion.fechaReservaEntrada), 'hh:mm:ss a')}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {(idEstado === 2 || idEstado === 'vencido') && habitacion.fechaCheckin && habitacion.fechaCheckoutPrevista && (
                <div className="px-4 pb-4">
                    {/* Fondo del sub‑card adaptativo */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-base-200 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                <User size={22} className="text-gray-500 dark:text-gray-300" />
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">{habitacion.clienteHuesped}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div
                                className="p-2.5 rounded-lg border border-transparent"
                                style={{ backgroundColor: style.entradaBg }}
                            >
                                <p className="text-xs font-semibold mb-1" style={{ color: style.entradaTitleColor }}>
                                    Entrada
                                </p>
                                <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                                    {format(new Date(habitacion.fechaCheckin), 'dd/MM/yyyy')}
                                </p>
                                <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                                    {format(new Date(habitacion.fechaCheckin), 'hh:mm:ss a')}
                                </p>
                            </div>
                            <div
                                className="p-2.5 rounded-lg border border-transparent"
                                style={{ backgroundColor: style.salidaBg }}
                            >
                                <p className="text-xs font-semibold mb-1" style={{ color: style.salidaTitleColor }}>
                                    Salida
                                </p>
                                <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                                    {format(new Date(habitacion.fechaCheckoutPrevista), 'dd/MM/yyyy')}
                                </p>
                                <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                                    {format(new Date(habitacion.fechaCheckoutPrevista), 'hh:mm:ss a')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {extraActions && (
                <div className="px-4 pb-4 flex justify-end">
                    {extraActions(habitacion)}
                </div>
            )}
        </div>
    );
}