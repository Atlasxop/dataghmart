// DataMart API Utility — server-side only
// NEVER import this in client components
// All data bundle operations go through the DataMart API

import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'

// ─── Network Mapping ─────────────────────────────────────────────
export const NETWORK_MAP: Record<string, string> = {
  MTN: 'YELLO',
  Telecel: 'TELECEL',
  AirtelTigo: 'AT_PREMIUM',
}

// Reverse mapping for display purposes
export const NETWORK_DISPLAY: Record<string, string> = {
  YELLO: 'MTN',
  TELECEL: 'Telecel',
  AT_PREMIUM: 'AirtelTigo',
}

// ─── Types ────────────────────────────────────────────────────────
export interface DatamartProduct {
  id: string
  network: string
  capacity: number
  mb: number
  displayName: string
  basePrice: number
  sellingPrice: number
  profit: number
  inStock: boolean
}

export interface DatamartOrderResponse {
  id: string
  status: string
  reference?: string
  [key: string]: unknown
}

export interface DatamartWalletBalance {
  deposit: {
    balance: number
    currency: string
  }
  earnings: {
    availableBalance: number
    pendingBalance: number
    totalEarnings: number
    totalWithdrawn: number
    currency: string
  }
}

export interface DatamartDataPackage {
  id: string
  network: string
  capacity: number
  mb: number
  name: string
  price: number
  sellingPrice?: number
  [key: string]: unknown
}

export interface DatamartOrderStatus {
  id: string
  reference: string
  status: string
  phoneNumber?: string
  network?: string
  capacity?: number
  createdAt?: string
  updatedAt?: string
  [key: string]: unknown
}

export interface DatamartDeliveryTracker {
  pending: number
  processing: number
  completed: number
  failed: number
  [key: string]: unknown
}

export interface DatamartStoreProfile {
  id: string
  name: string
  email: string
  phone?: string
  status: string
  [key: string]: unknown
}

export interface DatamartWalletTransaction {
  id: string
  type: string
  amount: number
  balance: number
  description?: string
  reference?: string
  createdAt: string
  [key: string]: unknown
}

export interface DatamartBulkPurchaseResponse {
  success: boolean
  results: Array<{
    ref?: string
    orderId?: string
    status: string
    error?: string
  }>
  [key: string]: unknown
}

// ─── In-Memory Cache ──────────────────────────────────────────────
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

interface ProductCache {
  data: {
    products: DatamartProduct[]
    networks: string[]
  }
  timestamp: number
}

let productCache: ProductCache | null = null

// ─── Config Helpers ───────────────────────────────────────────────
// Support multiple env var names for flexibility
const STORE_BASE_URL = process.env.DATAMART_API_BASE_URL || 'https://api.datamartgh.shop/api/store/v1'
const DEVELOPER_BASE_URL = process.env.DATAMART_DEVELOPER_BASE_URL || 'https://api.datamartgh.shop/api/developer'
const API_KEY = process.env.DATAMART_API_KEY || process.env.DATAMART_STORE_API_KEY || ''
const WEBHOOK_SECRET = process.env.DATAMART_WEBHOOK_SECRET || ''

function getBaseUrl(): string {
  return STORE_BASE_URL
}

function getDeveloperBaseUrl(): string {
  return DEVELOPER_BASE_URL
}

function getApiKey(): string {
  return API_KEY
}

function getWebhookSecret(): string {
  return WEBHOOK_SECRET
}

/** Check if DataMart API is properly configured */
export function isDatamartConfigured(): boolean {
  return !!getApiKey()
}

// Store API headers (Bearer auth)
function storeHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getApiKey()}`,
  }
}

// Developer API headers (X-API-Key)
function developerHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'X-API-Key': getApiKey(),
  }
}

/**
 * Validate a Ghana phone number: starts with 0, exactly 10 digits
 */
export function isValidGhanaPhone(phone: string): boolean {
  return /^0\d{9}$/.test(phone)
}

/**
 * Map a human-readable network name to the DataMart API code.
 * Returns the code if already mapped, or throws if unknown.
 */
export function mapNetworkToCode(network: string): string {
  if (NETWORK_MAP[network]) return NETWORK_MAP[network]
  // If already a code, return as-is
  if (Object.values(NETWORK_MAP).includes(network)) return network
  throw new Error(`Unknown network: ${network}. Supported: ${Object.keys(NETWORK_MAP).join(', ')}`)
}

// ─── Store API Calls ─────────────────────────────────────────────

/**
 * GET /products — fetches available DataMart products from the store API.
 * Results are cached in memory for 5 minutes.
 */
export async function getDatamartProducts(): Promise<{
  products: DatamartProduct[]
  networks: string[]
}> {
  // Return cached if fresh
  if (productCache && Date.now() - productCache.timestamp < CACHE_TTL) {
    return productCache.data
  }

  if (!isDatamartConfigured()) {
    console.warn('DataMart API key not configured — returning empty products')
    return { products: [], networks: [] }
  }

  const res = await fetch(`${getBaseUrl()}/products`, {
    method: 'GET',
    headers: storeHeaders(),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('DataMart GET /products failed:', res.status, text)
    throw new Error(`DataMart products fetch failed: ${res.status}`)
  }

  const json = await res.json()

  // Normalize the response shape — API returns flat array or {data: [...]}
  const rawProducts: DatamartProduct[] = Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : []
  const networks = [...new Set(rawProducts.map((p) => p.network).filter(Boolean))]

  const data = { products: rawProducts, networks }

  // Update cache
  productCache = { data, timestamp: Date.now() }

  return data
}

/**
 * GET /developer/data-packages — fetches data packages from the developer API.
 */
export async function getDatamartDataPackages(): Promise<DatamartDataPackage[]> {
  if (!isDatamartConfigured()) {
    console.warn('DataMart API key not configured — returning empty data packages')
    return []
  }

  const res = await fetch(`${getDeveloperBaseUrl()}/data-packages`, {
    method: 'GET',
    headers: developerHeaders(),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('DataMart GET /developer/data-packages failed:', res.status, text)
    throw new Error(`DataMart data-packages fetch failed: ${res.status}`)
  }

  const json = await res.json()
  return Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : []
}

/**
 * GET /products + /developer/data-packages — combined product list organized by network.
 */
export async function getCombinedProducts(): Promise<{
  products: DatamartProduct[]
  dataPackages: DatamartDataPackage[]
  networks: string[]
  byNetwork: Record<string, {
    storeProducts: DatamartProduct[]
    dataPackages: DatamartDataPackage[]
  }>
}> {
  // Fetch both in parallel
  const [storeResult, dataPackages] = await Promise.allSettled([
    getDatamartProducts(),
    getDatamartDataPackages(),
  ])

  const products = storeResult.status === 'fulfilled' ? storeResult.value.products : []
  const packages = dataPackages.status === 'fulfilled' ? dataPackages.value : []

  // Collect all unique networks
  const networkSet = new Set<string>()
  for (const p of products) {
    if (p.network) networkSet.add(p.network)
  }
  for (const pkg of packages) {
    if (pkg.network) networkSet.add(pkg.network)
  }
  const networks = [...networkSet]

  // Organize by network
  const byNetwork: Record<string, {
    storeProducts: DatamartProduct[]
    dataPackages: DatamartDataPackage[]
  }> = {}

  for (const network of networks) {
    byNetwork[network] = {
      storeProducts: products.filter((p) => p.network === network),
      dataPackages: packages.filter((p) => p.network === network),
    }
  }

  return { products, dataPackages: packages, networks, byNetwork }
}

/**
 * POST /orders — place a data bundle order with idempotency (Store API).
 * This is the main payment flow — DataMart deducts from the store wallet
 * and delivers data instantly to the phone number.
 */
export async function placeDatamartOrder(
  phoneNumber: string,
  networkCode: string,
  capacity: number,
  idempotencyKey?: string,
): Promise<DatamartOrderResponse> {
  if (!isDatamartConfigured()) {
    throw new Error('DataMart API is not configured. Please set DATAMART_API_KEY environment variable.')
  }

  const key = idempotencyKey || uuidv4()

  const res = await fetch(`${getBaseUrl()}/orders`, {
    method: 'POST',
    headers: {
      ...storeHeaders(),
      'x-idempotency-key': key,
    },
    body: JSON.stringify({
      phoneNumber,
      network: networkCode,
      capacity,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('DataMart POST /orders failed:', res.status, text)
    throw new Error(`DataMart order placement failed: ${res.status} - ${text}`)
  }

  const json = await res.json()
  return json.data || json
}

/**
 * GET /developer/order-status/:reference — check order status (Developer API).
 */
export async function getDatamartOrderStatus(reference: string): Promise<DatamartOrderStatus> {
  if (!isDatamartConfigured()) {
    throw new Error('DataMart API is not configured.')
  }

  const res = await fetch(`${getDeveloperBaseUrl()}/order-status/${encodeURIComponent(reference)}`, {
    method: 'GET',
    headers: developerHeaders(),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('DataMart GET /developer/order-status failed:', res.status, text)
    throw new Error(`DataMart order status fetch failed: ${res.status}`)
  }

  const json = await res.json()
  return json.data || json
}

/**
 * GET /wallet/balance — retrieve DataMart wallet balance.
 */
export async function getDatamartWalletBalance(): Promise<DatamartWalletBalance> {
  if (!isDatamartConfigured()) {
    throw new Error('DataMart API is not configured.')
  }

  const res = await fetch(`${getBaseUrl()}/wallet/balance`, {
    method: 'GET',
    headers: storeHeaders(),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('DataMart GET /wallet/balance failed:', res.status, text)
    throw new Error(`DataMart wallet balance fetch failed: ${res.status}`)
  }

  const json = await res.json()
  return json.data || json
}

/**
 * GET /wallet/transactions — retrieve DataMart wallet transactions.
 */
export async function getDatamartWalletTransactions(): Promise<DatamartWalletTransaction[]> {
  if (!isDatamartConfigured()) {
    throw new Error('DataMart API is not configured.')
  }

  const res = await fetch(`${getBaseUrl()}/wallet/transactions`, {
    method: 'GET',
    headers: storeHeaders(),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('DataMart GET /wallet/transactions failed:', res.status, text)
    throw new Error(`DataMart wallet transactions fetch failed: ${res.status}`)
  }

  const json = await res.json()
  return Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : []
}

/**
 * GET /orders — retrieve DataMart orders list.
 */
export async function getDatamartOrders(): Promise<DatamartOrderStatus[]> {
  if (!isDatamartConfigured()) {
    throw new Error('DataMart API is not configured.')
  }

  const res = await fetch(`${getBaseUrl()}/orders`, {
    method: 'GET',
    headers: storeHeaders(),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('DataMart GET /orders failed:', res.status, text)
    throw new Error(`DataMart orders fetch failed: ${res.status}`)
  }

  const json = await res.json()
  return Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : []
}

/**
 * GET /developer/delivery-tracker — retrieve delivery tracker stats.
 */
export async function getDatamartDeliveryTracker(): Promise<DatamartDeliveryTracker> {
  if (!isDatamartConfigured()) {
    throw new Error('DataMart API is not configured.')
  }

  const res = await fetch(`${getDeveloperBaseUrl()}/delivery-tracker`, {
    method: 'GET',
    headers: developerHeaders(),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('DataMart GET /developer/delivery-tracker failed:', res.status, text)
    throw new Error(`DataMart delivery tracker fetch failed: ${res.status}`)
  }

  const json = await res.json()
  return json.data || json
}

/**
 * POST /developer/bulk-purchase — place bulk orders (Developer API).
 */
export async function placeDatamartBulkOrder(
  orders: Array<{ phoneNumber: string; network: string; capacity: number; ref?: string }>,
  idempotencyKey?: string,
): Promise<DatamartBulkPurchaseResponse> {
  if (!isDatamartConfigured()) {
    throw new Error('DataMart API is not configured.')
  }

  const key = idempotencyKey || uuidv4()

  if (orders.length > 50) {
    throw new Error('Bulk purchase limited to 50 orders at a time')
  }

  const res = await fetch(`${getDeveloperBaseUrl()}/bulk-purchase`, {
    method: 'POST',
    headers: {
      ...developerHeaders(),
      'x-idempotency-key': key,
    },
    body: JSON.stringify({ orders }),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('DataMart POST /developer/bulk-purchase failed:', res.status, text)
    throw new Error(`DataMart bulk purchase failed: ${res.status} - ${text}`)
  }

  const json = await res.json()
  return json.data || json
}

/**
 * GET /store — retrieve store profile.
 */
export async function getDatamartStoreProfile(): Promise<DatamartStoreProfile> {
  if (!isDatamartConfigured()) {
    throw new Error('DataMart API is not configured.')
  }

  const res = await fetch(`${getBaseUrl()}/store`, {
    method: 'GET',
    headers: storeHeaders(),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('DataMart GET /store failed:', res.status, text)
    throw new Error(`DataMart store profile fetch failed: ${res.status}`)
  }

  const json = await res.json()
  return json.data || json
}

/**
 * Verify DataMart webhook signature.
 */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = getWebhookSecret()
  if (!secret) return false

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')

  return expectedSignature === signature
}

/**
 * Invalidate the product cache (useful for admin refreshes).
 */
export function invalidateProductCache(): void {
  productCache = null
}
