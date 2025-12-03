import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Settings,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  UserCheck,
  Flag,
  X,
  ClipboardList,
  CalendarDays,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  children?: {
    id: string;
    label: string;
    href: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/',
  },
  {
    id: 'employees',
    label: 'Employees',
    icon: Users,
    children: [
      { id: 'all-employees', label: 'All Employees', href: '/employees', icon: Users },
      { id: 'flagged', label: 'Flagged', href: '/employees?filter=flagged', icon: Flag },
      { id: 'attendance', label: 'Attendance', href: '/employees?view=attendance', icon: CalendarDays },
    ],
  },
  {
    id: 'management',
    label: 'Management',
    icon: UserCheck,
    adminOnly: true,
    children: [
      { id: 'add-employee', label: 'Add Employee', href: '/employees?action=add', icon: UserPlus },
      { id: 'pending-accounts', label: 'Pending Accounts', href: '/pending-accounts', icon: ClipboardList },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/settings',
  },
];

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  isCollapsed,
  onClose,
  onToggleCollapse,
}) => {
  const [expandedItems, setExpandedItems] = useState<string[]>(['employees']);
  const location = useLocation();
  const { isAdmin } = useAuth();

  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href.split('?')[0]);
  };

  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-surface-800">
        <NavLink to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-display font-bold text-xl gradient-text"
            >
              StaffHub
            </motion.span>
          )}
        </NavLink>
        
        {/* Close button on mobile */}
        <button
          onClick={onClose}
          className="lg:hidden p-2 text-surface-400 hover:text-surface-100 rounded-lg hover:bg-surface-800"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {filteredNavItems.map((item) => (
            <li key={item.id}>
              {item.href ? (
                // Simple nav item
                <NavLink
                  to={item.href}
                  onClick={onClose}
                  className={({ isActive: active }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                      active || isActive(item.href!)
                        ? 'bg-primary-500/10 text-primary-400'
                        : 'text-surface-400 hover:text-surface-100 hover:bg-surface-800/50'
                    }`
                  }
                >
                  <item.icon
                    className={`w-5 h-5 flex-shrink-0 ${
                      isActive(item.href)
                        ? 'text-primary-400'
                        : 'text-surface-500 group-hover:text-surface-300'
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </NavLink>
              ) : (
                // Nav item with children (submenu)
                <>
                  <button
                    onClick={() => !isCollapsed && toggleExpand(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                      expandedItems.includes(item.id)
                        ? 'bg-surface-800/30 text-surface-100'
                        : 'text-surface-400 hover:text-surface-100 hover:bg-surface-800/50'
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0 text-surface-500 group-hover:text-surface-300" />
                    {!isCollapsed && (
                      <>
                        <span className="font-medium flex-1 text-left">
                          {item.label}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            expandedItems.includes(item.id) ? 'rotate-180' : ''
                          }`}
                        />
                      </>
                    )}
                  </button>

                  {/* Submenu */}
                  <AnimatePresence>
                    {!isCollapsed && expandedItems.includes(item.id) && item.children && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden ml-4 mt-1 space-y-1 border-l border-surface-800 pl-3"
                      >
                        {item.children.map((child) => (
                          <motion.li
                            key={child.id}
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <NavLink
                              to={child.href}
                              onClick={onClose}
                              className={({ isActive: active }) =>
                                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                  active
                                    ? 'bg-primary-500/10 text-primary-400'
                                    : 'text-surface-500 hover:text-surface-200 hover:bg-surface-800/30'
                                }`
                              }
                            >
                              {child.icon && (
                                <child.icon className="w-4 h-4" />
                              )}
                              <span>{child.label}</span>
                            </NavLink>
                          </motion.li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapse toggle - desktop only */}
      <div className="hidden lg:block p-3 border-t border-surface-800">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-surface-500 hover:text-surface-200 hover:bg-surface-800/50 rounded-xl transition-all duration-200"
        >
          {isCollapsed ? (
            <ChevronRight size={20} />
          ) : (
            <>
              <ChevronLeft size={20} />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed top-0 left-0 h-full bg-surface-900/80 backdrop-blur-xl border-r border-surface-800 z-30 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -288 }}
            animate={{ x: 0 }}
            exit={{ x: -288 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-72 bg-surface-900/95 backdrop-blur-xl border-r border-surface-800 z-50 lg:hidden"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;

