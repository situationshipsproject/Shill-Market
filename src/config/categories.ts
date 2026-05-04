export const CATEGORIES = [
  { icon: '⚙️', name: 'Development', slug: 'development', description: 'Smart contracts, bots, frontends, audits' },
  { icon: '🎨', name: 'Design & Art', slug: 'design-art', description: 'PFPs, banners, memes, animated content' },
  { icon: '📣', name: 'Marketing', slug: 'marketing', description: 'Shill packages, threads, viral content' },
  { icon: '👥', name: 'Community', slug: 'community', description: 'TG creation, Discord setup, moderation' },
  { icon: '📞', name: 'Callers / KOLs', slug: 'callers-kols', description: 'Promotion, spaces hosting, Twitter' },
  { icon: '📊', name: 'Strategy', slug: 'strategy', description: 'Tokenomics, launch planning, roadmaps' },
  { icon: '🔍', name: 'Research & Alpha', slug: 'research-alpha', description: 'Market analysis, competitor research' },
  { icon: '⚖️', name: 'Brokerage', slug: 'brokerage', description: 'Middle-man services, KOL management' },
  { icon: '📋', name: 'Compliance', slug: 'compliance', description: 'Legal review, audits, entity setup' },
] as const

export type CategorySlug = typeof CATEGORIES[number]['slug']
