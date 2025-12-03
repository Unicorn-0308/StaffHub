import { motion } from 'framer-motion';
import { Employee } from '../../types';
import { Flag, ExternalLink } from 'lucide-react';

interface EmployeeGridProps {
  employees: Employee[];
  onSelect: (employee: Employee) => void;
}

const EmployeeGrid: React.FC<EmployeeGridProps> = ({ employees, onSelect }) => {
  const statusColors = {
    ACTIVE: 'badge-success',
    INACTIVE: 'bg-surface-700 text-surface-400',
    ON_LEAVE: 'badge-warning',
    TERMINATED: 'badge-danger',
  };

  const formatCurrency = (value?: number | null) => {
    if (!value) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="table-container"
    >
      <table className="table">
        <thead>
          <tr>
            <th className="w-12"></th>
            <th>Employee</th>
            <th>ID</th>
            <th>Department</th>
            <th>Position</th>
            <th>Status</th>
            <th>Age</th>
            <th>Attendance</th>
            <th>Salary</th>
            <th>Join Date</th>
            <th className="w-12"></th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee, index) => (
            <motion.tr
              key={employee.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => onSelect(employee)}
              className={`cursor-pointer ${employee.isFlagged ? 'bg-amber-500/5' : ''}`}
            >
              {/* Flag indicator */}
              <td className="text-center">
                {employee.isFlagged && (
                  <Flag size={14} className="text-amber-500 mx-auto" />
                )}
              </td>

              {/* Employee info */}
              <td>
                <div className="flex items-center gap-3">
                  <img
                    src={employee.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.firstName}`}
                    alt={employee.fullName}
                    className="w-10 h-10 rounded-lg object-cover bg-surface-800"
                  />
                  <div>
                    <p className="font-medium text-surface-100">{employee.fullName}</p>
                    <p className="text-xs text-surface-500">{employee.email}</p>
                  </div>
                </div>
              </td>

              {/* Employee ID */}
              <td>
                <span className="font-mono text-sm text-surface-400">
                  {employee.employeeId}
                </span>
              </td>

              {/* Department */}
              <td className="text-surface-300">{employee.department}</td>

              {/* Position */}
              <td className="text-surface-300">{employee.position}</td>

              {/* Status */}
              <td>
                <span className={`badge ${statusColors[employee.status]}`}>
                  {employee.status}
                </span>
              </td>

              {/* Age */}
              <td className="text-surface-400">{employee.age}</td>

              {/* Attendance */}
              <td>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-surface-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        employee.attendance >= 90 ? 'bg-emerald-500' :
                        employee.attendance >= 75 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${employee.attendance}%` }}
                    />
                  </div>
                  <span className="text-sm text-surface-400">
                    {employee.attendance.toFixed(1)}%
                  </span>
                </div>
              </td>

              {/* Salary */}
              <td className="text-surface-300 font-mono text-sm">
                {formatCurrency(employee.salary)}
              </td>

              {/* Join Date */}
              <td className="text-surface-400 text-sm">
                {formatDate(employee.joinDate)}
              </td>

              {/* Action */}
              <td>
                <button className="p-1.5 text-surface-500 hover:text-primary-400 hover:bg-surface-800 rounded-lg transition-colors">
                  <ExternalLink size={16} />
                </button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
};

export default EmployeeGrid;

