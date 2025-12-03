import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid,
  Grid3X3,
  Search,
  Filter,
  Plus,
  ChevronDown,
  X,
} from 'lucide-react';
import { GET_EMPLOYEES, GET_DEPARTMENTS } from '../graphql/queries';
import { Employee, ViewMode, EmployeeFilter, SortField, SortDirection } from '../types';
import { useAuth } from '../context/AuthContext';
import EmployeeGrid from '../components/employees/EmployeeGrid';
import EmployeeTiles from '../components/employees/EmployeeTiles';
import AttendanceView from '../components/employees/AttendanceView';
import EmployeeModal from '../components/employees/EmployeeModal';
import AddEmployeeModal from '../components/employees/AddEmployeeModal';
import Pagination from '../components/ui/Pagination';

const EmployeesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAdmin } = useAuth();
  
  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('tile');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [filters, setFilters] = useState<EmployeeFilter>({});
  const [sortField, setSortField] = useState<SortField>('JOIN_DATE');
  const [sortDirection, setSortDirection] = useState<SortDirection>('DESC');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Sync filters with URL params
  useEffect(() => {
    if (searchParams.get('action') === 'add' && isAdmin) {
      setShowAddModal(true);
    }
    
    // Handle flagged filter from URL - sync both ways
    const filterParam = searchParams.get('filter');
    if (filterParam === 'flagged') {
      setFilters(prev => ({ ...prev, isFlagged: true }));
    } else {
      // Clear the isFlagged filter when navigating away from flagged page
      setFilters(prev => {
        if (prev.isFlagged !== undefined) {
          const { isFlagged, ...rest } = prev;
          return rest;
        }
        return prev;
      });
    }
    
    // Handle attendance view - sort by attendance
    const viewParam = searchParams.get('view');
    if (viewParam === 'attendance') {
      setSortField('ATTENDANCE');
      setSortDirection('DESC');
    }
    
    // Handle search from URL
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams, isAdmin]);

  // Build query variables
  const queryVariables = {
    pagination: { page, pageSize },
    sort: { field: sortField, direction: sortDirection },
    filter: {
      ...filters,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    },
  };

  // Fetch employees
  const { data, loading, refetch } = useQuery(GET_EMPLOYEES, {
    variables: queryVariables,
    fetchPolicy: 'cache-and-network',
  });

  // Fetch departments for filter
  const { data: deptData } = useQuery(GET_DEPARTMENTS);

  const employees = data?.employees?.data || [];
  const totalCount = data?.employees?.totalCount || 0;
  const pageInfo = data?.employees?.pageInfo;
  const departments = deptData?.departments || [];

  const handleFilterChange = (key: keyof EmployeeFilter, value: unknown) => {
    setFilters(prev => {
      if (value === '' || value === undefined || value === null) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: value };
    });
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setDebouncedSearch('');
    setPage(1);
  };

  const hasActiveFilters = Object.keys(filters).length > 0 || debouncedSearch;
  
  // Get current view from URL
  const currentView = searchParams.get('view');
  const isAttendanceView = currentView === 'attendance';
  const isFlaggedView = searchParams.get('filter') === 'flagged';

  // Page title based on view
  const getPageTitle = () => {
    if (isAttendanceView) return 'Attendance';
    if (isFlaggedView) return 'Flagged Employees';
    return 'Employees';
  };

  const getPageDescription = () => {
    if (isAttendanceView) return `Track attendance for ${totalCount} employees`;
    if (isFlaggedView) return `${totalCount} employees flagged for review`;
    return `Manage and view all ${totalCount} employees in your organization`;
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-surface-100 mb-2">
              {getPageTitle()}
            </h1>
            <p className="text-surface-500">
              {getPageDescription()}
            </p>
          </div>
          
          {isAdmin && !isAttendanceView && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              <Plus size={20} />
              Add Employee
            </button>
          )}
        </div>
      </motion.div>

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-4 mb-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
            <input
              type="text"
              placeholder="Search by name, email, department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary ${showFilters ? 'bg-primary-500/20 border-primary-500/30' : ''}`}
          >
            <Filter size={18} />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-primary-500" />
            )}
          </button>

          {/* Sort dropdown */}
          <div className="relative">
            <select
              value={`${sortField}-${sortDirection}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-') as [SortField, SortDirection];
                setSortField(field);
                setSortDirection(direction);
              }}
              className="input pr-10 appearance-none cursor-pointer"
            >
              <option value="JOIN_DATE-DESC">Newest First</option>
              <option value="JOIN_DATE-ASC">Oldest First</option>
              <option value="NAME-ASC">Name A-Z</option>
              <option value="NAME-DESC">Name Z-A</option>
              <option value="DEPARTMENT-ASC">Department A-Z</option>
              <option value="ATTENDANCE-DESC">Highest Attendance</option>
              <option value="ATTENDANCE-ASC">Lowest Attendance</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 pointer-events-none" />
          </div>

          {/* View toggle - hidden in attendance view */}
          {!isAttendanceView && (
            <div className="flex items-center gap-1 bg-surface-800/50 rounded-xl p-1">
              <button
                onClick={() => setViewMode('tile')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'tile'
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'text-surface-500 hover:text-surface-300'
                }`}
                title="Tile View"
              >
                <LayoutGrid size={20} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'text-surface-500 hover:text-surface-300'
                }`}
                title="Grid View"
              >
                <Grid3X3 size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Filters panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-surface-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Department filter */}
                  <div>
                    <label className="block text-sm text-surface-400 mb-2">Department</label>
                    <select
                      value={filters.department || ''}
                      onChange={(e) => handleFilterChange('department', e.target.value)}
                      className="input"
                    >
                      <option value="">All Departments</option>
                      {departments.map((dept: string) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status filter */}
                  <div>
                    <label className="block text-sm text-surface-400 mb-2">Status</label>
                    <select
                      value={filters.status || ''}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="input"
                    >
                      <option value="">All Status</option>
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="ON_LEAVE">On Leave</option>
                      <option value="TERMINATED">Terminated</option>
                    </select>
                  </div>

                  {/* Gender filter */}
                  <div>
                    <label className="block text-sm text-surface-400 mb-2">Gender</label>
                    <select
                      value={filters.gender || ''}
                      onChange={(e) => handleFilterChange('gender', e.target.value)}
                      className="input"
                    >
                      <option value="">All Genders</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  {/* Flagged filter */}
                  <div>
                    <label className="block text-sm text-surface-400 mb-2">Flagged</label>
                    <select
                      value={filters.isFlagged === undefined ? '' : filters.isFlagged.toString()}
                      onChange={(e) => handleFilterChange('isFlagged', e.target.value === '' ? undefined : e.target.value === 'true')}
                      className="input"
                    >
                      <option value="">All</option>
                      <option value="true">Flagged Only</option>
                      <option value="false">Not Flagged</option>
                    </select>
                  </div>
                </div>

                {/* Clear filters */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
                  >
                    <X size={14} />
                    Clear all filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Results count and page size */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-surface-500">
          Showing {employees.length} of {totalCount} employees
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-surface-500">Per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1); // Reset to first page when changing page size
            }}
            className="px-3 py-1.5 bg-surface-800 border border-surface-700 rounded-lg text-sm text-surface-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          >
            <option value={8}>8</option>
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
          </select>
        </div>
      </div>

      {/* Employee views */}
      <AnimatePresence mode="wait">
        {loading && employees.length === 0 ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card p-6">
                <div className="skeleton w-16 h-16 rounded-xl mb-4" />
                <div className="skeleton h-5 w-32 mb-2 rounded" />
                <div className="skeleton h-4 w-24 mb-4 rounded" />
                <div className="skeleton h-3 w-full mb-2 rounded" />
                <div className="skeleton h-3 w-2/3 rounded" />
              </div>
            ))}
          </motion.div>
        ) : employees.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-surface-800 flex items-center justify-center">
              <Search size={32} className="text-surface-600" />
            </div>
            <h3 className="text-xl font-semibold text-surface-300 mb-2">
              No employees found
            </h3>
            <p className="text-surface-500 mb-6">
              {hasActiveFilters
                ? 'Try adjusting your filters or search query'
                : 'Start by adding your first employee'}
            </p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="btn-secondary">
                Clear filters
              </button>
            )}
          </motion.div>
        ) : isAttendanceView ? (
          <motion.div
            key="attendance"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AttendanceView
              employees={employees}
              onSelect={setSelectedEmployee}
            />
          </motion.div>
        ) : viewMode === 'tile' ? (
          <motion.div
            key="tiles"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <EmployeeTiles
              employees={employees}
              onSelect={setSelectedEmployee}
              onRefetch={refetch}
            />
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <EmployeeGrid
              employees={employees}
              onSelect={setSelectedEmployee}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {pageInfo && pageInfo.totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={pageInfo.totalPages}
          onPageChange={setPage}
        />
      )}

      {/* Employee detail modal */}
      <AnimatePresence>
        {selectedEmployee && (
          <EmployeeModal
            employee={selectedEmployee}
            onClose={() => setSelectedEmployee(null)}
            onRefetch={refetch}
          />
        )}
      </AnimatePresence>

      {/* Add employee modal */}
      <AnimatePresence>
        {showAddModal && isAdmin && (
          <AddEmployeeModal
            onClose={() => {
              setShowAddModal(false);
              setSearchParams({});
            }}
            onSuccess={() => {
              setShowAddModal(false);
              setSearchParams({});
              refetch();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmployeesPage;

