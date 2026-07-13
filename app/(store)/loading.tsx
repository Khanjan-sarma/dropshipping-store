export default function Loading() {
  return (
    <div className="container-page py-16">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-600" />
      <p className="mt-4 text-center text-sm text-gray-500">Loading…</p>
    </div>
  );
}
