export default function LoadingButton({
    type = 'submit',
    className = '',
    isLoading = false,
    disabled = false,
    children,
    ...props
}) {
    return (
        <button
            type={type}
            className={`btn btn-primary relative overflow-hidden ${className} ${isLoading ? 'pointer-events-none opacity-80' : ''}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && (
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            )}
            <span className={`flex items-center gap-2 ${isLoading ? 'opacity-70' : ''}`}>
                {isLoading ? (
                    <>
                        <span className="loading loading-spinner loading-xs"></span>
                        {children || 'Procesando...'}
                    </>
                ) : (
                    children
                )}
            </span>
        </button>
    );
}