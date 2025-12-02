import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Employee } from '../../types';

interface AttendanceViewProps {
  employees: Employee[];
  onSelect: (employee: Employee) => void;
}

const AttendanceView: React.FC<AttendanceViewProps> = ({ employees, onSelect }) => {
  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 95) return 'text-emerald-400 bg-emerald-500';
    if (attendance >= 90) return 'text-emerald-400 bg-emerald-500';
    if (attendance >= 80) return 'text-amber-400 bg-amber-500';
    if (attendance >= 70) return 'text-orange-400 bg-orange-500';
    return 'text-red-400 bg-red-500';
  };

  const getAttendanceBg = (attendance: number) => {
    if (attendance >= 90) return 'bg-emerald-500/10 border-emerald-500/20';
    if (attendance >= 80) return 'bg-amber-500/10 border-amber-500/20';
    if (attendance >= 70) return 'bg-orange-500/10 border-orange-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  const getTrendIcon = (attendance: number) => {
    if (attendance >= 95) return <TrendingUp size={16} className="text-emerald-400" />;
    if (attendance >= 85) return <Minus size={16} className="text-surface-500" />;
    return <TrendingDown size={16} className="text-red-400" />;
  };

  const getAttendanceLabel = (attendance: number) => {
    if (attendance >= 95) return 'Excellent';
    if (attendance >= 90) return 'Good';
    if (attendance >= 80) return 'Average';
    if (attendance >= 70) return 'Below Average';
    return 'Poor';
  };

  return (
    <div className="space-y-3">
      {employees.map((employee, index) => {
        const colorClass = getAttendanceColor(employee.attendance);
        const bgClass = getAttendanceBg(employee.attendance);
        
        return (
          <motion.div
            key={employee.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            onClick={() => onSelect(employee)}
            className={`card p-4 cursor-pointer hover:border-primary-500/30 transition-all ${bgClass}`}
          >
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <img
                src={employee.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.firstName}`}
                alt={employee.fullName}
                className="w-12 h-12 rounded-xl object-cover bg-surface-800"
              />

              {/* Employee info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-surface-100 truncate">
                    {employee.fullName}
                  </h3>
                  <span className="text-xs text-surface-500 font-mono">
                    {employee.employeeId}
                  </span>
                </div>
                <p className="text-sm text-surface-500 truncate">
                  {employee.position} • {employee.department}
                </p>
              </div>

              {/* Attendance bar */}
              <div className="hidden sm:block flex-1 max-w-xs">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-surface-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${employee.attendance}%` }}
                      transition={{ delay: index * 0.03 + 0.2, duration: 0.5 }}
                      className={`h-full rounded-full ${colorClass.split(' ')[1]}`}
                    />
                  </div>
                </div>
              </div>

              {/* Attendance percentage */}
              <div className="text-right min-w-[100px]">
                <div className="flex items-center justify-end gap-2">
                  {getTrendIcon(employee.attendance)}
                  <span className={`text-2xl font-bold ${colorClass.split(' ')[0]}`}>
                    {employee.attendance.toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs text-surface-500">
                  {getAttendanceLabel(employee.attendance)}
                </p>
              </div>
            </div>

            {/* Mobile attendance bar */}
            <div className="sm:hidden mt-3">
              <div className="flex items-center justify-between text-xs text-surface-500 mb-1">
                <span>Attendance</span>
                <span>{getAttendanceLabel(employee.attendance)}</span>
              </div>
              <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${employee.attendance}%` }}
                  transition={{ delay: index * 0.03 + 0.2, duration: 0.5 }}
                  className={`h-full rounded-full ${colorClass.split(' ')[1]}`}
                />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default AttendanceView;

