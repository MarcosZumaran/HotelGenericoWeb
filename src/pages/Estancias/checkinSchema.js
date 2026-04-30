import { z } from 'zod';

export const checkinSchema = z.object({
    idHabitacion: z.preprocess(
        (val) => Number(val),
        z.number().int().min(1, 'Seleccioná una habitación')
    ),
    tipoDocumento: z.string().min(1, 'Tipo de documento es obligatorio'),
    documento: z.string().min(1, 'Número de documento es obligatorio'),
    nombres: z.string().min(1, 'Nombre es obligatorio'),
    apellidos: z.string().min(1, 'Apellido es obligatorio'),
    telefono: z.string().nullable().optional(),
    fechaCheckoutPrevista: z.string().min(1, 'Fecha de salida es obligatoria'),
    metodoPago: z.string().min(1, 'Método de pago es obligatorio'),
    usarClienteAnonimo: z.boolean(),
});