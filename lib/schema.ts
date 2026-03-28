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
