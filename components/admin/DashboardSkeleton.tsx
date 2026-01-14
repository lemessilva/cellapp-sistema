export default function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* KPI Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-32">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
              <div className="w-16 h-6 bg-slate-200 rounded-full"></div>
            </div>
            <div className="w-24 h-4 bg-slate-200 rounded mb-2"></div>
            <div className="w-16 h-8 bg-slate-200 rounded"></div>
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-[400px]">
          <div className="w-32 h-6 bg-slate-200 rounded mb-6"></div>
          <div className="w-full h-full bg-slate-100 rounded-lg"></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-[400px]">
          <div className="w-32 h-6 bg-slate-200 rounded mb-6"></div>
          <div className="w-full h-full bg-slate-100 rounded-lg"></div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden h-64">
        <div className="p-6 border-b border-slate-100">
          <div className="w-48 h-6 bg-slate-200 rounded"></div>
        </div>
        <div className="space-y-4 p-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-full h-12 bg-slate-50 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  )
}
