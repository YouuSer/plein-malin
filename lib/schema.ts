import { sqliteTable, text, real, integer, index } from "drizzle-orm/sqlite-core";

// ─── Stations ────────────────────────────────────────────
export const stations = sqliteTable(
  "stations",
  {
    id: text("id").primaryKey(),
    name: text("name"),
    address: text("address").notNull(),
    city: text("city").notNull(),
    postalCode: text("postal_code").notNull(),
    department: text("department"),
    latitude: real("latitude").notNull(),
    longitude: real("longitude").notNull(),
    services: text("services"), // JSON array
    schedule: text("schedule"), // JSON
    isAutomate24h: integer("is_automate_24h", { mode: "boolean" }).default(
      false
    ),
    lastUpdated: text("last_updated").notNull(),
  },
  (table) => [
    index("idx_stations_lat").on(table.latitude),
    index("idx_stations_lon").on(table.longitude),
    index("idx_stations_dept").on(table.department),
  ]
);

// ─── Current Prices (latest snapshot) ────────────────────
export const currentPrices = sqliteTable(
  "current_prices",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    stationId: text("station_id")
      .notNull()
      .references(() => stations.id),
    fuelType: text("fuel_type").notNull(),
    price: real("price").notNull(),
    updatedAt: text("updated_at").notNull(),
    shortage: text("shortage"),
  },
  (table) => [
    index("idx_cp_station").on(table.stationId),
    index("idx_cp_fuel").on(table.fuelType),
    index("idx_cp_station_fuel").on(table.stationId, table.fuelType),
  ]
);

// ─── Users (Better Auth managed) ─────────────────────────
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  preferredFuel: text("preferred_fuel").default("e10"),
  tankSize: integer("tank_size").default(50),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

// ─── Favorites ───────────────────────────────────────────
export const favorites = sqliteTable(
  "favorites",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    stationId: text("station_id")
      .notNull()
      .references(() => stations.id),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("idx_fav_user").on(table.userId)]
);

// ─── Price Alerts ────────────────────────────────────────
export const priceAlerts = sqliteTable(
  "price_alerts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    stationId: text("station_id").references(() => stations.id),
    fuelType: text("fuel_type").notNull(),
    targetPrice: real("target_price").notNull(),
    radiusKm: integer("radius_km"),
    isActive: integer("is_active", { mode: "boolean" }).default(true),
    lastTriggered: text("last_triggered"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("idx_alert_user").on(table.userId)]
);

// ─── Fill-up Log ─────────────────────────────────────────
export const fillUps = sqliteTable(
  "fill_ups",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    stationId: text("station_id")
      .notNull()
      .references(() => stations.id),
    fuelType: text("fuel_type").notNull(),
    liters: real("liters").notNull(),
    pricePerLiter: real("price_per_liter").notNull(),
    totalCost: real("total_cost").notNull(),
    savedVsAverage: real("saved_vs_average"),
    filledAt: text("filled_at").notNull(),
  },
  (table) => [
    index("idx_fillup_user").on(table.userId),
    index("idx_fillup_date").on(table.filledAt),
  ]
);

// ─── Community Reports ───────────────────────────────────
export const communityReports = sqliteTable(
  "community_reports",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    stationId: text("station_id")
      .notNull()
      .references(() => stations.id),
    reportType: text("report_type").notNull(), // price_confirm, price_wrong, closed, queue
    fuelType: text("fuel_type"),
    reportedPrice: real("reported_price"),
    comment: text("comment"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("idx_report_station").on(table.stationId),
    index("idx_report_user").on(table.userId),
  ]
);

// ─── Badges / Gamification ───────────────────────────────
export const userBadges = sqliteTable(
  "user_badges",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    badgeType: text("badge_type").notNull(),
    earnedAt: text("earned_at").notNull(),
  },
  (table) => [index("idx_badge_user").on(table.userId)]
);

// ─── Share Tokens ────────────────────────────────────────
export const shareTokens = sqliteTable("share_tokens", {
  id: text("id").primaryKey(), // nanoid token
  type: text("type").notNull(), // prix_du_jour, bilan, alerte
  data: text("data").notNull(), // JSON payload
  createdAt: text("created_at").notNull(),
  views: integer("views").default(0),
});

// ─── Price History (for trend charts) ────────────────────
export const priceHistory = sqliteTable(
  "price_history",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    stationId: text("station_id")
      .notNull()
      .references(() => stations.id),
    fuelType: text("fuel_type").notNull(),
    price: real("price").notNull(),
    recordedAt: text("recorded_at").notNull(),
  },
  (table) => [
    index("idx_ph_station_fuel").on(table.stationId, table.fuelType),
    index("idx_ph_recorded").on(table.recordedAt),
  ]
);
