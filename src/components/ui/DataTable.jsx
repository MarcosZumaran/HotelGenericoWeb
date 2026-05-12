import { flexRender } from '@tanstack/react-table';
import Paginacion from './Paginacion';

export default function DataTable({
    table,
    columns,
    emptyMessage = 'No se encontraron datos',
    paginacion,
    showActions = false,
    actionsHeader = 'Acciones',
    renderActions,
    isLoading = false,
    parentRef,
}) {
    const totalColumns = columns.length + (showActions ? 1 : 0);

    return (
        <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-0">
                <div className="overflow-x-auto">
                    <table className="table table-zebra w-full [&_tbody_tr:nth-child(odd)]:bg-base-200/30">
                        <thead className="bg-base-200/60 border-b-2 border-base-300">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th
                                            key={header.id}
                                            className={`${header.column.getCanSort() ? 'cursor-pointer select-none hover:bg-base-200/50 transition-colors' : ''} text-sm font-semibold text-base-content/80`}
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            <div className="flex items-center gap-1">
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {header.column.getIsSorted() === 'asc' && <span className="text-xs">🔼</span>}
                                                {header.column.getIsSorted() === 'desc' && <span className="text-xs">🔽</span>}
                                            </div>
                                        </th>
                                    ))}
                                    {showActions && (
                                        <th className="text-sm font-semibold text-base-content/80">{actionsHeader}</th>
                                    )}
                                </tr>
                            ))}
                        </thead>
                        <tbody ref={parentRef}>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={totalColumns} className="text-center py-8">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="loading loading-spinner loading-lg text-primary"></span>
                                            <span className="text-base-content/50">Cargando datos...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : table.getRowModel().rows.length === 0 ? (
                                <tr>
                                    <td colSpan={totalColumns} className="text-center text-base-content/50 py-8">
                                        {emptyMessage}
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
                                        {showActions && renderActions && (
                                            <td>{renderActions(row.original)}</td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {paginacion && (
                    <Paginacion
                        page={paginacion.page}
                        pageSize={paginacion.pageSize}
                        totalItems={paginacion.totalItems}
                        onPageChange={paginacion.onPageChange}
                    />
                )}
            </div>
        </div>
    );
}