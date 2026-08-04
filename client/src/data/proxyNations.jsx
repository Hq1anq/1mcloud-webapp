import { getFlagIcon } from './flags.jsx'

// Nations available for Proxy service (from BuyProxyDialog)
export const proxyNations = [
  { symbol: 'VN', name: 'Việt Nam', shortName: 'Việt Nam' },
  { symbol: 'VNR', name: 'Việt Nam (Dân cư)', shortName: 'VN - Residential' },
  { symbol: 'SG', name: 'Singapore', shortName: 'Singapore' },
  { symbol: 'US', name: 'Mỹ (Hoa Kỳ)', shortName: 'Hoa Kỳ' },
  { symbol: 'CA', name: 'Canada', shortName: 'Canada' },
  { symbol: 'AU', name: 'Úc', shortName: 'Australia' },
  { symbol: 'DE', name: 'Đức', shortName: 'Germany' },
  { symbol: 'UK', name: 'Anh', shortName: 'United Kingdom' },
  { symbol: 'FR', name: 'Pháp', shortName: 'France' },
  { symbol: 'JP', name: 'Nhật Bản', shortName: 'Japan' },
  { symbol: 'HK', name: 'Hồng Kông', shortName: 'Hong Kong' },
].map((n) => ({
  ...n,
  flag: getFlagIcon(n.symbol),
}))
