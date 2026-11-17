export default function DropsLayout({ children }: LayoutProps<"/drops">) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">{children}</main>
  );
}
