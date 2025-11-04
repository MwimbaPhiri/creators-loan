declare module '@coinbase/cdp-react' {
  import { ReactNode } from 'react'

  export interface Config {
    projectId: string
    ethereum?: {
      createOnLogin?: 'smart' | 'eoa'
      chainId?: number
    }
    appName?: string
    appLogoUrl?: string
    authMethods?: Array<
      | 'email'
      | 'sms'
      | 'oauth:google'
      | 'oauth:apple'
      | 'oauth:x'
      | 'oauth:github'
      | 'oauth:discord'
    >
    showCoinbaseFooter?: boolean
  }

  export interface Theme {
    'colors-bg-default': string
    'colors-bg-alternate': string
    'colors-bg-primary': string
    'colors-bg-secondary': string
    'colors-fg-default': string
    'colors-fg-muted': string
    'colors-fg-primary': string
    'colors-fg-onPrimary': string
    'colors-fg-onSecondary': string
    'colors-fg-positive': string
    'colors-fg-negative': string
    'colors-fg-warning': string
    'colors-line-default': string
    'colors-line-heavy': string
    'borderRadius-cta': string
    'borderRadius-link': string
    'borderRadius-input': string
    'borderRadius-select-trigger': string
    'borderRadius-select-list': string
    'borderRadius-modal': string
    'font-family-sans': string
  }

  export interface CDPReactProviderProps {
    config: Config
    theme?: Partial<Theme>
    children: ReactNode
  }

  export function CDPReactProvider(props: CDPReactProviderProps): JSX.Element
  export function AuthButton(): JSX.Element
}
