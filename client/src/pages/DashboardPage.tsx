import { useQuery } from '@apollo/client';
import { motion } from 'framer-motion';
import {
  Users,
  UserCheck,
  UserX,
  Flag,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { GET_DASHBOARD_STATS, GET_EMPLOYEES } from '../graphql/queries';
import { Employee } from '../types';
import { Link } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { data: statsData, loading: statsLoading } = useQuery(GET_DASHBOARD_STATS);
  const { data: employeesData, loading: employeesLoading } = useQuery(GET_EMPLOYEES, {
    variables: { pagination: { page: 1, pageSize: 5 }, sort: { field: 'JOIN_DATE', direction: 'DESC' } },
  });

  const stats = statsData?.dashboardStats;
  const recentEmployees = employeesData?.employees?.data || [];

  const statCards = [
    {
      label: 'Total Employees',
      value: stats?.totalEmployees || 0,
      icon: Users,
      color: 'primary',
      change: '+12%',
      trend: 'up',
    },
    {
      label: 'Active',
      value: stats?.activeEmployees || 0,
      icon: UserCheck,
      color: 'emerald',
      change: '+5%',
      trend: 'up',
    },
    {
      label: 'On Leave',
      value: stats?.onLeaveEmployees || 0,
      icon: UserX,
      color: 'amber',
      change: '-2%',
      trend: 'down',
    },
    {
      label: 'Flagged',
      value: stats?.flaggedEmployees || 0,
      icon: Flag,
      color: 'red',
      change: '0%',
      trend: 'neutral',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-display font-bold text-surface-100 mb-2">
          Dashboard
        </h1>
        <p className="text-surface-500">
          Welcome back! Here's what's happening with your team today.
        </p>
      </motion.div>

      {/* Stats cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            primary: 'from-primary-500/20 to-primary-600/10 border-primary-500/20',
            emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20',
            amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/20',
            red: 'from-red-500/20 to-red-600/10 border-red-500/20',
          };
          const iconColors = {
            primary: 'text-primary-400 bg-primary-500/20',
            emerald: 'text-emerald-400 bg-emerald-500/20',
            amber: 'text-amber-400 bg-amber-500/20',
            red: 'text-red-400 bg-red-500/20',
          };

          return (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className={`card-hover p-6 bg-gradient-to-br ${colorClasses[stat.color as keyof typeof colorClasses]}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${iconColors[stat.color as keyof typeof iconColors]}`}>
                  <Icon size={24} />
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  stat.trend === 'up' ? 'text-emerald-400' :
                  stat.trend === 'down' ? 'text-red-400' : 'text-surface-500'
                }`}>
                  {stat.trend === 'up' ? <ArrowUpRight size={16} /> :
                   stat.trend === 'down' ? <ArrowDownRight size={16} /> : null}
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-surface-100 mb-1">
                  {statsLoading ? (
                    <span className="skeleton h-9 w-16 block rounded" />
                  ) : (
                    stat.value.toLocaleString()
                  )}
                </p>
                <p className="text-surface-500 text-sm">{stat.label}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent employees */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 card"
        >
          <div className="p-6 border-b border-surface-800 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-surface-100">Recent Employees</h2>
              <p className="text-sm text-surface-500">Latest additions to your team</p>
            </div>
            <Link
              to="/employees"
              className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="divide-y divide-surface-800">
            {employeesLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 flex items-center gap-4">
                  <div className="skeleton w-12 h-12 rounded-xl" />
                  <div className="flex-1">
                    <div className="skeleton h-4 w-32 mb-2 rounded" />
                    <div className="skeleton h-3 w-24 rounded" />
                  </div>
                  <div className="skeleton h-6 w-16 rounded-full" />
                </div>
              ))
            ) : (
              recentEmployees.map((employee: Employee) => (
                <Link
                  key={employee.id}
                  to={`/employees/${employee.id}`}
                  className="p-4 flex items-center gap-4 hover:bg-surface-800/30 transition-colors"
                >
                  <img
                    src={employee.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.firstName}`}
                    alt={employee.fullName}
                    className="w-12 h-12 rounded-xl object-cover bg-surface-800"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-surface-100 truncate">
                      {employee.fullName}
                    </p>
                    <p className="text-sm text-surface-500 truncate">
                      {employee.position} • {employee.department}
                    </p>
                  </div>
                  <span className={`badge ${
                    employee.status === 'ACTIVE' ? 'badge-success' :
                    employee.status === 'ON_LEAVE' ? 'badge-warning' :
                    employee.status === 'INACTIVE' ? 'badge-danger' : 'badge-info'
                  }`}>
                    {employee.status}
                  </span>
                </Link>
              ))
            )}
          </div>
        </motion.div>

        {/* Department distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="p-6 border-b border-surface-800">
            <h2 className="text-lg font-semibold text-surface-100">Departments</h2>
            <p className="text-sm text-surface-500">Employee distribution</p>
          </div>
          <div className="p-6 space-y-4">
            {statsLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="skeleton h-4 w-24 rounded" />
                    <div className="skeleton h-4 w-8 rounded" />
                  </div>
                  <div className="skeleton h-2 rounded-full" />
                </div>
              ))
            ) : (
              stats?.departmentCounts?.map((dept: { department: string; count: number }, index: number) => {
                const percentage = stats.totalEmployees > 0
                  ? Math.round((dept.count / stats.totalEmployees) * 100)
                  : 0;
                const colors = [
                  'bg-primary-500',
                  'bg-accent-500',
                  'bg-emerald-500',
                  'bg-amber-500',
                  'bg-violet-500',
                  'bg-rose-500',
                  'bg-cyan-500',
                  'bg-lime-500',
                ];

                return (
                  <div key={dept.department} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-surface-300">{dept.department}</span>
                      <span className="text-surface-500">{dept.count}</span>
                    </div>
                    <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                        className={`h-full ${colors[index % colors.length]} rounded-full`}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>

      {/* Average attendance card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 card p-6"
      >
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-500/20 to-primary-600/10">
            <TrendingUp size={32} className="text-primary-400" />
          </div>
          <div>
            <p className="text-surface-500 mb-1">Average Team Attendance</p>
            <p className="text-4xl font-bold text-surface-100">
              {statsLoading ? (
                <span className="skeleton h-10 w-24 block rounded" />
              ) : (
                `${(stats?.averageAttendance || 0).toFixed(1)}%`
              )}
            </p>
          </div>
          <div className="ml-auto hidden sm:block">
            <div className="w-32 h-32 relative">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-surface-800"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <motion.path
                  className="text-primary-500"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  initial={{ strokeDasharray: '0 100' }}
                  animate={{ strokeDasharray: `${stats?.averageAttendance || 0} 100` }}
                  transition={{ delay: 0.6, duration: 1 }}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;

