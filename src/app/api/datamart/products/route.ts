import { getCombinedProducts, NETWORK_MAP, NETWORK_DISPLAY, isDatamartConfigured } from '@/lib/datamart'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check if DataMart API is configured
    if (!isDatamartConfigured()) {
      return NextResponse.json({
        products: [],
        dataPackages: [],
        networks: Object.keys(NETWORK_MAP),
        byNetwork: {},
        networkMap: NETWORK_MAP,
        networkDisplay: NETWORK_DISPLAY,
        configured: false,
      })
    }

    const data = await getCombinedProducts()

    return NextResponse.json({
      products: data.products,
      dataPackages: data.dataPackages,
      networks: data.networks,
      byNetwork: data.byNetwork,
      networkMap: NETWORK_MAP,
      networkDisplay: NETWORK_DISPLAY,
      configured: true,
    })
  } catch (error) {
    console.error('GET /api/datamart/products error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch DataMart products' },
      { status: 500 },
    )
  }
}
