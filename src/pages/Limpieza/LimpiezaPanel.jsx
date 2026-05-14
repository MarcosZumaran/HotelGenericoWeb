import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const coloresFondo = {
    1: 'bg-success/10 border-success/30',
    2: 'bg-warning/10 border-warning/30',
    3: 'bg-info/10 border-info/30',
    4: 'bg-error/10 border-error/30',
    5: 'bg-orange-500/10 border-orange-500/30',
};

export default function LimpiezaPanel() {
    const { user } = useAuth();
    const [habitaciones, setHabitaciones] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [cambiando, setCambiando] = useState(null);

    const cargarHabitacionesLimpieza = async () => {
        setCargando(true);
        try {
            const res = await api.get('/Habitacion/estado-actual');
            // Filtramos solo las que están en estado "Limpieza" (idEstado 3)
            const enLimpieza = res.data.filter(h => h.idEstado === 3);
            setHabitaciones(enLimpieza);
        } catch (error) {
            toast.error('No se pudieron cargar las habitaciones');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarHabitacionesLimpieza();
        // Recargar cada 30 segundos para estar sincronizados
        const intervalo = setInterval(cargarHabitacionesLimpieza, 30000);
        return () => clearInterval(intervalo);
    }, []);

    const marcarComoDisponible = async (idHabitacion) => {
        setCambiando(idHabitacion);
        try {
            await api.patch(`/Habitacion/${idHabitacion}`, { idEstado: 1 }); // 1 = Disponible
            toast.success('Habitación marcada como disponible');
            cargarHabitacionesLimpieza();
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
                <div className="text-center py-16 text-2xl text-base-content/40">
                    ✅ Todo está limpio
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {habitaciones.map(h => (
                        <div
                            key={h.idHabitacion}
                            className={`card border-2 ${coloresFondo[h.idEstado] || 'bg-base-200'} shadow-md animate-[pulse_2s_ease-in-out_infinite]`}
                            style={{ animation: 'pulse 2s ease-in-out infinite' }}
                        >
                            <div className="card-body items-center text-center p-6">
                                <h3 className="text-5xl font-extrabold text-base-content mb-2">
                                    {h.numeroHabitacion}
                                </h3>
                                <p className="text-xl font-semibold text-base-content/80 mb-4">
                                    {h.nombreTipo}
                                </p>
                                <button
                                    className="btn btn-success btn-lg w-full gap-2 text-xl"
                                    onClick={() => marcarComoDisponible(h.idHabitacion)}
                                    disabled={cambiando === h.idHabitacion}
                                >
                                    {cambiando === h.idHabitacion ? (
                                        <span className="loading loading-spinner loading-md"></span>
                                    ) : (
                                        <CheckCircle size={28} />
                                    )}
                                    LISTA
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Animación de parpadeo suave definida en línea */}
            <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
        </div>
    );
}