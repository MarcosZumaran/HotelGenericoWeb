import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ventaSchema } from './ventaSchema';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import swal from '../../lib/swal';
import LoadingButton from '../../components/ui/LoadingButton';
import { Plus, Search, ShoppingCart, Trash2, DollarSign, User } from 'lucide-react';

export default function VentaList() {
    const { user } = useAuth();
    const puedeVender = user?.nombreRol === 'Administrador' || user?.nombreRol === 'Recepcionista';

    const [productos, setProductos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [carrito, setCarrito] = useState([]);
    const [buscarCliente, setBuscarCliente] = useState('');
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [anadirProductoId, setAnadirProductoId] = useState('');
    const [cantidad, setCantidad] = useState(1);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue,
        watch
    } = useForm({
        resolver: zodResolver(ventaSchema),
        defaultValues: { metodoPago: '005' }
    });

    const cargarProductos = async () => {
        try {
            const res = await api.get('/Producto');
            setProductos(res.data);
        } catch (error) {
            swal.fire('Error', 'No se pudieron cargar los productos', 'error');
        }
    };

    useEffect(() => {
        cargarProductos();
    }, []);

    const buscarClientePorDocumento = async () => {
        if (!buscarCliente.trim()) return;
        try {
            const res = await api.get(`/Cliente/documento/1/${buscarCliente}`);
            if (res.data) {
                setClienteSeleccionado(res.data);
                swal.fire('Cliente encontrado', `${res.data.nombres} ${res.data.apellidos}`, 'success');
            }
        } catch (error) {
            if (error.response?.status === 404) {
                swal.fire('Cliente no encontrado', 'Se usará cliente anónimo', 'info');
                setClienteSeleccionado(null);
            } else {
                swal.fire('Error', 'Error al buscar el cliente', 'error');
            }
        }
    };

    const agregarAlCarrito = () => {
        if (!anadirProductoId) return;
        const producto = productos.find(p => p.idProducto === parseInt(anadirProductoId, 10));
        if (!producto) return;
        const nuevaCantidad = parseInt(cantidad, 10) || 1;

        setCarrito(prev => {
            const existente = prev.find(item => item.idProducto === producto.idProducto);
            if (existente) {
                return prev.map(item =>
                    item.idProducto === producto.idProducto
                        ? { ...item, cantidad: item.cantidad + nuevaCantidad }
                        : item
                );
            }
            return [...prev, { ...producto, cantidad: nuevaCantidad }];
        });
        setAnadirProductoId('');
        setCantidad(1);
    };

    const eliminarDelCarrito = (idProducto) => {
        setCarrito(prev => prev.filter(item => item.idProducto !== idProducto));
    };

    const totalVenta = carrito.reduce((sum, item) => sum + item.precioUnitario * item.cantidad, 0);

    const onSubmit = async (data) => {
        if (carrito.length === 0) {
            swal.fire('Atención', 'Agregá al menos un producto al carrito', 'warning');
            return;
        }

        // Validación de monto para cliente anónimo
        if (!clienteSeleccionado && totalVenta > 700) {
            swal.fire({
                icon: 'error',
                title: 'Límite de boleta anónima superado',
                text: 'Para montos mayores a S/ 700.00 es obligatorio identificar al comprador. Busque un cliente por su DNI.',
            });
            return;
        }

        setCargando(true);
        try {
            const payload = {
                idCliente: clienteSeleccionado?.idCliente || null,
                metodoPago: data.metodoPago,
                items: carrito.map(item => ({
                    idProducto: item.idProducto,
                    cantidad: item.cantidad,
                })),
            };

            const res = await api.post('/Venta', payload);
            swal.fire({
                icon: 'success',
                title: '¡Venta realizada!',
                html: `
          <p>Venta N° <strong>${res.data.idVenta}</strong></p>
          <p>Monto total: <strong>S/ ${res.data.total.toFixed(2)}</strong></p>
        `,
                confirmButtonText: 'Aceptar',
            });

            // Limpiar
            setCarrito([]);
            setClienteSeleccionado(null);
            setBuscarCliente('');
            setValue('metodoPago', '005');
        } catch (error) {
            const mensaje =
                error.response?.data?.mensaje || 'Error al realizar la venta';
            swal.fire('Error', mensaje, 'error');
        } finally {
            setCargando(false);
        }
    };

    const metodosPago = [
        { codigo: '005', descripcion: 'Efectivo' },
        { codigo: '006', descripcion: 'Tarjeta Crédito/Débito' },
        { codigo: '008', descripcion: 'Yape / Plin' },
    ];

    if (!puedeVender) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-base-content/50 gap-2">
                <ShoppingCart size={48} className="opacity-50" />
                <p>No tenés permisos para vender productos.</p>
            </div>
        );
    }

    return (
        <div>
            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <ShoppingCart size={28} /> Nueva Venta
                    </h2>
                    <p className="text-sm text-base-content/60 mt-1">Registrá ventas de productos del hotel</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Panel izquierdo: cliente y productos */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Buscar cliente */}
                    <div className="card bg-base-100 shadow-sm border border-base-200">
                        <div className="card-body">
                            <h3 className="card-title text-base flex items-center gap-2"><User size={20} /> Cliente</h3>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="DNI"
                                    className="input input-bordered flex-1"
                                    value={buscarCliente}
                                    onChange={(e) => setBuscarCliente(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && buscarClientePorDocumento()}
                                />
                                <button className="btn btn-primary gap-2" onClick={buscarClientePorDocumento}>
                                    <Search size={18} /> Buscar
                                </button>
                            </div>
                            {clienteSeleccionado && (
                                <p className="mt-2 text-sm text-base-content/90">
                                    Cliente: <strong>{clienteSeleccionado.nombres} {clienteSeleccionado.apellidos}</strong>
                                </p>
                            )}
                            {!clienteSeleccionado && (
                                <p className="mt-2 text-xs text-base-content/50">
                                    Venta al cliente anónimo (boleta ≤ S/700)
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Agregar producto */}
                    <div className="card bg-base-100 shadow-sm border border-base-200">
                        <div className="card-body">
                            <h3 className="card-title text-base">Agregar Producto</h3>
                            <div className="flex gap-2 items-end">
                                <select
                                    className="select select-bordered flex-1"
                                    value={anadirProductoId}
                                    onChange={(e) => setAnadirProductoId(e.target.value)}
                                >
                                    <option value="">Seleccionar producto...</option>
                                    {productos.map(p => (
                                        <option key={p.idProducto} value={p.idProducto}>
                                            {p.nombre} — S/{p.precioUnitario.toFixed(2)}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    min="1"
                                    className="input input-bordered w-20"
                                    value={cantidad}
                                    onChange={(e) => setCantidad(e.target.value)}
                                />
                                <button className="btn btn-primary gap-2" onClick={agregarAlCarrito}>
                                    <Plus size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Carrito */}
                    <div className="card bg-base-100 shadow-sm border border-base-200">
                        <div className="card-body">
                            <h3 className="card-title text-base">Carrito</h3>
                            {carrito.length === 0 ? (
                                <p className="text-base-content/50 py-4">No hay productos en el carrito.</p>
                            ) : (
                                <table className="table table-zebra w-full">
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th>Cantidad</th>
                                            <th>Precio</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {carrito.map(item => (
                                            <tr key={item.idProducto} className="hover:bg-base-200/50 transition-colors">
                                                <td className="text-base-content/90">{item.nombre}</td>
                                                <td className="text-base-content/90">{item.cantidad}</td>
                                                <td className="text-base-content/90">S/ {(item.precioUnitario * item.cantidad).toFixed(2)}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-ghost btn-xs text-error"
                                                        onClick={() => eliminarDelCarrito(item.idProducto)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                            {carrito.length > 0 && (
                                <p className="text-right font-bold text-lg mt-4 text-base-content">
                                    Total: S/ {totalVenta.toFixed(2)}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Panel derecho: resumen y pago */}
                <div className="space-y-6">
                    <div className="card bg-base-100 shadow-sm border border-base-200">
                        <div className="card-body">
                            <h3 className="card-title text-base flex items-center gap-2"><DollarSign size={20} /> Resumen de Venta</h3>
                            <p className="text-base-content/80">Productos: {carrito.length}</p>
                            <p className="text-2xl font-bold text-base-content">S/ {totalVenta.toFixed(2)}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="card bg-base-100 shadow-sm border border-base-200">
                            <div className="card-body">
                                <h3 className="card-title text-base">Método de Pago</h3>
                                <select
                                    className={`select select-bordered ${errors.metodoPago ? 'select-error' : ''}`}
                                    {...register('metodoPago')}
                                >
                                    {metodosPago.map(m => (
                                        <option key={m.codigo} value={m.codigo}>{m.descripcion}</option>
                                    ))}
                                </select>
                                {errors.metodoPago && (
                                    <span className="label-text-alt text-error">{errors.metodoPago.message}</span>
                                )}
                                <LoadingButton
                                    type="submit"
                                    isLoading={cargando}
                                    className="btn-primary w-full mt-4"
                                >
                                    Confirmar Venta
                                </LoadingButton>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}