import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";

// Added Clock icon for the work log button
import {
  ListTodo,
  Plus,
  MoreHorizontal,
  Edit,
  History,
  Trash2,
  X,
  Clock,
} from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { config } from "@/components/CustomComponents/config";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/components/CustomComponents/apiRequest";

const TaskForm = ({
  open,
  setOpen,
  task,
  onSave,
  getAllTasks,
  employees,
  Permissions,
}) => {
  const { user } = useAuth();
  const [isConfirmPause, setIsConfirmPause] = useState(false);
  const [isConfirmComplete, setIsConfirmComplete] = useState(false);
  const [feedback, setFeedback] = useState("");
  const isAdmin = ["Admin", "Super Admin"].includes(user.role);
  const isEmployee = user.role === "Employee";
  const [isSubTaskOpen, setIsSubTaskOpen] = useState(false);
  const isClient = user.role === "Client";
  const [ProgressMessage, setProgressMessage] = useState("");
  const [subTasks, setSubTasks] = useState([]);
  const [subTaskData, setSubTaskData] = useState({
    taskName: "",
    description: "",
    assignees: [],
    subTaskType: "",
    dependencyTaskId: "",
  });
  const getSubTasks = async (taskId) => {
    try {
      const res = await apiRequest("SubTask/getSubTasksByTaskId", {
        method: "POST",
        body: JSON.stringify({ parentTaskId: taskId }),
      });

      setSubTasks(res);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    if (task?._id) {
      getSubTasks(task._id);
    }
  }, [task]);
  const [formData, setFormData] = useState(
    task || {
      _id: "",
      taskName: "",
      description: "",
      taskPriority: "",
      taskPriorityId: "",
      taskStatus: "To Do",
      taskStatusId: "68b5a25b88e62ec178bb2923",
      assignee: "",
      assignedTo: "",
      assignees: isEmployee ? [user._id] : [],
      project: "",
      projectId: "",
      dueDate: "",
      reqLeadCount: "",
      compLeadCount: "",
      createdBy: user._id,
      notifyId: [],
    },
  );
  const [employee, setEmployee] = useState([]);
  const [Data, SetData] = useState([]);
  useEffect(() => {
    getEmployeeList();
  }, []);
  const handleSubTaskChange = (e) => {
    const { name, value } = e.target;
    setSubTaskData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubTaskAssignee = (value) => {
    setSubTaskData((prev) => ({ ...prev, assignees: value }));
  };
  const createSubTask = async () => {
    try {
      if (!subTaskData.taskName || subTaskData.assignees.length === 0) {
        toast({
          title: "Validation failed",
          description: "Subtask name and assignees are required.",
        });
        return;
      }

      const payload = {
        subtaskName: subTaskData.taskName,
        subdescription: subTaskData.description,

        parentTaskId: formData._id,
        subprojectId: formData.projectId,
        subtaskPriorityId: formData.taskPriorityId,
        subdueDate: formData.dueDate,

        subassignedTo: subTaskData.assignees,
        subcreatedBy: user._id,

        subTaskType: subTaskData.subTaskType,
        dependencyTaskId:
          subTaskData.subTaskType === "Dependent"
            ? subTaskData.dependencyTaskId
            : null,
      };
      apiRequest("SubTask/createSubTask/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      toast({
        title: "Subtask Created",
        description: "Subtask added successfully.",
      });

      setIsSubTaskOpen(false);
      setSubTaskData({ taskName: "", description: "", assignees: [] });

      getAllTasks();
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    if (task) {
      setFormData({
        _id: task._id,
        taskName: task.taskName,
        projectId: task.projectId._id,
        project: task.projectId.projectName,
        description: task.description,
        startDate: task.startDate,
        taskStatus: task.taskStatusId.name,
        taskStatusId: task.taskStatusId._id,
        taskPriority: task.taskPriorityId.name,
        taskPriorityId: task.taskPriorityId._id,
        assignee: task.assignedTo[0].name,
        assignedTo: task.assignedTo[0]._id,
        dueDate: task.dueDate.split("T")[0],
        reqLeadCount: task.reqLeadCount,
        compLeadCount: task.compLeadCount,
        assignees: task.assignedTo.map((val) => val._id),
        notifyId: task.notifyId || [],
      });
    }
  }, [task]);
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

      setEmployee(response);
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  const getTaskStatusList = async () => {
    try {
      SetData([]); // clear Data once
      const response = await apiRequest("TaskStatus/getAllTaskStatus/", {
        method: "POST",
        body: JSON.stringify({}),
      });

      SetData(response);
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };
  const handleSelectAssignee = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSelectNotifyto = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const [projectList, setProjectList] = useState([]);
  const [priorityList, setPriorityList] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const getProjectList = async () => {
    try {
      const response = await apiRequest("Project/getAllProjects/", {
        method: "POST",
        body: JSON.stringify({
          _id: user._id,
          role: user.role,
        }),
      });

      setProjectList(response || []);
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };
  const filteredProjectEmployees = useMemo(() => {
    if (!formData.projectId) return [];

    const selectedProject = projectList.find(
      (proj) => proj._id === formData.projectId,
    );

    if (!selectedProject?.assignedEmployees) return [];

    return selectedProject.assignedEmployees;
  }, [formData.projectId, projectList]);
  const getTaskPriorityList = async () => {
    try {
      SetData([]); // clear Data once
      const response = await apiRequest("TaskPriority/getAllTaskPriority/", {
        method: "POST",
        body: JSON.stringify({}),
      });

      SetData(response);
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  const createTask = async (data) => {
    try {
      const response = await apiRequest("Task/createTask/", {
        method: "POST",
        body: JSON.stringify(data),
      });

      SetData([]);
      getAllTasks();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };
  const updateTask = async (data) => {
    try {
      const response = await apiRequest("Task/updateTask/", {
        method: "POST",
        body: JSON.stringify(data),
      });

      SetData([]);
      getAllTasks();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };
  const updateTaskStatus = async (
    taskId,
    status,
    compLeadCount,
    notifyId = [],
  ) => {
    try {
      if (status === "Pause" && !ProgressMessage) {
        toast({
          title: "Validation fails",
          description:
            "Please enter a reason for progress message or reason for pausing the task",
        });
        return;
      }

      if (status === "Complete" && !feedback) {
        toast({
          title: "Validation fails",
          description: "Please enter feedback before completing the task",
        });
        return;
      }

      const response = await apiRequest("Task/updateTaskStatus/", {
        method: "POST",
        body: JSON.stringify({
          taskId,
          status,
          progressDetails: ProgressMessage,
          feedback,
          compLeadCount,
          notifyId: notifyId || [], // array
        }),
      });

      SetData([]);

      toast({
        title: "Status Updated",
        description: response.message,
      });

      setOpen(false);

      getAllTasks();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();

    const finalFormData = {
      ...formData,
      assignees: !isAdmin ? [user._id] : formData.assignees,
    };

    if (!finalFormData.assignees || finalFormData.assignees.length === 0) {
      toast({
        title: "Validation failed",
        description: "Please select at least one assignee.",
      });
      return;
    }

    if (formData._id) {
      updateTask(finalFormData);
      toast({
        title: "Task Updated",
        description: "Task has been updated successfully.",
      });
      setOpen(false);
    } else {
      createTask(finalFormData);
      toast({
        title: "Task Added",
        description: `${formData.taskName} has been added to the system.`,
      });
      setOpen(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isConfirmPause && (
          <ConfirmationDialog
            isOpen={isConfirmPause}
            onClose={() => setIsConfirmPause(false)}
            onConfirm={() =>
              updateTaskStatus(
                formData._id,
                formData.taskStatus === "In Progress" ? "Pause" : "Start",
                formData.compLeadCount,
                formData.notifyId || [],
              )
            }
            title="Pause Task?"
            description="Please provide a reason or Progress message for pausing the task."
          >
            <div className="mt-2">
              <Label htmlFor="ProgressMessage" className="text-gray-300">
                <b>Progress message</b>
              </Label>
              <Input
                id="ProgressMessage"
                type="text"
                value={ProgressMessage}
                onChange={(e) => setProgressMessage(e.target.value)}
                placeholder="Enter Progress Message"
                className="bg-white/5 border-white/10"
              />
            </div>
          </ConfirmationDialog>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isConfirmComplete && (
          <ConfirmationDialog
            isOpen={isConfirmComplete}
            onClose={() => setIsConfirmComplete(false)}
            onConfirm={() =>
              updateTaskStatus(
                formData._id,
                "Complete",
                formData.compLeadCount,
                formData.notifyId || [],
              )
            }
            title="Complete Task?"
            description="Please provide a feedback before completing the task."
          >
            <div className="mt-2">
              <Label htmlFor="feedback" className="text-gray-300">
                <b>Feedback</b>
              </Label>
              <Input
                id="feedback"
                type="text"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Enter Feedback"
                className="bg-white/5 border-white/10"
              />
            </div>
          </ConfirmationDialog>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isSubTaskOpen && (
          <Dialog open={isSubTaskOpen} onOpenChange={setIsSubTaskOpen}>
            <DialogContent className="glass-effect border-white/10 text-white">
              <DialogHeader>
                <DialogTitle>Create Sub Task</DialogTitle>
                <DialogDescription>
                  Add a sub task under this task.
                </DialogDescription>
              </DialogHeader>

              <DialogContent>
                <div className="space-y-4 py-4">
                  <div>
                    <Label className="text-gray-300">Sub Task Name</Label>
                    <Input
                      name="taskName"
                      value={subTaskData.taskName}
                      onChange={handleSubTaskChange}
                      placeholder="Enter sub task name"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Description</Label>
                    <Textarea
                      name="description"
                      value={subTaskData.description}
                      onChange={handleSubTaskChange}
                      placeholder="Enter description"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Assign Members</Label>
                    <select
                      multiple
                      value={subTaskData.assignees}
                      onChange={(e) =>
                        handleSubTaskAssignee(
                          Array.from(e.target.selectedOptions, (o) => o.value),
                        )
                      }
                      className="w-full h-32 glass-effect border-white/10 rounded-md bg-transparent p-2"
                    >
                      {employee.map((emp) => (
                        <option
                          key={emp._id}
                          value={emp._id}
                          className="bg-slate-800"
                        >
                          {emp.name || emp.email}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-gray-300">Sub Task Type</Label>
                    <select
                      name="subTaskType"
                      value={subTaskData.subTaskType || ""}
                      onChange={handleSubTaskChange}
                      className="w-full glass-effect border-white/10 rounded-md bg-transparent p-2"
                    >
                      <option value="" className="bg-slate-800">
                        Select Type
                      </option>
                      <option value="Independent" className="bg-slate-800">
                        Independent
                      </option>
                      <option value="Dependent" className="bg-slate-800">
                        Dependent
                      </option>
                    </select>
                  </div>
                  {subTaskData.subTaskType === "Dependent" && (
                    <div>
                      <Label className="text-gray-300">
                        Dependency SubTask
                      </Label>
                      <select
                        name="dependencyTaskId"
                        value={subTaskData.dependencyTaskId || ""}
                        onChange={handleSubTaskChange}
                        className="w-full glass-effect border-white/10 rounded-md bg-transparent p-2"
                      >
                        <option value="" className="bg-slate-800">
                          Select Dependency
                        </option>

                        {/* You must fetch subtasks of this task */}
                        {subTasks.map((sub) => (
                          <option
                            key={sub._id}
                            value={sub._id}
                            className="bg-slate-800"
                          >
                            {sub.subtaskName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {/* 👇 inherited fields (read-only for clarity) */}
                  <div className="text-sm text-gray-400">
                    <p>Priority: {formData.taskPriority}</p>
                    <p>Due Date: {formData.dueDate}</p>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsSubTaskOpen(false)}
                  >
                    Cancel
                  </Button>

                  <Button
                    onClick={createSubTask}
                    className="bg-gradient-to-r from-blue-500 to-purple-600"
                  >
                    Save Sub Task
                  </Button>
                </DialogFooter>
              </DialogContent>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
      {!isConfirmPause && !isConfirmComplete && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent
            className="glass-effect border-white/10 text-white"
            style={{
              overflowY: "auto",
              height: "90vh",
              scrollbarWidth: "none",
            }}
          >
            <DialogHeader>
              <DialogTitle>
                {task
                  ? isAdmin
                    ? "Edit Task"
                    : "Task details"
                  : "Create New Task"}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                {task ? "Update task details." : "Add a new task to a project."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div>
                <Label htmlFor="taskName" className="text-gray-300">
                  Task Title
                </Label>
                <Input
                  name="taskName"
                  value={formData.taskName}
                  onChange={handleChange}
                  placeholder="Task Title"
                  required
                  className="bg-white/5 border-white/10"
                  disabled={
                    task ? !isAdmin && Permissions.isAdd : !Permissions.isAdd
                  }
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-gray-300">
                  Task Description
                </Label>
                <Textarea
                  disabled={
                    task ? !isAdmin && Permissions.isAdd : !Permissions.isAdd
                  }
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Task Description"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="taskPriority" className="text-gray-300">
                    Priority
                  </Label>
                  <Select
                    name="taskPriority"
                    value={formData.taskPriorityId}
                    onOpenChange={async (open) => {
                      if (open && (!Data || Data.length === 0)) {
                        await getTaskPriorityList();
                      }
                    }}
                    disabled={
                      task ? isAdmin && Permissions.isAdd : !Permissions.isAdd
                    }
                    onValueChange={(id) => {
                      if (!id) return;
                      const dept = Data.find((d) => d._id === id);
                      if (dept) {
                        handleSelectChange(
                          "taskPriorityId",
                          "taskPriority",
                          dept._id,
                          dept.name,
                        );
                      }
                    }}
                  >
                    <SelectTrigger className="glass-effect border-white/10">
                      <SelectValue placeholder="Select Priority">
                        {formData.taskPriority}
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
                </div>
                <div>
                  <Label htmlFor="taskStatus" className="text-gray-300">
                    Status
                  </Label>
                  <Select
                    name="taskStatus"
                    value={formData.taskStatusId}
                    onOpenChange={async (open) => {
                      if (open && (!Data || Data.length === 0)) {
                        await getTaskStatusList();
                      }
                    }}
                    disabled={true}
                    onValueChange={(id) => {
                      if (!id) return;
                      const dept = Data.find((d) => d._id === id);
                      if (dept) {
                        handleSelectChange(
                          "taskStatusId",
                          "taskStatus",
                          dept._id,
                          dept.name,
                        );
                      }
                    }}
                  >
                    <SelectTrigger className="glass-effect border-white/10">
                      <SelectValue placeholder="Select Status">
                        {formData.taskStatus}
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
                </div>
                <div>
                  <Label htmlFor="taskStatus" className="text-gray-300">
                    Project
                  </Label>
                  <Select
                    name="project"
                    value={formData.projectId}
                    onOpenChange={async (open) => {
                      if (open && projectList.length === 0) {
                        await getProjectList();
                      }
                    }}
                    disabled={
                      task ? !isAdmin && Permissions.isAdd : !Permissions.isAdd
                    }
                    onValueChange={(id) => {
                      if (!id) return;

                      const selectedProject = projectList.find(
                        (proj) => proj._id === id,
                      );

                      if (selectedProject) {
                        setFormData((prev) => ({
                          ...prev,
                          projectId: selectedProject._id,
                          project: selectedProject.projectName,
                          assignees: [], // reset selected members when project changes
                        }));
                      }
                    }}
                  >
                    <SelectTrigger className="glass-effect border-white/10">
                      <SelectValue placeholder="Select Project">
                        {formData.project}
                      </SelectValue>
                    </SelectTrigger>

                    <SelectContent className="glass-effect border-white/10 text-white max-h-[200px] overflow-y-auto">
                      {(projectList || []).map((proj) => (
                        <SelectItem
                          key={proj._id}
                          value={proj._id}
                          className="hover:bg-white/10"
                        >
                          {proj.projectName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {!task && isAdmin && (
                  <div>
                    <Label htmlFor="assignees" className="text-gray-300">
                      Select Members
                    </Label>
                    <p className="text-gray-400 text-xs mb-2">
                      Ctrl/Cmd + click to select multiple.
                    </p>

                    <select
                      id="assignees"
                      name="assignees"
                      multiple
                      disabled={!isAdmin && Permissions.isAdd}
                      value={formData.assignees}
                      onChange={(e) =>
                        handleSelectAssignee(
                          "assignees",
                          Array.from(
                            e.target.selectedOptions,
                            (option) => option.value,
                          ),
                        )
                      }
                      className="w-full h-32 glass-effect border-white/10 rounded-md bg-transparent p-2"
                    >
                      {filteredProjectEmployees.length > 0 ? (
                        filteredProjectEmployees.map((emp) => (
                          <option
                            key={emp._id}
                            value={emp._id}
                            className="bg-slate-800 p-1"
                          >
                            {emp.name || emp.email}
                          </option>
                        ))
                      ) : (
                        <option disabled className="bg-slate-800 p-1">
                          No employees assigned to this project
                        </option>
                      )}
                    </select>
                  </div>
                )}
              </div>
              <div>
                <div>
                  <Label htmlFor="notifyto" className="text-gray-300">
                    Select Members to Notify - When Done
                  </Label>
                  <p className="text-gray-400 text-xs mb-2">
                    Ctrl/Cmd + click to select multiple.
                  </p>

                  <select
                    id="notifyto"
                    name="notifyto"
                    multiple
                    // disabled={!isAdmin && Permissions.isAdd}
                    value={formData.notifyId}
                    onChange={(e) =>
                      handleSelectNotifyto(
                        "notifyId",
                        Array.from(
                          e.target.selectedOptions,
                          (option) => option.value,
                        ),
                      )
                    }
                    className="w-full h-32 glass-effect border-white/10 rounded-md bg-transparent p-2"
                  >
                    {employee.length > 0 ? (
                      employee.map((emp) => (
                        <option
                          key={emp._id}
                          value={emp._id}
                          className="bg-slate-800 p-1"
                        >
                          {emp.name || emp.email}
                        </option>
                      ))
                    ) : (
                      <option disabled className="bg-slate-800 p-1">
                        No employees available
                      </option>
                    )}
                  </select>
                </div>
                <Label htmlFor="dueDate" className="text-gray-300">
                  Due Date
                </Label>
                <Input
                  disabled={
                    task ? !isAdmin && Permissions.isAdd : !Permissions.isAdd
                  }
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  required
                  onChange={handleChange}
                  className="bg-white/5 border-white/10 text-white [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-100"
                />
              </div>
              <DialogFooter>
                {(isAdmin || (Permissions.isAdd && !task)) && (
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-white/10 hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                )}
                {(isAdmin || (Permissions.isAdd && !task)) && (
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-blue-500 to-purple-600"
                  >
                    Save Task
                  </Button>
                )}
              </DialogFooter>
            </form>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              {user.role === "Super Admin" && (
                <Button
                  onClick={() => setIsSubTaskOpen(true)}
                  className="bg-gradient-to-r from-indigo-500 to-indigo-600 mr-4"
                >
                  Create Sub Task
                </Button>
              )}
              {formData.taskStatus !== "Completed" &&
                formData.assignedTo === user._id && (
                  <>
                    <Button
                      onClick={() => {
                        formData.taskStatus === "In Progress"
                          ? setIsConfirmPause(true)
                          : updateTaskStatus(
                              formData._id,
                              formData.taskStatus === "In Progress"
                                ? "Pause"
                                : "Start",
                              formData.compLeadCount,
                              formData.notifyId || [],
                            );
                      }}
                      className={`bg-gradient-to-r ${
                        formData.taskStatus === "In Progress"
                          ? "from-yellow-500 to-yellow-600"
                          : "from-green-500 to-green-600"
                      } mr-4`}
                    >
                      {formData.taskStatus === "In Progress"
                        ? "Pause Task"
                        : "Start Task"}
                    </Button>
                  </>
                )}
              {formData.assignedTo === user._id && (
                <Button
                  onClick={() => {
                    setIsConfirmComplete(true);
                  }}
                  className="bg-gradient-to-r from-blue-500 to-purple-600"
                  disabled={formData.taskStatus === "Completed"}
                >
                  {formData.taskStatus === "Completed"
                    ? "Task Completed"
                    : "Complete Task"}
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

// Updated TaskCard to include onShowWorkLogs
const TaskCard = ({
  task,
  onEdit,
  onDelete,
  employees,
  onShowHistory,
  onShowWorkLogs,
  Permissions,
}) => {
  const { user } = useAuth();
  const isAdmin = ["Admin", "Super Admin"].includes(user.role);
  const isEmployee = user.role === "Employee";
  const isClient = user.role === "Client";
  const [confirmPause, setConfirmPause] = useState(false);
  const [confirmComplete, setConfirmComplete] = useState(false);
  const [selectedSubtask, setSelectedSubtask] = useState(null);
  const [progressMessage, setProgressMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const getPriorityColor = (priority) =>
    ({
      High: "bg-red-500",
      Medium: "bg-yellow-500",
      Low: "bg-green-500",
    })[priority];

  const assignee = employees.find((e) => e._id === task.assignedTo?.[0]?._id);
  const [subTasks, setSubTasks] = useState([]);
  const [showSubTasks, setShowSubTasks] = useState(false);
  const handleToggleSubTasks = async () => {
    if (!showSubTasks) {
      const data = await getSubTasksByTaskId(task._id);
      setSubTasks(data);
    }
    setShowSubTasks(!showSubTasks);
  };
  const getStatus = (sub) => sub.subtaskStatusId?.name?.toLowerCase().trim();
  const getSubTasksByTaskId = async (taskId) => {
    try {
      const res = await apiRequest("SubTask/getSubTasksByTaskId", {
        method: "POST",
        body: JSON.stringify({ parentTaskId: taskId }),
      });

      return res || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };
  const updateSubTaskStatus = async (
    subtaskId,
    status,
    progressDetails = "",
    feedback = "",
  ) => {
    try {
      await apiRequest("SubTask/updateSubTaskStatus", {
        method: "POST",
        body: JSON.stringify({
          subtaskId,
          status,
          progressDetails,
          feedback,
        }),
      });

      handleToggleSubTasks();
    } catch (err) {
      console.error(err);
    }
  };
  const isBlocked = (sub) => {
    if (sub.subTaskType !== "Dependent") return false;

    return sub.dependencyTaskId?.subtaskStatusId?.name !== "Completed";
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-slate-800/50 rounded-lg border border-white/10"
    >
      {/* title */}
      <div className="flex justify-between items-start gap-2">
        <h4 className="font-bold text-white mb-2 break-words">
          {task.taskName}
        </h4>
        <div
          className={`w-3 h-3 rounded-full flex-shrink-0 ${getPriorityColor(
            task.taskPriorityId?.name,
          )}`}
        ></div>
      </div>

      <p className="text-sm text-gray-400 mb-4">{task.description}</p>

      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center gap-2">
          {assignee && (
            <img
              src={assignee.avatar}
              alt={assignee.name}
              className="w-6 h-6 rounded-full"
            />
          )}
          <span className="text-gray-300">
            {assignee ? assignee.name : "Unassigned"}
          </span>
        </div>
      </div>
      <div className="flex gap-2 mb-3">
        {Permissions.isEdit && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onEdit(task)}
          >
            <Edit className="w-3 h-3" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleToggleSubTasks}
        >
          📂
        </Button>
        {isAdmin && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onDelete(task)}
            >
              <Trash2 className="w-3 h-3 text-red-400" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onShowHistory(task.progressDetails)}
            >
              <History className="w-3 h-3 text-yellow-400" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onShowWorkLogs(task.workLogs || [])}
            >
              <Clock className="w-3 h-3 text-blue-400" />
            </Button>
          </>
        )}
      </div>

      {showSubTasks && (
        <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
          {subTasks.length > 0 ? (
            subTasks.map((sub) => (
              <div
                key={sub._id}
                className="p-3 bg-slate-700/40 rounded-md border border-white/10"
              >
                <div className="flex justify-between items-center">
                  {isBlocked(sub) && (
                    <div className="text-xs text-red-500 mt-1 font-semibold"></div>
                  )}
                  <h5 className="text-sm font-semibold text-white">
                    {sub.subtaskName}
                  </h5>

                  <span className="text-xs text-gray-400">
                    {sub.subtaskStatusId?.name}
                  </span>
                </div>

                <p className="text-xs text-gray-400">
                  {sub.subdescription || "No description"}
                </p>

                <div className="text-xs text-gray-500 mt-1">
                  Due:{" "}
                  {sub.subdueDate
                    ? new Date(sub.subdueDate).toLocaleDateString("en-IN")
                    : "-"}
                </div>

                {sub.subTaskType === "Dependent" && (
                  <div className="text-xs text-red-400 mt-1">
                    Depends on: {sub.dependencyTaskId?.subtaskName || "Unknown"}
                    {" | "}
                    Status:{" "}
                    {sub.dependencyTaskId?.subtaskStatusId?.name || "N/A"}
                  </div>
                )}
                <div className="flex gap-2 mt-2">
                  {/* 🔒 BLOCKED */}
                  {isBlocked(sub) && (
                    <span className="text-xs text-red-500 font-semibold"></span>
                  )}

                  {/* 🟢 TODO → SHOW START */}
                  {!isBlocked(sub) && getStatus(sub) === "to do" && (
                    <button
                      className="text-xs bg-green-600 px-2 py-1 rounded hover:bg-green-700"
                      onClick={() => updateSubTaskStatus(sub._id, "Start")}
                    >
                      Start
                    </button>
                  )}

                  {/* 🟡 IN PROGRESS → SHOW PAUSE + COMPLETE */}
                  {!isBlocked(sub) && getStatus(sub) === "in progress" && (
                    <>
                      <button
                        className="text-xs bg-yellow-600 px-2 py-1 rounded hover:bg-yellow-700"
                        onClick={() => {
                          setSelectedSubtask(sub);
                          setConfirmPause(true);
                        }}
                      >
                        Pause
                      </button>

                      <button
                        className="text-xs bg-blue-600 px-2 py-1 rounded hover:bg-blue-700"
                        onClick={() => {
                          setSelectedSubtask(sub);
                          setConfirmComplete(true);
                        }}
                      >
                        Complete
                      </button>
                    </>
                  )}

                  {/* 🔵 COMPLETED → NOTHING */}
                  {!isBlocked(sub) && getStatus(sub) === "completed" && (
                    <span className="text-xs text-green-400 font-semibold">
                      ✅ Done
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-400">No subtasks</p>
          )}
        </div>
      )}
      {confirmPause && (
        <ConfirmationDialog
          isOpen={confirmPause}
          onClose={() => setConfirmPause(false)}
          onConfirm={() => {
            updateSubTaskStatus(selectedSubtask._id, "Pause", progressMessage);
            setConfirmPause(false);
          }}
          title="Pause SubTask?"
          description="Enter progress message"
        >
          <Input
            value={progressMessage}
            onChange={(e) => setProgressMessage(e.target.value)}
            placeholder="Progress message"
          />
        </ConfirmationDialog>
      )}
      {confirmComplete && (
        <ConfirmationDialog
          isOpen={confirmComplete}
          onClose={() => setConfirmComplete(false)}
          onConfirm={() => {
            updateSubTaskStatus(selectedSubtask._id, "Complete", "", feedback);
            setConfirmComplete(false);
          }}
          title="Complete SubTask?"
          description="Enter feedback"
        >
          <Input
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Feedback"
          />
        </ConfirmationDialog>
      )}
    </motion.div>
  );
};

const TasksPage = () => {
  const { user, getPermissionsByPath } = useAuth();
  const { addTask, updateTask } = useData();
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [projectList, setProjectList] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [task, setTasks] = useState([]);
  const [Employees, setEmployees] = useState([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [showAllCompleted, setShowAllCompleted] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [ProgressDetails, setProgressDetails] = useState([]);

  const [isWorkLogOpen, setIsWorkLogOpen] = useState(false);
  const [workLogDetails, setWorkLogDetails] = useState([]);
  const isAdmin = ["Admin", "Super Admin"].includes(user.role);
  const isEmployee = user.role === "Employee";
  const isClient = user.role === "Client";
  const [Permissions, setPermissions] = useState({
    isAdd: false,
    isView: false,
    isEdit: false,
    isDelete: false,
  });

  const [viewMode, setViewMode] = useState("card"); // card | table
  const [activeStatus, setActiveStatus] = useState("In Progress");

  const [filterType, setFilterType] = useState(isAdmin ? "day" : "date");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [selectedWeek, setSelectedWeek] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [selectedMonth, setSelectedMonth] = useState(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`,
  );

  useEffect(() => {
    getPermissionsByPath(window.location.pathname).then((res) => {
      if (res) {
        setPermissions(res);
      } else {
        navigate("/dashboard");
      }
    });

    getAllTasks();
    getEmployeeList();
  }, []);
  const getProjectList = async () => {
    try {
      const response = await apiRequest("Project/getAllProjects/", {
        method: "POST",
        body: JSON.stringify({
          _id: user._id,
          role: user.role,
        }),
      });

      setProjectList(response || []);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    if (isAdmin) {
      getProjectList();
    }
  }, [user.role]);
  // const getAllTasks = async () => {
  //   try {
  //     const response = await apiRequest("Task/getAllTasks/", {
  //       method: "POST",
  //       body: JSON.stringify({ _id: user._id, role: user.role }),
  //     });

  //     setTasks(response || []);
  //   } catch (error) {
  //     console.error("Error:", error);
  //   }
  // };
  const getAllTasks = async () => {
    try {
      let response;

      if (user.role === "Client") {
        response = await apiRequest("Client/getClientTasks", {
          method: "POST",
          body: JSON.stringify({
            clientId: user._id,
          }),
        });
        console.log("Client Tasks Response:", response);
        setTasks(response.tasks || []);
      } else {
        response = await apiRequest("Task/getAllTasks", {
          method: "POST",
          body: JSON.stringify({
            _id: user._id,
            role: user.role,
          }),
        });

        setTasks(response || []);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const getEmployeeList = async () => {
    try {
      const response = await apiRequest("Employee/getAllEmployees/", {
        method: "POST",
        body: JSON.stringify({}),
      });

      setEmployees(response || []);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await apiRequest("Task/deleteTask/", {
        method: "POST",
        body: JSON.stringify({ _id: id }),
      });

      getAllTasks();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleAddNew = () => {
    setSelectedTask(null);
    setIsFormOpen(true);
  };

  const handleEdit = (task) => {
    setSelectedTask(task);
    setIsFormOpen(true);
  };

  const handleDelete = (task) => {
    setSelectedTask(task);
    setIsConfirmOpen(true);
  };

  const handleHistory = (details) => {
    setProgressDetails(details || []);
    setIsHistoryOpen(true);
  };

  const handleWorkLogs = (logs) => {
    setWorkLogDetails(logs || []);
    setIsWorkLogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedTask?._id) return;

    await deleteTask(selectedTask._id);
    toast({ title: "Task Deleted" });
    setIsConfirmOpen(false);
    setSelectedTask(null);
  };

  const handleSave = (taskData) => {
    if (selectedTask) {
      updateTask({ ...taskData, id: selectedTask._id });
      toast({ title: "Task Updated" });
    } else {
      addTask(taskData);
      toast({ title: "Task Created" });
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Ongoing";
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isSameDay = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const getWeekRange = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;

    const start = new Date(date);
    start.setDate(date.getDate() + diffToMonday);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  };

  const filteredTasks = useMemo(() => {
    // 🔹 EMPLOYEE → only assigned tasks
    if (user.role === "Employee") {
      return task.filter((t) =>
        (t.assignedTo || []).some(
          (emp) => String(emp._id) === String(user._id),
        ),
      );
    }

    // 🔹 CLIENT → already filtered from backend → return as is
    if (user.role === "Client") {
      return task;
    }

    let employeeMatch = true;
    let projectMatch = true;

    return task.filter((t) => {
      if (selectedEmployee) {
        employeeMatch = (t.assignedTo || []).some(
          (emp) => String(emp._id) === String(selectedEmployee),
        );
      } else {
        employeeMatch = true;
      }

      if (selectedProject) {
        projectMatch = String(t.projectId?._id) === String(selectedProject);
      } else {
        projectMatch = true;
      }

      return employeeMatch && projectMatch;
    });
  }, [task, user.role, user._id, selectedEmployee, selectedProject]);
  const sortedFilteredTasks = useMemo(() => {
    return [...filteredTasks].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  }, [filteredTasks]);
  const filteredProjectList = useMemo(() => {
    if (!selectedEmployee) return projectList;

    return (projectList || []).filter((project) =>
      (project.assignedEmployees || []).some(
        (emp) => String(emp._id) === String(selectedEmployee),
      ),
    );
  }, [projectList, selectedEmployee]);

  const filteredEmployeeList = useMemo(() => {
    if (!selectedProject) return Employees;

    const selectedProjectData = (projectList || []).find(
      (project) => String(project._id) === String(selectedProject),
    );

    if (!selectedProjectData) return [];

    return selectedProjectData.assignedEmployees || [];
  }, [projectList, Employees, selectedProject]);
  const taskColumns = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isToday = (dateValue) => {
      if (!dateValue) return false;
      const d = new Date(dateValue);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    };

    const getStatusName = (task) => {
      if (typeof task.taskStatusId === "object") {
        return task.taskStatusId?.name;
      }
      return ""; // fallback if not populated
    };

    const normalizeStatus = (task) =>
      (getStatusName(task) || "").toLowerCase().replace(/\s+/g, "");
    return {
      Pending: filteredTasks.filter((t) => {
        const s = normalizeStatus(t);
        return s === "todo";
      }),

      "In Progress": filteredTasks.filter((t) => {
        const s = normalizeStatus(t);
        return s === "inprogress" || s === "inprocess";
      }),

      // Completed: filteredTasks.filter((t) => {
      //   const s = normalizeStatus(t.taskStatusId?.name);
      //   return (
      //     (s === "completed" || s === "complete") &&
      //     isToday(t.updatedAt || t.completedAt || t.createdAt)
      //   );
      // }),
      Completed: filteredTasks.filter((t) => {
        const s = normalizeStatus(t);

        if (!(s === "completed" || s === "complete")) return false;

        //  CLIENT → show ALL completed tasks
        if (isClient) {
          return true;
        }

        // Others → keep your existing logic
        if (!showAllCompleted) {
          return isToday(t.updatedAt || t.createdAt);
        }

        return true;
      }),
      OverDue: filteredTasks.filter((t) => {
        const s = normalizeStatus(t);
        if (s === "completed" || s === "complete") return false;
        if (!t.dueDate) return false;

        const dueDate = new Date(t.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        return dueDate < today;
      }),
    };
  }, [filteredTasks]);
  const activeTableData = taskColumns[activeStatus] || [];

  const getPriorityBadge = (priority) =>
    ({
      High: "bg-red-500/20 text-red-300 border border-red-500/40",
      Medium: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40",
      Low: "bg-green-500/20 text-green-300 border border-green-500/40",
    })[priority] || "bg-slate-500/20 text-slate-300 border border-slate-500/40";

  const cardColors = {
    Pending: "bg-violet-600",
    "In Progress": "bg-yellow-600",
    Completed: "bg-green-600",
    OverDue: "bg-red-600",
  };
  const handleResetFilters = () => {
    setFilterType(isAdmin ? "day" : "date");
    setSelectedDate(new Date().toISOString().split("T")[0]);
    setSelectedWeek(new Date().toISOString().split("T")[0]);
    setSelectedMonth(
      `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`,
    );
    setSelectedProject("");
    setSelectedEmployee("");
    setViewMode("card");
    setActiveStatus("In Progress");
  };
  return (
    <>
      <Helmet>
        <title>Tasks - ENIS-HRMS</title>
      </Helmet>

      <AnimatePresence>
        {isFormOpen && (
          <TaskForm
            open={isFormOpen}
            setOpen={setIsFormOpen}
            task={selectedTask}
            onSave={handleSave}
            getAllTasks={getAllTasks}
            employees={Employees}
            Permissions={Permissions}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isConfirmOpen && (
          <ConfirmationDialog
            isOpen={isConfirmOpen}
            onClose={() => setIsConfirmOpen(false)}
            onConfirm={confirmDelete}
            title="Delete Task?"
            description="This action cannot be undone."
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isHistoryOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl p-6 w-[500px] max-w-full relative"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              style={{ backgroundColor: "#c4f4c4" }}
            >
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
              >
                <X size={22} />
              </button>
              <h2 className="text-xl font-semibold mb-4 text-black">
                Progress Details
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 max-h-[60vh] overflow-y-auto">
                {ProgressDetails.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isWorkLogOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl p-6 w-[600px] max-w-full relative"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              style={{ backgroundColor: "#e0f2fe" }}
            >
              <button
                onClick={() => setIsWorkLogOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
              >
                <X size={22} />
              </button>
              <h2 className="text-xl font-semibold mb-4 text-black">
                Work Timing Log
              </h2>

              <div className="max-h-[60vh] overflow-y-auto">
                {workLogDetails.length > 0 ? (
                  <table className="w-full text-sm text-left text-gray-700">
                    <thead className="text-xs uppercase border-b border-gray-400">
                      <tr>
                        <th className="px-2 py-2">Start Time</th>
                        <th className="px-2 py-2">End Time</th>
                        <th className="px-2 py-2 text-right">Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workLogDetails.map((log, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-gray-300 last:border-0"
                        >
                          <td className="px-2 py-2 font-medium">
                            {formatDateTime(log.startTime)}
                          </td>
                          <td className="px-2 py-2">
                            {formatDateTime(log.endTime)}
                          </td>
                          <td className="px-2 py-2 text-right font-bold">
                            {log.hoursWorked ? `${log.hoursWorked} hrs` : "-"}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-blue-100/50 font-bold border-t border-gray-400">
                        <td className="px-2 py-2" colSpan="2">
                          Total Hours Spent
                        </td>
                        <td className="px-2 py-2 text-right">
                          {workLogDetails
                            .reduce(
                              (acc, log) => acc + (log.hoursWorked || 0),
                              0,
                            )
                            .toFixed(2)}{" "}
                          hrs
                        </td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <p className="text-center text-gray-500 italic">
                    No work logs recorded yet.
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-white">Task Board</h1>
            <p className="text-gray-400">
              Manage project tasks with card and table view.
            </p>
          </div>

          {(isAdmin || Permissions.isAdd) && (
            <Button
              onClick={handleAddNew}
              className="bg-gradient-to-r from-blue-500 to-purple-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          )}
        </motion.div>
        {/* View Switch - Center */}
        <div className="flex justify-center mt-6">
          <div className="flex gap-4 bg-white/5 p-2 rounded-xl border border-white/10">
            <button
              onClick={() => setViewMode("card")}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition ${
                viewMode === "card"
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                  : "text-gray-300 hover:bg-white/10"
              }`}
            >
              Card View
            </button>

            <button
              onClick={() => {
                setViewMode("table");
                setActiveStatus("In Progress");
              }}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition ${
                viewMode === "table"
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                  : "text-gray-300 hover:bg-white/10"
              }`}
            >
              Table View
            </button>
          </div>
        </div>
        <Card className="glass-effect border-white/10">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 items-end justify-between">
              <div className="flex flex-wrap gap-4 items-end">
                {isAdmin ? (
                  <>
                    <div>
                      <Label className="text-gray-300">Filter Type</Label>
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-[160px] glass-effect border-white/10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-effect border-white/10 text-white">
                          <SelectItem value="day">Day</SelectItem>
                          <SelectItem value="week">Week</SelectItem>
                          <SelectItem value="month">Month</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {filterType === "day" && (
                      <div>
                        <Label className="text-gray-300">Select Date</Label>
                        <Input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="glass-effect border-white/10 text-white"
                        />
                      </div>
                    )}

                    {filterType === "week" && (
                      <div>
                        <Label className="text-gray-300">
                          Select Week Date
                        </Label>
                        <Input
                          type="date"
                          value={selectedWeek}
                          onChange={(e) => setSelectedWeek(e.target.value)}
                          className="glass-effect border-white/10 text-white"
                        />
                      </div>
                    )}

                    {filterType === "month" && (
                      <div>
                        <Label className="text-gray-300">Select Month</Label>
                        <Input
                          type="month"
                          value={selectedMonth}
                          onChange={(e) => setSelectedMonth(e.target.value)}
                          className="glass-effect border-white/10 text-white"
                        />
                      </div>
                    )}

                    <div>
                      <Label className="text-gray-300">Project</Label>
                      <Select
                        value={selectedProject || "all"}
                        onValueChange={(value) => {
                          const projectId = value === "all" ? "" : value;
                          setSelectedProject(projectId);

                          if (projectId && selectedEmployee) {
                            const selectedProjectData = (
                              projectList || []
                            ).find(
                              (project) =>
                                String(project._id) === String(projectId),
                            );

                            const employeeStillValid = (
                              selectedProjectData?.assignedEmployees || []
                            ).some(
                              (emp) =>
                                String(emp._id) === String(selectedEmployee),
                            );

                            if (!employeeStillValid) {
                              setSelectedEmployee("");
                            }
                          }
                        }}
                      >
                        <SelectTrigger className="w-[220px] glass-effect border-white/10">
                          <SelectValue placeholder="All Projects" />
                        </SelectTrigger>

                        <SelectContent className="glass-effect text-white h-[150px]">
                          <SelectItem value="all">All Projects</SelectItem>
                          {filteredProjectList.map((proj) => (
                            <SelectItem key={proj._id} value={proj._id}>
                              {proj.projectName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-gray-300">Employee</Label>
                      <Select
                        value={selectedEmployee || "all"}
                        onValueChange={(value) => {
                          const employeeId = value === "all" ? "" : value;
                          setSelectedEmployee(employeeId);

                          if (employeeId && selectedProject) {
                            const projectStillValid = (projectList || []).some(
                              (project) =>
                                String(project._id) ===
                                  String(selectedProject) &&
                                (project.assignedEmployees || []).some(
                                  (emp) =>
                                    String(emp._id) === String(employeeId),
                                ),
                            );

                            if (!projectStillValid) {
                              setSelectedProject("");
                            }
                          }
                        }}
                      >
                        <SelectTrigger className="w-[180px] glass-effect border-white/10">
                          <SelectValue placeholder="All Employees" />
                        </SelectTrigger>

                        <SelectContent className="glass-effect text-white h-[150px]">
                          <SelectItem value="all">All Employees</SelectItem>
                          {filteredEmployeeList.map((emp) => (
                            <SelectItem key={emp._id} value={emp._id}>
                              {emp.name || emp.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-gray-300 opacity-0">Reset</Label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleResetFilters}
                        className="border-white/10 hover:bg-white/10 text-white"
                      >
                        Reset
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label className="text-gray-300">Select Date</Label>
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="glass-effect border-white/10 text-white"
                      />
                    </div>

                    <div>
                      <Label className="text-gray-300 opacity-0">Reset</Label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleResetFilters}
                        className="border-white/10 hover:bg-white/10 text-white"
                      >
                        Reset
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {viewMode === "card" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
            {Object.entries(taskColumns).map(([status, tasksInColumn], i) => {
              const visibleTasks =
                status === "Completed" && !showAllCompleted
                  ? tasksInColumn.slice(0, 5)
                  : tasksInColumn;

              return (
                <motion.div
                  key={status}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card
                    className={`border-white/10 h-full ${cardColors[status] || "glass-effect"}`}
                  >
                    <CardHeader>
                      <CardTitle className="text-white">
                        {status} ({tasksInColumn.length})
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {visibleTasks.length > 0 ? (
                        <>
                          {visibleTasks.map((t) => (
                            <TaskCard
                              key={t._id}
                              task={t}
                              onEdit={handleEdit}
                              onDelete={handleDelete}
                              onShowHistory={handleHistory}
                              onShowWorkLogs={handleWorkLogs}
                              employees={Employees}
                              Permissions={Permissions}
                            />
                          ))}

                          {status === "Completed" &&
                            tasksInColumn.length > 5 && (
                              <div className="pt-2 text-center">
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="border-white/10 hover:bg-white/10 text-white"
                                  onClick={() =>
                                    setShowAllCompleted((prev) => !prev)
                                  }
                                >
                                  {showAllCompleted ? "View Less" : "View More"}
                                </Button>
                              </div>
                            )}
                        </>
                      ) : (
                        <div className="text-sm text-gray-300 bg-white/5 rounded-lg p-4 text-center">
                          No tasks in {status}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {viewMode === "table" && (
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <div className="flex flex-wrap gap-3">
                {["Pending", "In Progress", "Completed", "OverDue"].map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveStatus(tab)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        activeStatus === tab
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                          : "bg-white/5 text-gray-300 hover:bg-white/10"
                      }`}
                    >
                      {tab} ({taskColumns[tab]?.length || 0})
                    </button>
                  ),
                )}
              </div>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-white">
                  <thead className="border-b border-white/10 text-gray-300">
                    <tr>
                      <th className="px-4 py-3">Task Name</th>
                      <th className="px-4 py-3">Project</th>
                      <th className="px-4 py-3">Assignee</th>
                      <th className="px-4 py-3">Priority</th>
                      <th className="px-4 py-3">Due Date</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {activeTableData.length > 0 ? (
                      activeTableData.map((t) => {
                        const assignee =
                          Employees.find(
                            (e) => e._id === t.assignedTo?.[0]?._id,
                          ) || t.assignedTo?.[0];

                        return (
                          <tr
                            key={t._id}
                            className="border-b border-white/5 hover:bg-white/5"
                          >
                            <td className="px-4 py-3">
                              <div className="font-medium">{t.taskName}</div>
                              <div className="text-xs text-gray-400">
                                {t.description || "-"}
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              {t.projectId?.projectName || "-"}
                            </td>

                            <td className="px-4 py-3">
                              {assignee?.name || assignee?.email || "-"}
                            </td>

                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${getPriorityBadge(
                                  t.taskPriorityId?.name,
                                )}`}
                              >
                                {t.taskPriorityId?.name || "-"}
                              </span>
                            </td>

                            <td className="px-4 py-3">
                              {t.dueDate
                                ? new Date(t.dueDate).toLocaleDateString(
                                    "en-IN",
                                  )
                                : "-"}
                            </td>

                            <td className="px-4 py-3">
                              {t.taskStatusId?.name || "-"}
                            </td>

                            <td className="px-4 py-3">
                              <div className="flex justify-center gap-2">
                                {Permissions.isEdit && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleEdit(t)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                )}

                                {isAdmin && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => handleDelete(t)}
                                    >
                                      <Trash2 className="w-4 h-4 text-red-400" />
                                    </Button>

                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() =>
                                        handleHistory(t.progressDetails || [])
                                      }
                                    >
                                      <History className="w-4 h-4 text-yellow-400" />
                                    </Button>

                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() =>
                                        handleWorkLogs(t.workLogs || [])
                                      }
                                    >
                                      <Clock className="w-4 h-4 text-blue-400" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          className="px-4 py-10 text-center text-gray-400"
                        >
                          No tasks found for {activeStatus}.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default TasksPage;
