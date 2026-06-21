import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

const colorClasses = {
  blue: 'bg-[#EFF6FF] text-[#1E3A8A]',
  green: 'bg-[#ECFDF5] text-[#10B981]',
  purple: 'bg-[#F3E8FF] text-[#9333EA]',
  orange: 'bg-[#FFFBEB] text-[#F59E0B]',
  red: 'bg-[#FEF2F2] text-[#EF4444]',
};

export default function DashboardCard({ title, value, icon: Icon, color }: DashboardCardProps) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-xs font-medium text-[#10B981] bg-[#ECFDF5] px-2 py-1 rounded-full">
          +5%
        </span>
      </div>
      <p className="text-2xl font-bold text-[#1C1917]">{value}</p>
      <p className="text-sm text-[#78716C]">{title}</p>
    </div>
  );
}
