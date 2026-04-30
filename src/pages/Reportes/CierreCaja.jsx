import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { TrendingUp, CalendarDays, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import swal from '../../lib/swal';

export default function CierreCaja() {
  const hoy = new Date();
  const [fecha, setFecha] = useState(format(hoy, 'yyyy-MM-dd'));
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(false);

  const cargarCierre = async (fechaConsulta) => {
    setCargando(true);
    try {
      const res = await api.get('/Reporte/cierre-caja', {
        params: { fecha: fechaConsulta },
      });
      setDatos(res.data);
    } catch (error) {
      swal.fire('Error', 'No se pudo cargar el cierre de caja', 'error');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCierre(fecha);
  }, [fecha]);

  const totalGeneral = datos.reduce((sum, item) => sum + (item.ingresos || 0), 0);

  const metodosPagoTraducidos = {
    'Efectivo': 'Efectivo',
    'Tarjeta de Crédito / Débito': 'Tarjeta',
    'Transferencia bancaria (Yape/Plin)': 'Yape / Plin',
    'Depósito en cuenta': 'Depósito',
    'Otros': 'Otros',
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">
        <TrendingUp className="inline mr-2" size={28} />
        Cierre de Caja
      </h2>

      {/* Selector de fecha */}
      <div className="card bg-base-100 shadow-md mb-6">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="form-control">
              <label className="label justify-center">
                <span className="label-text">
                  <CalendarDays size={16} className="inline mr-1" />
                  Fecha
                </span>
              </label>
              <div className="flex justify-center">
                <DayPicker
                  mode="single"
                  selected={fecha ? new Date(fecha + 'T00:00:00') : undefined}
                  onSelect={(date) => {
                    if (date) {
                      setFecha(format(date, 'yyyy-MM-dd'));
                    } else {
                      setFecha('');
                    }
                  }}
                  className="bg-base-100 p-4 rounded-lg shadow-lg w-fit"
                />
              </div>
            </div>
            <div className="flex items-center">
              <button
                className="btn btn-primary"
                onClick={() => cargarCierre(fecha)}
                disabled={cargando}
              >
                {cargando ? 'Cargando...' : 'Consultar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de ingresos */}
      <div className="card bg-base-100 shadow-md mb-6">
        <div className="card-body">
          <h3 className="card-title mb-4">
            Ingresos del {fecha ? format(new Date(fecha + 'T00:00:00'), 'dd/MM/yyyy') : '—'}
          </h3>
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Concepto</th>
                  <th>Método de Pago</th>
                  <th>Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {datos.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center text-gray-500 py-8">
                      {cargando ? 'Cargando...' : 'Sin movimientos para esta fecha'}
                    </td>
                  </tr>
                ) : (
                  datos.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.concepto}</td>
                      <td>{metodosPagoTraducidos[item.metodoPago] || item.metodoPago}</td>
                      <td className="font-semibold">S/ {item.ingresos?.toFixed(2) ?? '0.00'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {datos.length > 0 && (
            <div className="mt-4 text-right">
              <p className="text-lg font-bold">
                <DollarSign size={20} className="inline mr-1" />
                Total General: S/ {totalGeneral.toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}