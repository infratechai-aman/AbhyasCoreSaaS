export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-[#fafafc] p-6 lg:p-8 animate-pulse">
      <div className="max-w-[1400px] mx-auto">
        <div className="h-8 w-56 bg-slate-200 rounded-lg mb-2" />
        <div className="h-4 w-72 bg-slate-100 rounded-lg mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 h-28" />
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="h-5 w-32 bg-slate-200 rounded-lg mb-6" />
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-50 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
