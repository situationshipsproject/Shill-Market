export const TIERS = {
  ANON: {
    label: 'Anon',
    color: 'text-white/40',
    bg: 'bg-white/5',
    border: 'border-white/10',
    description: 'Wallet only, no vetting',
    maxJobValue: 500,
  },
  VERIFIED: {
    label: 'Verified',
    color: 'text-lime-400',
    bg: 'bg-lime-400/10',
    border: 'border-lime-400/20',
    description: 'Social + optional KYC',
    maxJobValue: 5000,
  },
  ELITE: {
    label: 'Elite',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    description: 'Fully vetted by platform',
    maxJobValue: 50000,
  },
  INSTITUTION: {
    label: 'Institution',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/20',
    description: 'Legal entity, full compliance',
    maxJobValue: 999999,
  },
} as const

export type TierKey = keyof typeof TIERS
