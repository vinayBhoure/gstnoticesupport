// Passthrough layout for the auth route group. The AuthCardShell provides all
// chrome (no Navbar/Footer). Route group keeps these SSR and isolated from the
// public marketing layout.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
