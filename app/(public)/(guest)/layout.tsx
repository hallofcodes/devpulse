import Nav from "@/app/components/layout/Nav";

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen overflow-hidden relative">
      <Nav />

      <div className="mt-30 max-w-7xl mx-auto">{children}</div>
    </div>
  );
}
