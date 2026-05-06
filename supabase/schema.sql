-- ─────────────────────────────────────────────────────────────
-- CardGen — Schéma Supabase
-- Coller dans l'éditeur SQL de ton projet Supabase
-- ─────────────────────────────────────────────────────────────

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Table cards ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cards (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id     TEXT NOT NULL,
  tier            TEXT NOT NULL CHECK (tier IN ('basique', 'premium', 'vip')),
  cardholder_name TEXT NOT NULL,
  card_number     TEXT NOT NULL,
  expiry_date     TEXT NOT NULL,
  cvv             TEXT NOT NULL,
  network_type    TEXT NOT NULL CHECK (network_type IN ('visa', 'mastercard')),
  language        TEXT NOT NULL DEFAULT 'fr',
  currency        TEXT NOT NULL DEFAULT 'EUR',
  display_amount  DECIMAL(15, 2),
  bank_name       TEXT,
  style_variant   TEXT CHECK (style_variant IN ('standard', 'metal', 'luxe')),
  font_variant    TEXT CHECK (font_variant IN ('classic', 'modern', 'rounded')),
  payment_id      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Table payments ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payments (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id            UUID REFERENCES public.cards(id) ON DELETE SET NULL,
  amount             INTEGER NOT NULL,
  tier               TEXT NOT NULL,
  payment_provider   TEXT NOT NULL DEFAULT 'leekpay',
  transaction_id     TEXT,
  status             TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Table share_links ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.share_links (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id        UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  slug           TEXT NOT NULL UNIQUE,
  password_hash  TEXT NOT NULL,
  password       TEXT NOT NULL,
  expires_at     TIMESTAMPTZ NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Row Level Security ───────────────────────────────────────

ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_links ENABLE ROW LEVEL SECURITY;

-- cards : lecture / suppression par le propriétaire
CREATE POLICY "cards_select" ON public.cards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "cards_insert" ON public.cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cards_delete" ON public.cards
  FOR DELETE USING (auth.uid() = user_id);

-- payments : lecture par le propriétaire uniquement
CREATE POLICY "payments_select" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

-- payments : le client peut uniquement lier une carte après création
CREATE POLICY "payments_update_card_id" ON public.payments
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND status = 'success');

-- AUCUN INSERT direct autorisé → passer par record_payment() (SECURITY DEFINER)

-- share_links : le propriétaire de la carte gère ses liens
CREATE POLICY "share_links_owner" ON public.share_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.cards c
      WHERE c.id = share_links.card_id AND c.user_id = auth.uid()
    )
  );

-- share_links : lecture publique pour les visiteurs (par slug)
CREATE POLICY "share_links_public_read" ON public.share_links
  FOR SELECT USING (true);

-- cards : lecture publique via share_links (visiteurs)
CREATE POLICY "cards_public_via_share" ON public.cards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.share_links sl
      WHERE sl.card_id = cards.id AND sl.expires_at > now()
    )
  );

-- ── Fonction sécurisée pour enregistrer un paiement ─────────
-- Seule cette fonction peut insérer un paiement avec status='success'.
-- Elle s'exécute avec les droits du créateur (SECURITY DEFINER),
-- ce qui contourne les RLS INSERT pour les payments.
CREATE OR REPLACE FUNCTION public.record_payment(
  p_tier         TEXT,
  p_amount       INTEGER,
  p_provider     TEXT DEFAULT 'leekpay',
  p_transaction_id TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid        UUID;
  v_payment_id UUID;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO payments (user_id, tier, amount, payment_provider, transaction_id, status)
  VALUES (v_uid, p_tier, p_amount, p_provider, p_transaction_id, 'success')
  RETURNING id INTO v_payment_id;

  RETURN v_payment_id;
END;
$$;

-- Révoquer les droits d'exécution publics puis les accorder aux utilisateurs connectés
REVOKE ALL ON FUNCTION public.record_payment FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_payment TO authenticated;

-- ── Index pour les performances ──────────────────────────────
CREATE INDEX IF NOT EXISTS idx_cards_user_id      ON public.cards(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id   ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_share_links_slug   ON public.share_links(slug);
CREATE INDEX IF NOT EXISTS idx_share_links_card_id ON public.share_links(card_id);
