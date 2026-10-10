import { Pool } from "pg";
import { CREATE_TABLES_SQL } from "./schema.sql";

const usePg = process.env.USE_REAL_POSTGRES === "true";

let pool: Pool | null = null;

if (usePg) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgres://cloudsphere:cloudsphere@localhost:5432/cloudsphere"
  });
}

// In-Memory fallback store for standalone development/testing
export class MemoryDb {
  public users: Map<string, any> = new Map();
  public categories: Map<string, any> = new Map();
  public products: Map<string, any> = new Map();
  public coupons: Map<string, any> = new Map();
  public carts: Map<string, any> = new Map();
  public cartLines: Map<string, any> = new Map();
  public orders: Map<string, any> = new Map();
  public orderLines: Map<string, any> = new Map();
  public orderEvents: Map<string, any> = new Map();
  public payments: Map<string, any> = new Map();
  public deliveries: Map<string, any> = new Map();
  public returns: Map<string, any> = new Map();
  public returnLines: Map<string, any> = new Map();
  public services: Map<string, any> = new Map();
  public bookings: Map<string, any> = new Map();
  public auditEvents: Map<string, any> = new Map();
  public notifications: Map<string, any> = new Map();
  public opsAlerts: Map<string, any> = new Map();
  public stockReservations: Map<string, any> = new Map();
  public otpCodes: Map<string, any> = new Map();
  public sessions: Map<string, any> = new Map();

  public reset() {
    this.users.clear();
    this.categories.clear();
    this.products.clear();
    this.coupons.clear();
    this.carts.clear();
    this.cartLines.clear();
    this.orders.clear();
    this.orderLines.clear();
    this.orderEvents.clear();
    this.payments.clear();
    this.deliveries.clear();
    this.returns.clear();
    this.returnLines.clear();
    this.services.clear();
    this.bookings.clear();
    this.auditEvents.clear();
    this.notifications.clear();
    this.opsAlerts.clear();
    this.stockReservations.clear();
    this.otpCodes.clear();
    this.sessions.clear();
  }
}

export const memoryDb = new MemoryDb();

export async function query(sql: string, params: any[] = []): Promise<any> {
  if (pool) {
    const res = await pool.query(sql, params);
    return res.rows;
  }
  return [];
}

export async function initDb(): Promise<void> {
  if (pool) {
    await pool.query(CREATE_TABLES_SQL);
  }
}
