export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#fafafc] p-4 sm:p-6 lg:p-8 animate-pulse">
      {/* Header skeleton */}
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-7 w-48 bg-slate-200 rounded-lg mb-2" />
            <div className="h-4 w-64 bg-slate-100 rounded-lg" />
          </div>
          <div className="h-10 w-32 bg-slate-200 rounded-xl" />
        </div>

        {/* Stats grid skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5">
              <div className="h-3 w-20 bg-slate-100 rounded mb-3" />
              <div className="h-8 w-16 bg-slate-200 rounded-lg mb-2" />
              <div className="h-3 w-24 bg-slate-50 rounded" />
            </div>
          ))}
        </div>

        {/* Main content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6">
            <div className="h-5 w-40 bg-slate-200 rounded-lg mb-6" />
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-slate-100 rounded-xl flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 w-3/4 bg-slate-100 rounded mb-2" />
                    <div className="h-3 w-1/2 bg-slate-50 rounded" />
                  </div>
                  <div className="h-8 w-20 bg-slate-100 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="h-5 w-32 bg-slate-200 rounded-lg mb-6" />
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-50 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
