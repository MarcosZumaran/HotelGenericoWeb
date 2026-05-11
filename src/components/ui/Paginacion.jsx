import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Paginacion({ page, pageSize, totalItems, onPageChange }) {
    const totalPages = Math.ceil(totalItems / pageSize);
    if (totalPages <= 1) return null;

    const getVisiblePages = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, page - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-base-200">
            <p className="text-sm text-ink-secondary">
                Mostrando {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, totalItems)} de {totalItems} resultados
            </p>
            <div className="join shadow-sm">
                <button
                    className="join-item btn btn-sm btn-ghost hover:bg-gray-100"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                >
                    <ChevronLeft size={16} />
                </button>
                {getVisiblePages().map(p => (
                    <button
                        key={p}
                        className={`join-item btn btn-sm ${p === page
                                ? 'btn-primary'
                                : 'btn-ghost hover:bg-gray-100'
                            }`}
                        onClick={() => onPageChange(p)}
                    >
                        {p}
                    </button>
                ))}
                <button
                    className="join-item btn btn-sm btn-ghost hover:bg-gray-100"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages}
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}