import { z } from 'zod';

export const ventaSchema = z.object({
    metodoPago: z.string().min(1, "Seleccioná un método de pago"),
});