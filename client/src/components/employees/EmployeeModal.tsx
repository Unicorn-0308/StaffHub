import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@apollo/client';
import {
  X,
  Mail,
  Phone,
  MapPin,
  Building2,
  Briefcase,
  Award,
  BookOpen,
  Flag,
  FlagOff,
  Edit,
  Trash2,
  User,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { Employee } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { DELETE_EMPLOYEE, FLAG_EMPLOYEE, UNFLAG_EMPLOYEE, UPDATE_EMPLOYEE } from '../../graphql/mutations';
import FlagReasonModal from '../ui/FlagReasonModal';
import toast from 'react-hot-toast';

interface EmployeeModalProps {
  employee: Employee;
  onClose: () => void;
  onRefetch: () => void;
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({ employee, onClose, onRefetch }) => {
  const { isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
  
  // Local state for flag status (to update UI immediately)
  const [isFlagged, setIsFlagged] = useState(employee.isFlagged);
  const [flagReason, setFlagReason] = useState(employee.flagReason);
  
  const [editData, setEditData] = useState({
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    phone: employee.phone || '',
    department: employee.department,
    position: employee.position,
    age: employee.age,
    status: employee.status,
    attendance: employee.attendance,
  });

  const [deleteEmployee] = useMutation(DELETE_EMPLOYEE);
  const [flagEmployee] = useMutation(FLAG_EMPLOYEE);
  const [unflagEmployee] = useMutation(UNFLAG_EMPLOYEE);
  const [updateEmployee, { loading: updating }] = useMutation(UPDATE_EMPLOYEE);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${employee.fullName}?`)) return;
    
    try {
      await deleteEmployee({ variables: { id: employee.id } });
      toast.success('Employee deleted successfully');
      onRefetch();
      onClose();
    } catch (error) {
      toast.error('Failed to delete employee');
    }
  };

  const handleFlag = async (reason: string) => {
    try {
      await flagEmployee({ variables: { id: employee.id, reason } });
      toast.success('Employee flagged');
      setShowFlagModal(false);
      // Update local state immediately
      setIsFlagged(true);
      setFlagReason(reason);
      onRefetch();
    } catch (error) {
      toast.error('Failed to flag employee');
    }
  };

  const handleUnflag = async () => {
    try {
      await unflagEmployee({ variables: { id: employee.id } });
      toast.success('Flag removed');
      // Update local state immediately
      setIsFlagged(false);
      setFlagReason(null);
      onRefetch();
    } catch (error) {
      toast.error('Failed to unflag employee');
    }
  };

  const handleUpdate = async () => {
    try {
      await updateEmployee({
        variables: {
          id: employee.id,
          input: editData,
        },
      });
      toast.success('Employee updated successfully');
      setIsEditing(false);
      onRefetch();
    } catch (error) {
      toast.error('Failed to update employee');
    }
  };

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

  const statusColors = {
    ACTIVE: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    INACTIVE: 'bg-surface-700 text-surface-400 border-surface-600',
    ON_LEAVE: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    TERMINATED: 'bg-red-500/20 text-red-300 border-red-500/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-surface-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[90vh] overflow-auto bg-surface-900 border border-surface-800 rounded-2xl shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-surface-900/95 backdrop-blur-xl border-b border-surface-800 p-6 flex items-start justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={employee.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.firstName}`}
                alt={employee.fullName}
                className="w-16 h-16 rounded-2xl object-cover bg-surface-800 ring-2 ring-surface-700"
              />
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-surface-900 ${
                employee.status === 'ACTIVE' ? 'bg-emerald-500' :
                employee.status === 'ON_LEAVE' ? 'bg-amber-500' : 'bg-surface-600'
              }`} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-surface-100">
                  {employee.fullName}
                </h2>
                {isFlagged && (
                  <span className="badge badge-warning">
                    <Flag size={12} />
                    Flagged
                  </span>
                )}
              </div>
              <p className="text-surface-500">
                {employee.position} • {employee.department}
              </p>
              <span className="font-mono text-sm text-surface-600">
                {employee.employeeId}
              </span>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-surface-500 hover:text-surface-100 hover:bg-surface-800 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Flag reason alert */}
          {isFlagged && flagReason && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <div className="flex items-center gap-2 text-amber-300 mb-1">
                <Flag size={16} />
                <span className="font-medium">Flagged Employee</span>
              </div>
              <p className="text-amber-200/80 text-sm">{flagReason}</p>
            </div>
          )}

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="card p-4 text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-primary-500/20 flex items-center justify-center">
                <TrendingUp size={20} className="text-primary-400" />
              </div>
              <p className="text-2xl font-bold text-surface-100">{employee.attendance.toFixed(1)}%</p>
              <p className="text-xs text-surface-500">Attendance</p>
            </div>
            <div className="card p-4 text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Briefcase size={20} className="text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-surface-100">{formatCurrency(employee.salary)}</p>
              <p className="text-xs text-surface-500">Salary</p>
            </div>
            <div className="card p-4 text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <Clock size={20} className="text-violet-400" />
              </div>
              <p className="text-2xl font-bold text-surface-100">
                {new Date().getFullYear() - new Date(employee.joinDate).getFullYear()}y
              </p>
              <p className="text-xs text-surface-500">Experience</p>
            </div>
            <div className="card p-4 text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-accent-500/20 flex items-center justify-center">
                <User size={20} className="text-accent-400" />
              </div>
              <p className="text-2xl font-bold text-surface-100">{employee.age}</p>
              <p className="text-xs text-surface-500">Age</p>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact info */}
            <div className="card p-6">
              <h3 className="font-semibold text-surface-100 mb-4 flex items-center gap-2">
                <Mail size={18} className="text-primary-400" />
                Contact Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-surface-500" />
                  <a href={`mailto:${employee.email}`} className="text-surface-300 hover:text-primary-400 transition-colors">
                    {employee.email}
                  </a>
                </div>
                {employee.phone && (
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-surface-500" />
                    <a href={`tel:${employee.phone}`} className="text-surface-300 hover:text-primary-400 transition-colors">
                      {employee.phone}
                    </a>
                  </div>
                )}
                {employee.fullAddress && (
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-surface-500 mt-0.5" />
                    <span className="text-surface-300">{employee.fullAddress}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Work info */}
            <div className="card p-6">
              <h3 className="font-semibold text-surface-100 mb-4 flex items-center gap-2">
                <Building2 size={18} className="text-primary-400" />
                Work Information
              </h3>
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
                <div className="flex justify-between items-center">
                  <span className="text-surface-500">Status</span>
                  <span className={`badge ${statusColors[employee.status]}`}>
                    {employee.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Subjects */}
          {employee.subjects && employee.subjects.length > 0 && (
            <div className="card p-6">
              <h3 className="font-semibold text-surface-100 mb-4 flex items-center gap-2">
                <BookOpen size={18} className="text-primary-400" />
                Subjects / Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {employee.subjects.map((subject, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-surface-800 border border-surface-700 rounded-lg text-sm text-surface-300"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Personal info */}
          <div className="card p-6">
            <h3 className="font-semibold text-surface-100 mb-4 flex items-center gap-2">
              <Award size={18} className="text-primary-400" />
              Personal Details
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-surface-500 mb-1">Gender</p>
                <p className="text-surface-300 capitalize">{employee.gender.toLowerCase()}</p>
              </div>
              <div>
                <p className="text-surface-500 mb-1">Age</p>
                <p className="text-surface-300">{employee.age} years</p>
              </div>
              {employee.dateOfBirth && (
                <div>
                  <p className="text-surface-500 mb-1">Date of Birth</p>
                  <p className="text-surface-300">{formatDate(employee.dateOfBirth)}</p>
                </div>
              )}
              <div>
                <p className="text-surface-500 mb-1">Created</p>
                <p className="text-surface-300">{formatDate(employee.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {isAdmin && (
          <div className="sticky bottom-0 bg-surface-900/95 backdrop-blur-xl border-t border-surface-800 p-6 flex justify-end gap-3">
            {isFlagged ? (
              <button
                onClick={handleUnflag}
                className="btn-secondary"
              >
                <FlagOff size={18} />
                Remove Flag
              </button>
            ) : (
              <button
                onClick={() => setShowFlagModal(true)}
                className="btn-secondary text-amber-400 hover:text-amber-300"
              >
                <Flag size={18} />
                Flag
              </button>
            )}
            <button
              onClick={handleDelete}
              className="btn-danger"
            >
              <Trash2 size={18} />
              Delete
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="btn-primary"
            >
              <Edit size={18} />
              Edit Employee
            </button>
          </div>
        )}
      </motion.div>

      {/* Flag Reason Modal */}
      <AnimatePresence>
        {showFlagModal && (
          <FlagReasonModal
            employeeName={employee.fullName}
            onConfirm={handleFlag}
            onCancel={() => setShowFlagModal(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EmployeeModal;

