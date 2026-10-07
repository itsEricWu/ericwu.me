export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[1040px]" data-col="blog">
      {children}
    </div>
  );
}
