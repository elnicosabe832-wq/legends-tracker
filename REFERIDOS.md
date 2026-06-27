# Referidos — creadores de contenido

Los creadores comparten un enlace con su código. Si alguien se hace **Pro** con ese código, queda registrado para comisiones (**10%** por defecto ≈ **0,20 €/mes** por suscriptor activo).

## 1. Activar en Supabase (una vez)

En **SQL Editor**, ejecuta el contenido de `supabase/schema-referrals.sql`.

## 2. Dar de alta un creador

```sql
insert into public.affiliates (code, display_name, contact_email)
values ('TORRE4', 'Nombre del creador', 'email@ejemplo.com');
```

Reglas del código: **3–32 caracteres**, mayúsculas, números, `_` o `-` (ej. `TORRE4`, `CAREER_ES`).

## 3. Enlace para el creador

```
https://legends-tracker-five.vercel.app/?ref=TORRE4
```

Al entrar, el código se guarda. Al pagar Pro, aparece pre-rellenado en el modal (también pueden escribirlo a mano).

## 4. Informe de comisiones (mensual)

En local, con `.env` configurado:

```powershell
npm run report:affiliates
```

Muestra suscriptores activos por código y cuánto pagar. Los pagos son **manuales** (Bizum, PayPal, transferencia).

## Notas

- El código se asigna en el **primer pago**; si cancelan y vuelven, conserva el mismo afiliado.
- Stripe cobra su comisión aparte; el 10% es sobre 1,99 € bruto.
- Para impuestos/facturas de creadores, consulta con un gestor si crece el programa.
