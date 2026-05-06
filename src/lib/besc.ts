const BESC_API = 'https://api.beschypercharts.com'

export interface BescTokenInfo {
  name: string
  symbol: string
  decimals: number
  totalSupply: string
  contractAddress: string
}

export interface BescTokenPrice {
  price: number
  priceUsd: number
  change24h?: number
}

export async function getTokenInfo(contractAddress: string): Promise<BescTokenInfo | null> {
  try {
    const res = await fetch(`${BESC_API}/token/info/${contractAddress}`, { next: { revalidate: 300 } })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function getTokenPrice(contractAddress: string): Promise<BescTokenPrice | null> {
  try {
    const res = await fetch(`${BESC_API}/token/price/${contractAddress}`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    const data = await res.json()
    return { price: data.price ?? 1, priceUsd: data.priceUsd ?? data.price ?? 1, change24h: data.change24h }
  } catch {
    return null
  }
}

export async function getFUSDPrice(): Promise<number> {
  const result = await getTokenPrice('0xcfd6AaA9373CEebcC03D3cd9d87d4033da67B8e9')
  return result?.priceUsd ?? 1
}

export async function verifyTransaction(contractAddress: string, txHash: string): Promise<boolean> {
  try {
    const res = await fetch(`${BESC_API}/transactions/${contractAddress}`, { next: { revalidate: 30 } })
    if (!res.ok) return false
    const data = await res.json()
    const txs: Array<{ hash: string }> = data.transactions ?? data ?? []
    return txs.some((tx) => tx.hash?.toLowerCase() === txHash.toLowerCase())
  } catch {
    return false
  }
}
