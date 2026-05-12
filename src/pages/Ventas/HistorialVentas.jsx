import { useState, useEffect, useMemo } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import {
    useReactTable, getCoreRowModel, getSortedRowModel,
    createColumnHelper,
} from '@tanstack/react-table';
import api from '../../api/axios';
import swal from '../../lib/swal';
import { ShoppingCart, FileText } from 'lucide-react';
import PdfViewerModal from '../../components/ui/PdfViewerModal';
import DataTable from '../../components/ui/DataTable';

const columnHelper = createColumnHelper();

export default function HistorialVentas() {
    const [ventas, setVentas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [sorting, setSorting] = useState([]);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [mostrarPdf, setMostrarPdf] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [parentRef] = useAutoAnimate();

    const cargarVentas = async (pagina = page) => {
        setCargando(true);
        try {
            const res = await api.get('/Venta', { params: { page: pagina, pageSize } });
            setVentas(res.data.items);
            setTotalItems(res.data.totalItems);
        } catch (error) {
            swal.fire('Error', 'No se pudo cargar el historial de ventas', 'error');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => { cargarVentas(); }, [page]);

    const handlePageChange = (newPage) => { setPage(newPage); cargarVentas(newPage); };

    const verPdf = async (idVenta) => {
        try {
            const res = await api.get(`/Pdf/Venta/${idVenta}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            setPdfUrl(url); setMostrarPdf(true);
        } catch (error) {
            swal.fire('Error', 'No se pudo generar el PDF', 'error');
        }
    };

    const columns = useMemo(() => [
        columnHelper.accessor('idVenta', {
            header: 'N° Venta',
            enableSorting: true,
            cell: info => <span className="font-bold text-primary">#{info.getValue()}</span>
        }),
        columnHelper.accessor('clienteNombre', {
            header: 'Cliente',
            enableSorting: true,
        }),
        columnHelper.accessor('fechaVenta', {
            header: 'Fecha',
            enableSorting: true,
            cell: info => new Date(info.getValue()).toLocaleString('es-PE')
        }),
        columnHelper.accessor('total', {
            header: 'Total',
            enableSorting: true,
            cell: info => <span className="font-semibold text-success">S/ {info.getValue().toFixed(2)}</span>
        }),
        columnHelper.accessor('metodoPago', {
            header: 'Método de Pago',
            enableSorting: true,
            cell: info => {
                const metodos = { '005': 'Efectivo', '006': 'Tarjeta', '008': 'Yape/Plin', '001': 'Depósito' };
                return <span className="badge badge-ghost">{metodos[info.getValue()] || info.getValue()}</span>;
            },
        }),
        columnHelper.display({
            id: 'pdf',
            header: 'PDF',
            cell: ({ row }) => (
                <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => verPdf(row.original.idVenta)}
                    title="Ver PDF"
                >
                    <FileText size={16} />
                </button>
            ),
        }),
    ], []);

    const table = useReactTable({
        data: ventas, columns, state: { sorting }, onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(),
    });

    const paginacion = {
        page,
        pageSize,
        totalItems,
        onPageChange: handlePageChange,
    };

    return (
        <div>
            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <ShoppingCart size={28} /> Historial de Ventas
                    </h2>
                    <p className="text-sm text-base-content/60 mt-1">Consultá todas las ventas realizadas</p>
                </div>
            </div>

            {/* Tabla */}
            <DataTable
                table={table}
                columns={columns}
                emptyMessage="No hay ventas registradas"
                paginacion={paginacion}
                isLoading={cargando}
                parentRef={parentRef}
            />

            {mostrarPdf && <PdfViewerModal pdfUrl={pdfUrl} onClose={() => { setMostrarPdf(false); setPdfUrl(null); }} />}
        </div>
    );
}