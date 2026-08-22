import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";

import {
  Calendar,
  Plus,
  Filter,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { useData } from "@/contexts/DataContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { config } from "@/components/CustomComponents/config";
import { apiRequest } from "@/components/CustomComponents/apiRequest";
import { useAuth } from "@/contexts/AuthContext";

// Employees eligible to be picked in the "Request To" (approver) dropdown.
// Matches the Admin/Super Admin check used elsewhere in the app (e.g. canManage).
const isAdminRole = (roleName) =>
  roleName === "Admin" || roleName === "Super Admin";

// Leave types currently enabled for applying leave. Only "Casual Leave" is
// available for now; the other leave types are temporarily disabled here.
// To bring one back, uncomment its name below.
const ENABLED_LEAVE_TYPES = [
  "Casual Leave",
  // "Sick Leave",
  // "Earned Leave",
];
const isEnabledLeaveType = (leaveTypeName) =>
  ENABLED_LEAVE_TYPES.some(
    (name) => name.toLowerCase() === (leaveTypeName || "").trim().toLowerCase(),
  );

// Default approver for new leave requests. Must also satisfy isAdminRole
// (only Admin/Super Admin employees are valid "Request To" options).
const DEFAULT_REQUESTED_TO_NAME = "Amsa Veni";

// Reason cells in the table are truncated; click to view the full text.
const truncateText = (text, maxLength = 40) => {
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}…` : text;
};

const LeaveForm = ({ open, setOpen, leave, onSave, getAllLeaves }) => {
  const { user } = useAuth();
  const { employees } = useData();
  const [formData, setFormData] = useState(
    leave || {
      _id: "",
      employee: user.name,
      employeeId: user._id,
      leaveTypeId: "",
      leaveType: "",
      startDate: "",
      endDate: "",
      reason: "",
      RequestStatusId: "",
      RequestStatus: "",
      requestedToId: "",
      requestedTo: "",
    },
  );
  const [Data, SetData] = useState([]);

  // Default the leave type to the sole enabled type ("Casual Leave") for new requests.
  useEffect(() => {
    if (leave) return;
    const setDefaultLeaveType = async () => {
      try {
        const response = await apiRequest("LeaveType/getAllLeaveType/", {
          method: "POST",
          body: JSON.stringify({}),
        });
        const defaultType = (response || []).find((lt) =>
          isEnabledLeaveType(lt.LeaveTypeName),
        );
        if (defaultType) {
          setFormData((prev) => ({
            ...prev,
            leaveTypeId: defaultType._id,
            leaveType: defaultType.LeaveTypeName,
          }));
        }
      } catch (error) {
        console.error("Error fetching default leave type:", error);
      }
    };
    setDefaultLeaveType();
  }, [leave]);

  // Default "Request To" to the designated approver for new requests.
  useEffect(() => {
    if (leave) return;
    const setDefaultRequestedTo = async () => {
      try {
        const response = await apiRequest("Employee/getAllActiveEmployees/", {
          method: "POST",
          body: JSON.stringify({}),
        });
        const defaultApprover = (response || []).find(
          (emp) =>
            isAdminRole(emp.roleName) &&
            (emp.name || "").trim().toLowerCase() ===
              DEFAULT_REQUESTED_TO_NAME.toLowerCase(),
        );
        if (defaultApprover) {
          setFormData((prev) => ({
            ...prev,
            requestedToId: defaultApprover._id,
            requestedTo: defaultApprover.name,
          }));
        }
      } catch (error) {
        console.error("Error fetching default approver:", error);
      }
    };
    setDefaultRequestedTo();
  }, [leave]);

  useEffect(() => {
    if (leave) {
      setFormData({
        _id: leave._id,
        employeeId: leave.employeeId._id,
        employee: leave.employeeId.name,
        leaveTypeId: leave.leaveTypeId._id,
        leaveType: leave.leaveTypeId.LeaveTypeName,
        RequestStatus: leave.RequestStatusId.StatusName,
        RequestStatusId: leave.RequestStatusId._id,
        startDate: leave.startDate.split("T")[0],
        endDate: leave.endDate.split("T")[0],
        requestedTo: leave.requestedTo.name,
        requestedToId: leave.requestedTo._id,
        totalDays: leave.totalDays,
        reason: leave.reason,
      });
    }
  }, [leave]);

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
      SetData([]); // clear Data once
    }
  };

  const getEmployeeList = async () => {
    try {
      SetData([]); // clear Data once
      const response = await apiRequest("Employee/getAllActiveEmployees/", {
        method: "POST",
        body: JSON.stringify({}),
      });

      SetData(response);
      // setState(result)
      // setFilteredData(result)
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  const getLeaveTypeList = async () => {
    try {
      SetData([]); // clear Data once
      const response = await apiRequest("LeaveType/getAllLeaveType/", {
        method: "POST",
        body: JSON.stringify({}),
      });

      SetData(response);
      // setState(result)
      // setFilteredData(result)
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };
  const createLeave = async (data) => {
    try {
      const response = await apiRequest("Leave/createLeave/", {
        method: "POST",
        body: JSON.stringify(data),
      });

      SetData([]);
      getAllLeaves();
      // setFilteredData(result)
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };
  const updateLeave = async (data) => {
    try {
      const response = await apiRequest("Leave/updateLeave/", {
        method: "POST",
        body: JSON.stringify(data),
      });

      SetData([]);
      getAllLeaves();
      // setFilteredData(result)
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    // onSave({ ...formData, totalDays, appliedOn: new Date().toISOString().slice(0, 10) });
    if (formData._id) {
      updateLeave({
        ...formData,
        totalDays,
        appliedOn: new Date().toISOString().slice(0, 10),
      });
      toast({
        title: "Leave Updated",
        description: "Leave has been updated successfully.",
      });
    } else {
      createLeave({
        ...formData,
        totalDays,
        appliedOn: new Date().toISOString().slice(0, 10),
      });
      toast({
        title: "Leave Added",
        description: `Leave Request has been added to the system.`,
      });
    }
    setOpen(false);
  };
  const canSelectEmployee =
    user.role === "Admin" || user.role === "Super Admin";
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="glass-effect border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>
            {leave ? "Edit Leave Request" : "Apply for Leave"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <Select
            name="employee"
            value={formData.employeeId} // store only _id
            disabled={!canSelectEmployee}
            onOpenChange={async (open) => {
              if (open && (!Data || Data.length === 0)) {
                await getEmployeeList();
              }
            }}
            onValueChange={(id) => {
              if (!id) return;
              const dept = Data.find((d) => d._id === id);
              if (dept) {
                handleSelectChange(
                  "employeeId",
                  "employee",
                  dept._id,
                  dept.name,
                );
              }
            }}
            // required
          >
            <SelectTrigger className="glass-effect border-white/10">
              <SelectValue placeholder="Select Employee">
                {formData.employee}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="glass-effect border-white/10 text-white">
              {(Data || []).map((dept) => (
                <SelectItem
                  key={dept._id}
                  value={dept._id}
                  className="hover:bg-white/10"
                >
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            name="leaveType"
            value={formData.leaveTypeId} // store only _id
            onOpenChange={async (open) => {
              if (open && (!Data || Data.length === 0)) {
                await getLeaveTypeList();
              }
            }}
            onValueChange={(id) => {
              if (!id) return;
              const dept = Data.find((d) => d._id === id);
              if (dept) {
                handleSelectChange(
                  "leaveTypeId",
                  "leaveType",
                  dept._id,
                  dept.LeaveTypeName,
                );
              }
            }}
            // required
          >
            <SelectTrigger className="glass-effect border-white/10">
              <SelectValue placeholder="Select Leave Type">
                {formData.leaveType}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="glass-effect border-white/10 text-white">
              {(Data || [])
                .filter((dept) => isEnabledLeaveType(dept.LeaveTypeName))
                .map((dept) => (
                  <SelectItem
                    key={dept._id}
                    value={dept._id}
                    className="hover:bg-white/10"
                  >
                    {dept.LeaveTypeName}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Select
            name="requestedTo"
            value={formData.requestedToId} // store only _id
            onOpenChange={async (open) => {
              if (open && (!Data || Data.length === 0)) {
                await getEmployeeList();
              }
            }}
            onValueChange={(id) => {
              if (!id) return;
              const dept = Data.find((d) => d._id === id);
              if (dept) {
                handleSelectChange(
                  "requestedToId",
                  "requestedTo",
                  dept._id,
                  dept.name,
                );
              }
            }}
            // required
          >
            <SelectTrigger className="glass-effect border-white/10">
              <SelectValue placeholder="Request To">
                {formData.requestedTo}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="glass-effect border-white/10 text-white">
              {(Data || [])
                .filter((dept) => isAdminRole(dept.roleName))
                .map((dept) => (
                  <SelectItem
                    key={dept._id}
                    value={dept._id}
                    className="hover:bg-white/10"
                  >
                    {dept.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="bg-white/5 text-white [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-100"
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                className="bg-white/5 text-white [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-100"
              />
            </div>
          </div>
          <Textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            placeholder="Reason for leave"
            required
            className="bg-white/5"
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-purple-600"
            >
              Submit Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const LeavesPage = () => {
  const { leaves, employees, addLeave, updateLeave, deleteLeave } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [Leaves, setLeaves] = useState([]);
  const [Employees, setEmployees] = useState([]);
  const [Status, setStatus] = useState([]);
  const { user } = useAuth();

  // Approve / Reject state
  const [actionTarget, setActionTarget] = useState(null); // leave request being acted on
  const [actionType, setActionType] = useState(null); // "Approved" | "Rejected"
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionError, setRejectionError] = useState("");
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [processingLeaveId, setProcessingLeaveId] = useState(null);

  // View full reason
  const [viewReasonText, setViewReasonText] = useState("");
  const [isReasonDialogOpen, setIsReasonDialogOpen] = useState(false);
  const openReasonDialog = (reason) => {
    setViewReasonText(reason || "");
    setIsReasonDialogOpen(true);
  };

  const canManage = user.role === "Admin" || user.role === "Super Admin";

  const filteredRequests = Leaves.filter((request) => {
    const employee = Employees.find((e) => e._id === request.employeeId._id);
    const matchesSearch =
      (employee?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.leaveTypeId.LeaveTypeName.toLowerCase().includes(
        searchTerm.toLowerCase(),
      );
    const matchesStatus =
      statusFilter === "all" ||
      request.RequestStatusId.StatusName.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    getAllLeaves();
    getAllEmployees();
    getAllLeaveStatus();
  }, []);

  const getAllLeaves = async () => {
    try {
      let filter = {};
      if (user.role !== "Admin" && user.role !== "Super Admin") {
        filter.employeeId = user._id;
      }
      const response = await apiRequest("Leave/getAllLeaves/", {
        method: "POST",
        body: JSON.stringify(filter),
      });

      setLeaves(response);
      // setState(result)
      // setFilteredData(result)
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };
  const getAllEmployees = async () => {
    try {
      const response = await apiRequest("Employee/getAllActiveEmployees/", {
        method: "POST",
        body: JSON.stringify({}),
      });

      setEmployees(response);
      // setState(result)
      // setFilteredData(result)
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };
  const getAllLeaveStatus = async () => {
    try {
      const response = await apiRequest("LeaveStatus/getAllLeaveStatus/", {
        method: "POST",
        body: JSON.stringify({}),
      });

      setStatus(response);
      // setState(result)
      // setFilteredData(result)
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };
  const handleApplyLeave = () => {
    setSelectedLeave(null);
    setIsFormOpen(true);
  };

  const handleEditLeave = (leave) => {
    setSelectedLeave(leave);
    setIsFormOpen(true);
  };

  const handleDeleteLeave = (leave) => {
    setSelectedLeave(leave);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    deleteLeave(selectedLeave.id);
    toast({ title: "Leave Request Deleted" });
    setIsConfirmOpen(false);
  };

  const handleSaveLeave = (leaveData) => {
    if (selectedLeave) {
      updateLeave({ ...leaveData, id: selectedLeave.id });
      toast({ title: "Leave Request Updated" });
    } else {
      addLeave(leaveData);
      toast({ title: "Leave Request Submitted" });
    }
  };

  const openApproveDialog = (leave) => {
    setActionTarget(leave);
    setActionType("Approved");
    setRejectionReason("");
    setRejectionError("");
    setIsActionDialogOpen(true);
  };

  const openRejectDialog = (leave) => {
    setActionTarget(leave);
    setActionType("Rejected");
    setRejectionReason("");
    setRejectionError("");
    setIsActionDialogOpen(true);
  };

  const closeActionDialog = () => {
    if (isSubmittingAction) return; // prevent closing mid-request
    setIsActionDialogOpen(false);
    setActionTarget(null);
    setActionType(null);
    setRejectionReason("");
    setRejectionError("");
  };

  const submitAction = async () => {
    if (!actionTarget || !actionType) return;

    if (actionType === "Rejected" && !rejectionReason.trim()) {
      setRejectionError("Please provide a reason for rejecting this leave request.");
      return;
    }

    setIsSubmittingAction(true);
    setProcessingLeaveId(actionTarget._id);
    try {
      await apiRequest("Leave/updateLeaveStatus/", {
        method: "POST",
        body: JSON.stringify({
          _id: actionTarget._id,
          status: actionType,
          ...(actionType === "Rejected" ? { rejectionReason: rejectionReason.trim() } : {}),
        }),
      });

      await getAllLeaves();

      const employeeName =
        actionTarget.employeeId?.name ||
        Employees.find((e) => e._id === actionTarget.employeeId?._id)?.name ||
        "the employee";
      toast({
        title: `Leave ${actionType}`,
        description: `Leave request for ${employeeName} has been ${actionType.toLowerCase()}.`,
      });

      setIsActionDialogOpen(false);
      setActionTarget(null);
      setActionType(null);
      setRejectionReason("");
      setRejectionError("");
    } catch (error) {
      console.error("Error updating leave status:", error);
      toast({
        variant: "destructive",
        title: `Failed to ${actionType === "Approved" ? "approve" : "reject"} leave`,
        description:
          error?.message || "Something went wrong. The leave status was not changed.",
      });
      // Keep the dialog open (and status unchanged) so the user can retry.
    } finally {
      setIsSubmittingAction(false);
      setProcessingLeaveId(null);
    }
  };

  return (
    <>
      <Helmet>
        <title>Leave Management - ENIS-HRMS</title>
        <meta
          name="description"
          content="Manage employee leave requests, track leave balances, and streamline approval processes."
        />
      </Helmet>
      <AnimatePresence>
        {isFormOpen && (
          <LeaveForm
            open={isFormOpen}
            setOpen={setIsFormOpen}
            leave={selectedLeave}
            onSave={handleSaveLeave}
            getAllLeaves={getAllLeaves}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isConfirmOpen && (
          <ConfirmationDialog
            isOpen={isConfirmOpen}
            onClose={() => setIsConfirmOpen(false)}
            onConfirm={confirmDelete}
            title="Delete Leave Request?"
            description="This action cannot be undone."
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isActionDialogOpen && (
          <ConfirmationDialog
            isOpen={isActionDialogOpen}
            onClose={closeActionDialog}
            onConfirm={submitAction}
            title={
              actionType === "Approved"
                ? "Approve Leave Request?"
                : "Reject Leave Request?"
            }
            description={
              actionType === "Approved"
                ? "Are you sure you want to approve this leave request?"
                : "Are you sure you want to reject this leave request? Please provide a reason below."
            }
            confirmLabel={
              isSubmittingAction ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {actionType === "Approved" ? "Approving..." : "Rejecting..."}
                </span>
              ) : actionType === "Approved" ? (
                "Approve"
              ) : (
                "Reject"
              )
            }
            confirmDisabled={isSubmittingAction}
            variant={actionType === "Approved" ? "success" : "danger"}
          >
            {actionType === "Rejected" && (
              <div className="text-left space-y-2">
                <Label htmlFor="rejectionReason">Rejection Reason</Label>
                <Textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => {
                    setRejectionReason(e.target.value);
                    if (rejectionError) setRejectionError("");
                  }}
                  placeholder="Enter the reason for rejecting this leave request"
                  disabled={isSubmittingAction}
                  className="bg-white/5"
                />
                {rejectionError && (
                  <p className="text-sm text-red-400">{rejectionError}</p>
                )}
              </div>
            )}
          </ConfirmationDialog>
        )}
      </AnimatePresence>
      <Dialog open={isReasonDialogOpen} onOpenChange={setIsReasonDialogOpen}>
        <DialogContent className="glass-effect border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Reason</DialogTitle>
          </DialogHeader>
          <p className="text-gray-200 whitespace-pre-wrap py-2">
            {viewReasonText}
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-white">Leave Management</h1>
            <p className="text-gray-400">
              Manage employee leave requests and approvals
            </p>
          </div>
          <Button
            onClick={handleApplyLeave}
            className="bg-gradient-to-r from-blue-500 to-purple-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Apply for Leave
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-effect border-white/10">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Input
                  placeholder="Search by employee or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="glass-effect"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px] glass-effect">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-effect">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Leave Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Leave Type</th>
                      <th>Dates</th>
                      <th>Days</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request) => {
                      const employee = Employees.find(
                        (e) => e._id === request.employeeId._id,
                      );
                      const isPending =
                        request.RequestStatusId?.StatusName === "Pending";
                      const isOwner = user._id === request.employeeId._id;
                      const hasActions =
                        (canManage && isPending) || (isOwner && isPending);
                      return (
                        <tr key={request.id}>
                          <td>{request.employeeId.name}</td>
                          <td>{request.leaveTypeId.LeaveTypeName}</td>
                          <td>
                            {request.startDate
                              .split("T")[0]
                              .split("-")
                              .reverse()
                              .join("-")}{" "}
                            to{" "}
                            {request.endDate
                              .split("T")[0]
                              .split("-")
                              .reverse()
                              .join("-")}
                          </td>
                          <td>{request.totalDays}</td>
                          <td>
                            <button
                              type="button"
                              onClick={() => openReasonDialog(request.reason)}
                              className="text-left hover:underline decoration-white/40 underline-offset-2"
                            >
                              {truncateText(request.reason)}
                            </button>
                          </td>
                          <td>
                            <span
                              className={`status-badge ${request.RequestStatusId.StatusName === "Approved" ? "status-active" : request.RequestStatusId.StatusName === "Pending" ? "status-pending" : "status-inactive"}`}
                              title={
                                request.RequestStatusId.StatusName === "Rejected"
                                  ? request.rejectionReason || undefined
                                  : undefined
                              }
                            >
                              {request.RequestStatusId.StatusName}
                            </span>
                          </td>
                          <td>
                            <div className="flex flex-wrap gap-2">
                              {canManage &&
                                request.RequestStatusId?.StatusName === "Pending" && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      disabled={processingLeaveId === request._id}
                                      className="h-8 gap-1 px-2 text-green-400 border-green-500/30 hover:bg-green-500/10 hover:text-green-300"
                                      onClick={() => openApproveDialog(request)}
                                    >
                                      {processingLeaveId === request._id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <CheckCircle className="w-4 h-4" />
                                      )}
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      disabled={processingLeaveId === request._id}
                                      className="h-8 gap-1 px-2 text-red-400 border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
                                      onClick={() => openRejectDialog(request)}
                                    >
                                      {processingLeaveId === request._id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <XCircle className="w-4 h-4" />
                                      )}
                                      Reject
                                    </Button>
                                  </>
                                )}
                              {user._id === request.employeeId._id &&
                                request.RequestStatusId?.StatusName ===
                                  "Pending" && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8"
                                  onClick={() => handleEditLeave(request)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              )}
                              {user._id === request.employeeId._id &&
                                request.RequestStatusId?.StatusName ===
                                  "Pending" && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-red-400"
                                  onClick={() => handleDeleteLeave(request)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                              {!hasActions && (
                                <span className="text-gray-500">—</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default LeavesPage;
