import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  LogOut,
  User,
  Settings,
  HelpCircle,
  UserPlus,
  Flag,
  Calendar,
  CheckCircle,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

// Sample notifications
interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  title: string;
  message: string;
  time: string;
  read: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>;
}

const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'info',
    title: 'New Employee Added',
    message: 'John Smith has joined the Engineering team',
    time: '5 min ago',
    read: false,
    icon: UserPlus,
  },
  {
    id: '2',
    type: 'warning',
    title: 'Employee Flagged',
    message: 'Sarah Johnson has been flagged for review',
    time: '1 hour ago',
    read: false,
    icon: Flag,
  },
  {
    id: '3',
    type: 'success',
    title: 'Attendance Updated',
    message: 'Weekly attendance report is ready',
    time: '2 hours ago',
    read: true,
    icon: Calendar,
  },
  {
    id: '4',
    type: 'alert',
    title: 'Pending Approval',
    message: '3 new signup requests awaiting approval',
    time: '3 hours ago',
    read: true,
    icon: CheckCircle,
  },
];

interface HeaderProps {
  onMenuClick: () => void;
  sidebarCollapsed: boolean;
}

// Horizontal menu items
const horizontalMenuItems = [
  { id: 'overview', label: 'Overview', href: '/' },
  { id: 'team', label: 'Team', href: '/employees' },
  { id: 'analytics', label: 'Analytics', href: '/reports' },
  { id: 'help', label: 'Help', href: '/help' },
];

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [searchQuery, setSearchQuery] = useState('');
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/employees?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left section */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-surface-400 hover:text-surface-100 hover:bg-surface-800 rounded-xl transition-colors"
          >
            <Menu size={24} />
          </button>

          {/* Horizontal menu - desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {horizontalMenuItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.href}
                end={item.href === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'text-primary-400 bg-primary-500/10'
                      : 'text-surface-400 hover:text-surface-100 hover:bg-surface-800/50'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <AnimatePresence>
              {searchOpen ? (
                <motion.form
                  initial={{ width: 40, opacity: 0 }}
                  animate={{ width: 280, opacity: 1 }}
                  exit={{ width: 40, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSearch}
                  className="absolute right-0 top-1/2 -translate-y-1/2"
                >
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    onBlur={() => !searchQuery && setSearchOpen(false)}
                    className="w-full px-4 py-2 pl-10 bg-surface-800 border border-surface-700 rounded-xl text-sm text-surface-100 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                </motion.form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2.5 text-surface-400 hover:text-surface-100 hover:bg-surface-800 rounded-xl transition-colors"
                >
                  <Search size={20} />
                </button>
              )}
            </AnimatePresence>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 text-surface-400 hover:text-surface-100 hover:bg-surface-800 rounded-xl transition-colors"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Notifications */}
          <div ref={notificationsRef} className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2.5 text-surface-400 hover:text-surface-100 hover:bg-surface-800 rounded-xl transition-colors"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-accent-500 rounded-full flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">{unreadCount}</span>
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-900 border border-surface-800 rounded-xl shadow-xl overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-4 border-b border-surface-800 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-surface-100">Notifications</h3>
                      <p className="text-xs text-surface-500">
                        {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                      </p>
                    </div>
                    {notifications.length > 0 && (
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                          >
                            Mark all read
                          </button>
                        )}
                        <button
                          onClick={clearAllNotifications}
                          className="text-xs text-surface-500 hover:text-surface-300 transition-colors"
                        >
                          Clear all
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Notification list */}
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-12 h-12 mx-auto text-surface-700 mb-3" />
                        <p className="text-surface-500 text-sm">No notifications</p>
                      </div>
                    ) : (
                      notifications.map((notification) => {
                        const Icon = notification.icon;
                        const typeColors = {
                          info: 'bg-blue-500/20 text-blue-400',
                          warning: 'bg-amber-500/20 text-amber-400',
                          success: 'bg-emerald-500/20 text-emerald-400',
                          alert: 'bg-red-500/20 text-red-400',
                        };

                        return (
                          <div
                            key={notification.id}
                            onClick={() => markAsRead(notification.id)}
                            className={`p-4 border-b border-surface-800/50 hover:bg-surface-800/30 transition-colors cursor-pointer group ${
                              !notification.read ? 'bg-surface-800/20' : ''
                            }`}
                          >
                            <div className="flex gap-3">
                              <div className={`p-2 rounded-lg flex-shrink-0 ${typeColors[notification.type]}`}>
                                <Icon size={16} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className={`text-sm font-medium ${!notification.read ? 'text-surface-100' : 'text-surface-300'}`}>
                                    {notification.title}
                                  </p>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeNotification(notification.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-surface-700 rounded transition-all"
                                  >
                                    <X size={14} className="text-surface-500" />
                                  </button>
                                </div>
                                <p className="text-xs text-surface-500 mt-0.5 truncate">
                                  {notification.message}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] text-surface-600">{notification.time}</span>
                                  {!notification.read && (
                                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="p-3 border-t border-surface-800">
                      <button
                        onClick={() => {
                          setNotificationsOpen(false);
                          // Navigate to a notifications page if you have one
                        }}
                        className="w-full text-center text-sm text-primary-400 hover:text-primary-300 transition-colors"
                      >
                        View all notifications
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile dropdown */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1.5 pr-3 text-surface-300 hover:text-surface-100 hover:bg-surface-800 rounded-xl transition-colors"
            >
              {user?.employee?.avatar ? (
                <img
                  src={user.employee.avatar}
                  alt={user.employee.firstName}
                  className="w-8 h-8 rounded-lg object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium">
                  {user?.employee
                    ? `${user.employee.firstName} ${user.employee.lastName}`
                    : user?.email}
                </p>
                <p className="text-xs text-surface-500">
                  {isAdmin ? 'Admin' : 'Employee'}
                </p>
              </div>
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${
                  profileOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown menu */}
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 bg-surface-900 border border-surface-800 rounded-xl shadow-xl overflow-hidden"
                >
                  {/* User info */}
                  <div className="p-4 border-b border-surface-800">
                    <p className="font-medium text-surface-100">
                      {user?.employee
                        ? `${user.employee.firstName} ${user.employee.lastName}`
                        : user?.email}
                    </p>
                    <p className="text-sm text-surface-500 truncate">
                      {user?.email}
                    </p>
                    <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${
                      isAdmin 
                        ? 'bg-primary-500/20 text-primary-300'
                        : 'bg-surface-700 text-surface-300'
                    }`}>
                      {isAdmin ? 'Administrator' : 'Employee'}
                    </span>
                  </div>

                  {/* Menu items */}
                  <div className="py-2">
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-surface-300 hover:text-surface-100 hover:bg-surface-800 transition-colors"
                    >
                      <User size={16} />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setProfileOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-surface-300 hover:text-surface-100 hover:bg-surface-800 transition-colors"
                    >
                      <Settings size={16} />
                      Settings
                    </Link>
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-surface-300 hover:text-surface-100 hover:bg-surface-800 transition-colors">
                      <HelpCircle size={16} />
                      Help & Support
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-surface-800 py-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

