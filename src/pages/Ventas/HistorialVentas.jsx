import { useState, useEffect, useMemo } from 'react';
import {
    useReactTable, getCoreRowModel, getSortedRowModel,
    getFilteredRowModel, getPaginationRowModel,
    createColumnHelper,
} from '@tanstack/react-table';
import { isBefore, isAfter, isSameDay, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import api from '../../api/axios';
import swal from '../../lib/swal';
import { ShoppingCart, FileText } from 'lucide-react';
import PdfViewerModal from '../../components/ui/PdfViewerModal';
import DataTable from '../../components/ui/DataTable';
import TableFilters from '../../components/ui/TableFilters';

const columnHelper = createColumnHelper();

export default function HistorialVentas() {
    const [ventas, setVentas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [dateFilter, setDateFilter] = useState({ type: 'none', date: null, dateEnd: null });
    const [pdfUrl, setPdfUrl] = useState(null);
    const [mostrarPdf, setMostrarPdf] = useState(false);

    const cargarVentas = async () => {
        setCargando(true);
        try {
            const res = await api.get('/Venta');
            const data = Array.isArray(res.data) ? res.data : (res.data.items || []);
            setVentas(data);
        } catch (error) {
            swal.fire('Error', 'No se pudo cargar el historial de ventas', 'error');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => { cargarVentas(); }, []);

    const verPdf = async (idVenta) => {
        const url = "/Pdf/Venta/" + idVenta;
        setPdfUrl(url);
        setMostrarPdf(true);
    };

    const dataFiltrada = useMemo(() => {
        if (!dateFilter || dateFilter.type === 'none' || !dateFilter.date) return ventas;

        return ventas.filter(item => {
            const itemDate = new Date(item.fechaVenta);
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
    }, [ventas, dateFilter]);

    const columns = useMemo(() => [
        columnHelper.accessor('idVenta', {
            header: 'N° Venta',
            enableSorting: true,
            cell: info => <span className="font-bold text-primary">{"#" + info.getValue()}</span>
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
            cell: info => <span className="font-semibold text-success">{"S/ " + info.getValue().toFixed(2)}</span>
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

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <ShoppingCart size={28} /> Historial de Ventas
                    </h2>
                    <p className="text-sm text-base-content/60 mt-1">Consultá todas las ventas realizadas</p>
                </div>
            </div>

            <TableFilters
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
                dateFilter={dateFilter}
                setDateFilter={setDateFilter}
                placeholder="Buscar por N° venta, cliente..."
            />

            <DataTable
                table={table}
                columns={columns}
                emptyMessage="No se encontraron ventas con los criterios de búsqueda"
                isLoading={cargando}
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