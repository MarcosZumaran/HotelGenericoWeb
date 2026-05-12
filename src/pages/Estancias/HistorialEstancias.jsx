import { useState, useEffect, useMemo } from 'react';
import {
    useReactTable, getCoreRowModel, getSortedRowModel,
    flexRender, createColumnHelper,
} from '@tanstack/react-table';
import api from '../../api/axios';
import swal from '../../lib/swal';
import { DoorOpen, FileText } from 'lucide-react';
import PdfViewerModal from '../../components/ui/PdfViewerModal';
import DataTable from '../../components/ui/DataTable';

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

    const verPdf = (idEstancia) => {
        const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5054/api'}/Pdf/Estancia/${idEstancia}`;
        setPdfUrl(url);
        setMostrarPdf(true);
    };

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
        columnHelper.display({
            id: 'pdf',
            header: 'PDF',
            cell: ({ row }) => (
                <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => verPdf(row.original.idEstancia)}
                    title="Ver PDF"
                >
                    <FileText size={16} />
                </button>
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
            <DataTable
                table={table}
                columns={columns}
                emptyMessage="No hay estancias registradas"
                isLoading={cargando}
            />

            {mostrarPdf && (
                <PdfViewerModal pdfUrl={pdfUrl} onClose={() => { setMostrarPdf(false); setPdfUrl(null); }} />
            )}
        </div>
    );
}