import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { checkinSchema } from './checkinSchema';
import api from '../../api/axios';
import { UserPlus, Bed, Calendar, CreditCard, Search, Hash, Phone } from 'lucide-react';
import swal from '../../lib/swal';
import LoadingButton from '../../components/ui/LoadingButton';

export default function CheckIn() {
  const [habitaciones, setHabitaciones] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [buscarDocumento, setBuscarDocumento] = useState('');
  const [tipoBusqueda, setTipoBusqueda] = useState('1');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(checkinSchema),
    defaultValues: {
      usarClienteAnonimo: false,
      tipoDocumento: '1',
      metodoPago: '005',
    },
  });

  const usarAnonimo = watch('usarClienteAnonimo');

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    const cargarHabitaciones = async () => {
      try {
        const res = await api.get('/Habitacion');
        const disponibles = res.data.filter((h) => h.nombreEstado === 'Disponible');
        setHabitaciones(disponibles);
      } catch (error) {
        console.error('Error al cargar habitaciones:', error);
      }
    };
    cargarHabitaciones();
  }, []);

  const buscarCliente = async () => {
    if (!buscarDocumento.trim()) {
      swal.fire('Atención', 'Ingresá un número de documento', 'warning');
      return;
    }
    try {
      const res = await api.get(`/Cliente/documento/${tipoBusqueda}/${buscarDocumento}`);
      if (res.data) {
        setValue('nombres', res.data.nombres);
        setValue('apellidos', res.data.apellidos);
        setValue('telefono', res.data.telefono ?? '');
        swal.fire('Cliente encontrado', '', 'success');
      }
    } catch (error) {
      if (error.response?.status === 404) {
        swal.fire('Nuevo cliente', 'Cliente no encontrado, completá los datos', 'info');
      } else {
        swal.fire('Error', 'Error al buscar cliente', 'error');
      }
    }
  };

  const toggleAnonimo = () => {
    const nuevoValor = !usarAnonimo;
    setValue('usarClienteAnonimo', nuevoValor);
    if (nuevoValor) {
      setValue('tipoDocumento', '0');
      setValue('documento', '00000000');
      setValue('nombres', 'CLIENTE');
      setValue('apellidos', 'ANONIMO');
      setValue('telefono', '');
    } else {
      setValue('tipoDocumento', '1');
      setValue('documento', '');
      setValue('nombres', '');
      setValue('apellidos', '');
      setValue('telefono', '');
    }
  };

  const onSubmit = async (data) => {
    setCargando(true);
    try {
      const res = await api.post('/Estancia/checkin', data);
      swal.fire({
        icon: 'success',
        title: '¡Check‑In exitoso!',
        html: `
          <p>Estancia N° <strong>${res.data.idEstancia}</strong></p>
          <p>Monto: <strong>S/ ${res.data.montoTotal.toFixed(2)}</strong></p>
          <p>Habitación: <strong>${res.data.numeroHabitacion}</strong></p>
        `,
        confirmButtonText: 'Aceptar',
      });
      reset({
        usarClienteAnonimo: false,
        tipoDocumento: '1',
        metodoPago: '005',
      });
      setBuscarDocumento('');
      const habRes = await api.get('/Habitacion');
      setHabitaciones(habRes.data.filter((h) => h.nombreEstado === 'Disponible'));
    } catch (error) {
      const mensaje =
        error.response?.data?.mensaje || 'Error al realizar el Check‑In';
      swal.fire('Error', mensaje, 'error');
    } finally {
      setCargando(false);
    }
  };

  const tiposDocumento = [
    { codigo: '1', descripcion: 'DNI' },
    { codigo: '7', descripcion: 'Pasaporte' },
    { codigo: '6', descripcion: 'RUC' },
  ];

  const metodosPago = [
    { codigo: '005', descripcion: 'Efectivo' },
    { codigo: '006', descripcion: 'Tarjeta Crédito/Débito' },
    { codigo: '008', descripcion: 'Yape / Plin' },
    { codigo: '001', descripcion: 'Depósito en cuenta' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">
        <UserPlus className="inline mr-2" size={28} />
        Check‑In
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Columna izquierda: Cliente */}
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <h3 className="card-title mb-4">
                <Search size={20} /> Datos del Cliente
              </h3>

              <div className="form-control mb-4">
                <label className="label cursor-pointer justify-start gap-3">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={usarAnonimo}
                    onChange={toggleAnonimo}
                  />
                  <span className="label-text">Cliente anónimo (boleta ≤ S/ 700)</span>
                </label>
              </div>

              {!usarAnonimo && (
                <>
                  <div className="flex gap-2 mb-4">
                    <select
                      className="select select-bordered w-1/4"
                      value={tipoBusqueda}
                      onChange={(e) => setTipoBusqueda(e.target.value)}
                    >
                      {tiposDocumento.map((t) => (
                        <option key={t.codigo} value={t.codigo}>
                          {t.descripcion}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="N° Documento"
                      className="input input-bordered flex-1"
                      value={buscarDocumento}
                      onChange={(e) => setBuscarDocumento(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && buscarCliente()}
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={buscarCliente}
                    >
                      <Search size={18} /> Buscar
                    </button>
                  </div>

                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Tipo Documento</span>
                    </label>
                    <select
                      className={`select select-bordered ${errors.tipoDocumento ? 'select-error' : ''}`}
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

                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Número Documento</span>
                    </label>
                    <input
                      type="text"
                      className={`input input-bordered ${errors.documento ? 'input-error' : ''}`}
                      {...register('documento')}
                    />
                    {errors.documento && (
                      <span className="label-text-alt text-error">
                        {errors.documento.message}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Nombres</span>
                      </label>
                      <input
                        type="text"
                        className={`input input-bordered ${errors.nombres ? 'input-error' : ''}`}
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
                        className={`input input-bordered ${errors.apellidos ? 'input-error' : ''}`}
                        {...register('apellidos')}
                      />
                      {errors.apellidos && (
                        <span className="label-text-alt text-error">
                          {errors.apellidos.message}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Teléfono</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      {...register('telefono')}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Columna derecha: Habitación y pago */}
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <h3 className="card-title mb-4">
                <Bed size={20} /> Habitación y Pago
              </h3>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Habitación</span>
                </label>
                <select
                  className={`select select-bordered ${errors.idHabitacion ? 'select-error' : ''}`}
                  {...register('idHabitacion')}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Seleccioná una habitación disponible
                  </option>
                  {habitaciones.map((h) => (
                    <option key={h.idHabitacion} value={h.idHabitacion}>
                      {h.numeroHabitacion} — {h.nombreTipo} (S/ {h.precioNoche.toFixed(2)})
                    </option>
                  ))}
                </select>
                {errors.idHabitacion && (
                  <span className="label-text-alt text-error">
                    {errors.idHabitacion.message}
                  </span>
                )}
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Fecha de Check‑Out prevista</span>
                </label>
                <Controller
                  name="fechaCheckoutPrevista"
                  control={control}
                  render={({ field }) => (
                    <div className="flex justify-center">
                      <DayPicker
                        mode="single"
                        selected={field.value ? new Date(field.value + 'T00:00:00') : undefined}
                        onSelect={(date) => {
                          if (date) {
                            field.onChange(format(date, 'yyyy-MM-dd'));
                          } else {
                            field.onChange('');
                          }
                        }}
                        className="bg-base-100 p-4 rounded-lg shadow-lg"
                      />
                    </div>
                  )}
                />
                {errors.fechaCheckoutPrevista && (
                  <span className="label-text-alt text-error mt-1 block">
                    {errors.fechaCheckoutPrevista.message}
                  </span>
                )}
              </div>

              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text">Método de Pago</span>
                </label>
                <select
                  className={`select select-bordered ${errors.metodoPago ? 'select-error' : ''}`}
                  {...register('metodoPago')}
                >
                  {metodosPago.map((m) => (
                    <option key={m.codigo} value={m.codigo}>
                      {m.descripcion}
                    </option>
                  ))}
                </select>
                {errors.metodoPago && (
                  <span className="label-text-alt text-error">
                    {errors.metodoPago.message}
                  </span>
                )}
              </div>

              <LoadingButton
                type="submit"
                isLoading={isLoading}
                className="w-full"
              >
                Entrar
              </LoadingButton>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}