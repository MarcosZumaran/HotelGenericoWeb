import { useState, useEffect } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import api from '../../api/axios';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

export default function PdfViewerModal({ pdfUrl, onClose }) {
    const [blobUrl, setBlobUrl] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarPdf = async () => {
            // Si ya es un blob URL (creado fuera), lo usamos directamente
            if (pdfUrl.startsWith('blob:')) {
                setBlobUrl(pdfUrl);
                setCargando(false);
                return;
            }

            try {
                // Si es una URL de API, la descargamos usando axios (con token)
                const response = await api.get(pdfUrl, { responseType: 'blob' });
                const url = window.URL.createObjectURL(response.data);
                setBlobUrl(url);
            } catch (err) {
                console.error('Error al cargar PDF:', err);
                setError('No se pudo cargar el PDF. Verifique su conexión o permisos.');
            } finally {
                setCargando(false);
            }
        };

        if (pdfUrl) {
            cargarPdf();
        }

        return () => {
            // Solo revocamos si nosotros creamos el blob
            if (blobUrl && !pdfUrl.startsWith('blob:')) {
                window.URL.revokeObjectURL(blobUrl);
            }
        };
    }, [pdfUrl]);

    const handleDownload = () => {
        if (!blobUrl) return;
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = 'comprobante.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handlePrint = () => {
        if (!blobUrl) return;
        const newWindow = window.open(blobUrl, '_blank');
        if (newWindow) {
            newWindow.onload = () => {
                newWindow.print();
            };
        } else {
            alert('El navegador bloqueó la ventana emergente. Permita las ventanas emergentes para imprimir.');
        }
    };

    if (!pdfUrl) return null;

    return (
        <div className="modal modal-open z-[1000]">
            <div className="modal-box w-full max-w-5xl h-[90vh] flex flex-col bg-base-100 border border-base-200 shadow-xl p-0 overflow-hidden">
                {/* Barra superior */}
                <div className="flex justify-between items-center p-4 border-b border-base-200">
                    <h3 className="text-lg font-bold">Vista previa del comprobante</h3>
                    <div className="flex gap-2">
                        <button
                            className="btn btn-primary btn-sm gap-1"
                            onClick={handleDownload}
                            disabled={cargando || !!error}
                        >
                            Descargar
                        </button>
                        <button
                            className="btn btn-secondary btn-sm gap-1"
                            onClick={handlePrint}
                            disabled={cargando || !!error}
                        >
                            Imprimir
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={onClose}>
                            ✕
                        </button>
                    </div>
                </div>

                {/* Visor de PDF */}
                <div className="flex-1 relative bg-base-200">
                    {cargando && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-base-100/50 z-10">
                            <span className="loading loading-spinner loading-lg text-primary"></span>
                            <p className="mt-2 text-sm font-medium">Cargando documento...</p>
                        </div>
                    )}

                    {error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                            <p className="text-error font-bold mb-2">Error</p>
                            <p className="text-sm">{error}</p>
                            <button className="btn btn-sm mt-4" onClick={onClose}>Cerrar</button>
                        </div>
                    )}

                    {!cargando && !error && blobUrl && (
                        <div className="h-full overflow-auto">
                            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                                <Viewer fileUrl={blobUrl} />
                            </Worker>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
