import { useState, useEffect } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import api from '../../api/axios';
import Swal from 'sweetalert2';
import { DoorOpen, Hash, User, Calendar, DollarSign, Activity } from 'lucide-react';

export default function CheckOut() {
  const [estancias, setEstancias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [procesandoId, setProcesandoId] = useState(null);
  const [parentRef] = useAutoAnimate(); // Para animar la eliminación de filas

  const cargarEstancias = async () => {
    try {
      const res = await api.get('/Estancia');
      // Filtramos solo las activas (por si el backend devuelve todas)
      setEstancias(res.data.filter((e) => e.estado === 'Activa'));
    } catch (error) {
      Swal.fire('Error', 'No se pudieron cargar las estancias activas', 'error');
    } finally {
      setCargando(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    cargarEstancias();
  }, []);

  const realizarCheckOut = async (idEstancia, numeroHabitacion) => {
    const confirmacion = await Swal.fire({
      title: '¿Confirmar Check‑Out?',
      html: `Habitación <strong>${numeroHabitacion}</strong> pasará a estado <em>Limpieza</em>.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#15803d',
      confirmButtonText: 'Sí, finalizar estancia',
      cancelButtonText: 'Cancelar',
    });

    if (!confirmacion.isConfirmed) return;

    setProcesandoId(idEstancia);
    try {
      await api.post(`/Estancia/${idEstancia}/checkout`);
      Swal.fire('Check‑Out exitoso', `La habitación ${numeroHabitacion} ahora está en limpieza.`, 'success');
      cargarEstancias();
    } catch (error) {
      const mensaje =
        error.response?.data?.mensaje || 'Error al realizar el Check‑Out';
      Swal.fire('Error', mensaje, 'error');
    } finally {
      setProcesandoId(null);
    }
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">
        <DoorOpen className="inline mr-2" size={28} />
        Check‑Out
      </h2>

      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th><Hash size={16} className="inline mr-1" />Estancia N°</th>
                  <th><Hash size={16} className="inline mr-1" />Habitación</th>
                  <th><User size={16} className="inline mr-1" />Cliente</th>
                  <th><Calendar size={16} className="inline mr-1" />Check‑In</th>
                  <th><Calendar size={16} className="inline mr-1" />Salida Prevista</th>
                  <th><DollarSign size={16} className="inline mr-1" />Monto</th>
                  <th><Activity size={16} className="inline mr-1" />Acción</th>
                </tr>
              </thead>
              <tbody ref={parentRef}>
                {estancias.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-gray-500 py-8">
                      No hay estancias activas en este momento.
                    </td>
                  </tr>
                ) : (
                  estancias.map((e) => (
                    <tr key={e.idEstancia}>
                      <td className="font-bold">#{e.idEstancia}</td>
                      <td>{e.numeroHabitacion}</td>
                      <td>{e.clienteNombreCompleto}</td>
                      <td>{new Date(e.fechaCheckin).toLocaleDateString('es-PE', { dateStyle: 'short' })}</td>
                      <td>{new Date(e.fechaCheckoutPrevista).toLocaleDateString('es-PE', { dateStyle: 'short' })}</td>
                      <td className="font-semibold">S/ {e.montoTotal.toFixed(2)}</td>
                      <td>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => realizarCheckOut(e.idEstancia, e.numeroHabitacion)}
                          disabled={procesandoId === e.idEstancia}
                        >
                          {procesandoId === e.idEstancia ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            <DoorOpen size={16} />
                          )}
                          <span className="ml-1">Check‑Out</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}