import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery } from '@apollo/client';
import { X, UserPlus, Loader } from 'lucide-react';
import { CREATE_EMPLOYEE } from '../../graphql/mutations';
import { GET_DEPARTMENTS, GET_POSITIONS } from '../../graphql/queries';
import { Gender, EmployeeStatus } from '../../types';
import toast from 'react-hot-toast';

interface AddEmployeeModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    age: '',
    gender: 'OTHER' as Gender,
    department: '',
    position: '',
    class: '',
    salary: '',
    status: 'ACTIVE' as EmployeeStatus,
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
  });

  const [createEmployee, { loading }] = useMutation(CREATE_EMPLOYEE);
  const { data: deptData } = useQuery(GET_DEPARTMENTS);
  const { data: posData } = useQuery(GET_POSITIONS);

  const departments = deptData?.departments || [];
  const positions = posData?.positions || [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.department || !formData.position || !formData.age) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createEmployee({
        variables: {
          input: {
            ...formData,
            age: parseInt(formData.age, 10),
            salary: formData.salary ? parseFloat(formData.salary) : undefined,
          },
        },
      });
      toast.success('Employee created successfully!');
      onSuccess();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create employee';
      toast.error(message);
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
        className="w-full max-w-2xl max-h-[90vh] overflow-auto bg-surface-900 border border-surface-800 rounded-2xl shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-surface-900/95 backdrop-blur-xl border-b border-surface-800 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-500/20">
              <UserPlus size={24} className="text-primary-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-surface-100">Add New Employee</h2>
              <p className="text-sm text-surface-500">Fill in the details below</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-surface-500 hover:text-surface-100 hover:bg-surface-800 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-sm font-medium text-surface-400 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-surface-300 mb-2">
                  First Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="input"
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-surface-300 mb-2">
                  Last Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="input"
                  placeholder="Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-surface-300 mb-2">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input"
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-surface-300 mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input"
                  placeholder="+1-234-567-8900"
                />
              </div>
              <div>
                <label className="block text-sm text-surface-300 mb-2">
                  Age <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="input"
                  placeholder="25"
                  min="18"
                  max="100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-surface-300 mb-2">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Work Info */}
          <div>
            <h3 className="text-sm font-medium text-surface-400 mb-4">Work Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-surface-300 mb-2">
                  Department <span className="text-red-400">*</span>
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept: string) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-surface-300 mb-2">
                  Position <span className="text-red-400">*</span>
                </label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="">Select Position</option>
                  {positions.map((pos: string) => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-surface-300 mb-2">Class</label>
                <input
                  type="text"
                  name="class"
                  value={formData.class}
                  onChange={handleChange}
                  className="input"
                  placeholder="Class A"
                />
              </div>
              <div>
                <label className="block text-sm text-surface-300 mb-2">Salary</label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  className="input"
                  placeholder="50000"
                  min="0"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-surface-300 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="ON_LEAVE">On Leave</option>
                </select>
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-sm font-medium text-surface-400 mb-4">Address (Optional)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm text-surface-300 mb-2">Street Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="input"
                  placeholder="123 Main Street"
                />
              </div>
              <div>
                <label className="block text-sm text-surface-300 mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="input"
                  placeholder="New York"
                />
              </div>
              <div>
                <label className="block text-sm text-surface-300 mb-2">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="input"
                  placeholder="NY"
                />
              </div>
              <div>
                <label className="block text-sm text-surface-300 mb-2">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="input"
                  placeholder="USA"
                />
              </div>
              <div>
                <label className="block text-sm text-surface-300 mb-2">ZIP Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className="input"
                  placeholder="10001"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-800">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Create Employee
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddEmployeeModal;

