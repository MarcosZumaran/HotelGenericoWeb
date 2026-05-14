import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import HabitacionCard from '../../components/ui/HabitacionCard';
import { useSignalR } from '../../hooks/useSignalR';

export default function LimpiezaPanel() {
    const { user } = useAuth();
    const [habitaciones, setHabitaciones] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [cambiando, setCambiando] = useState(null);

    const cargarHabitacionesLimpieza = useCallback(async () => {
        setCargando(true);
        try {
            const res = await api.get('/Habitacion/estado-actual');
            const enLimpieza = res.data.filter(h => h.idEstado === 3);
            setHabitaciones(enLimpieza);
        } catch (error) {
            toast.error('No se pudieron cargar las habitaciones');
        } finally {
            setCargando(false);
        }
    }, []);

    // Carga inicial
    useEffect(() => {
        cargarHabitacionesLimpieza();
    }, [cargarHabitacionesLimpieza]);

    // Actualización en tiempo real con SignalR
    useSignalR('EstadoHabitacionCambiado', () => {
        // Recargar la lista cuando cualquier estado cambia
        cargarHabitacionesLimpieza();
    });

    // Refresco periódico como respaldo (cada 2 minutos)
    useEffect(() => {
        const intervalo = setInterval(cargarHabitacionesLimpieza, 120000);
        return () => clearInterval(intervalo);
    }, [cargarHabitacionesLimpieza]);

    const marcarComoDisponible = async (idHabitacion) => {
        setCambiando(idHabitacion);
        try {
            await api.patch(`/Habitacion/${idHabitacion}`, { idEstado: 1 });
            toast.success('Habitación marcada como disponible');
            // No es necesario recargar manualmente, SignalR lo hará en milisegundos
        } catch (error) {
            toast.error('Error al cambiar el estado');
        } finally {
            setCambiando(null);
        }
    };

    if (cargando && habitaciones.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    return (
        <div className="px-2 py-4">
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-base-content">Limpieza</h2>
                <p className="text-lg text-base-content/60 mt-1">
                    {habitaciones.length === 0
                        ? 'No hay habitaciones pendientes de limpieza'
                        : `${habitaciones.length} habitacion(es) por limpiar`}
                </p>
            </div>

            {habitaciones.length === 0 ? (
                <div className="text-center py-16 text-2xl text-base-content/40">Todo está limpio</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {habitaciones.map(h => (
                        <HabitacionCard
                            key={h.idHabitacion}
                            habitacion={h}
                            allHover={false}
                            extraActions={(habitacion) => (
                                <button
                                    className="btn btn-success btn-lg w-full gap-2 text-xl mt-2"
                                    onClick={(e) => { e.stopPropagation(); marcarComoDisponible(habitacion.idHabitacion); }}
                                    disabled={cambiando === habitacion.idHabitacion}
                                >
                                    {cambiando === habitacion.idHabitacion ? (
                                        <span className="loading loading-spinner loading-md"></span>
                                    ) : (
                                        <CheckCircle size={28} />
                                    )}
                                    LISTA
                                </button>
                            )}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}