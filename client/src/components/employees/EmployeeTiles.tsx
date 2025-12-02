import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@apollo/client';
import {
  MoreVertical,
  Edit,
  Trash2,
  Flag,
  FlagOff,
  Mail,
  Phone,
  Building2,
  Calendar,
} from 'lucide-react';
import { Employee } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { DELETE_EMPLOYEE, FLAG_EMPLOYEE, UNFLAG_EMPLOYEE } from '../../graphql/mutations';
import FlagReasonModal from '../ui/FlagReasonModal';
import toast from 'react-hot-toast';

interface EmployeeTilesProps {
  employees: Employee[];
  onSelect: (employee: Employee) => void;
  onRefetch: () => void;
}

interface TileCardProps {
  employee: Employee;
  onSelect: () => void;
  onRefetch: () => void;
  index: number;
}

const TileCard: React.FC<TileCardProps> = ({ employee, onSelect, onRefetch, index }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { isAdmin } = useAuth();

  const [deleteEmployee] = useMutation(DELETE_EMPLOYEE);
  const [flagEmployee] = useMutation(FLAG_EMPLOYEE);
  const [unflagEmployee] = useMutation(UNFLAG_EMPLOYEE);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${employee.fullName}?`)) return;
    
    try {
      await deleteEmployee({ variables: { id: employee.id } });
      toast.success('Employee deleted successfully');
      onRefetch();
    } catch (error) {
      toast.error('Failed to delete employee');
    }
    setMenuOpen(false);
  };

  const handleFlag = async (reason: string) => {
    try {
      await flagEmployee({ variables: { id: employee.id, reason } });
      toast.success('Employee flagged');
      setShowFlagModal(false);
      onRefetch();
    } catch (error) {
      toast.error('Failed to flag employee');
    }
  };

  const openFlagModal = () => {
    setMenuOpen(false);
    setShowFlagModal(true);
  };

  const handleUnflag = async () => {
    try {
      await unflagEmployee({ variables: { id: employee.id } });
      toast.success('Flag removed');
      onRefetch();
    } catch (error) {
      toast.error('Failed to unflag employee');
    }
    setMenuOpen(false);
  };

  const statusColors = {
    ACTIVE: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    INACTIVE: 'bg-surface-700 text-surface-400 border-surface-600',
    ON_LEAVE: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    TERMINATED: 'bg-red-500/20 text-red-300 border-red-500/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`card-hover p-6 relative group cursor-pointer ${
        employee.isFlagged ? 'border-amber-500/30 bg-amber-500/5' : ''
      }`}
      onClick={onSelect}
    >
      {/* Flagged indicator */}
      {employee.isFlagged && (
        <div className="absolute top-3 left-3">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        </div>
      )}

      {/* Action menu button */}
      <div
        ref={menuRef}
        className="absolute top-3 right-3"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 text-surface-500 hover:text-surface-200 hover:bg-surface-800 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
        >
          <MoreVertical size={18} />
        </button>

        {/* Dropdown menu */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="absolute right-0 mt-1 w-48 bg-surface-900 border border-surface-800 rounded-xl shadow-xl overflow-hidden z-10"
          >
            <button
              onClick={() => {
                onSelect();
                setMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-surface-300 hover:bg-surface-800 hover:text-surface-100 transition-colors"
            >
              <Edit size={16} />
              {isAdmin ? 'View / Edit' : 'View Details'}
            </button>
            
            {isAdmin && (
              <>
                {employee.isFlagged ? (
                  <button
                    onClick={handleUnflag}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-amber-400 hover:bg-amber-500/10 transition-colors"
                  >
                    <FlagOff size={16} />
                    Remove Flag
                  </button>
                ) : (
                  <button
                    onClick={openFlagModal}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-amber-400 hover:bg-amber-500/10 transition-colors"
                  >
                    <Flag size={16} />
                    Flag Employee
                  </button>
                )}
                
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </>
            )}
          </motion.div>
        )}
      </div>

      {/* Avatar */}
      <div className="flex justify-center mb-4">
        <div className="relative">
          <img
            src={employee.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.firstName}`}
            alt={employee.fullName}
            className="w-20 h-20 rounded-2xl object-cover bg-surface-800 ring-2 ring-surface-700 group-hover:ring-primary-500/50 transition-all"
          />
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-surface-900 ${
            employee.status === 'ACTIVE' ? 'bg-emerald-500' :
            employee.status === 'ON_LEAVE' ? 'bg-amber-500' : 'bg-surface-600'
          }`} />
        </div>
      </div>

      {/* Name & Position */}
      <div className="text-center mb-4">
        <h3 className="font-semibold text-surface-100 mb-1 truncate">
          {employee.fullName}
        </h3>
        <p className="text-sm text-surface-500 truncate">
          {employee.position}
        </p>
      </div>

      {/* Quick info */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-surface-400">
          <Building2 size={14} className="flex-shrink-0" />
          <span className="truncate">{employee.department}</span>
        </div>
        <div className="flex items-center gap-2 text-surface-400">
          <Mail size={14} className="flex-shrink-0" />
          <span className="truncate">{employee.email}</span>
        </div>
        {employee.phone && (
          <div className="flex items-center gap-2 text-surface-400">
            <Phone size={14} className="flex-shrink-0" />
            <span className="truncate">{employee.phone}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-surface-800 flex items-center justify-between">
        <span className={`text-xs px-2.5 py-1 rounded-full border ${statusColors[employee.status]}`}>
          {employee.status}
        </span>
        <div className="flex items-center gap-1 text-xs text-surface-500">
          <Calendar size={12} />
          <span>{new Date(employee.joinDate).getFullYear()}</span>
        </div>
      </div>

      {/* Flag reason tooltip */}
      {employee.isFlagged && employee.flagReason && (
        <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-xs text-amber-300 truncate">
            ⚠️ {employee.flagReason}
          </p>
        </div>
      )}

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

const EmployeeTiles: React.FC<EmployeeTilesProps> = ({ employees, onSelect, onRefetch }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {employees.map((employee, index) => (
        <TileCard
          key={employee.id}
          employee={employee}
          onSelect={() => onSelect(employee)}
          onRefetch={onRefetch}
          index={index}
        />
      ))}
    </div>
  );
};

export default EmployeeTiles;

