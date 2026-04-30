import { useState, useEffect, useMemo } from 'react';
import api from '../../api/axios';
import { TrendingUp, CalendarDays, DollarSign, FileText, Send } from 'lucide-react';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import swal from '../../lib/swal';
import PdfViewerModal from '../../components/ui/PdfViewerModal';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';

const columnHelper = createColumnHelper();

export default function CierreCaja() {
  const hoy = new Date();
  const [fecha, setFecha] = useState(format(hoy, 'yyyy-MM-dd'));
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [sorting, setSorting] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [mostrarPdf, setMostrarPdf] = useState(false);
  
  // --- NUEVOS ESTADOS PARA SUNAT ---
  const [estadoEnvio, setEstadoEnvio] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const columns = useMemo(
    () => [
      columnHelper.accessor('concepto', {
        header: 'Concepto',
        enableSorting: true,
      }),
      columnHelper.accessor('metodoPago', {
        header: 'Método de Pago',
        enableSorting: true,
        cell: info => {
          const metodosPagoTraducidos = {
            'Efectivo': 'Efectivo',
            'Tarjeta de Crédito / Débito': 'Tarjeta',
            'Transferencia bancaria (Yape/Plin)': 'Yape / Plin',
            'Depósito en cuenta': 'Depósito',
            'Otros': 'Otros',
          };
          return metodosPagoTraducidos[info.getValue()] || info.getValue();
        },
      }),
      columnHelper.accessor('ingresos', {
        header: 'Ingresos',
        enableSorting: true,
        cell: info => `S/ ${(info.getValue() ?? 0).toFixed(2)}`,
      }),
    ],
    []
  );

  const table = useReactTable({
    data: datos,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

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

  // --- NUEVA FUNCIÓN: cargar estado SUNAT ---
  const cargarEstadoEnvio = async (fechaConsulta) => {
    try {
      const res = await api.get('/Reporte/cierre-caja/estado-envio', {
        params: { fecha: fechaConsulta },
      });
      setEstadoEnvio(res.data);
    } catch (error) {
      console.error('Error al cargar estado de envío:', error);
    }
  };

  // Cargar datos y estado SUNAT cuando cambia la fecha
  useEffect(() => {
    cargarCierre(fecha);
    cargarEstadoEnvio(fecha);
  }, [fecha]);

  const totalGeneral = datos.reduce((sum, item) => sum + (item.ingresos || 0), 0);

  const generarPdf = () => {
    const url = `${import.meta.env.VITE_API_URL}/Pdf/CierreCaja?fecha=${fecha}`;
    setPdfUrl(url);
    setMostrarPdf(true);
  };

  // --- NUEVA FUNCIÓN: simular envío a SUNAT ---
  const enviarASunat = async () => {
    const confirmacion = await swal.fire({
      title: '¿Simular envío a SUNAT?',
      text: 'Se marcará el cierre de caja como enviado.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, enviar',
      cancelButtonText: 'Cancelar',
    });

    if (!confirmacion.isConfirmed) return;

    setEnviando(true);
    try {
      await api.post('/Reporte/cierre-caja/enviar', null, {
        params: { fecha },
      });
      swal.fire('Enviado', 'El cierre de caja fue marcado como enviado a SUNAT.', 'success');
      cargarEstadoEnvio(fecha);
    } catch (error) {
      swal.fire('Error', 'No se pudo simular el envío', 'error');
    } finally {
      setEnviando(false);
    }
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
                  captionLayout="dropdown"
                  startMonth={new Date(1960, 0)}
                  endMonth={new Date(2100, 11)}
                  className="bg-base-100 p-4 rounded-lg shadow-lg w-fit"
                />
              </div>
            </div>
            <div className="flex items-center">
              <button
                className="btn btn-primary"
                onClick={() => {
                  cargarCierre(fecha);
                  cargarEstadoEnvio(fecha);
                }}
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
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' && ' 🔼'}
                        {header.column.getIsSorted() === 'desc' && ' 🔽'}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center text-gray-500 py-8">
                      {cargando ? 'Cargando...' : 'Sin movimientos para esta fecha'}
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map(row => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Totales y acciones */}
          {datos.length > 0 && (
            <div className="mt-4 space-y-4">
              <div className="text-right">
                <p className="text-lg font-bold">
                  <DollarSign size={20} className="inline mr-1" />
                  Total General: S/ {totalGeneral.toFixed(2)}
                </p>
              </div>

              {/* Estado SUNAT y acciones */}
              <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4">
                {/* Estado de envío */}
                {estadoEnvio && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">Estado SUNAT:</span>
                    <span className={`badge ${estadoEnvio.idEstadoSunat === 2 ? 'badge-info' : estadoEnvio.idEstadoSunat === 3 ? 'badge-success' : 'badge-warning'}`}>
                      {estadoEnvio.nombreEstadoSunat ?? 'Pendiente'}
                    </span>
                    {estadoEnvio.fechaEnvio && (
                      <span className="text-xs text-gray-500">
                        ({new Date(estadoEnvio.fechaEnvio).toLocaleString('es-PE')})
                      </span>
                    )}
                  </div>
                )}

                {/* Botones */}
                <div className="flex gap-2">
                  {estadoEnvio && estadoEnvio.idEstadoSunat === 1 && (
                    <button
                      className="btn btn-sm btn-info"
                      onClick={enviarASunat}
                      disabled={enviando}
                    >
                      {enviando ? 'Enviando...' : <><Send size={16} className="mr-1" /> Enviar a SUNAT</>}
                    </button>
                  )}
                  <button className="btn btn-primary btn-sm" onClick={generarPdf}>
                    <FileText size={16} className="mr-1" /> Generar PDF
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de PDF */}
      {mostrarPdf && (
        <PdfViewerModal pdfUrl={pdfUrl} onClose={() => { setMostrarPdf(false); setPdfUrl(null); }} />
      )}
    </div>
  );
}