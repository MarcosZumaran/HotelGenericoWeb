import { useState, useEffect, useMemo } from 'react';
import {
    useReactTable, getCoreRowModel, getSortedRowModel,
    flexRender, createColumnHelper,
} from '@tanstack/react-table';
import api from '../../api/axios';
import swal from '../../lib/swal';
import { DoorOpen, FileText } from 'lucide-react';
import PdfViewerModal from '../../components/ui/PdfViewerModal';

const columnHelper = createColumnHelper();

export default function HistorialEstancias() {
    const [estancias, setEstancias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [sorting, setSorting] = useState([]);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [mostrarPdf, setMostrarPdf] = useState(false);

    useEffect(() => {
        api.get('/Estancia')
            .then(res => setEstancias(res.data))
            .catch(() => swal.fire('Error', 'No se pudo cargar el historial de estancias', 'error'))
            .finally(() => setCargando(false));
    }, []);

    const columns = useMemo(() => [
        columnHelper.accessor('idEstancia', { header: 'N° Estancia', enableSorting: true }),
        columnHelper.accessor('numeroHabitacion', { header: 'Habitación', enableSorting: true }),
        columnHelper.accessor('clienteNombreCompleto', { header: 'Cliente', enableSorting: true }),
        columnHelper.accessor('fechaCheckin', {
            header: 'Entrada',
            enableSorting: true,
            cell: info => new Date(info.getValue()).toLocaleString('es-PE'),
        }),
        columnHelper.accessor('fechaCheckoutPrevista', {
            header: 'Salida Prevista',
            enableSorting: true,
            cell: info => new Date(info.getValue()).toLocaleDateString('es-PE'),
        }),
        columnHelper.accessor('fechaCheckoutReal', {
            header: 'Salida Real',
            enableSorting: true,
            cell: info => info.getValue() ? new Date(info.getValue()).toLocaleString('es-PE') : '—',
        }),
        columnHelper.accessor('montoTotal', {
            header: 'Monto',
            enableSorting: true,
            cell: info => `S/ ${info.getValue().toFixed(2)}`,
        }),
        columnHelper.accessor('estado', {
            header: 'Estado',
            enableSorting: true,
            cell: info => (
                <span className={`badge ${info.getValue() === 'Activa' ? 'badge-warning' : 'badge-success'}`}>
                    {info.getValue()}
                </span>
            ),
        }),
    ], []);

    const table = useReactTable({
        data: estancias,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    const verPdf = (idEstancia) => {
        const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5054/api'}/Pdf/Estancia/${idEstancia}`;
        setPdfUrl(url);
        setMostrarPdf(true);
    };

    if (cargando) {
        return (
            <div className="flex justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    return (
        <div>
            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <DoorOpen size={28} /> Historial de Estancias
                    </h2>
                    <p className="text-sm text-base-content/60 mt-1">Consultá todas las estancias registradas</p>
                </div>
            </div>

            {/* Tabla */}
            <div className="card bg-base-100 shadow-sm border border-base-200">
                <div className="card-body p-0">
                    <div className="overflow-x-auto">
                        <table className="table table-zebra w-full [&_tbody_tr:nth-child(odd)]:bg-base-200/30">
                            <thead>
                                {table.getHeaderGroups().map(hg => (
                                    <tr key={hg.id}>
                                        {hg.headers.map(header => (
                                            <th
                                                key={header.id}
                                                onClick={header.column.getToggleSortingHandler()}
                                                className={`${header.column.getCanSort() ? 'cursor-pointer select-none hover:bg-base-200/50 transition-colors' : ''} text-sm font-semibold text-base-content/80`}
                                            >
                                                <div className="flex items-center gap-1">
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    {header.column.getIsSorted() === 'asc' && <span className="text-xs">🔼</span>}
                                                    {header.column.getIsSorted() === 'desc' && <span className="text-xs">🔽</span>}
                                                </div>
                                            </th>
                                        ))}
                                        <th className="text-sm font-semibold text-base-content/80">PDF</th>
                                    </tr>
                                ))}
                            </thead>
                            <tbody>
                                {table.getRowModel().rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="text-center text-base-content/50 py-8">
                                            No hay estancias registradas
                                        </td>
                                    </tr>
                                ) : (
                                    table.getRowModel().rows.map(row => (
                                        <tr key={row.id} className="hover:bg-base-200/50 transition-colors">
                                            {row.getVisibleCells().map(cell => (
                                                <td key={cell.id} className="text-base-content/90">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                            <td>
                                                <button
                                                    className="btn btn-ghost btn-xs"
                                                    onClick={() => verPdf(row.original.idEstancia)}
                                                    title="Ver PDF"
                                                >
                                                    <FileText size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {mostrarPdf && (
                <PdfViewerModal pdfUrl={pdfUrl} onClose={() => { setMostrarPdf(false); setPdfUrl(null); }} />
            )}
        </div>
    );
}