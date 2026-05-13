import { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clienteSchema } from './clienteSchema';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import { format, parse } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import {
  Plus, Edit, Trash2, Search, CheckCircle
} from 'lucide-react';
import swal from '../../lib/swal';
import LoadingButton from '../../components/ui/LoadingButton';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
} from '@tanstack/react-table';
import DataTable from '../../components/ui/DataTable';
import TableFilters from '../../components/ui/TableFilters';
import { isBefore, isAfter, isSameDay, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { consultarDni } from '../../api/verifica_pe';
import toast from 'react-hot-toast';

const columnHelper = createColumnHelper();

export default function ClienteList() {
  const { user } = useAuth();
  const esAdmin = user?.nombreRol === 'Administrador';

  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [dateFilter, setDateFilter] = useState({ type: 'none', date: null, dateEnd: null });
  const [consultandoReniec, setConsultandoReniec] = useState(false);

  const [buscarTipo, setBuscarTipo] = useState('');
  const [buscarDocumento, setBuscarDocumento] = useState('');

  const [parentRef] = useAutoAnimate(); // ← CORREGIDO: se llama al inicio, no en JSX

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(clienteSchema),
  });

  const cargarClientes = async () => {
    setCargando(true);
    try {
      const res = await api.get('/Cliente', { params: { pageSize: 9999 } });
      setClientes(res.data.items || []);
    } catch (error) {
      swal.fire('Error', 'No se pudieron cargar los clientes', 'error');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarClientes(); }, []);

  const buscarClienteManual = async () => {
    if (!buscarTipo || !buscarDocumento) {
      cargarClientes();
      return;
    }
    try {
      const res = await api.get(`/Cliente/documento/${buscarTipo}/${buscarDocumento}`);
      setClientes(res.data ? [res.data] : []);
    } catch (error) {
      if (error.response?.status === 404) {
        setClientes([]);
        swal.fire('Sin resultados', 'No se encontró ningún cliente con ese documento', 'info');
      } else {
        swal.fire('Error', 'Error al buscar cliente', 'error');
      }
    }
  };

  const limpiarBusquedaDocumento = () => {
    setBuscarTipo('');
    setBuscarDocumento('');
    cargarClientes();
  };

  // Filtro por fecha sobre fechaRegistro
  const dataFiltrada = useMemo(() => {
    let result = clientes;
    if (dateFilter && dateFilter.type !== 'none' && dateFilter.date) {
      result = result.filter(item => {
        const itemDate = item.fechaRegistro ? new Date(item.fechaRegistro) : null;
        if (!itemDate) return true;
        const filterDate = dateFilter.date;
        if (dateFilter.type === 'before') return isBefore(itemDate, startOfDay(filterDate));
        if (dateFilter.type === 'after') return isAfter(itemDate, endOfDay(filterDate));
        if (dateFilter.type === 'on') return isSameDay(itemDate, filterDate);
        if (dateFilter.type === 'range') {
          if (!dateFilter.dateEnd) return true;
          return isWithinInterval(itemDate, {
            start: startOfDay(filterDate),
            end: endOfDay(dateFilter.dateEnd)
          });
        }
        return true;
      });
    }
    return result;
  }, [clientes, dateFilter]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('documento', {
        header: 'Documento',
        enableSorting: true,
        cell: info => {
          const c = info.row.original;
          const prefijo = c.tipoDocumento === '1' ? 'DNI' : 'PAS';
          return <span className="font-bold">{prefijo}: {c.documento}</span>;
        },
      }),
      columnHelper.accessor('nombres', {
        header: 'Nombres',
        enableSorting: true,
      }),
      columnHelper.accessor('apellidos', {
        header: 'Apellidos',
        enableSorting: true,
      }),
      columnHelper.accessor('telefono', {
        header: 'Teléfono',
        enableSorting: true,
        cell: info => info.getValue() ?? '—',
      }),
      columnHelper.accessor('email', {
        header: 'Correo',
        enableSorting: true,
        cell: info => info.getValue() ?? '—',
      }),
    ],
    []
  );

  const table = useReactTable({
    data: dataFiltrada,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const abrirModalCrear = () => {
    setEditando(null);
    reset({
      tipoDocumento: '1', documento: '', nombres: '', apellidos: '',
      telefono: '', email: '', nacionalidad: 'PERUANA', direccion: '', fechaNacimiento: '',
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = (cliente) => {
    setEditando(cliente);
    reset({
      tipoDocumento: cliente.tipoDocumento, documento: cliente.documento,
      nombres: cliente.nombres, apellidos: cliente.apellidos,
      telefono: cliente.telefono ?? '', email: cliente.email ?? '',
      nacionalidad: cliente.nacionalidad ?? 'PERUANA', direccion: cliente.direccion ?? '',
      fechaNacimiento: cliente.fechaNacimiento ? cliente.fechaNacimiento.split('T')[0] : '',
    });
    setMostrarModal(true);
  };

  const cerrarModal = () => { setMostrarModal(false); setEditando(null); reset(); };

  // Verificar DNI con VerificaPE
  const verificarDni = async () => {
    const dni = watch('documento');
    if (!dni || dni.length < 8) {
      toast.error('Ingrese un DNI válido de 8 dígitos', { duration: 3000 });
      return;
    }

    setConsultandoReniec(true);
    try {
      const data = await consultarDni(dni);
      setValue('nombres', data.names);
      setValue('apellidos', `${data.paternalSurname} ${data.maternalSurname}`);

      if (data.birthDate) {
        const parsedDate = parse(data.birthDate, 'dd/MM/yyyy', new Date());
        setValue('fechaNacimiento', format(parsedDate, 'yyyy-MM-dd'));
      }

      toast.success(`Datos de ${data.fullName} verificados correctamente`, { duration: 3000 });
    } catch (error) {
      toast.error(error.message || 'No se pudo verificar el DNI', { duration: 3000 });
    } finally {
      setConsultandoReniec(false);
    }
  };

  const onSubmit = async (data) => {
    const payload = { ...data, fechaNacimiento: data.fechaNacimiento || null, telefono: data.telefono || null, email: data.email || null, nacionalidad: data.nacionalidad || 'PERUANA', direccion: data.direccion || null };
    try {
      if (editando) {
        await api.put(`/Cliente/${editando.idCliente}`, payload);
        swal.fire('Actualizado', 'Cliente actualizado exitosamente', 'success');
      } else {
        await api.post('/Cliente', payload);
        swal.fire('Creado', 'Cliente registrado exitosamente', 'success');
      }
      cerrarModal();
      cargarClientes();
    } catch (error) {
      swal.fire('Error', error.response?.data?.mensaje || 'Error al guardar el cliente', 'error');
    }
  };

  const eliminarCliente = async (id) => {
    const confirmacion = await swal.fire({
      title: '¿Eliminar cliente?', text: 'Esta acción no se puede deshacer', icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar',
    });
    if (!confirmacion.isConfirmed) return;
    try {
      await api.delete(`/Cliente/${id}`);
      swal.fire('Eliminado', 'El cliente fue eliminado', 'success');
      cargarClientes();
    } catch (error) {
      swal.fire('Error', error.response?.data?.mensaje || 'Error al eliminar el cliente', 'error');
    }
  };

  const tiposDocumento = [
    { codigo: '1', descripcion: 'DNI' }, { codigo: '7', descripcion: 'Pasaporte' }, { codigo: '6', descripcion: 'RUC' },
  ];

  return (
    <div>
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Clientes</h2>
          <p className="text-sm text-base-content/60 mt-1">Gestioná la información de los huéspedes y clientes</p>
        </div>
        {esAdmin && (
          <button className="btn btn-primary gap-2" onClick={abrirModalCrear}>
            <Plus size={20} /> Nuevo Cliente
          </button>
        )}
      </div>

      {/* Filtros generales (búsqueda global + fecha) */}
      <TableFilters
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        placeholder="Buscar por nombre, documento, teléfono..."
        showDateFilter={true}
      />

      {/* Filtro adicional por documento */}
      <div className="card bg-base-100 shadow-sm border border-base-200 mb-6">
        <div className="card-body p-5">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="form-control flex-1">
              <label className="label"><span className="label-text">Tipo de Documento</span></label>
              <select className="select select-bordered" value={buscarTipo} onChange={(e) => setBuscarTipo(e.target.value)}>
                <option value="">Todos</option>
                <option value="1">DNI</option>
                <option value="7">Pasaporte</option>
              </select>
            </div>
            <div className="form-control flex-1">
              <label className="label"><span className="label-text">Número de Documento</span></label>
              <input
                type="text"
                className="input input-bordered"
                placeholder="Ingresá el documento"
                value={buscarDocumento}
                onChange={(e) => setBuscarDocumento(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && buscarClienteManual()}
              />
            </div>
            <button className="btn btn-primary gap-2" onClick={buscarClienteManual}>
              <Search size={20} /> Buscar
            </button>
            <button className="btn btn-ghost" onClick={limpiarBusquedaDocumento}>Limpiar</button>
          </div>
        </div>
      </div>

      {/* Tabla de clientes */}
      <DataTable
        table={table}
        columns={columns}
        emptyMessage="No se encontraron clientes con los criterios de búsqueda"
        isLoading={cargando}
        showActions={esAdmin}
        renderActions={(row) => (
          <div className="flex gap-1">
            <button className="btn btn-ghost btn-xs" onClick={() => abrirModalEditar(row)} title="Editar">
              <Edit size={16} />
            </button>
            <button className="btn btn-ghost btn-xs text-error" onClick={() => eliminarCliente(row.idCliente)} title="Eliminar">
              <Trash2 size={16} />
            </button>
          </div>
        )}
        parentRef={parentRef}
      />

      {/* Modal de Crear/Editar */}
      {mostrarModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg bg-base-100 border border-base-200 shadow-xl">
            <h3 className="text-lg font-bold mb-4">{editando ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="form-control mb-4">
                <label className="label"><span className="label-text">Tipo de Documento</span></label>
                <select className={`select select-bordered ${errors.tipoDocumento ? 'select-error' : ''}`} {...register('tipoDocumento')}>
                  {tiposDocumento.map((t) => (<option key={t.codigo} value={t.codigo}>{t.descripcion}</option>))}
                </select>
              </div>
              <div className="form-control mb-4">
                <label className="label"><span className="label-text">Número de Documento</span></label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className={`input input-bordered flex-1 ${errors.documento ? 'input-error' : ''}`}
                    {...register('documento')}
                  />
                  <button
                    type="button"
                    className="btn btn-outline btn-primary"
                    onClick={verificarDni}
                    disabled={consultandoReniec}
                  >
                    {consultandoReniec ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      <CheckCircle size={18} />
                    )}
                    Verificar
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="form-control"><label className="label"><span className="label-text">Nombres</span></label><input type="text" className={`input input-bordered ${errors.nombres ? 'input-error' : ''}`} {...register('nombres')} /></div>
                <div className="form-control"><label className="label"><span className="label-text">Apellidos</span></label><input type="text" className={`input input-bordered ${errors.apellidos ? 'input-error' : ''}`} {...register('apellidos')} /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="form-control"><label className="label"><span className="label-text">Teléfono</span></label><input type="text" className="input input-bordered" {...register('telefono')} /></div>
                <div className="form-control"><label className="label"><span className="label-text">Correo electrónico</span></label><input type="text" className={`input input-bordered ${errors.email ? 'input-error' : ''}`} {...register('email')} /></div>
              </div>
              <div className="form-control mb-4"><label className="label"><span className="label-text">Nacionalidad</span></label><input type="text" className="input input-bordered" {...register('nacionalidad')} /></div>
              <div className="form-control mb-4"><label className="label"><span className="label-text">Dirección</span></label><textarea className="textarea textarea-bordered" {...register('direccion')}></textarea></div>
              <div className="form-control mb-6">
                <label className="label"><span className="label-text">Fecha de Nacimiento</span></label>
                <Controller name="fechaNacimiento" control={control} render={({ field }) => (
                  <div className="flex justify-center">
                    <DayPicker
                      mode="single"
                      selected={field.value ? new Date(field.value + 'T00:00:00') : undefined}
                      onSelect={(date) => { if (date) { field.onChange(format(date, 'yyyy-MM-dd')); } else { field.onChange(''); } }}
                      captionLayout="dropdown"
                      startMonth={new Date(1960, 0)}
                      endMonth={new Date(2100, 11)}
                      className="bg-base-100 p-4 rounded-lg shadow-sm border border-base-300"
                    />
                  </div>
                )} />
              </div>
              <div className="modal-action">
                <button type="button" className="btn btn-ghost" onClick={cerrarModal}>Cancelar</button>
                <LoadingButton type="submit" isLoading={isSubmitting}>{editando ? 'Actualizar' : 'Crear'}</LoadingButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}