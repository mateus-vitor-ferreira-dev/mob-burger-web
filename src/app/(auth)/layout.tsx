import { AuthProviders } from "./providers"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthProviders>{children}</AuthProviders>
}
