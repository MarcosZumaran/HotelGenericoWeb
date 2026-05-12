import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productoSchema } from './productoSchema';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import swal from '../../lib/swal';
import LoadingButton from '../../components/ui/LoadingButton';
import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import DataTable from '../../components/ui/DataTable';

export default function ProductoList() {
  const { user } = useAuth();
  const esAdmin = user?.nombreRol === 'Administrador';

  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [sorting, setSorting] = useState([]);

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

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor('codigoSunat', {
        header: 'Cód. SUNAT',
        enableSorting: true,
        cell: info => info.getValue() ?? '—',
      }),
      columnHelper.accessor('nombre', {
        header: 'Nombre',
        enableSorting: true,
        cell: info => <span className="font-bold">{info.getValue()}</span>,
      }),
      columnHelper.accessor('precioUnitario', {
        header: 'Precio',
        enableSorting: true,
        cell: info => `S/ ${info.getValue().toFixed(2)}`,
      }),
      columnHelper.accessor('stock', {
        header: 'Stock',
        enableSorting: true,
        cell: info => info.getValue() ?? '—',
      }),
      columnHelper.accessor('nombreAfectacionIgv', {
        header: 'Afectación IGV',
        enableSorting: false,
        cell: info => (
          <span className="badge badge-ghost">{info.getValue() ?? '—'}</span>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: productos,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

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
      idAfectacionIgv: '10',
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

  return (
    <div>
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package size={28} /> Productos
          </h2>
          <p className="text-sm text-base-content/60 mt-1">Gestioná el catálogo de productos y servicios</p>
        </div>
        {esAdmin && (
          <button className="btn btn-primary gap-2" onClick={abrirModalCrear}>
            <Plus size={20} /> Nuevo Producto
          </button>
        )}
      </div>

      {/* Tabla */}
      <DataTable
        table={table}
        columns={columns}
        emptyMessage="No hay productos registrados"
        isLoading={cargando}
        showActions={esAdmin}
        renderActions={(row) => (
          <div className="flex gap-1">
            <button className="btn btn-ghost btn-xs" onClick={() => abrirModalEditar(row)} title="Editar">
              <Edit size={16} />
            </button>
            <button className="btn btn-ghost btn-xs text-error" onClick={() => eliminarProducto(row.idProducto)} title="Eliminar">
              <Trash2 size={16} />
            </button>
          </div>
        )}
      />

      {/* Modal de creación/edición */}
      {mostrarModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg bg-base-100 border border-base-200 shadow-xl">
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