import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export default function Chart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-center h-64">
        <p className="text-gray-400">No data available for chart</p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.monthName ? d.monthName.split(' ')[0] : d.name,
    Income: d.totalIncome ?? 0,
    Expenses: d.totalExpenses ?? 0,
  }));

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-gray-800 font-semibold text-lg mb-4">Income vs Expenses</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
          <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, undefined]} />
          <Legend />
          <Bar dataKey="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
