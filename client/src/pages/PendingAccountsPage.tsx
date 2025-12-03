import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Loader,
} from 'lucide-react';
import { GET_SIGNUP_REQUESTS, GET_DEPARTMENTS, GET_POSITIONS } from '../graphql/queries';
import { APPROVE_SIGNUP_REQUEST, REJECT_SIGNUP_REQUEST } from '../graphql/mutations';
import toast from 'react-hot-toast';

interface SignupRequest {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string;
  age: number;
  gender: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  status: string;
  rejectionReason?: string;
  createdAt: string;
}

interface ApproveModalProps {
  request: SignupRequest;
  onClose: () => void;
  onSuccess: () => void;
}

const ApproveModal: React.FC<ApproveModalProps> = ({ request, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    department: '',
    position: '',
    class: '',
    salary: '',
  });

  const { data: deptData } = useQuery(GET_DEPARTMENTS);
  const { data: posData } = useQuery(GET_POSITIONS);
  const [approveRequest, { loading }] = useMutation(APPROVE_SIGNUP_REQUEST);

  const departments = deptData?.departments || [];
  const positions = posData?.positions || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.department || !formData.position) {
      toast.error('Department and Position are required');
      return;
    }

    try {
      await approveRequest({
        variables: {
          id: request.id,
          input: {
            department: formData.department,
            position: formData.position,
            class: formData.class || undefined,
            salary: formData.salary ? parseFloat(formData.salary) : undefined,
          },
        },
      });
      toast.success(`Account approved for ${request.fullName}`);
      onSuccess();
    } catch (error) {
      toast.error('Failed to approve account');
    }
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
        className="w-full max-w-lg bg-surface-900 border border-surface-800 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-surface-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20">
              <CheckCircle size={24} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-surface-100">
                Approve Account
              </h3>
              <p className="text-sm text-surface-500">
                {request.fullName} ({request.email})
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-surface-400 mb-4">
            Please fill in the work-related information for this employee:
          </p>

          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">
              Department <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.department}
              onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
              className="input"
              required
            >
              <option value="">Select Department</option>
              {departments.map((dept: string) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Operations">Operations</option>
              <option value="Product">Product</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">
              Position <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.position}
              onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
              className="input"
              required
            >
              <option value="">Select Position</option>
              {positions.map((pos: string) => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
              <option value="Software Engineer">Software Engineer</option>
              <option value="Senior Developer">Senior Developer</option>
              <option value="UI/UX Designer">UI/UX Designer</option>
              <option value="Marketing Manager">Marketing Manager</option>
              <option value="Sales Representative">Sales Representative</option>
              <option value="HR Specialist">HR Specialist</option>
              <option value="Financial Analyst">Financial Analyst</option>
              <option value="Product Manager">Product Manager</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">
              Class
            </label>
            <input
              type="text"
              value={formData.class}
              onChange={(e) => setFormData(prev => ({ ...prev, class: e.target.value }))}
              placeholder="e.g., Class A"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">
              Salary
            </label>
            <input
              type="number"
              value={formData.salary}
              onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
              placeholder="e.g., 50000"
              min="0"
              className="input"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn bg-emerald-500 text-white hover:bg-emerald-600"
            >
              {loading ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <CheckCircle size={18} />
              )}
              Approve Account
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

interface RejectModalProps {
  request: SignupRequest;
  onClose: () => void;
  onSuccess: () => void;
}

const RejectModal: React.FC<RejectModalProps> = ({ request, onClose, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [rejectRequest, { loading }] = useMutation(REJECT_SIGNUP_REQUEST);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      await rejectRequest({
        variables: {
          id: request.id,
          reason: reason.trim(),
        },
      });
      toast.success(`Request rejected for ${request.fullName}`);
      onSuccess();
    } catch (error) {
      toast.error('Failed to reject request');
    }
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
        className="w-full max-w-md bg-surface-900 border border-surface-800 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-surface-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/20">
              <XCircle size={24} className="text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-surface-100">
                Reject Request
              </h3>
              <p className="text-sm text-surface-500">
                {request.fullName}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">
              Reason for rejection <span className="text-red-400">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a reason..."
              rows={4}
              className="input resize-none"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-danger"
            >
              {loading ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <XCircle size={18} />
              )}
              Reject
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const PendingAccountsPage: React.FC = () => {
  const [selectedRequest, setSelectedRequest] = useState<SignupRequest | null>(null);
  const [modalType, setModalType] = useState<'approve' | 'reject' | null>(null);

  const { data, loading, refetch } = useQuery(GET_SIGNUP_REQUESTS, {
    variables: { status: 'PENDING' },
    fetchPolicy: 'cache-and-network',
  });

  const requests: SignupRequest[] = data?.signupRequests || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleModalClose = () => {
    setSelectedRequest(null);
    setModalType(null);
  };

  const handleSuccess = () => {
    handleModalClose();
    refetch();
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-primary-500/20">
            <UserPlus size={24} className="text-primary-400" />
          </div>
          <h1 className="text-3xl font-display font-bold text-surface-100">
            Pending Accounts
          </h1>
          {requests.length > 0 && (
            <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 text-sm font-medium rounded-full">
              {requests.length} pending
            </span>
          )}
        </div>
        <p className="text-surface-500">
          Review and approve new account requests
        </p>
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-6">
              <div className="flex gap-4">
                <div className="skeleton w-16 h-16 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-5 w-48 rounded" />
                  <div className="skeleton h-4 w-32 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-surface-800 flex items-center justify-center">
            <CheckCircle size={32} className="text-surface-600" />
          </div>
          <h3 className="text-xl font-semibold text-surface-300 mb-2">
            No pending requests
          </h3>
          <p className="text-surface-500">
            All account requests have been processed.
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          {requests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Avatar and basic info */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xl font-bold">
                    {request.firstName[0]}{request.lastName[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-surface-100">
                      {request.fullName}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-surface-500">
                      <Mail size={14} />
                      {request.email}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-surface-500">
                      {request.phone && (
                        <span className="flex items-center gap-1">
                          <Phone size={12} />
                          {request.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        {request.age} years, {request.gender}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Location */}
                {(request.city || request.country) && (
                  <div className="flex items-center gap-2 text-sm text-surface-400">
                    <MapPin size={14} />
                    <span>
                      {[request.city, request.state, request.country]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </div>
                )}

                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-surface-500">
                  <Calendar size={14} />
                  {formatDate(request.createdAt)}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedRequest(request);
                      setModalType('reject');
                    }}
                    className="btn-secondary text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <XCircle size={18} />
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRequest(request);
                      setModalType('approve');
                    }}
                    className="btn bg-emerald-500 text-white hover:bg-emerald-600"
                  >
                    <CheckCircle size={18} />
                    Approve
                  </button>
                </div>
              </div>

              {/* Full address if available */}
              {request.address && (
                <div className="mt-4 pt-4 border-t border-surface-800 text-sm text-surface-400">
                  <span className="font-medium">Address:</span> {request.address}
                  {request.zipCode && `, ${request.zipCode}`}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {selectedRequest && modalType === 'approve' && (
          <ApproveModal
            request={selectedRequest}
            onClose={handleModalClose}
            onSuccess={handleSuccess}
          />
        )}
        {selectedRequest && modalType === 'reject' && (
          <RejectModal
            request={selectedRequest}
            onClose={handleModalClose}
            onSuccess={handleSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PendingAccountsPage;

