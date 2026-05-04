import type { PrivyClientConfig } from '@privy-io/react-auth'

export const privyConfig: PrivyClientConfig = {
  loginMethods: ['wallet', 'email', 'google', 'twitter'],
  appearance: {
    theme: 'dark',
    accentColor: '#a3e635',
    logo: '',
  },
  embeddedWallets: {
    createOnLogin: 'users-without-wallets',
  },
}
