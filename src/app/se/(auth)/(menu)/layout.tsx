export default function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-1 flex-col gap-1 p-3 pb-1">{children}</div>
  );
}
