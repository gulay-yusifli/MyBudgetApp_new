export default function StatCard({ title, value, icon, colorClass, subtext }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-4 hover:shadow-xl transition-shadow duration-300">
      <div className={`rounded-xl p-3 ${colorClass}`}>
        <span className="text-white text-2xl">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
        <p className="text-gray-900 text-2xl font-bold truncate">{value}</p>
        {subtext && <p className="text-gray-400 text-xs mt-1">{subtext}</p>}
      </div>
    </div>
  );
}
