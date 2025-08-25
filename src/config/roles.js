import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  Calendar, 
  DollarSign,
  FolderOpen,
  CheckSquare,
  Timer,
  TrendingUp,
  UserPlus,
  Ticket,
  MessageCircle,
  Settings,
  Shield,
} from 'lucide-react';

export const ALL_MENU_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', id: 'dashboard' },
  { 
    icon: Users, 
    label: 'Employees', 
    path: '/employees',
    id: 'employees',
    subItems: [
      { label: 'All Employees', path: '/employees', id: 'employees.all' },
      { label: 'Departments', path: '/departments', id: 'employees.departments' },
      { label: 'Designations', path: '/designations', id: 'employees.designations' },
    ]
  },
  { 
    icon: DollarSign, 
    label: 'Payroll', 
    path: '/payroll',
    id: 'payroll',
    subItems: [
      { label: 'Employee Salary', path: '/payroll', id: 'payroll.salary' },
      { label: 'Payslip', path: '/payslip', id: 'payroll.payslip' },
      { label: 'Payroll Items', path: '/payroll/settings', id: 'payroll.settings' },
      { label: 'Shifts', path: '/shifts', id: 'payroll.shifts' },
    ]
  },
  { icon: FolderOpen, label: 'Projects', path: '/projects', id: 'projects' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks', id: 'tasks' },
  { 
    icon: Clock, 
    label: 'Attendance', 
    path: '/attendance',
    id: 'attendance',
    subItems: [
      { label: 'Daily Log', path: '/attendance', id: 'attendance.log' },
      { label: 'Reports', path: '/attendance/reports', id: 'attendance.reports' },
    ]
  },
  { 
    icon: Calendar, 
    label: 'Leaves', 
    path: '/leaves',
    id: 'leaves',
     subItems: [
      { label: 'Leave Requests', path: '/leaves', id: 'leaves.requests' },
      { label: 'Leave Balances', path: '/leaves/balances', id: 'leaves.balances' },
      { label: 'Permissions', path: '/leaves/permissions', id: 'leaves.permissions' },
    ]
  },
  { icon: Timer, label: 'Timesheets', path: '/timesheets', id: 'timesheets' },
  { 
    icon: TrendingUp, 
    label: 'Finance', 
    path: '/finance',
    id: 'finance',
     subItems: [
      { label: 'Transactions', path: '/finance', id: 'finance.transactions' },
      { label: 'Invoices', path: '/finance/invoices', id: 'finance.invoices' },
      { label: 'Reports', path: '/finance/reports', id: 'finance.reports' },
    ]
  },
  { 
    icon: UserPlus, 
    label: 'Leads', 
    path: '/leads',
    id: 'leads',
    subItems: [
      { label: 'All Leads', path: '/leads', id: 'leads.all' },
      { label: 'Lead Funnel', path: '/leads/funnel', id: 'leads.funnel' },
    ]
  },
  { icon: Ticket, label: 'Tickets', path: '/tickets', id: 'tickets' },
  { icon: MessageCircle, label: 'Chat', path: '/chat', id: 'chat' },
  { 
    icon: Settings, 
    label: 'Settings', 
    path: '/settings',
    id: 'settings',
    subItems: [
      { label: 'General', path: '/settings', id: 'settings.general' },
      { label: 'Roles & Permissions', path: '/settings/roles', id: 'settings.roles' },
      { label: 'Notifications', path: '/settings/notifications', id: 'settings.notifications' },
      { label: 'Appearance', path: '/settings/appearance', id: 'settings.appearance' },
    ]
  }
];
