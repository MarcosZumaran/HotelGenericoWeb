import api from './axios';

export async function consultarDni(dni) {
    const response = await api.get(`/Cliente/reniec/${dni}`);
    if (response.data && response.data.success) {
        return response.data.data;
    }
    throw new Error(response.data?.message || 'No se pudo verificar el DNI');
}