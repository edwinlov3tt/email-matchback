/**
 * Market detection and validation utilities
 */

export interface MarketInfo {
  market: string;
  count: number;
  percentage: number;
}

/**
 * Detect markets from a dataset
 */
export function detectMarkets(records: Array<{ market?: string }>): string[] {
  const markets = new Set<string>();

  records.forEach(record => {
    if (record.market) {
      markets.add(record.market.trim());
    }
  });

  return Array.from(markets).sort();
}

/**
 * Get detailed market information from records
 */
export function getMarketInfo(records: Array<{ market?: string }>): MarketInfo[] {
  const marketCounts = new Map<string, number>();
  const total = records.length;

  records.forEach(record => {
    if (record.market) {
      const market = record.market.trim();
      marketCounts.set(market, (marketCounts.get(market) || 0) + 1);
    }
  });

  return Array.from(marketCounts.entries())
    .map(([market, count]) => ({
      market,
      count,
      percentage: (count / total) * 100,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Validate that records don't mix markets
 */
export function validateMarketSeparation(
  records: Array<{ market?: string }>,
  allowedMarkets?: string[]
): { valid: boolean; markets: string[]; error?: string } {
  const detectedMarkets = detectMarkets(records);

  if (detectedMarkets.length === 0) {
    return {
      valid: false,
      markets: [],
      error: 'No market information found in records',
    };
  }

  if (detectedMarkets.length > 1) {
    return {
      valid: false,
      markets: detectedMarkets,
      error: `Market mixing detected: ${detectedMarkets.join(', ')}`,
    };
  }

  if (allowedMarkets && !allowedMarkets.includes(detectedMarkets[0])) {
    return {
      valid: false,
      markets: detectedMarkets,
      error: `Unexpected market: ${detectedMarkets[0]}. Expected one of: ${allowedMarkets.join(', ')}`,
    };
  }

  return {
    valid: true,
    markets: detectedMarkets,
  };
}

/**
 * Group records by market
 */
export function groupByMarket<T extends { market?: string }>(
  records: T[]
): Map<string, T[]> {
  const grouped = new Map<string, T[]>();

  records.forEach(record => {
    const market = record.market || 'UNKNOWN';
    if (!grouped.has(market)) {
      grouped.set(market, []);
    }
    grouped.get(market)!.push(record);
  });

  return grouped;
}
