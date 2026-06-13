// Dataghmart — Ghana Phone Number Network Detection
// Maps common Ghana phone number prefixes to their mobile networks

export type DetectedNetwork = "YELLO" | "TELECEL" | "AT_PREMIUM" | null

interface NetworkInfo {
  key: DetectedNetwork
  name: string
  prefixes: string[]
}

const NETWORK_PREFIXES: NetworkInfo[] = [
  {
    key: "YELLO",
    name: "MTN",
    prefixes: ["024", "054", "055", "059"],
  },
  {
    key: "TELECEL",
    name: "Telecel",
    prefixes: ["020", "050"],
  },
  {
    key: "AT_PREMIUM",
    name: "AirtelTigo",
    prefixes: ["026", "056", "057"],
  },
]

/**
 * Detects the Ghana mobile network based on phone number prefix.
 * @param phone - The phone number string (expects format starting with 0, e.g. "024XXXXXXX")
 * @returns The network key ("YELLO" | "TELECEL" | "AT_PREMIUM") or null if not detected
 */
export function detectNetwork(phone: string): DetectedNetwork {
  if (!phone || phone.length < 3) return null

  const prefix = phone.substring(0, 3)

  for (const network of NETWORK_PREFIXES) {
    if (network.prefixes.includes(prefix)) {
      return network.key
    }
  }

  return null
}

/**
 * Gets the human-readable network name from a detected network key.
 * @param networkKey - The network key returned by detectNetwork
 * @returns The network name or null
 */
export function getNetworkName(networkKey: DetectedNetwork): string | null {
  if (!networkKey) return null
  const network = NETWORK_PREFIXES.find((n) => n.key === networkKey)
  return network?.name ?? null
}

/**
 * Validates a Ghana phone number format.
 * Must be exactly 10 digits starting with 0.
 * @param phone - The phone number string
 * @returns true if valid format
 */
export function isValidGhanaPhone(phone: string): boolean {
  return /^0\d{9}$/.test(phone)
}
