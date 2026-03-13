export default function StatCard({ title, value, icon }) {

  const Icon = icon;

  return (
    <div className="bg-white p-6 rounded-xl shadow flex items-center justify-between">

      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
      </div>

      <div className="bg-blue-100 p-3 rounded-lg">
        <Icon size={22} />
      </div>

    </div>
  );
}