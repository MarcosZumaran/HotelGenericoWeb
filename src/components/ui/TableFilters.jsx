import { useState } from 'react';
import { Search, Calendar, X, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';

export default function TableFilters({
    globalFilter,
    setGlobalFilter,
    dateFilter,
    setDateFilter,
    placeholder = "Buscar...",
    showDateFilter = true
}) {
    const [modalAbierto, setModalAbierto] = useState(false);
    const [tempFilter, setTempFilter] = useState(dateFilter || { type: 'none', date: null, dateEnd: null });

    const aplicarFiltroFecha = () => {
        setDateFilter(tempFilter);
        setModalAbierto(false);
    };

    const limpiarFiltroFecha = () => {
        const reset = { type: 'none', date: null, dateEnd: null };
        setTempFilter(reset);
        setDateFilter(reset);
        setModalAbierto(false);
    };

    const getEtiquetaFiltro = () => {
        if (!dateFilter || dateFilter.type === 'none') return 'Filtro por fecha';
        const d1 = dateFilter.date ? format(dateFilter.date, 'dd/MM/yyyy') : '';
        const d2 = dateFilter.dateEnd ? format(dateFilter.dateEnd, 'dd/MM/yyyy') : '';

        if (dateFilter.type === 'before') return 'Antes de ' + d1;
        if (dateFilter.type === 'on') return 'El día ' + d1;
        if (dateFilter.type === 'after') return 'Después de ' + d1;
        if (dateFilter.type === 'range') return 'Del ' + d1 + ' al ' + d2;
        return 'Filtro por fecha';
    };

    return (
        <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-base-content/40" />
                </div>
                <input
                    type="text"
                    className="input input-bordered w-full pl-10 bg-base-100 shadow-sm focus:border-primary transition-all"
                    placeholder={placeholder}
                    value={globalFilter ?? ''}
                    onChange={e => setGlobalFilter(e.target.value)}
                />
            </div>

            {showDateFilter && (
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        className={"btn gap-2 shadow-sm " + (dateFilter?.type !== 'none' ? 'btn-primary' : 'btn-outline border-base-300')}
                        onClick={() => setModalAbierto(true)}
                    >
                        <Calendar size={18} />
                        <span className="hidden sm:inline">{getEtiquetaFiltro()}</span>
                    </button>
                    {dateFilter?.type !== 'none' && (
                        <button
                            className="btn btn-square btn-ghost btn-sm text-error"
                            onClick={limpiarFiltroFecha}
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
            )}

            {modalAbierto && (
                <div className="modal modal-open z-[1001]">
                    <div className="modal-box max-w-md bg-base-100 border border-base-200 shadow-2xl p-0 overflow-hidden">
                        <div className="p-4 border-b border-base-200 flex justify-between items-center bg-base-200/30">
                            <h3 className="font-bold flex items-center gap-2">
                                <Filter size={18} /> Filtrar por fecha
                            </h3>
                            <button className="btn btn-ghost btn-sm btn-square" onClick={() => setModalAbierto(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text font-semibold">Condición</span>
                                </label>
                                <select
                                    className="select select-bordered w-full"
                                    value={tempFilter.type}
                                    onChange={e => setTempFilter({ ...tempFilter, type: e.target.value })}
                                >
                                    <option value="none">Sin filtro</option>
                                    <option value="before">Antes de...</option>
                                    <option value="on">En la fecha (Exacto)</option>
                                    <option value="after">Después de...</option>
                                    <option value="range">Rango de fechas</option>
                                </select>
                            </div>

                            {tempFilter.type !== 'none' && (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="bg-base-200/50 p-2 rounded-xl border border-base-300">
                                        <DayPicker
                                            mode={tempFilter.type === 'range' ? 'range' : 'single'}
                                            selected={tempFilter.type === 'range'
                                                ? { from: tempFilter.date, to: tempFilter.dateEnd }
                                                : tempFilter.date
                                            }
                                            onSelect={(val) => {
                                                if (tempFilter.type === 'range') {
                                                    setTempFilter({ ...tempFilter, date: val?.from, dateEnd: val?.to });
                                                } else {
                                                    setTempFilter({ ...tempFilter, date: val });
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-base-200/30 flex justify-end gap-2 border-t border-base-200">
                            <button className="btn btn-ghost btn-sm" onClick={() => setModalAbierto(false)}>Cancelar</button>
                            <button className="btn btn-primary btn-sm px-6" onClick={aplicarFiltroFecha}>Aplicar Filtro</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
