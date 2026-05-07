interface InfoCardProps {
  label: string;
  value: string;
}

export default function InfoCard({ label, value }: InfoCardProps) {
  return (
    <div className="bg-white rounded-[20px] p-4 flex-1 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-50 flex flex-col justify-center">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
        {label}
      </span>
      <span className="text-gray-900 font-semibold text-base">{value}</span>
    </div>
  );
}
