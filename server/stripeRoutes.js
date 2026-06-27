import Stripe from 'stripe';
import {
  getUserFromAccessToken,
  getSubscriptionRow,
  getUserIdByStripeCustomer,
  upsertSubscriptionRow,
  isActiveProStatus,
  isSupabaseAdminConfigured,
  getAffiliateByCode,
  normalizeAffiliateCode,
} from './supabaseAdmin.js';

const stripeSecret = process.env.STRIPE_SECRET_KEY?.trim();
const priceId = process.env.STRIPE_PRICE_ID?.trim();
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
const appUrl = (process.env.APP_URL || 'http://localhost:5173').replace(/\/$/, '');

export const isStripeConfigured = Boolean(stripeSecret && priceId);

const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

function toPeriodEndIso(unixSeconds) {
  const n = Number(unixSeconds);
  if (!n || Number.isNaN(n)) return null;
  const date = new Date(n * 1000);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function readPeriodEnd(subscription) {
  return toPeriodEndIso(
    subscription?.current_period_end
      ?? subscription?.items?.data?.[0]?.current_period_end,
  );
}

async function syncSubscriptionForUser(userId) {
  const row = await getSubscriptionRow(userId);

  if (!row?.stripe_customer_id || !stripe) {
    const status = row?.status || 'inactive';
    return {
      isPro: isActiveProStatus(status),
      status,
      currentPeriodEnd: row?.current_period_end || null,
    };
  }

  const { data: subscriptions } = await stripe.subscriptions.list({
    customer: row.stripe_customer_id,
    status: 'all',
    limit: 10,
  });

  const active = subscriptions.find((sub) => isActiveProStatus(sub.status));
  const chosen = active || subscriptions[0];

  if (!chosen) {
    await upsertSubscriptionRow({
      userId,
      customerId: row.stripe_customer_id,
      subscriptionId: null,
      status: 'inactive',
      periodEnd: null,
    });
    return { isPro: false, status: 'inactive', currentPeriodEnd: null };
  }

  const periodEnd = readPeriodEnd(chosen);

  await upsertSubscriptionRow({
    userId,
    customerId: row.stripe_customer_id,
    subscriptionId: chosen.id,
    status: chosen.status,
    periodEnd,
  });

  return {
    isPro: isActiveProStatus(chosen.status),
    status: chosen.status,
    currentPeriodEnd: periodEnd,
  };
}

function stripeUnavailable(res) {
  return res.status(503).json({
    error: 'STRIPE_NOT_CONFIGURED',
    message: 'Falta configurar Stripe en el servidor (.env): STRIPE_SECRET_KEY y STRIPE_PRICE_ID',
  });
}

async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  const user = await getUserFromAccessToken(token);
  if (!user) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Inicia sesión para continuar.' });
  }
  req.user = user;
  return next();
}

async function getOrCreateCustomer(user) {
  const existing = await getSubscriptionRow(user.id);
  if (existing?.stripe_customer_id) {
    return existing.stripe_customer_id;
  }

  const customer = await stripe.customers.create({
    email: user.email,
    metadata: { supabase_user_id: user.id },
  });

  await upsertSubscriptionRow({
    userId: user.id,
    customerId: customer.id,
    subscriptionId: null,
    status: 'inactive',
    periodEnd: null,
  });

  return customer.id;
}

async function resolveAffiliateCode(raw) {
  const code = normalizeAffiliateCode(raw);
  if (!code) return null;
  const affiliate = await getAffiliateByCode(code);
  return affiliate ? affiliate.code : null;
}

export async function handleValidateReferralCode(req, res) {
  if (!isSupabaseAdminConfigured) {
    return res.status(503).json({ valid: false, message: 'Referidos no disponibles.' });
  }

  try {
    const affiliate = await getAffiliateByCode(req.params.code);
    if (!affiliate) {
      return res.json({ valid: false, message: 'Código no válido o inactivo.' });
    }
    return res.json({
      valid: true,
      code: affiliate.code,
      displayName: affiliate.display_name,
    });
  } catch (err) {
    console.error('Validate referral error:', err);
    return res.status(500).json({ valid: false, message: err.message });
  }
}

export async function handleCreateCheckoutSession(req, res) {
  if (!stripe) return stripeUnavailable(res);
  if (!isSupabaseAdminConfigured) {
    return res.status(503).json({
      error: 'SUPABASE_ADMIN_MISSING',
      message: 'Falta SUPABASE_SERVICE_ROLE_KEY en .env para pagos.',
    });
  }

  try {
    const affiliateCode = await resolveAffiliateCode(req.body?.affiliateCode);
    if (req.body?.affiliateCode?.trim() && !affiliateCode) {
      return res.status(400).json({
        error: 'INVALID_REFERRAL',
        message: 'El código de creador no es válido. Compruébalo o déjalo vacío.',
      });
    }

    const customerId = await getOrCreateCustomer(req.user);
    const sessionMeta = {
      supabase_user_id: req.user.id,
      ...(affiliateCode ? { affiliate_code: affiliateCode } : {}),
    };

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/?pro=success`,
      cancel_url: `${appUrl}/?pro=cancelled`,
      client_reference_id: req.user.id,
      metadata: sessionMeta,
      subscription_data: {
        metadata: sessionMeta,
      },
      allow_promotion_codes: true,
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return res.status(500).json({
      error: 'CHECKOUT_FAILED',
      message: err.message || 'No se pudo iniciar el pago.',
    });
  }
}

export async function handleCreatePortalSession(req, res) {
  if (!stripe) return stripeUnavailable(res);

  try {
    const row = await getSubscriptionRow(req.user.id);
    if (!row?.stripe_customer_id) {
      return res.status(400).json({
        error: 'NO_CUSTOMER',
        message: 'No tienes una suscripción asociada todavía.',
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: row.stripe_customer_id,
      return_url: appUrl,
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe portal error:', err);
    return res.status(500).json({
      error: 'PORTAL_FAILED',
      message: err.message || 'No se pudo abrir el portal de facturación.',
    });
  }
}

export async function handleSubscriptionStatus(req, res) {
  if (!isSupabaseAdminConfigured) {
    return res.json({ isPro: false, status: 'unavailable' });
  }

  try {
    const result = await syncSubscriptionForUser(req.user.id);
    return res.json(result);
  } catch (err) {
    console.error('Subscription status error:', err);
    return res.status(500).json({ error: 'STATUS_FAILED', message: err.message });
  }
}

async function applySubscriptionUpdate({
  userId,
  customerId,
  subscriptionId,
  status,
  periodEnd,
  affiliateCode,
}) {
  if (!userId) return;

  await upsertSubscriptionRow({
    userId,
    customerId: typeof customerId === 'string' ? customerId : customerId?.id ?? null,
    subscriptionId,
    status,
    periodEnd: toPeriodEndIso(periodEnd) ?? null,
    affiliateCode,
  });
}

export async function handleStripeWebhook(req, res) {
  if (!stripe || !webhookSecret) {
    return res.status(503).send('Stripe webhook no configurado');
  }
  if (!isSupabaseAdminConfigured) {
    return res.status(503).send('Supabase admin no configurado');
  }

  const signature = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.supabase_user_id || session.client_reference_id;
        const affiliateCode = session.metadata?.affiliate_code || null;
        const subscriptionId = typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription?.id;

        let status = 'active';
        let periodEnd = null;

        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          status = sub.status;
          periodEnd = sub.current_period_end ?? sub.items?.data?.[0]?.current_period_end;
        }

        await applySubscriptionUpdate({
          userId,
          customerId: session.customer,
          subscriptionId,
          status,
          periodEnd,
          affiliateCode,
        });
        console.log(`✓ Webhook checkout completado para usuario ${userId}${affiliateCode ? ` (ref: ${affiliateCode})` : ''}`);
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        let userId = sub.metadata?.supabase_user_id;
        if (!userId && sub.customer) {
          userId = await getUserIdByStripeCustomer(
            typeof sub.customer === 'string' ? sub.customer : sub.customer?.id,
          );
        }

        await applySubscriptionUpdate({
          userId,
          customerId: sub.customer,
          subscriptionId: sub.id,
          status: sub.status,
          periodEnd: sub.current_period_end ?? sub.items?.data?.[0]?.current_period_end,
          affiliateCode: sub.metadata?.affiliate_code || null,
        });
        console.log(`✓ Webhook suscripción ${sub.status} para usuario ${userId}`);
        break;
      }

      default:
        break;
    }

    return res.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return res.status(500).send('Webhook handler failed');
  }
}

export { requireAuth };
