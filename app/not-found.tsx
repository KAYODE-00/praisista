export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-500">404</p>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">This room is not here.</h1>
        <p className="mt-3 text-slate-600">The page you’re looking for may have moved or never existed.</p>
      </div>
    </main>
  );
}
