import { Briefcase, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Extraworks() {
  const extraworks = [
    {
      id: 1,
      title: 'Desarrollo de API REST',
      client: 'TechCorp',
      status: 'in-progress',
      hours: 24,
      deadline: '2026-01-25',
    },
    {
      id: 2,
      title: 'Diseño UI/UX Dashboard',
      client: 'StartupXYZ',
      status: 'completed',
      hours: 16,
      deadline: '2026-01-20',
    },
    {
      id: 3,
      title: 'Consultoría Backend',
      client: 'Enterprise Inc',
      status: 'pending',
      hours: 8,
      deadline: '2026-01-30',
    },
    {
      id: 4,
      title: 'Optimización Base de Datos',
      client: 'DataCo',
      status: 'in-progress',
      hours: 12,
      deadline: '2026-01-28',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Extraworks</h1>
        <p className="text-gray-600 mt-1">Gestión de trabajos adicionales</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          icon={<Briefcase className="w-5 h-5" />}
          label="Total Projects"
          value="4"
          bgColor="bg-blue-50"
          textColor="text-blue-600"
        />
        <SummaryCard
          icon={<Clock className="w-5 h-5" />}
          label="Total Hours"
          value="60"
          bgColor="bg-purple-50"
          textColor="text-purple-600"
        />
        <SummaryCard
          icon={<CheckCircle2 className="w-5 h-5" />}
          label="Completed"
          value="1"
          bgColor="bg-green-50"
          textColor="text-green-600"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proyecto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deadline
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {extraworks.map((work) => (
                <tr key={work.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{work.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{work.client}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={work.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {work.hours}h
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{work.deadline}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  bgColor,
  textColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bgColor: string;
  textColor: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${bgColor} ${textColor}`}>{icon}</div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    completed: {
      label: 'Completado',
      color: 'bg-green-100 text-green-800',
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    'in-progress': {
      label: 'En Progreso',
      color: 'bg-blue-100 text-blue-800',
      icon: <Clock className="w-4 h-4" />,
    },
    pending: {
      label: 'Pendiente',
      color: 'bg-yellow-100 text-yellow-800',
      icon: <AlertCircle className="w-4 h-4" />,
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}
