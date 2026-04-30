import { z } from 'zod';

export const clienteSchema = z.object({
    tipoDocumento: z.string().min(1, 'Seleccioná un tipo de documento'),
    documento: z.string().min(1, 'El número de documento es obligatorio'),
    nombres: z.string().min(1, 'El nombre es obligatorio'),
    apellidos: z.string().min(1, 'Los apellidos son obligatorios'),
    telefono: z.string().nullable().optional(),
    email: z.string().email('Correo inválido').nullable().optional().or(z.literal('')),
    nacionalidad: z.string().nullable().optional(),
    direccion: z.string().nullable().optional(),
    fechaNacimiento: z.string().nullable().optional(),
});