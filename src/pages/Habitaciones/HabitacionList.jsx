import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { habitacionSchema } from './habitacionSchema';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import swal from '../../lib/swal';
import {
  Plus, Edit, Trash2, Bed, Hash, DollarSign, Layers,
  CheckCircle, Wrench, RotateCcw
} from 'lucide-react';
import LoadingButton from '../../components/ui/LoadingButton';

export default function HabitacionList() {
  const { user } = useAuth();
  const [habitaciones, setHabitaciones] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [cambiandoEstado, setCambiandoEstado] = useState(null);

  const esAdmin = user?.nombreRol === 'Administrador';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(habitacionSchema),
  });

  const cargarDatos = async () => {
    try {
      const [habRes, tiposRes] = await Promise.all([
        api.get('/Habitacion'),
        api.get('/TiposHabitacion'),
      ]);
      setHabitaciones(habRes.data);
      setTipos(tiposRes.data);
    } catch (error) {
      swal.fire('Error', 'No se pudieron cargar las habitaciones', 'error');
    } finally {
      setCargando(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    cargarDatos();
  }, []);

  const abrirModalCrear = () => {
    setEditando(null);
    reset({
      numeroHabitacion: '',
      piso: '',
      descripcion: '',
      idTipo: '',
      precioNoche: '',
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = (habitacion) => {
    setEditando(habitacion);
    reset({
      numeroHabitacion: habitacion.numeroHabitacion,
      piso: habitacion.piso ?? '',
      descripcion: habitacion.descripcion ?? '',
      idTipo: habitacion.idTipo,
      precioNoche: habitacion.precioNoche,
    });
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setEditando(null);
    reset();
  };

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      piso: data.piso ?? null,
      descripcion: data.descripcion || null,
    };

    if (editando) {
      payload.idEstado = editando.idEstado;
    }

    try {
      if (editando) {
        await api.patch(`/Habitacion/${editando.idHabitacion}`, payload);
        swal.fire('Actualizado', 'La habitación fue actualizada', 'success');
      } else {
        await api.post('/Habitacion', payload);
        swal.fire('Creado', 'La habitación fue creada', 'success');
      }
      cerrarModal();
      cargarDatos();
    } catch (error) {
      const mensaje =
        error.response?.data?.mensaje || 'Error al guardar la habitación';
      swal.fire('Error', mensaje, 'error');
    }
  };

  const eliminarHabitacion = async (id) => {
    const confirmacion = await swal.fire({
      title: '¿Eliminar habitación?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (!confirmacion.isConfirmed) return;

    try {
      await api.delete(`/Habitacion/${id}`);
      swal.fire('Eliminado', 'La habitación fue eliminada', 'success');
      cargarDatos();
    } catch (error) {
      const mensaje =
        error.response?.data?.mensaje || 'Error al eliminar la habitación';
      swal.fire('Error', mensaje, 'error');
    }
  };

  // Cambio manual de estado
  const cambiarEstado = async (idHabitacion, nuevoIdEstado, accion) => {
    const confirmacion = await swal.fire({
      title: `¿${accion}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    });

    if (!confirmacion.isConfirmed) return;

    setCambiandoEstado(idHabitacion);
    try {
      await api.patch(`/Habitacion/${idHabitacion}`, { idEstado: nuevoIdEstado });
      swal.fire('Éxito', `Habitación actualizada: ${accion}`, 'success');
      cargarDatos();
    } catch (error) {
      const mensaje = error.response?.data?.mensaje || 'Error al cambiar el estado';
      swal.fire('Error', mensaje, 'error');
    } finally {
      setCambiandoEstado(null);
    }
  };

  const estadoBadge = (idEstado, nombreEstado) => {
    const clases = {
      1: 'badge-success',
      2: 'badge-warning',
      3: 'badge-info',
      4: 'badge-error',
    };
    return <span className={`badge ${clases[idEstado] || 'badge-ghost'}`}>{nombreEstado}</span>;
  };

  const botonesEstado = (h) => {
    const esLimpieza = user?.nombreRol === 'Limpieza';

    // Si está cargando el cambio de estado, mostramos spinner
    if (cambiandoEstado === h.idHabitacion) {
      return <span className="loading loading-spinner loading-xs"></span>;
    }

    switch (h.idEstado) {
      case 1: // Disponible → Mantenimiento
        if (!esAdmin) return null;
        return (
          <button
            className="btn btn-ghost btn-xs text-warning"
            onClick={() => cambiarEstado(h.idHabitacion, 4, 'Poner en Mantenimiento')}
            title="Mantenimiento"
          >
            <Wrench size={16} />
          </button>
        );

      case 3: // Limpieza → Finalizar limpieza
        if (!esAdmin && !esLimpieza) return null;
        return (
          <button
            className="btn btn-ghost btn-xs text-success"
            onClick={() => cambiarEstado(h.idHabitacion, 1, 'Finalizar limpieza')}
            title="Finalizar limpieza"
          >
            <CheckCircle size={16} />
          </button>
        );

      case 4: // Mantenimiento → Habilitar
        if (!esAdmin) return null;
        return (
          <button
            className="btn btn-ghost btn-xs text-primary"
            onClick={() => cambiarEstado(h.idHabitacion, 1, 'Habilitar habitación')}
            title="Habilitar"
          >
            <RotateCcw size={16} />
          </button>
        );

      default:
        return null;
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
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold">Habitaciones</h2>
        {esAdmin && (
          <button className="btn btn-primary" onClick={abrirModalCrear}>
            <Plus size={20} /> Nueva Habitación
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th><Hash size={16} className="inline mr-1" />N°</th>
                  <th><Bed size={16} className="inline mr-1" />Tipo</th>
                  <th><Layers size={16} className="inline mr-1" />Piso</th>
                  <th><DollarSign size={16} className="inline mr-1" />Precio</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {habitaciones.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-500 py-8">
                      No hay habitaciones registradas
                    </td>
                  </tr>
                ) : (
                  habitaciones.map((h) => (
                    <tr key={h.idHabitacion}>
                      <td className="font-bold">{h.numeroHabitacion}</td>
                      <td>{h.nombreTipo}</td>
                      <td>{h.piso ?? '—'}</td>
                      <td>S/ {h.precioNoche.toFixed(2)}</td>
                      <td>{estadoBadge(h.idEstado, h.nombreEstado)}</td>
                      <td>
                        <div className="flex gap-1">
                          {esAdmin && (
                            <>
                              <button
                                className="btn btn-ghost btn-xs"
                                onClick={() => abrirModalEditar(h)}
                                title="Editar"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                className="btn btn-ghost btn-xs text-error"
                                onClick={() => eliminarHabitacion(h.idHabitacion)}
                                title="Eliminar"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                          {botonesEstado(h)}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de creación/edición */}
      {mostrarModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-lg font-bold mb-4">
              {editando ? 'Editar Habitación' : 'Nueva Habitación'}
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Número de habitación */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Número de Habitación</span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered ${errors.numeroHabitacion ? 'input-error' : ''
                    }`}
                  {...register('numeroHabitacion')}
                />
                {errors.numeroHabitacion && (
                  <span className="label-text-alt text-error">
                    {errors.numeroHabitacion.message}
                  </span>
                )}
              </div>

              {/* Piso */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Piso</span>
                </label>
                <input
                  type="number"
                  className={`input input-bordered ${errors.piso ? 'input-error' : ''
                    }`}
                  {...register('piso')}
                />
                {errors.piso && (
                  <span className="label-text-alt text-error">
                    {errors.piso.message}
                  </span>
                )}
              </div>

              {/* Tipo de habitación */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Tipo de Habitación</span>
                </label>
                <select
                  className={`select select-bordered ${errors.idTipo ? 'select-error' : ''
                    }`}
                  {...register('idTipo')}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Seleccioná un tipo
                  </option>
                  {tipos.map((t) => (
                    <option key={t.idTipo} value={t.idTipo}>
                      {t.nombre} (capacidad: {t.capacidad})
                    </option>
                  ))}
                </select>
                {errors.idTipo && (
                  <span className="label-text-alt text-error">
                    {errors.idTipo.message}
                  </span>
                )}
              </div>

              {/* Precio por noche */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Precio por Noche (S/)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  className={`input input-bordered ${errors.precioNoche ? 'input-error' : ''
                    }`}
                  {...register('precioNoche')}
                />
                {errors.precioNoche && (
                  <span className="label-text-alt text-error">
                    {errors.precioNoche.message}
                  </span>
                )}
              </div>

              {/* Descripción */}
              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text">Descripción</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  {...register('descripcion')}
                ></textarea>
              </div>

              {/* Botones */}
              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={cerrarModal}
                >
                  Cancelar
                </button>
                <LoadingButton type="submit" isLoading={isSubmitting} className="btn-primary">
                  {editando ? 'Actualizar' : 'Crear'}
                </LoadingButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}