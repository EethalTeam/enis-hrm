
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { X, User, Mail, Briefcase, DollarSign, Building, Calendar, Clock, Home, Shield } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const EmployeeForm = ({ isOpen, setIsOpen, employee }) => {
  const { addEmployee, updateEmployee, departments, shifts, roles } = useData();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    designation: '',
    department: '',
    joinDate: '',
    salary: '',
    status: 'Active',
    avatar: '',
    shiftId: '',
    workingHours: '',
    workLocation: 'Office',
    role: 'Employee',
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        ...employee,
        salary: employee.salary.toString(),
        workingHours: employee.workingHours?.toString() || '8',
        workLocation: employee.workLocation || 'Office',
        role: employee.role || 'Employee',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        designation: '',
        department: '',
        joinDate: '',
        salary: '',
        status: 'Active',
        avatar: '',
        shiftId: '',
        workingHours: '8',
        workLocation: 'Office',
        role: 'Employee',
      });
    }
  }, [employee, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({...prev, [name]: value}));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const employeeData = {
      ...formData,
      salary: parseFloat(formData.salary),
      workingHours: parseFloat(formData.workingHours)
    };

    if (employee) {
      updateEmployee({ ...employeeData, id: employee.id });
      toast({
        title: 'Employee Updated',
        description: `${employee.name} has been updated successfully.`,
      });
    } else {
      addEmployee(employeeData);
      toast({
        title: 'Employee Added',
        description: `${formData.name} has been added to the system.`,
      });
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="glass-effect border-white/10 rounded-xl w-full max-w-4xl relative"
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="p-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            {employee ? 'Edit Employee' : 'Add New Employee'}
          </h2>
          <p className="text-gray-400 mb-6">
            {employee ? 'Update the details for' : 'Enter the details for the new'} employee.
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Full Name</label>
                <div className="relative"><User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" /><Input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. John Doe" required className="pl-10 glass-effect border-white/10" /></div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Email Address</label>
                <div className="relative"><Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" /><Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="e.g. john.doe@company.com" required className="pl-10 glass-effect border-white/10" /></div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Designation</label>
                <div className="relative"><Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" /><Input name="designation" value={formData.designation} onChange={handleChange} placeholder="e.g. Software Engineer" required className="pl-10 glass-effect border-white/10" /></div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Department</label>
                 <Select name="department" value={formData.department} onValueChange={(value) => handleSelectChange('department', value)} required>
                  <SelectTrigger className="glass-effect border-white/10"><SelectValue placeholder="Select Department" /></SelectTrigger>
                  <SelectContent className="glass-effect border-white/10 text-white">{(departments || []).map(dept => (<SelectItem key={dept.id} value={dept.name} className="hover:bg-white/10">{dept.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Work Shift</label>
                <Select name="shiftId" value={formData.shiftId} onValueChange={(value) => handleSelectChange('shiftId', value)} required>
                  <SelectTrigger className="glass-effect border-white/10"><SelectValue placeholder="Select Shift" /></SelectTrigger>
                  <SelectContent className="glass-effect border-white/10 text-white">{(shifts || []).map(shift => (<SelectItem key={shift.id} value={shift.id} className="hover:bg-white/10">{shift.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
               <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Working Hours/Day</label>
                <div className="relative"><Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" /><Input name="workingHours" type="number" value={formData.workingHours} onChange={handleChange} placeholder="e.g. 8" required className="pl-10 glass-effect border-white/10" /></div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Joining Date</label>
                <div className="relative"><Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" /><Input name="joinDate" type="date" value={formData.joinDate} onChange={handleChange} required className="pl-10 glass-effect border-white/10" /></div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Annual Salary ($)</label>
                <div className="relative"><DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" /><Input name="salary" type="number" value={formData.salary} onChange={handleChange} placeholder="e.g. 75000" required className="pl-10 glass-effect border-white/10" /></div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Work Location</label>
                <Select name="workLocation" value={formData.workLocation} onValueChange={(value) => handleSelectChange('workLocation', value)}>
                  <SelectTrigger className="glass-effect border-white/10"><SelectValue placeholder="Select Location" /></SelectTrigger>
                  <SelectContent className="glass-effect border-white/10 text-white"><SelectItem value="Office">Office</SelectItem><SelectItem value="Remote (WFH)">Remote (WFH)</SelectItem><SelectItem value="Hybrid">Hybrid</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Role</label>
                <Select name="role" value={formData.role} onValueChange={(value) => handleSelectChange('role', value)}>
                  <SelectTrigger className="glass-effect border-white/10"><SelectValue placeholder="Select Role" /></SelectTrigger>
                  <SelectContent className="glass-effect border-white/10 text-white">
                    {(roles || []).map(role => (
                      <SelectItem key={role.id} value={role.name} className="hover:bg-white/10">{role.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 lg:col-span-2">
                <label className="text-sm font-medium text-gray-300">Status</label>
                 <Select name="status" value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                  <SelectTrigger className="glass-effect border-white/10"><SelectValue placeholder="Select Status" /></SelectTrigger>
                  <SelectContent className="glass-effect border-white/10 text-white"><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="border-white/10 hover:bg-white/10">Cancel</Button>
              <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">{employee ? 'Save Changes' : 'Add Employee'}</Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default EmployeeForm;
