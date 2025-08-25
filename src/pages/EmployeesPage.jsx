
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, Home, Briefcase } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import EmployeeForm from '@/components/employees/EmployeeForm';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"; 

const EmployeesPage = () => {
  const { employees, deleteEmployee } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10); // default
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.designation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || employee.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });
  const totalPages = Math.ceil(filteredEmployees.length / rowsPerPage);

  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentEmployees = filteredEmployees.slice(startIndex, startIndex + rowsPerPage);

  const handleRowsPerPageChange = (value) => {
    setRowsPerPage(Number(value));
    setCurrentPage(1); // reset to first page
  };

  const departments = [...new Set(employees.map(emp => emp.department))];

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setIsFormOpen(true);
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setIsFormOpen(true);
  };
  
  const handleDeleteClick = (employee) => {
    setEmployeeToDelete(employee);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (employeeToDelete) {
      deleteEmployee(employeeToDelete.id);
      toast({
        title: "Employee Deleted",
        description: `Successfully deleted ${employeeToDelete.name}.`,
      });
      setEmployeeToDelete(null);
      setIsConfirmOpen(false);
    }
  };

  const handleViewEmployee = (employee) => {
    toast({
      title: "🚧 Feature Coming Soon!",
      description: "Employee profile view isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
    });
  };

  const getLocationIcon = (location) => {
    switch(location) {
      case 'Remote (WFH)': return <Home className="w-4 h-4 text-cyan-400" />;
      case 'Hybrid': return <><Briefcase className="w-4 h-4 text-purple-400" /><Home className="w-4 h-4 text-purple-400" /></>;
      default: return <Briefcase className="w-4 h-4 text-green-400" />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Employees - ENIS-HRMS</title>
        <meta name="description" content="Manage your organization's employees with comprehensive profiles, department tracking, and advanced search capabilities." />
        <meta property="og:title" content="Employee Management - ENIS-HRMS" />
        <meta property="og:description" content="Streamline employee management with detailed profiles, organizational structure, and powerful search tools." />
      </Helmet>
      
      <AnimatePresence>
        {isFormOpen && (
          <EmployeeForm 
            isOpen={isFormOpen} 
            setIsOpen={setIsFormOpen} 
            employee={selectedEmployee} 
          />
        )}
      </AnimatePresence>

      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Are you sure?"
        description={`This action cannot be undone. This will permanently delete ${employeeToDelete?.name}'s record.`}
      />

      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Employee Management</h1>
            <p className="text-gray-400">Manage your organization's workforce</p>
          </div>
          <Button 
            onClick={handleAddEmployee}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="glass-effect border-white/10">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 glass-effect border-white/10 text-white placeholder-gray-400"
                  />
                </div>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="px-4 py-2 glass-effect border border-white/10 rounded-md text-white bg-transparent"
                >
                  <option value="all" className="bg-slate-800">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept} className="bg-slate-800">{dept}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Employee Directory</CardTitle>
              <CardDescription className="text-gray-400">
                {filteredEmployees.length} of {employees.length} employees
              </CardDescription>
            </CardHeader>
            <CardContent>
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Work Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentEmployees.map((employee, index) => (
              <motion.tr
                key={employee.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                        <td>
                          <div className="flex items-center gap-4">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={employee.avatar} alt={employee.name} />
                              <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold text-white">{employee.name}</div>
                              <div className="text-sm text-gray-400">{employee.designation}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-gray-300">{employee.department}</td>
                        <td>
                          <div className="flex items-center gap-2 text-gray-300">
                            {getLocationIcon(employee.workLocation)}
                            <span>{employee.workLocation}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${employee.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                            {employee.status}
                          </span>
                        </td>
                        <td>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="hover:bg-white/10 h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="glass-effect border-white/10">
                              <DropdownMenuItem onClick={() => handleViewEmployee(employee)} className="hover:bg-white/10"><Eye className="w-4 h-4 mr-2" />View</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditEmployee(employee)} className="hover:bg-white/10"><Edit className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteClick(employee)} className="hover:bg-white/10 text-red-400"><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination + Rows per Page */}
      <div className="flex justify-between items-center mt-4 text-gray-300">
        {/* Rows Per Page Selector */}
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <Select value={String(rowsPerPage)} onValueChange={handleRowsPerPageChange}>
            <SelectTrigger className="w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Page Controls */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            Previous
          </Button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default EmployeesPage;
