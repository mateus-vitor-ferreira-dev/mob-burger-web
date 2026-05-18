export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header virá aqui */}
      <main className="flex-1">{children}</main>
      {/* Footer virá aqui */}
    </div>
  );
}
