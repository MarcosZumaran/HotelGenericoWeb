import { useState, useEffect, useMemo } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import {
    useReactTable, getCoreRowModel, getSortedRowModel,
    flexRender, createColumnHelper,
} from '@tanstack/react-table';
import api from '../../api/axios';
import swal from '../../lib/swal';
import { ShoppingCart, FileText, DollarSign, User, CalendarDays } from 'lucide-react';
import PdfViewerModal from '../../components/ui/PdfViewerModal';
import Paginacion from '../../components/ui/Paginacion';

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
        } catch (error) { swal.fire('Error', 'No se pudo cargar el historial de ventas', 'error'); }
        finally { setCargando(false); }
    };

    useEffect(() => { cargarVentas(); }, [page]);

    const handlePageChange = (newPage) => { setPage(newPage); cargarVentas(newPage); };

    const columns = useMemo(() => [
        columnHelper.accessor('idVenta', { header: 'N° Venta', enableSorting: true, cell: info => <span className="font-bold text-primary">#{info.getValue()}</span> }),
        columnHelper.accessor('clienteNombre', { header: 'Cliente', enableSorting: true }),
        columnHelper.accessor('fechaVenta', { header: 'Fecha', enableSorting: true, cell: info => new Date(info.getValue()).toLocaleString('es-PE') }),
        columnHelper.accessor('total', { header: 'Total', enableSorting: true, cell: info => <span className="font-semibold text-success">S/ {info.getValue().toFixed(2)}</span> }),
        columnHelper.accessor('metodoPago', {
            header: 'Método de Pago', enableSorting: true,
            cell: info => {
                const metodos = { '005': 'Efectivo', '006': 'Tarjeta', '008': 'Yape/Plin', '001': 'Depósito' };
                return <span className="badge badge-ghost">{metodos[info.getValue()] || info.getValue()}</span>;
            },
        }),
    ], []);

    const table = useReactTable({
        data: ventas, columns, state: { sorting }, onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(),
    });

    const verPdf = async (idVenta) => {
        try {
            const res = await api.get(`/Pdf/Venta/${idVenta}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            setPdfUrl(url); setMostrarPdf(true);
        } catch (error) { swal.fire('Error', 'No se pudo generar el PDF', 'error'); }
    };

    if (cargando && ventas.length === 0) return <div className="flex justify-center items-center h-64"><span className="loading loading-spinner loading-lg"></span></div>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6"><ShoppingCart className="inline mr-2" size={28} />Historial de Ventas</h2>
            <div className="card bg-base-100 shadow-md">
                <div className="card-body">
                    <div className="overflow-x-auto">
                        <table className="table table-zebra">
                            <thead>
                                {table.getHeaderGroups().map(hg => (
                                    <tr key={hg.id}>
                                        {hg.headers.map(header => (
                                            <th key={header.id} onClick={header.column.getToggleSortingHandler()} className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}>
                                                {flexRender(header.column.columnDef.header, header.getContext())}{header.column.getIsSorted() === 'asc' && ' 🔼'}{header.column.getIsSorted() === 'desc' && ' 🔽'}
                                            </th>
                                        ))}
                                        <th>PDF</th>
                                    </tr>
                                ))}
                            </thead>
                            <tbody ref={parentRef}>
                                {table.getRowModel().rows.map(row => (
                                    <tr key={row.id} className="hover:bg-base-200/50 transition-colors">
                                        {row.getVisibleCells().map(cell => (<td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>))}
                                        <td><button className="btn btn-ghost btn-xs" onClick={() => verPdf(row.original.idVenta)} title="Ver PDF"><FileText size={16} /></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Paginacion page={page} pageSize={pageSize} totalItems={totalItems} onPageChange={handlePageChange} />
                </div>
            </div>
            {mostrarPdf && <PdfViewerModal pdfUrl={pdfUrl} onClose={() => { setMostrarPdf(false); setPdfUrl(null); }} />}
        </div>
    );
}