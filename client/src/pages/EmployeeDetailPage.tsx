import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  Briefcase,
  Award,
  BookOpen,
  Flag,
  Edit,
  Trash2,
  User,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { GET_EMPLOYEE } from '../graphql/queries';

const EmployeeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, loading, error } = useQuery(GET_EMPLOYEE, {
    variables: { id },
    skip: !id,
  });

  const employee = data?.employee;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (value?: number | null) => {
    if (!value) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="skeleton h-8 w-32 rounded-lg" />
          <div className="card p-8">
            <div className="flex gap-6">
              <div className="skeleton w-24 h-24 rounded-2xl" />
              <div className="flex-1 space-y-3">
                <div className="skeleton h-8 w-48 rounded" />
                <div className="skeleton h-5 w-32 rounded" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-28 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-surface-100 mb-4">Employee Not Found</h2>
          <p className="text-surface-500 mb-6">The employee you're looking for doesn't exist.</p>
          <Link to="/employees" className="btn-primary">
            <ArrowLeft size={18} />
            Back to Employees
          </Link>
        </div>
      </div>
    );
  }

  const statusColors = {
    ACTIVE: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    INACTIVE: 'bg-surface-700 text-surface-400 border-surface-600',
    ON_LEAVE: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    TERMINATED: 'bg-red-500/20 text-red-300 border-red-500/30',
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6"
      >
        <button
          onClick={() => navigate('/employees')}
          className="flex items-center gap-2 text-surface-400 hover:text-surface-100 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Employees
        </button>
      </motion.div>

      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-8 mb-6"
      >
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="relative">
            <img
              src={employee.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.firstName}`}
              alt={employee.fullName}
              className="w-24 h-24 rounded-2xl object-cover bg-surface-800 ring-2 ring-surface-700"
            />
            <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-4 border-surface-900 ${
              employee.status === 'ACTIVE' ? 'bg-emerald-500' :
              employee.status === 'ON_LEAVE' ? 'bg-amber-500' : 'bg-surface-600'
            }`} />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-surface-100">
                {employee.fullName}
              </h1>
              {employee.isFlagged && (
                <span className="badge badge-warning">
                  <Flag size={12} />
                  Flagged
                </span>
              )}
              <span className={`badge ${statusColors[employee.status]}`}>
                {employee.status}
              </span>
            </div>
            <p className="text-lg text-surface-400 mb-2">
              {employee.position} • {employee.department}
            </p>
            <p className="font-mono text-surface-600">{employee.employeeId}</p>
          </div>
        </div>

        {employee.isFlagged && employee.flagReason && (
          <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <div className="flex items-center gap-2 text-amber-300 mb-1">
              <Flag size={16} />
              <span className="font-medium">Flag Reason</span>
            </div>
            <p className="text-amber-200/80">{employee.flagReason}</p>
          </div>
        )}
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6"
      >
        <div className="card p-4 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary-500/20 flex items-center justify-center">
            <TrendingUp size={24} className="text-primary-400" />
          </div>
          <p className="text-2xl font-bold text-surface-100">{employee.attendance.toFixed(1)}%</p>
          <p className="text-sm text-surface-500">Attendance</p>
        </div>
        <div className="card p-4 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Briefcase size={24} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-surface-100">{formatCurrency(employee.salary)}</p>
          <p className="text-sm text-surface-500">Salary</p>
        </div>
        <div className="card p-4 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <Clock size={24} className="text-violet-400" />
          </div>
          <p className="text-2xl font-bold text-surface-100">
            {new Date().getFullYear() - new Date(employee.joinDate).getFullYear()}y
          </p>
          <p className="text-sm text-surface-500">Experience</p>
        </div>
        <div className="card p-4 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-accent-500/20 flex items-center justify-center">
            <User size={24} className="text-accent-400" />
          </div>
          <p className="text-2xl font-bold text-surface-100">{employee.age}</p>
          <p className="text-sm text-surface-500">Age</p>
        </div>
      </motion.div>

      {/* Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <h2 className="font-semibold text-lg text-surface-100 mb-4 flex items-center gap-2">
            <Mail size={20} className="text-primary-400" />
            Contact Information
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-surface-500" />
              <a href={`mailto:${employee.email}`} className="text-surface-300 hover:text-primary-400">
                {employee.email}
              </a>
            </div>
            {employee.phone && (
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-surface-500" />
                <a href={`tel:${employee.phone}`} className="text-surface-300 hover:text-primary-400">
                  {employee.phone}
                </a>
              </div>
            )}
            {employee.fullAddress && (
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-surface-500 mt-0.5" />
                <span className="text-surface-300">{employee.fullAddress}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Work */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <h2 className="font-semibold text-lg text-surface-100 mb-4 flex items-center gap-2">
            <Building2 size={20} className="text-primary-400" />
            Work Information
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-surface-500">Department</span>
              <span className="text-surface-300">{employee.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-surface-500">Position</span>
              <span className="text-surface-300">{employee.position}</span>
            </div>
            {employee.class && (
              <div className="flex justify-between">
                <span className="text-surface-500">Class</span>
                <span className="text-surface-300">{employee.class}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-surface-500">Join Date</span>
              <span className="text-surface-300">{formatDate(employee.joinDate)}</span>
            </div>
          </div>
        </motion.div>

        {/* Subjects */}
        {employee.subjects && employee.subjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-6 lg:col-span-2"
          >
            <h2 className="font-semibold text-lg text-surface-100 mb-4 flex items-center gap-2">
              <BookOpen size={20} className="text-primary-400" />
              Subjects / Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {employee.subjects.map((subject: string, index: number) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-surface-800 border border-surface-700 rounded-xl text-surface-300"
                >
                  {subject}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Personal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-6 lg:col-span-2"
        >
          <h2 className="font-semibold text-lg text-surface-100 mb-4 flex items-center gap-2">
            <Award size={20} className="text-primary-400" />
            Personal Details
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <p className="text-surface-500 text-sm mb-1">Gender</p>
              <p className="text-surface-300 capitalize">{employee.gender.toLowerCase()}</p>
            </div>
            <div>
              <p className="text-surface-500 text-sm mb-1">Age</p>
              <p className="text-surface-300">{employee.age} years</p>
            </div>
            {employee.dateOfBirth && (
              <div>
                <p className="text-surface-500 text-sm mb-1">Date of Birth</p>
                <p className="text-surface-300">{formatDate(employee.dateOfBirth)}</p>
              </div>
            )}
            <div>
              <p className="text-surface-500 text-sm mb-1">Record Created</p>
              <p className="text-surface-300">{formatDate(employee.createdAt)}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EmployeeDetailPage;

