import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  Briefcase,
  Shield,
  Edit,
  Save,
  X,
} from 'lucide-react';
import { GET_ME } from '../graphql/queries';
import { UPDATE_EMPLOYEE } from '../graphql/mutations';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const { data, loading, refetch } = useQuery(GET_ME);
  const [updateEmployee, { loading: updating }] = useMutation(UPDATE_EMPLOYEE);

  const employee = data?.me?.employee;

  const [editData, setEditData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    dateOfBirth: '',
    // Contact Info
    phone: '',
    // Address
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
  });

  const handleEdit = () => {
    if (employee) {
      setEditData({
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        age: employee.age?.toString() || '',
        gender: employee.gender || 'OTHER',
        dateOfBirth: employee.dateOfBirth ? new Date(employee.dateOfBirth).toISOString().split('T')[0] : '',
        phone: employee.phone || '',
        address: employee.address || '',
        city: employee.city || '',
        state: employee.state || '',
        country: employee.country || '',
        zipCode: employee.zipCode || '',
      });
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!employee) return;

    try {
      await updateEmployee({
        variables: {
          id: employee.id,
          input: {
            firstName: editData.firstName || undefined,
            lastName: editData.lastName || undefined,
            age: editData.age ? parseInt(editData.age, 10) : undefined,
            gender: editData.gender || undefined,
            dateOfBirth: editData.dateOfBirth ? new Date(editData.dateOfBirth) : undefined,
            phone: editData.phone || undefined,
            address: editData.address || undefined,
            city: editData.city || undefined,
            state: editData.state || undefined,
            country: editData.country || undefined,
            zipCode: editData.zipCode || undefined,
          },
        },
      });
      toast.success('Profile updated successfully');
      setIsEditing(false);
      refetch();
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="card p-8">
          <div className="flex items-center gap-6">
            <div className="skeleton w-24 h-24 rounded-2xl" />
            <div className="space-y-3">
              <div className="skeleton h-8 w-48 rounded" />
              <div className="skeleton h-5 w-32 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If user has no employee profile (admin without employee record)
  if (!employee) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8"
        >
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <span className="text-white text-3xl font-bold">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-surface-100 mb-2">
                {user?.email}
              </h1>
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-primary-400" />
                <span className="text-surface-400">
                  {isAdmin ? 'Administrator' : 'Employee'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-surface-800/50 rounded-xl">
            <p className="text-surface-400">
              Your account doesn't have an employee profile yet. 
              {isAdmin 
                ? ' As an admin, you can manage employee records from the dashboard.'
                : ' Please contact your administrator for assistance.'}
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="card p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <img
                src={employee.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.firstName}`}
                alt={employee.fullName}
                className="w-24 h-24 rounded-2xl object-cover bg-surface-800 ring-2 ring-surface-700"
              />
              <div>
                <h1 className="text-3xl font-bold text-surface-100 mb-1">
                  {employee.fullName}
                </h1>
                <p className="text-surface-400 mb-2">
                  {employee.position} • {employee.department}
                </p>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-surface-500 font-mono">
                    {employee.employeeId}
                  </span>
                  <span className={`badge ${
                    employee.status === 'ACTIVE' ? 'badge-success' :
                    employee.status === 'ON_LEAVE' ? 'badge-warning' : 'badge-info'
                  }`}>
                    {employee.status}
                  </span>
                </div>
              </div>
            </div>

            {!isEditing ? (
              <button onClick={handleEdit} className="btn-secondary">
                <Edit size={18} />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setIsEditing(false)} className="btn-secondary">
                  <X size={18} />
                  Cancel
                </button>
                <button onClick={handleSave} disabled={updating} className="btn-primary">
                  <Save size={18} />
                  {updating ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Info */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-surface-100 mb-4 flex items-center gap-2">
              <User size={20} className="text-primary-400" />
              Personal Information
            </h2>
            {isEditing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-surface-500 mb-1">First Name</label>
                    <input
                      type="text"
                      value={editData.firstName}
                      onChange={(e) => setEditData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="input"
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-surface-500 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={editData.lastName}
                      onChange={(e) => setEditData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="input"
                      placeholder="Last name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-surface-500 mb-1">Age</label>
                    <input
                      type="number"
                      value={editData.age}
                      onChange={(e) => setEditData(prev => ({ ...prev, age: e.target.value }))}
                      className="input"
                      placeholder="Age"
                      min="18"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-surface-500 mb-1">Gender</label>
                    <select
                      value={editData.gender}
                      onChange={(e) => setEditData(prev => ({ ...prev, gender: e.target.value }))}
                      className="input"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-surface-500 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={editData.dateOfBirth}
                    onChange={(e) => setEditData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    className="input"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-surface-500">Full Name</span>
                  <span className="text-surface-200">{employee.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">Age</span>
                  <span className="text-surface-200">{employee.age} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">Gender</span>
                  <span className="text-surface-200 capitalize">{employee.gender?.toLowerCase()}</span>
                </div>
                {employee.dateOfBirth && (
                  <div className="flex justify-between">
                    <span className="text-surface-500">Date of Birth</span>
                    <span className="text-surface-200">{formatDate(employee.dateOfBirth)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Contact Info */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-surface-100 mb-4 flex items-center gap-2">
              <Mail size={20} className="text-primary-400" />
              Contact Information
            </h2>
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-surface-500 mb-1">Email</label>
                  <input
                    type="email"
                    value={employee.email}
                    disabled
                    className="input bg-surface-800/50 text-surface-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-surface-600 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm text-surface-500 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                    className="input"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-surface-500">Email</span>
                  <span className="text-surface-200">{employee.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-surface-500">Phone</span>
                  <span className="text-surface-200">{employee.phone || '—'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Work Info */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-surface-100 mb-4 flex items-center gap-2">
              <Briefcase size={20} className="text-primary-400" />
              Work Information
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-surface-500">Department</span>
                <span className="text-surface-200">{employee.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">Position</span>
                <span className="text-surface-200">{employee.position}</span>
              </div>
              {employee.class && (
                <div className="flex justify-between">
                  <span className="text-surface-500">Class</span>
                  <span className="text-surface-200">{employee.class}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-surface-500">Join Date</span>
                <span className="text-surface-200">{formatDate(employee.joinDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">Attendance</span>
                <span className={`font-medium ${
                  employee.attendance >= 90 ? 'text-emerald-400' :
                  employee.attendance >= 75 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {employee.attendance?.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-surface-100 mb-4 flex items-center gap-2">
              <MapPin size={20} className="text-primary-400" />
              Address
            </h2>
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-surface-500 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={editData.address}
                    onChange={(e) => setEditData(prev => ({ ...prev, address: e.target.value }))}
                    className="input"
                    placeholder="Enter street address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-surface-500 mb-1">City</label>
                    <input
                      type="text"
                      value={editData.city}
                      onChange={(e) => setEditData(prev => ({ ...prev, city: e.target.value }))}
                      className="input"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-surface-500 mb-1">State</label>
                    <input
                      type="text"
                      value={editData.state}
                      onChange={(e) => setEditData(prev => ({ ...prev, state: e.target.value }))}
                      className="input"
                      placeholder="State"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-surface-500 mb-1">Country</label>
                    <input
                      type="text"
                      value={editData.country}
                      onChange={(e) => setEditData(prev => ({ ...prev, country: e.target.value }))}
                      className="input"
                      placeholder="Country"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-surface-500 mb-1">ZIP Code</label>
                    <input
                      type="text"
                      value={editData.zipCode}
                      onChange={(e) => setEditData(prev => ({ ...prev, zipCode: e.target.value }))}
                      className="input"
                      placeholder="ZIP Code"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-surface-500">Street</span>
                  <span className="text-surface-200">{employee.address || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">City</span>
                  <span className="text-surface-200">{employee.city || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">State</span>
                  <span className="text-surface-200">{employee.state || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">Country</span>
                  <span className="text-surface-200">{employee.country || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">ZIP Code</span>
                  <span className="text-surface-200">{employee.zipCode || '—'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Subjects/Skills */}
        {employee.subjects && employee.subjects.length > 0 && (
          <div className="card p-6 mt-6">
            <h2 className="text-lg font-semibold text-surface-100 mb-4">
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
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ProfilePage;

