import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clienteSchema } from './clienteSchema';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import Swal from 'sweetalert2';
import { Plus, Edit, Trash2, Search, User, Hash, Phone, Mail } from 'lucide-react';

export default function ClienteList() {
  const { user } = useAuth();
  const esAdmin = user?.nombreRol === 'Administrador';

  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  // Búsqueda
  const [buscarTipo, setBuscarTipo] = useState('');
  const [buscarDocumento, setBuscarDocumento] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(clienteSchema),
  });

  const cargarClientes = async () => {
    try {
      const res = await api.get('/Cliente');
      setClientes(res.data);
    } catch (error) {
      Swal.fire('Error', 'No se pudieron cargar los clientes', 'error');
    } finally {
      setCargando(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    cargarClientes();
  }, []);

  // Buscar por documento
  const buscarCliente = async () => {
    if (!buscarTipo || !buscarDocumento) {
      // Si vacían los campos, recargar la lista completa
      cargarClientes();
      return;
    }
    try {
      const res = await api.get(`/Cliente/documento/${buscarTipo}/${buscarDocumento}`);
      setClientes(res.data ? [res.data] : []);
    } catch (error) {
      if (error.response?.status === 404) {
        setClientes([]);
        Swal.fire('Sin resultados', 'No se encontró ningún cliente con ese documento', 'info');
      } else {
        Swal.fire('Error', 'Error al buscar cliente', 'error');
      }
    }
  };

  const limpiarBusqueda = () => {
    setBuscarTipo('');
    setBuscarDocumento('');
    cargarClientes();
  };

  // Modal
  const abrirModalCrear = () => {
    setEditando(null);
    reset({
      tipoDocumento: '1',
      documento: '',
      nombres: '',
      apellidos: '',
      telefono: '',
      email: '',
      nacionalidad: 'PERUANA',
      direccion: '',
      fechaNacimiento: '',
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = (cliente) => {
    setEditando(cliente);
    reset({
      tipoDocumento: cliente.tipoDocumento,
      documento: cliente.documento,
      nombres: cliente.nombres,
      apellidos: cliente.apellidos,
      telefono: cliente.telefono ?? '',
      email: cliente.email ?? '',
      nacionalidad: cliente.nacionalidad ?? 'PERUANA',
      direccion: cliente.direccion ?? '',
      fechaNacimiento: cliente.fechaNacimiento
        ? cliente.fechaNacimiento.split('T')[0]
        : '',
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
      fechaNacimiento: data.fechaNacimiento || null,
      telefono: data.telefono || null,
      email: data.email || null,
      nacionalidad: data.nacionalidad || 'PERUANA',
      direccion: data.direccion || null,
    };

    try {
      if (editando) {
        await api.put(`/Cliente/${editando.idCliente}`, payload);
        Swal.fire('Actualizado', 'Cliente actualizado exitosamente', 'success');
      } else {
        await api.post('/Cliente', payload);
        Swal.fire('Creado', 'Cliente registrado exitosamente', 'success');
      }
      cerrarModal();
      cargarClientes();
    } catch (error) {
      const mensaje =
        error.response?.data?.mensaje || 'Error al guardar el cliente';
      Swal.fire('Error', mensaje, 'error');
    }
  };

  const eliminarCliente = async (id) => {
    const confirmacion = await Swal.fire({
      title: '¿Eliminar cliente?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (!confirmacion.isConfirmed) return;

    try {
      await api.delete(`/Cliente/${id}`);
      Swal.fire('Eliminado', 'El cliente fue eliminado', 'success');
      cargarClientes();
    } catch (error) {
      const mensaje =
        error.response?.data?.mensaje || 'Error al eliminar el cliente';
      Swal.fire('Error', mensaje, 'error');
    }
  };

  const tiposDocumento = [
    { codigo: '1', descripcion: 'DNI' },
    { codigo: '7', descripcion: 'Pasaporte' },
    { codigo: '6', descripcion: 'RUC' },
  ];

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
        <h2 className="text-2xl font-bold">Clientes</h2>
        {esAdmin && (
          <button className="btn btn-primary" onClick={abrirModalCrear}>
            <Plus size={20} /> Nuevo Cliente
          </button>
        )}
      </div>

      {/* Barra de búsqueda */}
      <div className="card bg-base-100 shadow-md mb-6">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="form-control flex-1">
              <label className="label">
                <span className="label-text">Tipo de Documento</span>
              </label>
              <select
                className="select select-bordered"
                value={buscarTipo}
                onChange={(e) => setBuscarTipo(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="1">DNI</option>
                <option value="7">Pasaporte</option>
              </select>
            </div>
            <div className="form-control flex-1">
              <label className="label">
                <span className="label-text">Número de Documento</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                placeholder="Ingresá el documento"
                value={buscarDocumento}
                onChange={(e) => setBuscarDocumento(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && buscarCliente()}
              />
            </div>
            <button className="btn btn-primary" onClick={buscarCliente}>
              <Search size={20} /> Buscar
            </button>
            <button className="btn btn-ghost" onClick={limpiarBusqueda}>
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th><Hash size={16} className="inline mr-1" />Documento</th>
                  <th><User size={16} className="inline mr-1" />Nombres</th>
                  <th><User size={16} className="inline mr-1" />Apellidos</th>
                  <th><Phone size={16} className="inline mr-1" />Teléfono</th>
                  <th><Mail size={16} className="inline mr-1" />Correo</th>
                  {esAdmin && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {clientes.length === 0 ? (
                  <tr>
                    <td colSpan={esAdmin ? 6 : 5} className="text-center text-gray-500 py-8">
                      No se encontraron clientes
                    </td>
                  </tr>
                ) : (
                  clientes.map((c) => (
                    <tr key={c.idCliente}>
                      <td className="font-bold">
                        {c.tipoDocumento === '1' ? 'DNI' : 'PAS'}: {c.documento}
                      </td>
                      <td>{c.nombres}</td>
                      <td>{c.apellidos}</td>
                      <td>{c.telefono ?? '—'}</td>
                      <td>{c.email ?? '—'}</td>
                      {esAdmin && (
                        <td>
                          <div className="flex gap-1">
                            <button
                              className="btn btn-ghost btn-xs"
                              onClick={() => abrirModalEditar(c)}
                              title="Editar"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="btn btn-ghost btn-xs text-error"
                              onClick={() => eliminarCliente(c.idCliente)}
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      )}
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
          <div className="modal-box max-w-lg">
            <h3 className="text-lg font-bold mb-4">
              {editando ? 'Editar Cliente' : 'Nuevo Cliente'}
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Tipo de documento */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Tipo de Documento</span>
                </label>
                <select
                  className={`select select-bordered ${
                    errors.tipoDocumento ? 'select-error' : ''
                  }`}
                  {...register('tipoDocumento')}
                >
                  {tiposDocumento.map((t) => (
                    <option key={t.codigo} value={t.codigo}>
                      {t.descripcion}
                    </option>
                  ))}
                </select>
                {errors.tipoDocumento && (
                  <span className="label-text-alt text-error">
                    {errors.tipoDocumento.message}
                  </span>
                )}
              </div>

              {/* Documento */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Número de Documento</span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered ${
                    errors.documento ? 'input-error' : ''
                  }`}
                  {...register('documento')}
                />
                {errors.documento && (
                  <span className="label-text-alt text-error">
                    {errors.documento.message}
                  </span>
                )}
              </div>

              {/* Nombres y Apellidos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Nombres</span>
                  </label>
                  <input
                    type="text"
                    className={`input input-bordered ${
                      errors.nombres ? 'input-error' : ''
                    }`}
                    {...register('nombres')}
                  />
                  {errors.nombres && (
                    <span className="label-text-alt text-error">
                      {errors.nombres.message}
                    </span>
                  )}
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Apellidos</span>
                  </label>
                  <input
                    type="text"
                    className={`input input-bordered ${
                      errors.apellidos ? 'input-error' : ''
                    }`}
                    {...register('apellidos')}
                  />
                  {errors.apellidos && (
                    <span className="label-text-alt text-error">
                      {errors.apellidos.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Teléfono y Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Teléfono</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    {...register('telefono')}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Correo electrónico</span>
                  </label>
                  <input
                    type="text"
                    className={`input input-bordered ${
                      errors.email ? 'input-error' : ''
                    }`}
                    {...register('email')}
                  />
                  {errors.email && (
                    <span className="label-text-alt text-error">
                      {errors.email.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Nacionalidad */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Nacionalidad</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  {...register('nacionalidad')}
                />
              </div>

              {/* Dirección */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Dirección</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  {...register('direccion')}
                ></textarea>
              </div>

              {/* Fecha de nacimiento */}
              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text">Fecha de Nacimiento</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered"
                  {...register('fechaNacimiento')}
                />
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
                <button
                  type="submit"
                  className={`btn btn-primary ${
                    isSubmitting ? 'loading' : ''
                  }`}
                  disabled={isSubmitting}
                >
                  {editando ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}