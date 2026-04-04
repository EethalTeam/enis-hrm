import React, { useState, useReducer, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useData } from "@/contexts/DataContext";
import Reducer from "@/components/Reducer/commonReducer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { config } from "@/components/CustomComponents/config";
import {
  X,
  User,
  Phone,
  Mail,
  Briefcase,
  IndianRupee,
  Building,
  Calendar,
  Clock,
  Home,
  Shield,
  BookLock,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/components/CustomComponents/apiRequest";

const initialState = {
  _id: "",
  code: "",
  name: "",
  email: "",
  password: "",
  designation: "",
  designationId: "",
  department: "",
  departmentId: "",
  joinDate: "",
  birthDate: "",
  phoneNumber: "",
  salary: "",
  status: "",
  statusId: "",
  avatar: "",
  shiftId: "",
  shift: "",
  workingHours: "",
  workLocation: "Office",
  workLocationId: "",
  role: "",
  roleId: "",
};

const EmployeeForm = ({ isOpen, setIsOpen, employee, getAllEmployees }) => {
  const { addEmployee, departments, shifts, roles } = useData();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    _id: "",
    name: "",
    code: "",
    email: "",
    password: "",
    designation: "",
    designationId: "",
    department: "",
    departmentId: "",
    joinDate: "",
    birthDate: "",
    phoneNumber: "",
    salary: "",
    status: "",
    statusId: "",
    avatar: "",
    shift: "",
    shiftId: "",
    workingHours: "",
    workLocation: "",
    workLocationId: "",
    role: "",
    roleId: "",
  });

  const [state, dispatch] = useReducer(Reducer, initialState);
  const [Employee, setEmployee] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [Department, setDepartment] = useState([]);
  const [Data, SetData] = useState([]);
  const [employeePic, setEmployeePic] = useState(null);

  useEffect(() => {
    if (employee) {
      let employeeData = {
        _id: employee._id,
        name: employee.name,
        code: employee.code,
        email: employee.email,
        password: employee.password,
        designation: employee.designationName,
        designationId: employee.designationId,
        department: employee.departmentName,
        departmentId: employee.departmentId,
        joinDate: employee.joinDate?.split("T")[0] || "",
        birthDate: employee.birthDate?.split("T")[0] || "",
        phoneNumber: employee.phoneNumber,
        salary: employee.salary,
        status: employee.statusName,
        statusId: employee.statusId,
        avatar: employee.avatar,
        shift: employee.shiftName,
        shiftId: employee.shiftId,
        workingHours: employee.workingHours,
        workLocation: employee.workLocationName,
        workLocationId: employee.workLocationId,
        role: employee.roleName,
        roleId: employee.roleId,
      };

      setFormData({
        ...employeeData,
        salary: employee.salary?.toString() || "",
        workingHours: employee.workingHours?.toString() || "8",
      });
    } else {
      setFormData({
        _id: "",
        name: "",
        code: "",
        email: "",
        password: "",
        designation: "",
        designationId: "",
        department: "",
        departmentId: "",
        joinDate: "",
        birthDate: "",
        phoneNumber: "",
        salary: "",
        status: "",
        statusId: "",
        avatar: "",
        workingHours: "8",
        workLocation: "",
        workLocationId: "",
        role: "",
        roleId: "",
        shift: "",
        shiftId: "",
      });
      setEmployeePic(null);
    }
  }, [employee, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (id, name, key, value) => {
    if (key && name) {
      setFormData((prev) => ({
        ...prev,
        [id]: key,
        [name]: value,
      }));
      SetData([]);
    }
  };
  // useEffect(() => {
  //   getRoleList();
  // }, []);
  const getDepartmentList = async () => {
    try {
      SetData([]);
      const res = await apiRequest("Employee/getAllDepartments/", {
        method: "POST",
        body: JSON.stringify({}),
      });

      if (!res) {
        throw new Error("Failed to get Department");
      }

      SetData(res);
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  const createEmployee = async () => {
    try {
      const formDataToSend = new FormData();

      formDataToSend.append("code", formData.code);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("designationId", formData.designationId);
      formDataToSend.append("departmentId", formData.departmentId);
      formDataToSend.append("joinDate", formData.joinDate);
      formDataToSend.append("birthDate", formData.birthDate);
      formDataToSend.append("phoneNumber", formData.phoneNumber);
      formDataToSend.append("salary", formData.salary);
      formDataToSend.append("statusId", formData.statusId);
      formDataToSend.append("shiftId", formData.shiftId);
      formDataToSend.append("workingHours", formData.workingHours);
      formDataToSend.append("workLocationId", formData.workLocationId);
      formDataToSend.append("roleId", formData.roleId);
      formDataToSend.append("unitId", "YOUR_UNIT_ID");

      if (employeePic) {
        formDataToSend.append("avatar", employeePic);
      }

      const response = await fetch(
        `${config.Api}/api/Employee/createEmployee`,
        {
          method: "POST",
          body: formDataToSend,
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create employee");
      }

      SetData([]);
      getAllEmployees();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  const updateEmployee = async () => {
    try {
      const formDataToSend = new FormData();

      formDataToSend.append("_id", formData._id);
      formDataToSend.append("code", formData.code);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("designationId", formData.designationId);
      formDataToSend.append("departmentId", formData.departmentId);
      formDataToSend.append("joinDate", formData.joinDate);
      formDataToSend.append("birthDate", formData.birthDate);
      formDataToSend.append("phoneNumber", formData.phoneNumber);
      formDataToSend.append("salary", formData.salary);
      formDataToSend.append("statusId", formData.statusId);
      formDataToSend.append("shiftId", formData.shiftId);
      formDataToSend.append("workingHours", formData.workingHours);
      formDataToSend.append("workLocationId", formData.workLocationId);
      formDataToSend.append("roleId", formData.roleId);

      if (employeePic) {
        formDataToSend.append("avatar", employeePic);
      }

      const response = await fetch(
        `${config.Api}/api/Employee/updateEmployee`,
        {
          method: "POST",
          body: formDataToSend,
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update employee");
      }

      SetData([]);
      getAllEmployees();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  const getDesignationList = async () => {
    try {
      SetData([]);
      const response = await apiRequest("Employee/getAllDesignations/", {
        method: "POST",
        body: JSON.stringify({}),
      });

      SetData(response);
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  const getShiftList = async () => {
    try {
      SetData([]);
      const response = await apiRequest("Employee/getAllShifts/", {
        method: "POST",
        body: JSON.stringify({}),
      });
      SetData(response);
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  const getWorkLocationList = async () => {
    try {
      SetData([]);
      const response = await apiRequest("Employee/getAllWorkLocations/", {
        method: "POST",
        body: JSON.stringify({}),
      });
      SetData(response);
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  const getRoleList = async () => {
    try {
      SetData([]);
      const response = await apiRequest("Employee/getAllRoles/", {
        method: "POST",
        body: JSON.stringify({}),
      });
      SetData(response);
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  const getStatusList = async () => {
    try {
      SetData([]);
      const response = await apiRequest("Employee/getAllStatus/", {
        method: "POST",
        body: JSON.stringify({}),
      });
      SetData(response);
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (employee) {
        await updateEmployee();
        toast({
          title: "Employee Updated",
          description: `${formData.name} has been updated successfully.`,
        });
      } else {
        await createEmployee();
        toast({
          title: "Employee Added",
          description: `${formData.name} has been added to the system.`,
        });
      }

      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
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
        style={{ overflowY: "auto", height: "90vh", scrollbarWidth: "none" }}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            {employee ? "Edit Employee" : "Add New Employee"}
          </h2>
          <p className="text-gray-400 mb-6">
            {employee
              ? "Update the details for"
              : "Enter the details for the new"}{" "}
            employee.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Employee Code
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="e.g. EMP001"
                    required
                    className="pl-10 border-white/10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                    required
                    className="pl-10 border-white/10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. john.doe@company.com"
                    required
                    className="pl-10 border-white/10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <BookLock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="please enter password"
                    required
                    className="pl-10 border-white/10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Date of Birth
                </label>
                <div className="relative">
                  <Input
                    name="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={handleChange}
                    required
                    className="glass-effect border-white/10 bg-white/5 text-white [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    name="phoneNumber"
                    type="tel"
                    maxLength={10}
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="e.g. 9876543210"
                    required
                    className="pl-10 border-white/10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Designation
                </label>
                <Select
                  name="designation"
                  value={formData.designationId}
                  onOpenChange={async (open) => {
                    if (open && (!Data || Data.length === 0)) {
                      await getDesignationList();
                    }
                  }}
                  onValueChange={(id) => {
                    if (!id) return;
                    const dept = Data.find((d) => d._id === id);
                    if (dept) {
                      handleSelectChange(
                        "designationId",
                        "designation",
                        dept._id,
                        dept.designationName,
                      );
                    }
                  }}
                >
                  <SelectTrigger className="glass-effect border-white/10">
                    <SelectValue placeholder="Select Designation">
                      {formData.designation}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="glass-effect border-white/10 text-white">
                    {(Data || []).map((dept) => (
                      <SelectItem
                        key={dept._id}
                        value={dept._id}
                        className="hover:bg-white/10"
                      >
                        {dept.designationName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Department
                </label>
                <Select
                  name="department"
                  value={formData.departmentId}
                  onOpenChange={async (open) => {
                    if (open) {
                      await getDepartmentList();
                    }
                  }}
                  onValueChange={(id) => {
                    if (!id) return;
                    const dept = Data.find((d) => d._id === id);
                    if (dept) {
                      handleSelectChange(
                        "departmentId",
                        "department",
                        dept._id,
                        dept.departmentName,
                      );
                    }
                  }}
                >
                  <SelectTrigger className="glass-effect border-white/10">
                    <SelectValue placeholder="Select Department">
                      {formData.department}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="glass-effect border-white/10 text-white">
                    {(Data || []).map((dept) => (
                      <SelectItem
                        key={dept._id}
                        value={dept._id}
                        className="hover:bg-white/10"
                      >
                        {dept.departmentName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Shift
                </label>
                <Select
                  name="Shift"
                  value={formData.shiftId}
                  onOpenChange={async (open) => {
                    if (open) {
                      await getShiftList();
                    }
                  }}
                  onValueChange={(id) => {
                    if (!id) return;
                    const dept = Data.find((d) => d._id === id);
                    if (dept) {
                      handleSelectChange(
                        "shiftId",
                        "shift",
                        dept._id,
                        dept.shiftName,
                      );
                    }
                  }}
                >
                  <SelectTrigger className="glass-effect border-white/10">
                    <SelectValue placeholder="Select Shift">
                      {formData.shift}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="glass-effect border-white/10 text-white">
                    {(Data || []).map((dept) => (
                      <SelectItem
                        key={dept._id}
                        value={dept._id}
                        className="hover:bg-white/10"
                      >
                        {dept.shiftName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Working Hours/Day
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    name="workingHours"
                    type="number"
                    value={formData.workingHours}
                    onChange={handleChange}
                    placeholder="e.g. 8"
                    required
                    className="pl-10 glass-effect border-white/10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Joining Date
                </label>
                <div className="relative">
                  <Input
                    name="joinDate"
                    type="date"
                    value={formData.joinDate}
                    onChange={handleChange}
                    required
                    className="glass-effect border-white/10 bg-white/5 text-white [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Annual Salary (₹)
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    name="salary"
                    type="number"
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="e.g. 75000"
                    required
                    className="pl-10 glass-effect border-white/10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Work Location
                </label>
                <Select
                  name="Work Location"
                  value={formData.workLocationId}
                  onOpenChange={async (open) => {
                    if (open && (!Data || Data.length === 0)) {
                      await getWorkLocationList();
                    }
                  }}
                  onValueChange={(id) => {
                    if (!id) return;
                    const dept = Data.find((d) => d._id === id);
                    if (dept) {
                      handleSelectChange(
                        "workLocationId",
                        "workLocation",
                        dept._id,
                        dept.locationName,
                      );
                    }
                  }}
                >
                  <SelectTrigger className="glass-effect border-white/10">
                    <SelectValue placeholder="Select Work Location">
                      {formData.workLocation}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="glass-effect border-white/10 text-white">
                    {(Data || []).map((dept) => (
                      <SelectItem
                        key={dept._id}
                        value={dept._id}
                        className="hover:bg-white/10"
                      >
                        {dept.locationName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Role
                </label>
                <Select
                  name="Role"
                  value={formData.roleId}
                  onOpenChange={async (open) => {
                    if (open) {
                      await getRoleList();
                    }
                  }}
                  onValueChange={(id) => {
                    if (!id) return;
                    const dept = Data.find((d) => d._id === id);
                    if (dept) {
                      handleSelectChange(
                        "roleId",
                        "role",
                        dept._id,
                        dept.RoleName,
                      );
                    }
                  }}
                >
                  <SelectTrigger className="glass-effect border-white/10">
                    <SelectValue placeholder="Select Role">
                      {formData.role}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="glass-effect border-white/10 text-white">
                    {(Data || []).map((dept) => (
                      <SelectItem
                        key={dept._id}
                        value={dept._id}
                        className="hover:bg-white/10"
                      >
                        {dept.RoleName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Status
                </label>
                <Select
                  name="Status"
                  value={formData.statusId}
                  onOpenChange={async (open) => {
                    if (open) {
                      await getStatusList();
                    }
                  }}
                  onValueChange={(id) => {
                    if (!id) return;
                    const dept = Data.find((d) => d._id === id);
                    if (dept) {
                      handleSelectChange(
                        "statusId",
                        "status",
                        dept._id,
                        dept.statusName,
                      );
                    }
                  }}
                >
                  <SelectTrigger className="glass-effect border-white/10">
                    <SelectValue placeholder="Select Status">
                      {formData.status}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="glass-effect border-white/10 text-white">
                    {(Data || []).map((dept) => (
                      <SelectItem
                        key={dept._id}
                        value={dept._id}
                        className="hover:bg-white/10"
                      >
                        {dept.statusName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label>
                  Employee Pic<span className="text-red-500 ml-1">*</span>
                </label>
                <Input
                  name="avatar"
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setEmployeePic(file);
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="border-white/10 hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {employee ? "Save Changes" : "Add Employee"}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default EmployeeForm;
