// Dataghmart - Smart Product Ranking Logic

export interface RankingInput {
  salesLast30Days: number
  averageRating: number
  isBoosted: boolean
  isFeatured: boolean
  daysSinceCreation: number
}

export function calculateRelevanceScore(input: RankingInput): number {
  const { salesLast30Days, averageRating, isBoosted, isFeatured, daysSinceCreation } = input
  return (
    salesLast30Days * 3 +
    averageRating * 10 +
    (isBoosted ? 100 : 0) +
    (isFeatured ? 50 : 0) -
    daysSinceCreation * 0.2
  )
}

export function isBoostActive(boostedUntil: Date | string | null): boolean {
  if (!boostedUntil) return false
  return new Date(boostedUntil) > new Date()
}

export function getBoostTimeRemaining(boostedUntil: Date | string): string {
  const end = new Date(boostedUntil)
  const now = new Date()
  const diff = end.getTime() - now.getTime()

  if (diff <= 0) return 'Expired'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 0) return `${days}d ${hours}h remaining`
  return `${hours}h remaining`
}

export function getBoostDurationHours(durationType: string): number {
  switch (durationType) {
    case '1day': return 24
    case '3days': return 72
    case '1month': return 24 * 30
    default: return 24
  }
}

export function getBoostEndDate(durationType: string): Date {
  const now = new Date()
  const hours = getBoostDurationHours(durationType)
  return new Date(now.getTime() + hours * 60 * 60 * 1000)
}
