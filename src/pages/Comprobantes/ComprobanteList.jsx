import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import Swal from 'sweetalert2';
import { Receipt, Search, Eye, SendHorizontal } from 'lucide-react';

export default function ComprobanteList() {
  const { user } = useAuth();
  const esAdmin = user?.nombreRol === 'Administrador';

  const [comprobantes, setComprobantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [enviandoId, setEnviandoId] = useState(null);

  const cargarComprobantes = async () => {
    try {
      const res = await api.get('/Comprobante');
      setComprobantes(res.data);
    } catch (error) {
      Swal.fire('Error', 'No se pudieron cargar los comprobantes', 'error');
    } finally {
      setCargando(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    cargarComprobantes();
  }, []);

  const verDetalle = async (id) => {
    try {
      const res = await api.get(`/Comprobante/${id}`);
      const c = res.data;
      Swal.fire({
        title: `Comprobante ${c.serie}-${c.correlativo}`,
        html: `
          <div class="text-left space-y-2">
            <p><strong>Tipo:</strong> ${c.tipoComprobante === '03' ? 'Boleta' : 'Factura'}</p>
            <p><strong>Fecha:</strong> ${new Date(c.fechaEmision).toLocaleString('es-PE')}</p>
            <p><strong>Monto:</strong> S/ ${c.montoTotal.toFixed(2)}</p>
            <p><strong>IGV:</strong> S/ ${c.igvMonto.toFixed(2)}</p>
            <p><strong>Cliente:</strong> ${c.clienteNombre}</p>
            <p><strong>Documento:</strong> ${c.clienteDocumentoTipo === '1' ? 'DNI' : 'PAS'}: ${c.clienteDocumentoNum}</p>
            <p><strong>Método de pago:</strong> ${c.metodoPago}</p>
            <p><strong>Estado SUNAT:</strong> <span class="badge ${c.idEstadoSunat === 3 ? 'badge-success' : 'badge-warning'}">${c.nombreEstadoSunat ?? 'Pendiente'}</span></p>
            ${c.fechaEnvio ? `<p><strong>Enviado:</strong> ${new Date(c.fechaEnvio).toLocaleString('es-PE')}</p>` : ''}
          </div>
        `,
        confirmButtonText: 'Cerrar',
      });
    } catch (error) {
      Swal.fire('Error', 'No se pudo cargar el detalle del comprobante', 'error');
    }
  };

  const marcarEnviado = async (id) => {
    const confirmacion = await Swal.fire({
      title: '¿Marcar como enviado a SUNAT?',
      text: 'Simulá la confirmación de envío electrónico.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, marcar como enviado',
      cancelButtonText: 'Cancelar',
    });

    if (!confirmacion.isConfirmed) return;

    setEnviandoId(id);
    try {
      await api.post(`/Comprobante/${id}/enviar`, '"hash_simulado"', {
        headers: { 'Content-Type': 'application/json' },
      });
      Swal.fire('Enviado', 'Comprobante marcado como enviado a SUNAT.', 'success');
      cargarComprobantes();
    } catch (error) {
      Swal.fire('Error', 'No se pudo actualizar el estado del comprobante', 'error');
    } finally {
      setEnviandoId(null);
    }
  };

  const estadoBadge = (idEstado, nombre) => {
    const clases = {
      1: 'badge-warning', // Pendiente
      2: 'badge-info',    // Enviado
      3: 'badge-success', // Aceptado
      4: 'badge-error',   // Rechazado
      5: 'badge-ghost',   // Observado
      6: 'badge-outline', // Anulado
    };
    return <span className={`badge ${clases[idEstado] || 'badge-ghost'}`}>{nombre ?? '—'}</span>;
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          <Receipt className="inline mr-2" size={28} />
          Comprobantes
        </h2>
      </div>

      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Serie</th>
                  <th>Tipo</th>
                  <th>Fecha</th>
                  <th>Monto</th>
                  <th>Cliente</th>
                  <th>Estado SUNAT</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {comprobantes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-gray-500 py-8">
                      No se encontraron comprobantes.
                    </td>
                  </tr>
                ) : (
                  comprobantes.map((c) => (
                    <tr key={c.idComprobante}>
                      <td className="font-bold">{c.idComprobante}</td>
                      <td>{c.serie}-{c.correlativo}</td>
                      <td>{c.tipoComprobante === '03' ? 'Boleta' : 'Factura'}</td>
                      <td>{new Date(c.fechaEmision).toLocaleDateString('es-PE')}</td>
                      <td className="font-semibold">S/ {c.montoTotal.toFixed(2)}</td>
                      <td>{c.clienteNombre}</td>
                      <td>{estadoBadge(c.idEstadoSunat, c.nombreEstadoSunat)}</td>
                      <td>
                        <div className="flex gap-1">
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => verDetalle(c.idComprobante)}
                            title="Ver detalle"
                          >
                            <Eye size={16} />
                          </button>
                          {esAdmin && c.idEstadoSunat === 1 && (
                            <button
                              className="btn btn-ghost btn-xs text-info"
                              onClick={() => marcarEnviado(c.idComprobante)}
                              disabled={enviandoId === c.idComprobante}
                              title="Marcar como enviado"
                            >
                              {enviandoId === c.idComprobante ? (
                                <span className="loading loading-spinner loading-xs"></span>
                              ) : (
                                <SendHorizontal size={16} />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}