import type {
  Category,
  DataMode,
  DataModeInfo,
  Order,
  OrderStatus,
  Paginated,
  Product,
  ProductFilters,
  StoreSettings,
} from "@/types";

export interface ProductInput {
  name: string;
  slug: string;
  description: string;
  sku: string | null;
  price: number;
  compare_at_price: number | null;
  stock_quantity: number | null;
  category_id: string | null;
  primary_image_url: string | null;
  colours: string[];
  is_active: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  seo_title: string | null;
  seo_description: string | null;
}

export interface CategoryInput {
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface OrderItemInput {
  productId: string | null;
  productName: string;
  variant: string | null;
  quantity: number;
  unitPrice: number;
}

export interface OrderInput {
  customerName: string | null;
  customerPhone: string | null;
  notes: string | null;
  currency: string;
  subtotal: number;
  items: OrderItemInput[];
}

export interface CatalogDriver {
  readonly mode: DataMode;

  listProducts(filters?: ProductFilters): Promise<Paginated<Product>>;
  getProductBySlug(slug: string): Promise<Product | null>;
  getProductById(id: string): Promise<Product | null>;
  getProductsByIds(ids: string[]): Promise<Product[]>;
  listCategories(options?: { activeOnly?: boolean }): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | null>;
  getColours(): Promise<string[]>;
  getSettings(): Promise<StoreSettings>;
  /** Returns product ids ranked by recorded order quantity; empty without sales data. */
  getBestsellerIds(limit?: number): Promise<string[]>;

  createProduct(input: ProductInput): Promise<Product>;
  updateProduct(id: string, input: Partial<ProductInput>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;

  createCategory(input: CategoryInput): Promise<Category>;
  updateCategory(id: string, input: Partial<CategoryInput>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;

  listOrders(options?: { status?: OrderStatus }): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | null>;
  createOrder(input: OrderInput): Promise<Order>;
  updateOrderStatus(id: string, status: OrderStatus): Promise<Order>;

  updateSettings(input: Partial<StoreSettings>): Promise<StoreSettings>;
}

export function getDataModeInfo(): DataModeInfo {
  if (isLocalCatalogMode()) {
    return { mode: "local", reason: "CATALOG_MODE=local is set for local development." };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key) {
    return { mode: "supabase", reason: "beautybybangles database configured via environment." };
  }
  return {
    mode: "local",
    reason:
      "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set, so the read-only local catalogue copy is being served. Configure Supabase before going live.",
  };
}

export const isSupabaseConfigured = (): boolean =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const isLocalCatalogMode = (): boolean =>
  process.env.NODE_ENV === "development" && process.env.CATALOG_MODE === "local";
