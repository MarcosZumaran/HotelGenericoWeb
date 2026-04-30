import Swal from 'sweetalert2';

const swal = Swal.mixin({
    customClass: {
        popup: 'rounded-xl bg-base-100 shadow-2xl',
        title: 'text-base-content font-bold',
        confirmButton: 'btn btn-primary btn-sm',
        cancelButton: 'btn btn-ghost btn-sm',
        denyButton: 'btn btn-error btn-sm',
        htmlContainer: 'text-base-content/80',
        validationMessage: 'text-error',
        timerProgressBar: 'bg-primary',
    },
    buttonsStyling: false,
    color: 'inherit',
});

export default swal;