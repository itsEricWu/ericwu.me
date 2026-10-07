export default function BlogLoading() {
  return (
    <div aria-busy="true" aria-label="Loading" className="space-y-4 pt-4">
      <div className="mx-auto h-8 w-40 animate-pulse rounded-full bg-card-2" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-64 animate-pulse rounded-[28px] bg-card-2"
          />
        ))}
      </div>
    </div>
  );
}
