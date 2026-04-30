import { z } from 'zod';

export const productoSchema = z.object({
    codigoSunat: z.string().nullable().optional(),
    nombre: z.string().min(1, 'El nombre es obligatorio'),
    descripcion: z.string().nullable().optional(),
    precioUnitario: z.preprocess(
        (val) => Number(val),
        z.number().min(0.01, 'El precio debe ser mayor a 0')
    ),
    idAfectacionIgv: z.string().nullable().optional(),
    stock: z.preprocess(
        (val) => (val === '' ? null : Number(val)),
        z.number().int().nullable()
    ),
    stockMinimo: z.preprocess(
        (val) => (val === '' ? null : Number(val)),
        z.number().int().nullable()
    ),
    unidadMedida: z.string().nullable().optional(),
});