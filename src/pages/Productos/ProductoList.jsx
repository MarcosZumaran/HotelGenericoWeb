import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productoSchema } from './productoSchema';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import { Plus, Edit, Trash2, Package, Hash, DollarSign, Layers } from 'lucide-react';
import swal from '../../lib/swal';
import LoadingButton from '../../components/ui/LoadingButton';

export default function ProductoList() {
  const { user } = useAuth();
  const esAdmin = user?.nombreRol === 'Administrador';

  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(productoSchema),
  });

  const cargarProductos = async () => {
    try {
      const res = await api.get('/Producto');
      setProductos(res.data);
    } catch (error) {
      swal.fire('Error', 'No se pudieron cargar los productos', 'error');
    } finally {
      setCargando(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    cargarProductos();
  }, []);

  // Modal
  const abrirModalCrear = () => {
    setEditando(null);
    reset({
      codigoSunat: '',
      nombre: '',
      descripcion: '',
      precioUnitario: '',
      idAfectacionIgv: '10', // Gravado
      stock: '',
      stockMinimo: '',
      unidadMedida: 'NIU',
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = (producto) => {
    setEditando(producto);
    reset({
      codigoSunat: producto.codigoSunat ?? '',
      nombre: producto.nombre,
      descripcion: producto.descripcion ?? '',
      precioUnitario: producto.precioUnitario,
      idAfectacionIgv: producto.idAfectacionIgv ?? '10',
      stock: producto.stock ?? '',
      stockMinimo: producto.stockMinimo ?? '',
      unidadMedida: producto.unidadMedida ?? 'NIU',
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
      stock: data.stock ?? null,
      stockMinimo: data.stockMinimo ?? null,
      codigoSunat: data.codigoSunat || null,
      descripcion: data.descripcion || null,
      unidadMedida: data.unidadMedida || 'NIU',
      idAfectacionIgv: data.idAfectacionIgv || '10',
    };

    try {
      if (editando) {
        await api.put(`/Producto/${editando.idProducto}`, payload);
        swal.fire('Actualizado', 'Producto actualizado exitosamente', 'success');
      } else {
        await api.post('/Producto', payload);
        swal.fire('Creado', 'Producto registrado exitosamente', 'success');
      }
      cerrarModal();
      cargarProductos();
    } catch (error) {
      const mensaje =
        error.response?.data?.mensaje || 'Error al guardar el producto';
      swal.fire('Error', mensaje, 'error');
    }
  };

  const eliminarProducto = async (id) => {
    const confirmacion = await swal.fire({
      title: '¿Eliminar producto?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (!confirmacion.isConfirmed) return;

    try {
      await api.delete(`/Producto/${id}`);
      swal.fire('Eliminado', 'El producto fue eliminado', 'success');
      cargarProductos();
    } catch (error) {
      const mensaje =
        error.response?.data?.mensaje || 'Error al eliminar el producto';
      swal.fire('Error', mensaje, 'error');
    }
  };

  const afectacionesIgv = [
    { codigo: '10', descripcion: 'Gravado (18%)' },
    { codigo: '20', descripcion: 'Exonerado' },
    { codigo: '30', descripcion: 'Inafecto' },
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
        <h2 className="text-2xl font-bold">
          <Package className="inline mr-2" size={28} />
          Productos
        </h2>
        {esAdmin && (
          <button className="btn btn-primary" onClick={abrirModalCrear}>
            <Plus size={20} /> Nuevo Producto
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
                  <th><Hash size={16} className="inline mr-1" />Cód. SUNAT</th>
                  <th><Package size={16} className="inline mr-1" />Nombre</th>
                  <th><DollarSign size={16} className="inline mr-1" />Precio</th>
                  <th><Layers size={16} className="inline mr-1" />Stock</th>
                  <th>Afectación IGV</th>
                  {esAdmin && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {productos.length === 0 ? (
                  <tr>
                    <td colSpan={esAdmin ? 6 : 5} className="text-center text-gray-500 py-8">
                      No hay productos registrados
                    </td>
                  </tr>
                ) : (
                  productos.map((p) => (
                    <tr key={p.idProducto}>
                      <td>{p.codigoSunat ?? '—'}</td>
                      <td className="font-bold">{p.nombre}</td>
                      <td>S/ {p.precioUnitario.toFixed(2)}</td>
                      <td>{p.stock ?? '—'}</td>
                      <td>
                        <span className="badge badge-ghost">
                          {p.nombreAfectacionIgv ?? '—'}
                        </span>
                      </td>
                      {esAdmin && (
                        <td>
                          <div className="flex gap-1">
                            <button
                              className="btn btn-ghost btn-xs"
                              onClick={() => abrirModalEditar(p)}
                              title="Editar"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="btn btn-ghost btn-xs text-error"
                              onClick={() => eliminarProducto(p.idProducto)}
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
              {editando ? 'Editar Producto' : 'Nuevo Producto'}
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Código SUNAT */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Código SUNAT</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  {...register('codigoSunat')}
                />
              </div>

              {/* Nombre */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Nombre</span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered ${errors.nombre ? 'input-error' : ''}`}
                  {...register('nombre')}
                />
                {errors.nombre && (
                  <span className="label-text-alt text-error">
                    {errors.nombre.message}
                  </span>
                )}
              </div>

              {/* Descripción */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Descripción</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  {...register('descripcion')}
                ></textarea>
              </div>

              {/* Precio */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Precio Unitario (S/)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  className={`input input-bordered ${errors.precioUnitario ? 'input-error' : ''}`}
                  {...register('precioUnitario')}
                />
                {errors.precioUnitario && (
                  <span className="label-text-alt text-error">
                    {errors.precioUnitario.message}
                  </span>
                )}
              </div>

              {/* Afectación IGV */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Afectación IGV</span>
                </label>
                <select
                  className="select select-bordered"
                  {...register('idAfectacionIgv')}
                >
                  {afectacionesIgv.map((a) => (
                    <option key={a.codigo} value={a.codigo}>
                      {a.descripcion}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock y Stock mínimo */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Stock</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    {...register('stock')}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Stock Mínimo</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    {...register('stockMinimo')}
                  />
                </div>
              </div>

              {/* Unidad de medida */}
              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text">Unidad de Medida</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  {...register('unidadMedida')}
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
                <LoadingButton
                  type="submit"
                  isLoading={isSubmitting}
                  className="btn-primary"
                >
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