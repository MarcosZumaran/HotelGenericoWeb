import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import { useSignalR } from '../../hooks/useSignalR';
import toast from 'react-hot-toast';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { Receipt, Eye, SendHorizontal, FileText } from 'lucide-react';
import swal from '../../lib/swal';
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  getFilteredRowModel, getPaginationRowModel,
  createColumnHelper,
} from '@tanstack/react-table';
import PdfViewerModal from '../../components/ui/PdfViewerModal';
import DataTable from '../../components/ui/DataTable';
import TableFilters from '../../components/ui/TableFilters';
import { isBefore, isAfter, isSameDay, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

const columnHelper = createColumnHelper();

export default function ComprobanteList() {
  const { user } = useAuth();
  const esAdmin = user?.nombreRol === 'Administrador';

  const [comprobantes, setComprobantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [enviandoId, setEnviandoId] = useState(null);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [dateFilter, setDateFilter] = useState({ type: 'none', date: null, dateEnd: null });
  const [pdfUrl, setPdfUrl] = useState(null);
  const [mostrarPdf, setMostrarPdf] = useState(false);
  const [parentRef] = useAutoAnimate();

  const cargarComprobantes = async () => {
    setCargando(true);
    try {
      // Traemos todos los comprobantes (sin paginación) para filtrar en cliente
      const res = await api.get('/Comprobante', { params: { pageSize: 9999 } });
      const data = res.data.items || res.data;
      setComprobantes(Array.isArray(data) ? data : []);
    } catch (error) {
      swal.fire('Error', 'No se pudieron cargar los comprobantes', 'error');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarComprobantes(); }, []);

  useSignalR('ComprobanteEmitido', (data) => {
    toast(`🧾 Nuevo comprobante: ${data.tipo} #${data.idComprobante} - S/ ${data.monto.toFixed(2)}`, {
      icon: '📄',
      duration: 4000,
    });
    cargarComprobantes();
  });

  // Filtro por fecha sobre fechaEmision
  const dataFiltrada = useMemo(() => {
    if (!dateFilter || dateFilter.type === 'none' || !dateFilter.date) return comprobantes;

    return comprobantes.filter(item => {
      const itemDate = new Date(item.fechaEmision);
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
  }, [comprobantes, dateFilter]);

  const columns = useMemo(() => [
    columnHelper.accessor('idComprobante', { header: 'N°', enableSorting: true, cell: info => <span className="font-bold">{info.getValue()}</span> }),
    columnHelper.accessor('serie', { header: 'Serie', enableSorting: true, cell: info => `${info.getValue()}-${info.row.original.correlativo}` }),
    columnHelper.accessor('tipoComprobante', { header: 'Tipo', enableSorting: true, cell: info => (info.getValue() === '03' ? 'Boleta' : 'Factura') }),
    columnHelper.accessor('fechaEmision', { header: 'Fecha', enableSorting: true, cell: info => new Date(info.getValue()).toLocaleDateString('es-PE') }),
    columnHelper.accessor('montoTotal', { header: 'Monto', enableSorting: true, cell: info => `S/ ${info.getValue().toFixed(2)}` }),
    columnHelper.accessor('clienteNombre', { header: 'Cliente', enableSorting: true }),
    columnHelper.accessor('nombreEstadoSunat', {
      header: 'Estado SUNAT', enableSorting: true,
      cell: info => {
        const idEstado = info.row.original.idEstadoSunat;
        const clases = { 1: 'badge-warning', 2: 'badge-info', 3: 'badge-success', 4: 'badge-error', 5: 'badge-ghost', 6: 'badge-outline' };
        return <span className={`badge ${clases[idEstado] || 'badge-ghost'}`}>{info.getValue() ?? '—'}</span>;
      },
    }),
  ], []);

  const table = useReactTable({
    data: dataFiltrada,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 }
    }
  });

  const verDetalle = async (id) => {
    try {
      const res = await api.get(`/Comprobante/${id}`);
      const c = res.data;
      swal.fire({
        title: `Comprobante ${c.serie}-${c.correlativo}`,
        html: `<div class="text-left space-y-2"><p><strong>Tipo:</strong> ${c.tipoComprobante === '03' ? 'Boleta' : 'Factura'}</p><p><strong>Fecha:</strong> ${new Date(c.fechaEmision).toLocaleString('es-PE')}</p><p><strong>Monto:</strong> S/ ${c.montoTotal.toFixed(2)}</p><p><strong>IGV:</strong> S/ ${c.igvMonto.toFixed(2)}</p><p><strong>Cliente:</strong> ${c.clienteNombre}</p><p><strong>Documento:</strong> ${c.clienteDocumentoTipo === '1' ? 'DNI' : 'PAS'}: ${c.clienteDocumentoNum}</p><p><strong>Método de pago:</strong> ${c.metodoPago}</p><p><strong>Estado SUNAT:</strong> <span class="badge ${c.idEstadoSunat === 3 ? 'badge-success' : 'badge-warning'}">${c.nombreEstadoSunat ?? 'Pendiente'}</span></p>${c.fechaEnvio ? `<p><strong>Enviado:</strong> ${new Date(c.fechaEnvio).toLocaleString('es-PE')}</p>` : ''}</div>`,
        confirmButtonText: 'Cerrar',
      });
    } catch (error) { swal.fire('Error', 'No se pudo cargar el detalle del comprobante', 'error'); }
  };

  const marcarEnviado = async (id) => {
    const confirmacion = await swal.fire({ title: '¿Marcar como enviado a SUNAT?', text: 'Simulá la confirmación de envío electrónico.', icon: 'question', showCancelButton: true, confirmButtonText: 'Sí, marcar como enviado', cancelButtonText: 'Cancelar' });
    if (!confirmacion.isConfirmed) return;
    setEnviandoId(id);
    try {
      await api.post(`/Comprobante/${id}/enviar`, '"hash_simulado"', { headers: { 'Content-Type': 'application/json' } });
      swal.fire('Enviado', 'Comprobante marcado como enviado a SUNAT.', 'success'); cargarComprobantes();
    } catch (error) { swal.fire('Error', 'No se pudo actualizar el estado del comprobante', 'error'); }
    finally { setEnviandoId(null); }
  };

  const verPdf = async (idComprobante) => {
    try {
      const res = await api.get(`/Pdf/Comprobante/${idComprobante}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      setPdfUrl(url); setMostrarPdf(true);
    } catch (error) { swal.fire('Error', 'No se pudo generar el PDF', 'error'); }
  };

  return (
    <div>
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Receipt size={28} /> Comprobantes
          </h2>
          <p className="text-sm text-base-content/60 mt-1">Consultá todos los comprobantes emitidos</p>
        </div>
      </div>

      {/* Filtros */}
      <TableFilters
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        placeholder="Buscar por serie, cliente, estado..."
        showDateFilter={true}
      />

      {/* Tabla */}
      <DataTable
        table={table}
        columns={columns}
        emptyMessage="No se encontraron comprobantes con los criterios de búsqueda"
        isLoading={cargando}
        showActions={true}
        renderActions={(row) => (
          <div className="flex gap-1">
            <button className="btn btn-ghost btn-xs" onClick={() => verPdf(row.idComprobante)} title="Ver PDF">
              <FileText size={16} />
            </button>
            <button className="btn btn-ghost btn-xs" onClick={() => verDetalle(row.idComprobante)} title="Ver detalle">
              <Eye size={16} />
            </button>
            {esAdmin && row.idEstadoSunat === 1 && (
              <button
                className="btn btn-ghost btn-xs text-info"
                onClick={() => marcarEnviado(row.idComprobante)}
                disabled={enviandoId === row.idComprobante}
                title="Marcar como enviado"
              >
                {enviandoId === row.idComprobante ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <SendHorizontal size={16} />
                )}
              </button>
            )}
          </div>
        )}
        parentRef={parentRef}
        paginacion={{
          page: table.getState().pagination.pageIndex + 1,
          pageSize: table.getState().pagination.pageSize,
          totalItems: table.getFilteredRowModel().rows.length,
          onPageChange: (p) => table.setPageIndex(p - 1)
        }}
      />

      {mostrarPdf && <PdfViewerModal pdfUrl={pdfUrl} onClose={() => { setMostrarPdf(false); setPdfUrl(null); }} />}
    </div>
  );
}