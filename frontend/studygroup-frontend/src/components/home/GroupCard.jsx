export default function GroupCard({ title, time, members, status, image }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-3 flex items-stretch gap-3">
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">{title}</h3>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              status === "Online"
                ? "bg-green-100 text-green-700"
                : "bg-orange-100 text-orange-700"
            }`}
          >
            {status}
          </span>
        </div>

        <p className="text-sm text-slate-500 mt-3">{time}</p>
        <p className="text-sm text-slate-500">{members}</p>
      </div>

      <div className="w-28 h-28 rounded-xl overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}