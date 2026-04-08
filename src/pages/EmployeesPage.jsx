import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";

import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Home,
  Briefcase,
} from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import EmployeeForm from "@/components/employees/EmployeeForm";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/components/CustomComponents/apiRequest";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const EmployeesPage = () => {
  const navigate = useNavigate();
  const { deleteEmployee } = useData();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [employee, setEmployee] = useState([]);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewEmployee, setViewEmployee] = useState(null);
  const { getPermissionsByPath } = useAuth();
  const [Permissions, setPermissions] = useState({
    isAdd: false,
    isView: false,
    isEdit: false,
    isDelete: false,
  });

  useEffect(() => {
    const init = async () => {
      try {
        const res = await getPermissionsByPath(window.location.pathname);
        if (res) {
          setPermissions(res);
        } else {
          navigate("/dashboard");
          return;
        }

        await getAllEmployees();
      } catch (error) {
        console.error("Init error:", error);
      }
    };

    init();
  }, []);

  const getAllEmployees = async () => {
    try {
      const res = await apiRequest("Employee/getAllEmployees/", {
        method: "POST",
        body: JSON.stringify({}),
      });

      setEmployee(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployee([]);
    }
  };

  const filteredEmployees = employee.filter((emp) => {
    const matchesSearch =
      (emp.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.employeeCode || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment =
      selectedDepartment === "all" ||
      emp.departmentName === selectedDepartment ||
      emp.department === selectedDepartment;

    return matchesSearch && matchesDepartment;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEmployees.length / rowsPerPage),
  );

  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentEmployees = filteredEmployees.slice(
    startIndex,
    startIndex + rowsPerPage,
  );

  const handleRowsPerPageChange = (value) => {
    setRowsPerPage(Number(value));
    setCurrentPage(1);
  };

  const departments = [
    ...new Set(
      employee
        .map((emp) => emp.departmentName || emp.department)
        .filter(Boolean),
    ),
  ];

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setIsFormOpen(true);
  };

  const handleEditEmployee = (emp) => {
    // important mapping for edit form
    const editData = {
      ...emp,
      designation: emp.designationName || emp.designation || "",
      designationId: emp.designationId || emp.designation?._id || "",
      department: emp.departmentName || emp.department || "",
      departmentId: emp.departmentId || emp.department?._id || "",
      status: emp.statusName || emp.status || "",
      statusId: emp.statusId || emp.status?._id || "",
      shift: emp.shiftName || emp.shift || "",
      shiftId: emp.shiftId || emp.shift?._id || "",
      workLocation: emp.workLocationName || emp.workLocation || "",
      workLocationId: emp.workLocationId || emp.workLocation?._id || "",

      // ===== role fix =====
      role: emp.roleName || emp.role || "",
      roleId: emp.roleId || emp.role?._id || "",
    };

    setSelectedEmployee(editData);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (emp) => {
    setEmployeeToDelete(emp);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      if (employeeToDelete) {
        await deleteEmployee(employeeToDelete._id);

        toast({
          title: "Employee Deleted",
          description: `Successfully deleted ${employeeToDelete.name}.`,
        });

        setEmployeeToDelete(null);
        setIsConfirmOpen(false);
        await getAllEmployees();
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Delete Failed",
        description: "Unable to delete employee.",
        variant: "destructive",
      });
    }
  };

  const handleViewEmployee = (emp) => {
    setViewEmployee(emp);
    setIsViewOpen(true);
  };

  const getLocationIcon = (location) => {
    switch (location) {
      case "Remote (WFH)":
        return <Home className="w-4 h-4 text-cyan-400" />;
      case "Hybrid":
        return (
          <div className="flex items-center gap-1">
            <Briefcase className="w-4 h-4 text-purple-400" />
            <Home className="w-4 h-4 text-purple-400" />
          </div>
        );
      default:
        return <Briefcase className="w-4 h-4 text-green-400" />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Employees - ENIS-HRMS</title>
        <meta
          name="description"
          content="Manage your organization's employees with comprehensive profiles, department tracking, and advanced search capabilities."
        />
      </Helmet>

      <AnimatePresence>
        {isFormOpen && (
          <EmployeeForm
            isOpen={isFormOpen}
            setIsOpen={setIsFormOpen}
            employee={selectedEmployee}
            getAllEmployees={getAllEmployees}
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
            <h1 className="text-3xl font-bold text-white mb-2">
              Employee Management
            </h1>
            <p className="text-gray-400">
              Manage your organization's workforce
            </p>
          </div>

          {Permissions.isAdd && (
            <Button
              onClick={handleAddEmployee}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          )}
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
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10 glass-effect border-white/10 text-white placeholder-gray-400"
                  />
                </div>

                <select
                  value={selectedDepartment}
                  onChange={(e) => {
                    setSelectedDepartment(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 glass-effect border border-white/10 rounded-md text-white bg-transparent"
                >
                  <option value="all" className="bg-slate-800">
                    All Departments
                  </option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept} className="bg-slate-800">
                      {dept}
                    </option>
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
                {filteredEmployees.length} of {employee.length} employees
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto">
                <table className="data-table w-full">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Role</th>
                      <th>Work Location</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentEmployees.length > 0 ? (
                      currentEmployees.map((emp, index) => (
                        <motion.tr
                          key={emp._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <td>
                            <div className="flex items-center gap-4">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={emp.avatar} alt={emp.name} />
                                <AvatarFallback>
                                  {(emp.name || "")
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>

                              <div>
                                <div className="font-semibold text-white">
                                  {emp.name || "-"}
                                </div>
                                <div className="text-sm text-gray-400">
                                  {emp.designationName ||
                                    emp.designation ||
                                    "-"}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="text-gray-300">
                            {emp.departmentName || emp.department || "-"}
                          </td>

                          <td className="text-gray-300">
                            {emp.roleName || emp.role || "-"}
                          </td>

                          <td>
                            <div className="flex items-center gap-2 text-gray-300">
                              {getLocationIcon(
                                emp.workLocationName || emp.workLocation,
                              )}
                              <span>
                                {emp.workLocationName ||
                                  emp.workLocation ||
                                  "-"}
                              </span>
                            </div>
                          </td>

                          <td>
                            <span
                              className={`status-badge ${
                                (emp.statusName || emp.status) === "Active"
                                  ? "status-active"
                                  : (emp.statusName || emp.status) ===
                                      "Inactive"
                                    ? "status-inactive"
                                    : "status-break"
                              }`}
                            >
                              {emp.statusName || emp.status || "-"}
                            </span>
                          </td>

                          <td>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="hover:bg-white/10 h-8 w-8"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>

                              <DropdownMenuContent
                                align="end"
                                className="glass-effect border-white/10"
                              >
                                {Permissions.isView && (
                                  <DropdownMenuItem
                                    onClick={() => handleViewEmployee(emp)}
                                    className="hover:bg-white/10"
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View
                                  </DropdownMenuItem>
                                )}

                                {Permissions.isEdit && (
                                  <DropdownMenuItem
                                    onClick={() => handleEditEmployee(emp)}
                                    className="hover:bg-white/10"
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                )}

                                {Permissions.isDelete && (
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteClick(emp)}
                                    className="hover:bg-white/10 text-red-400"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="text-center py-8 text-gray-400"
                        >
                          No employees found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center mt-4 text-gray-300 flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <span>Rows per page:</span>
                  <Select
                    value={String(rowsPerPage)}
                    onValueChange={handleRowsPerPageChange}
                  >
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

                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
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
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Employee Details</DialogTitle>
              </DialogHeader>
              {viewEmployee && (
                <div className="h-full flex flex-col">
                  {/* Top Profile Section */}
                  <div className="bg-gradient-to-r from-blue-800 to-purple-900 p-6 flex flex-col items-center rounded-[10px] justify-center text-white">
                    <Avatar className="w-24 h-24 border-4 border-white">
                      <AvatarImage src={viewEmployee.avatar} />
                      <AvatarFallback className="text-xl">
                        {viewEmployee.name?.[0]}
                      </AvatarFallback>
                    </Avatar>

                    <h2 className="text-xl font-bold mt-3">
                      {viewEmployee.name}
                    </h2>
                    <p className="text-sm opacity-90">
                      {viewEmployee.designationName || viewEmployee.designation}
                    </p>
                  </div>

                  {/* Details Section */}
                  <div className="flex-1 p-5 grid grid-cols-2 gap-5 text-sm">
                    <div className="space-y-1">
                      <p className="text-gray-400 text-xs">Email</p>
                      <p className="font-medium">{viewEmployee.email}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400 text-xs">Phone:</p>
                      <p className="font-medium">{viewEmployee.phoneNumber}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400 text-xs">Department:</p>
                      <p className="font-medium">
                        {viewEmployee.departmentName}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400 text-xs">Role:</p>
                      <p className="font-medium">{viewEmployee.roleName}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400 text-xs">Status:</p>
                      <p className="font-medium">{viewEmployee.statusName}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400 text-xs">Salary:</p>
                      <p className="font-medium">₹{viewEmployee.salary}</p>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>
    </>
  );
};

export default EmployeesPage;
