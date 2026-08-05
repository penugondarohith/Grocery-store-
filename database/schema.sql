-- ================================================================
-- GroceryMart — Production PostgreSQL Schema for Supabase
-- Version: 1.0.1 | Fix: value_positive constraint allows 0 for free_delivery coupons
-- Run order: execute this entire file once against your Supabase DB
-- ================================================================

-- ----------------------------------------------------------------
-- SECTION 1: ENUMS
-- ----------------------------------------------------------------
CREATE TYPE user_role_enum        AS ENUM ('customer', 'admin', 'super_admin');
CREATE TYPE address_type_enum     AS ENUM ('home', 'office', 'other');
CREATE TYPE order_status_enum     AS ENUM (
  'pending','confirmed','processing','packed',
  'shipped','out_for_delivery','delivered','cancelled','refunded'
);
CREATE TYPE delivery_type_enum    AS ENUM ('door_delivery', 'self_pickup');
CREATE TYPE payment_method_enum   AS ENUM ('cod','upi','card','wallet','netbanking');
CREATE TYPE payment_status_enum   AS ENUM ('pending','processing','paid','failed','refunded');
CREATE TYPE coupon_type_enum      AS ENUM ('percentage','fixed_amount','free_delivery');
CREATE TYPE offer_type_enum       AS ENUM ('product','category','bogo','flash_sale');
CREATE TYPE inventory_status_enum AS ENUM ('in_stock','low_stock','out_of_stock','discontinued');
CREATE TYPE notification_type_enum AS ENUM (
  'order_placed','order_confirmed','order_shipped','order_delivered',
  'order_cancelled','payment_success','payment_failed',
  'coupon_added','offer_alert','review_request','general'
);
CREATE TYPE audit_action_enum AS ENUM ('INSERT','UPDATE','DELETE','SELECT');


-- ----------------------------------------------------------------
-- SECTION 2: USERS
-- ----------------------------------------------------------------
CREATE TABLE users (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    email       TEXT        UNIQUE NOT NULL,
    phone       TEXT        UNIQUE,
    full_name   TEXT        NOT NULL,
    avatar_url  TEXT,
    role        user_role_enum NOT NULL DEFAULT 'customer',
    is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ,
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT phone_format CHECK (phone IS NULL OR phone ~* '^\+?[0-9]{10,15}$')
);
CREATE INDEX idx_users_email      ON users (email)      WHERE deleted_at IS NULL;
CREATE INDEX idx_users_phone      ON users (phone)      WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role       ON users (role)       WHERE deleted_at IS NULL;
CREATE INDEX idx_users_created_at ON users (created_at DESC);


-- ----------------------------------------------------------------
-- SECTION 3: ADDRESSES
-- ----------------------------------------------------------------
CREATE TABLE addresses (
    id            UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID              NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name     TEXT              NOT NULL,
    phone         TEXT              NOT NULL,
    address_line1 TEXT              NOT NULL,
    address_line2 TEXT,
    city          TEXT              NOT NULL,
    state         TEXT              NOT NULL,
    pincode       TEXT              NOT NULL,
    type          address_type_enum NOT NULL DEFAULT 'home',
    is_default    BOOLEAN           NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    CONSTRAINT pincode_format CHECK (pincode ~* '^[0-9]{6}$')
);
CREATE INDEX idx_addresses_user_id ON addresses (user_id);
CREATE INDEX idx_addresses_default ON addresses (user_id, is_default) WHERE is_default = TRUE;


-- ----------------------------------------------------------------
-- SECTION 4: CATEGORIES
-- ----------------------------------------------------------------
CREATE TABLE categories (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name           TEXT        UNIQUE NOT NULL,
    slug           TEXT        UNIQUE NOT NULL,
    description    TEXT,
    image_url      TEXT,
    icon           TEXT,
    color_gradient TEXT,
    sort_order     INTEGER     NOT NULL DEFAULT 0,
    is_active      BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at     TIMESTAMPTZ
);
CREATE INDEX idx_categories_slug       ON categories (slug)       WHERE deleted_at IS NULL;
CREATE INDEX idx_categories_is_active  ON categories (is_active)  WHERE deleted_at IS NULL;
CREATE INDEX idx_categories_sort_order ON categories (sort_order);


-- ----------------------------------------------------------------
-- SECTION 5: SUBCATEGORIES
-- ----------------------------------------------------------------
CREATE TABLE subcategories (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID        NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name        TEXT        NOT NULL,
    slug        TEXT        UNIQUE NOT NULL,
    description TEXT,
    image_url   TEXT,
    sort_order  INTEGER     NOT NULL DEFAULT 0,
    is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ,
    CONSTRAINT unique_subcat_per_category UNIQUE (category_id, name)
);
CREATE INDEX idx_subcategories_category_id ON subcategories (category_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_subcategories_slug        ON subcategories (slug)        WHERE deleted_at IS NULL;


-- ----------------------------------------------------------------
-- SECTION 6: PRODUCTS
-- ----------------------------------------------------------------
CREATE TABLE products (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id      UUID        NOT NULL REFERENCES categories(id)   ON DELETE RESTRICT,
    subcategory_id   UUID                 REFERENCES subcategories(id) ON DELETE SET NULL,
    name             TEXT        NOT NULL,
    slug             TEXT        UNIQUE NOT NULL,
    description      TEXT,
    brand            TEXT,
    sku              TEXT        UNIQUE NOT NULL,
    image_url        TEXT,
    image_urls       TEXT[]      NOT NULL DEFAULT '{}',
    is_active        BOOLEAN     NOT NULL DEFAULT TRUE,
    is_featured      BOOLEAN     NOT NULL DEFAULT FALSE,
    is_popular       BOOLEAN     NOT NULL DEFAULT FALSE,
    meta_title       TEXT,
    meta_description TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at       TIMESTAMPTZ
);
CREATE INDEX idx_products_category_id    ON products (category_id)    WHERE deleted_at IS NULL;
CREATE INDEX idx_products_subcategory_id ON products (subcategory_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_slug           ON products (slug)           WHERE deleted_at IS NULL;
CREATE INDEX idx_products_brand          ON products (brand)          WHERE deleted_at IS NULL;
CREATE INDEX idx_products_is_featured    ON products (is_featured)    WHERE is_featured = TRUE AND deleted_at IS NULL;
CREATE INDEX idx_products_is_popular     ON products (is_popular)     WHERE is_popular  = TRUE AND deleted_at IS NULL;
CREATE INDEX idx_products_fts ON products
    USING GIN (to_tsvector('english', name || ' ' || COALESCE(brand,'') || ' ' || COALESCE(description,'')));


-- ----------------------------------------------------------------
-- SECTION 7: PRODUCT VARIANTS
-- ----------------------------------------------------------------
CREATE TABLE product_variants (
    id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id       UUID          NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name             TEXT          NOT NULL,
    weight           NUMERIC(10,3),
    unit             TEXT,
    price            NUMERIC(10,2) NOT NULL,
    original_price   NUMERIC(10,2) NOT NULL,
    discount_percent NUMERIC(5,2)  NOT NULL DEFAULT 0,
    is_default       BOOLEAN       NOT NULL DEFAULT FALSE,
    is_active        BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT price_positive      CHECK (price > 0),
    CONSTRAINT original_price_gte  CHECK (original_price >= price),
    CONSTRAINT discount_range      CHECK (discount_percent BETWEEN 0 AND 100),
    CONSTRAINT unique_variant_name UNIQUE (product_id, name)
);
CREATE INDEX idx_variants_product_id ON product_variants (product_id);
CREATE INDEX idx_variants_price      ON product_variants (price)      WHERE is_active = TRUE;
CREATE INDEX idx_variants_default    ON product_variants (product_id) WHERE is_default = TRUE;


-- ----------------------------------------------------------------
-- SECTION 8: INVENTORY
-- ----------------------------------------------------------------
CREATE TABLE inventory (
    id                  UUID                  PRIMARY KEY DEFAULT gen_random_uuid(),
    product_variant_id  UUID                  UNIQUE NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity            INTEGER               NOT NULL DEFAULT 0,
    reserved_quantity   INTEGER               NOT NULL DEFAULT 0,
    low_stock_threshold INTEGER               NOT NULL DEFAULT 10,
    status              inventory_status_enum NOT NULL DEFAULT 'in_stock',
    last_restocked_at   TIMESTAMPTZ,
    created_at          TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
    CONSTRAINT quantity_non_negative          CHECK (quantity >= 0),
    CONSTRAINT reserved_quantity_non_negative CHECK (reserved_quantity >= 0),
    CONSTRAINT reserved_lte_quantity          CHECK (reserved_quantity <= quantity)
);
CREATE INDEX idx_inventory_status    ON inventory (status);
CREATE INDEX idx_inventory_low_stock ON inventory (quantity, low_stock_threshold)
    WHERE quantity <= low_stock_threshold;


-- ----------------------------------------------------------------
-- SECTION 9: COUPONS
-- ----------------------------------------------------------------
CREATE TABLE coupons (
    id                  UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
    code                TEXT             UNIQUE NOT NULL,
    description         TEXT,
    type                coupon_type_enum NOT NULL,
    value               NUMERIC(10,2)    NOT NULL,
    min_order_amount    NUMERIC(10,2)    NOT NULL DEFAULT 0,
    max_discount_amount NUMERIC(10,2),
    total_usage_limit   INTEGER,
    per_user_limit      INTEGER          NOT NULL DEFAULT 1,
    used_count          INTEGER          NOT NULL DEFAULT 0,
    valid_from          TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    valid_until         TIMESTAMPTZ      NOT NULL,
    is_active           BOOLEAN          NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ      NOT NULL DEFAULT NOW(),

    -- FIX: free_delivery coupons have value = 0 (no monetary discount)
    --      percentage and fixed_amount coupons must have value > 0
    CONSTRAINT value_valid            CHECK (
        (type = 'free_delivery' AND value = 0)
        OR
        (type IN ('percentage', 'fixed_amount') AND value > 0)
    ),
    CONSTRAINT min_order_non_negative CHECK (min_order_amount >= 0),
    CONSTRAINT valid_period           CHECK (valid_until > valid_from),
    CONSTRAINT code_uppercase         CHECK (code = UPPER(code)),
    CONSTRAINT percentage_range       CHECK (type != 'percentage' OR value <= 100)
);
CREATE INDEX idx_coupons_code        ON coupons (code)        WHERE is_active = TRUE;
CREATE INDEX idx_coupons_valid_until ON coupons (valid_until)  WHERE is_active = TRUE;


-- ----------------------------------------------------------------
-- SECTION 10: OFFERS
-- ----------------------------------------------------------------
CREATE TABLE offers (
    id               UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    title            TEXT            NOT NULL,
    description      TEXT,
    type             offer_type_enum NOT NULL DEFAULT 'product',
    discount_percent NUMERIC(5,2)    NOT NULL DEFAULT 0,
    banner_url       TEXT,
    valid_from       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    valid_until      TIMESTAMPTZ     NOT NULL,
    is_active        BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT discount_range CHECK (discount_percent BETWEEN 0 AND 100),
    CONSTRAINT valid_period   CHECK (valid_until > valid_from)
);
CREATE INDEX idx_offers_active ON offers (is_active, valid_from, valid_until) WHERE is_active = TRUE;


-- ----------------------------------------------------------------
-- SECTION 11: PRODUCT OFFERS (junction)
-- ----------------------------------------------------------------
CREATE TABLE product_offers (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    offer_id   UUID        NOT NULL REFERENCES offers(id)   ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_product_offer UNIQUE (product_id, offer_id)
);
CREATE INDEX idx_product_offers_product_id ON product_offers (product_id);
CREATE INDEX idx_product_offers_offer_id   ON product_offers (offer_id);


-- ----------------------------------------------------------------
-- SECTION 12: CART
-- ----------------------------------------------------------------
CREATE TABLE cart (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_cart_user_id ON cart (user_id);


-- ----------------------------------------------------------------
-- SECTION 13: CART ITEMS
-- ----------------------------------------------------------------
CREATE TABLE cart_items (
    id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id            UUID        NOT NULL REFERENCES cart(id)             ON DELETE CASCADE,
    product_variant_id UUID        NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity           INTEGER     NOT NULL DEFAULT 1,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT quantity_min        CHECK (quantity >= 1),
    CONSTRAINT unique_cart_variant UNIQUE (cart_id, product_variant_id)
);
CREATE INDEX idx_cart_items_cart_id            ON cart_items (cart_id);
CREATE INDEX idx_cart_items_product_variant_id ON cart_items (product_variant_id);


-- ----------------------------------------------------------------
-- SECTION 14: WISHLIST
-- ----------------------------------------------------------------
CREATE TABLE wishlist (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    product_id UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_wishlist_product UNIQUE (user_id, product_id)
);
CREATE INDEX idx_wishlist_user_id    ON wishlist (user_id);
CREATE INDEX idx_wishlist_product_id ON wishlist (product_id);


-- ----------------------------------------------------------------
-- SECTION 15: ORDERS
-- ----------------------------------------------------------------
CREATE TABLE orders (
    id                    UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number          TEXT               UNIQUE NOT NULL
                            DEFAULT 'GM' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM()*100000)::TEXT, 5, '0'),
    user_id               UUID               NOT NULL REFERENCES users(id)  ON DELETE RESTRICT,
    address_id            UUID               REFERENCES addresses(id)        ON DELETE SET NULL,
    coupon_id             UUID               REFERENCES coupons(id)          ON DELETE SET NULL,
    status                order_status_enum  NOT NULL DEFAULT 'pending',
    delivery_type         delivery_type_enum NOT NULL DEFAULT 'door_delivery',
    delivery_slot         TEXT,
    subtotal              NUMERIC(10,2)      NOT NULL,
    delivery_fee          NUMERIC(10,2)      NOT NULL DEFAULT 0,
    tax_amount            NUMERIC(10,2)      NOT NULL DEFAULT 0,
    discount_amount       NUMERIC(10,2)      NOT NULL DEFAULT 0,
    total_amount          NUMERIC(10,2)      NOT NULL,
    notes                 TEXT,
    placed_at             TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
    estimated_delivery_at TIMESTAMPTZ,
    delivered_at          TIMESTAMPTZ,
    created_at            TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
    deleted_at            TIMESTAMPTZ,
    CONSTRAINT subtotal_positive CHECK (subtotal > 0),
    CONSTRAINT total_positive    CHECK (total_amount > 0),
    CONSTRAINT fee_non_negative  CHECK (delivery_fee >= 0),
    CONSTRAINT tax_non_negative  CHECK (tax_amount >= 0),
    CONSTRAINT discount_non_neg  CHECK (discount_amount >= 0)
);
CREATE INDEX idx_orders_user_id   ON orders (user_id)   WHERE deleted_at IS NULL;
CREATE INDEX idx_orders_status    ON orders (status)    WHERE deleted_at IS NULL;
CREATE INDEX idx_orders_placed_at ON orders (placed_at DESC);
CREATE INDEX idx_orders_order_num ON orders (order_number);


-- ----------------------------------------------------------------
-- SECTION 16: COUPON USAGE
-- ----------------------------------------------------------------
CREATE TABLE coupon_usage (
    id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id        UUID          NOT NULL REFERENCES coupons(id) ON DELETE RESTRICT,
    user_id          UUID          NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
    order_id         UUID          NOT NULL REFERENCES orders(id)  ON DELETE RESTRICT,
    discount_applied NUMERIC(10,2) NOT NULL,
    used_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_coupon_order UNIQUE (coupon_id, order_id)
);
CREATE INDEX idx_coupon_usage_coupon_id ON coupon_usage (coupon_id);
CREATE INDEX idx_coupon_usage_user_id   ON coupon_usage (user_id);


-- ----------------------------------------------------------------
-- SECTION 17: ORDER ITEMS
-- ----------------------------------------------------------------
CREATE TABLE order_items (
    id                 UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id           UUID          NOT NULL REFERENCES orders(id)           ON DELETE CASCADE,
    product_variant_id UUID          NOT NULL REFERENCES product_variants(id)  ON DELETE RESTRICT,
    product_name       TEXT          NOT NULL,
    variant_name       TEXT          NOT NULL,
    quantity           INTEGER       NOT NULL,
    unit_price         NUMERIC(10,2) NOT NULL,
    total_price        NUMERIC(10,2) NOT NULL GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT quantity_min   CHECK (quantity >= 1),
    CONSTRAINT unit_price_pos CHECK (unit_price > 0)
);
CREATE INDEX idx_order_items_order_id           ON order_items (order_id);
CREATE INDEX idx_order_items_product_variant_id ON order_items (product_variant_id);


-- ----------------------------------------------------------------
-- SECTION 18: ORDER TRACKING
-- ----------------------------------------------------------------
CREATE TABLE order_tracking (
    id          UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id    UUID              NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status      order_status_enum NOT NULL,
    description TEXT,
    location    TEXT,
    tracked_at  TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    created_at  TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_order_tracking_order_id   ON order_tracking (order_id);
CREATE INDEX idx_order_tracking_tracked_at ON order_tracking (tracked_at DESC);


-- ----------------------------------------------------------------
-- SECTION 19: PAYMENTS
-- ----------------------------------------------------------------
CREATE TABLE payments (
    id               UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id         UUID                UNIQUE NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    method           payment_method_enum NOT NULL,
    status           payment_status_enum NOT NULL DEFAULT 'pending',
    amount           NUMERIC(10,2)       NOT NULL,
    transaction_id   TEXT,
    gateway_response JSONB,
    paid_at          TIMESTAMPTZ,
    created_at       TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    CONSTRAINT amount_positive CHECK (amount > 0)
);
CREATE INDEX idx_payments_order_id        ON payments (order_id);
CREATE INDEX idx_payments_status          ON payments (status);
CREATE INDEX idx_payments_transaction_id  ON payments (transaction_id) WHERE transaction_id IS NOT NULL;


-- ----------------------------------------------------------------
-- SECTION 20: REVIEWS
-- ----------------------------------------------------------------
CREATE TABLE reviews (
    id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id           UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id              UUID        NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    order_id             UUID                 REFERENCES orders(id)   ON DELETE SET NULL,
    rating               INTEGER     NOT NULL,
    comment              TEXT,
    is_verified_purchase BOOLEAN     NOT NULL DEFAULT FALSE,
    helpful_count        INTEGER     NOT NULL DEFAULT 0,
    is_approved          BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at           TIMESTAMPTZ,
    CONSTRAINT rating_range         CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT one_review_per_order UNIQUE (user_id, product_id, order_id)
);
CREATE INDEX idx_reviews_product_id ON reviews (product_id) WHERE deleted_at IS NULL AND is_approved = TRUE;
CREATE INDEX idx_reviews_user_id    ON reviews (user_id)    WHERE deleted_at IS NULL;
CREATE INDEX idx_reviews_rating     ON reviews (rating);


-- ----------------------------------------------------------------
-- SECTION 21: NOTIFICATIONS (User)
-- ----------------------------------------------------------------
CREATE TABLE notifications (
    id         UUID                   PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID                   NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type       notification_type_enum NOT NULL DEFAULT 'general',
    title      TEXT                   NOT NULL,
    message    TEXT                   NOT NULL,
    metadata   JSONB,
    is_read    BOOLEAN                NOT NULL DEFAULT FALSE,
    read_at    TIMESTAMPTZ,
    created_at TIMESTAMPTZ            NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notifications_user_id ON notifications (user_id);
CREATE INDEX idx_notifications_unread  ON notifications (user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created ON notifications (created_at DESC);


-- ----------------------------------------------------------------
-- SECTION 22: ADMIN NOTIFICATIONS
-- ----------------------------------------------------------------
CREATE TABLE admin_notifications (
    id             UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id       UUID                NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    user_id        UUID                NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    user_name      TEXT                NOT NULL,
    user_avatar    TEXT,
    order_amount   NUMERIC(10,2)       NOT NULL,
    item_count     INTEGER             NOT NULL,
    payment_method payment_method_enum NOT NULL,
    is_read        BOOLEAN             NOT NULL DEFAULT FALSE,
    read_at        TIMESTAMPTZ,
    created_at     TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    CONSTRAINT order_amount_positive CHECK (order_amount > 0),
    CONSTRAINT item_count_min        CHECK (item_count >= 1)
);
CREATE INDEX idx_admin_notif_unread  ON admin_notifications (is_read)     WHERE is_read = FALSE;
CREATE INDEX idx_admin_notif_created ON admin_notifications (created_at DESC);


-- ----------------------------------------------------------------
-- SECTION 23: AUDIT LOGS
-- ----------------------------------------------------------------
CREATE TABLE audit_logs (
    id         UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID              REFERENCES users(id) ON DELETE SET NULL,
    table_name TEXT              NOT NULL,
    record_id  TEXT              NOT NULL,
    action     audit_action_enum NOT NULL,
    old_data   JSONB,
    new_data   JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_logs_table_name ON audit_logs (table_name);
CREATE INDEX idx_audit_logs_user_id    ON audit_logs (user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at DESC);


-- ================================================================
-- SECTION 24: TRIGGERS
-- ================================================================

-- Auto set updated_at on every UPDATE
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

DO $$ DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'users','addresses','categories','subcategories',
    'products','product_variants','inventory','coupons',
    'offers','cart','cart_items','orders','payments','reviews'
  ]
  LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t, t
    );
  END LOOP;
END; $$;


-- Auto update inventory status based on quantity
CREATE OR REPLACE FUNCTION update_inventory_status()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.quantity = 0 THEN
    NEW.status = 'out_of_stock';
  ELSIF NEW.quantity <= NEW.low_stock_threshold THEN
    NEW.status = 'low_stock';
  ELSE
    NEW.status = 'in_stock';
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_inventory_status
BEFORE INSERT OR UPDATE ON inventory
FOR EACH ROW EXECUTE FUNCTION update_inventory_status();


-- ================================================================
-- SECTION 25: VIEWS
-- ================================================================

CREATE OR REPLACE VIEW product_listing AS
SELECT
    p.id, p.name, p.slug, p.brand, p.image_url, p.is_featured, p.is_popular,
    c.name  AS category_name, c.slug AS category_slug,
    sc.name AS subcategory_name,
    pv.id   AS default_variant_id, pv.name AS variant_name,
    pv.weight, pv.unit, pv.price, pv.original_price, pv.discount_percent,
    inv.quantity, inv.status AS stock_status,
    COALESCE(AVG(r.rating), 0)::NUMERIC(3,2) AS avg_rating,
    COUNT(DISTINCT r.id)                      AS review_count
FROM products p
JOIN categories c           ON c.id  = p.category_id
LEFT JOIN subcategories sc  ON sc.id = p.subcategory_id
JOIN product_variants pv    ON pv.product_id = p.id AND pv.is_default = TRUE AND pv.is_active = TRUE
JOIN inventory inv           ON inv.product_variant_id = pv.id
LEFT JOIN reviews r          ON r.product_id = p.id AND r.is_approved = TRUE AND r.deleted_at IS NULL
WHERE p.is_active = TRUE AND p.deleted_at IS NULL
GROUP BY p.id, c.id, sc.id, pv.id, inv.id;


CREATE OR REPLACE VIEW order_summary AS
SELECT
    o.id, o.order_number, o.status, o.delivery_type, o.total_amount, o.placed_at, o.delivered_at,
    u.full_name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
    pay.method  AS payment_method, pay.status AS payment_status,
    a.city AS delivery_city, a.pincode AS delivery_pincode
FROM orders o
JOIN users u           ON u.id   = o.user_id
LEFT JOIN payments pay ON pay.order_id = o.id
LEFT JOIN addresses a  ON a.id   = o.address_id
WHERE o.deleted_at IS NULL;


-- ================================================================
-- SECTION 26: ROW LEVEL SECURITY (Supabase)
-- ================================================================

ALTER TABLE users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses        ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart             ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist         ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders           ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications    ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews          ENABLE ROW LEVEL SECURITY;
ALTER TABLE products         ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories       ENABLE ROW LEVEL SECURITY;

-- Users can only see/modify their own data
CREATE POLICY "own_profile"       ON users       FOR ALL USING (auth.uid() = id);
CREATE POLICY "own_addresses"     ON addresses   FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_cart"          ON cart        FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_cart_items"    ON cart_items  FOR ALL
    USING (cart_id IN (SELECT id FROM cart WHERE user_id = auth.uid()));
CREATE POLICY "own_wishlist"      ON wishlist    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_orders"        ON orders      FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_order_items"   ON order_items FOR ALL
    USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));
CREATE POLICY "own_notifications" ON notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_reviews"       ON reviews     FOR ALL USING (auth.uid() = user_id);

-- Products & categories are publicly readable
CREATE POLICY "products_public"   ON products         FOR SELECT USING (is_active = TRUE AND deleted_at IS NULL);
CREATE POLICY "variants_public"   ON product_variants FOR SELECT USING (is_active = TRUE);
CREATE POLICY "categories_public" ON categories       FOR SELECT USING (is_active = TRUE AND deleted_at IS NULL);

-- Admins can access all orders
CREATE POLICY "admin_orders" ON orders FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin','super_admin'))
);


-- ================================================================
-- SECTION 27: SEED DATA
-- ================================================================

INSERT INTO categories (name, slug, description, icon, color_gradient, sort_order) VALUES
('Groceries',           'groceries',           'Staples, pulses, oils, and everyday essentials', '🛒', 'from-green-400 to-green-600',   1),
('Vijaya Milk Products','vijaya-milk-products','Fresh milk, butter, paneer, curd, and more',      '🥛', 'from-blue-400 to-blue-600',     2),
('Snacks',              'snacks',              'Chips, namkeen, biscuits, and munchies',           '🍟', 'from-yellow-400 to-orange-500', 3),
('Cool Drinks',         'cool-drinks',         'Soft drinks, juices, energy drinks, and water',    '🥤', 'from-cyan-400 to-blue-500',     4),
('Fruits & Vegetables', 'fruits-vegetables',   'Fresh farm produce delivered daily',               '🥦', 'from-lime-400 to-green-500',    5),
('Personal Care',       'personal-care',       'Soaps, shampoos, skincare, and hygiene',           '🧴', 'from-pink-400 to-rose-500',     6);

-- Coupons — note FREEDEL uses value = 0 (allowed for free_delivery type)
INSERT INTO coupons (code, description, type, value, min_order_amount, max_discount_amount, total_usage_limit, per_user_limit, valid_until) VALUES
('FRESH10',   '10% off on all groceries',       'percentage',    10, 0,   200, 1000, 1, NOW() + INTERVAL '90 days'),
('SAVE15',    '15% off on orders above 500',    'percentage',    15, 500, 300,  500, 1, NOW() + INTERVAL '60 days'),
('NEWUSER20', '20% off on first order',         'percentage',    20, 0,   400, NULL, 1, NOW() + INTERVAL '30 days'),
('VIJAYA5',   '5% off on Vijaya Milk Products', 'percentage',     5, 0,   100,  300, 2, NOW() + INTERVAL '120 days'),
('FREEDEL',   'Free delivery on any order',     'free_delivery',  0, 0,  NULL,  200, 1, NOW() + INTERVAL '45 days');

-- Admin user (password handled by Supabase Auth)
INSERT INTO users (email, phone, full_name, role, is_verified) VALUES
('admin@grocerymart.in', '+919000000001', 'GroceryMart Admin', 'super_admin', TRUE);
