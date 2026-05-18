export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100dvh', background: '#F7F8FA', maxWidth: 480, margin: '0 auto' }}>
      {children}
    </div>
  );
}
