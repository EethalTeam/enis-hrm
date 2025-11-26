import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
// Added Clock icon for the work log button
import { ListTodo, Plus, MoreHorizontal, Edit, History, Trash2, X, Clock } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { config } from '@/components/CustomComponents/config';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/components/CustomComponents/apiRequest';

const TaskForm = ({ open, setOpen, task, onSave, getAllTasks, employees }) => {
  const { user } = useAuth();
  console.log(user,"user")
  const [isConfirmPause, setIsConfirmPause] = useState(false);
  const [isConfirmComplete, setIsConfirmComplete] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [ProgressMessage, setProgressMessage] = useState('');
  const [formData, setFormData] = useState(
    task || { _id: '', taskName: '', description: '', taskPriority: '', taskPriorityId: '', taskStatus: 'To Do', taskStatusId: '68b5a25b88e62ec178bb2923', assignee: '', assignedTo: '', assignees: [], project: '', projectId: '', dueDate: '', reqLeadCount: '', compLeadCount: '', createdBy: user._id }
  );
  const [Data, SetData] = useState([]);

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
        dueDate: task.dueDate.split('T')[0],
        reqLeadCount: task.reqLeadCount,
        compLeadCount: task.compLeadCount,
        assignees: task.assignedTo.map(val => val._id)
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (id, name, key, value) => {
    if (key && name) {
      setFormData(prev => ({
        ...prev,
        [id]: key,
        [name]: value
      }));
      SetData([]); // clear Data once
    }
  };

  const getEmployeeList = async () => {
    try {
      SetData([]); // clear Data once
      const response = await apiRequest("Employee/getAllEmployees/", {
        method: 'POST',
        body: JSON.stringify({}),
      });

      SetData(response);
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  const getTaskStatusList = async () => {
    try {
      SetData([]); // clear Data once
      const response = await apiRequest("TaskStatus/getAllTaskStatus/", {
        method: 'POST',
        body: JSON.stringify({}),
      });

      SetData(response);
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };
  const handleSelectAssignee = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const getProjectList = async () => {
    try {
      SetData([]); // clear Data once
      const response = await apiRequest("Project/getAllProjects/", {
        method: 'POST',
        body: JSON.stringify({}),
      });

      SetData(response);
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };
  const getTaskPriorityList = async () => {
    try {
      SetData([]); // clear Data once
      const response = await apiRequest("TaskPriority/getAllTaskPriority/", {
        method: 'POST',
        body: JSON.stringify({}),
      });

      SetData(response);
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };
  const createTask = async (data) => {
    try {
      const response = await apiRequest("Task/createTask/", {
        method: 'POST',
        body: JSON.stringify(data),
      });

      SetData([]);
      getAllTasks();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };
  const updateTask = async (data) => {
    try {
      const response = await apiRequest("Task/updateTask/", {
        method: 'POST',
        body: JSON.stringify(data),
      });

      SetData([]);
      getAllTasks();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };
  const updateTaskStatus = async (taskId, status, compLeadCount) => {
    try {
      if (status === 'Pause' && !ProgressMessage) {
        toast({
          title: 'Validation fails',
          description: 'Please enter a reason for progress message or reason for pausing the task',
        });
        return;
      } else if (status === 'Complete' && !feedback) {
        toast({
          title: 'Validation fails',
          description: 'Please enter a feedback before completing the task',
        });
        return;
      }
      const response = await apiRequest("Task/updateTaskStatus/", {
        method: 'POST',
        body: JSON.stringify({ taskId, status, progressDetails: ProgressMessage, feedback: feedback, compLeadCount: compLeadCount }),
      });
      SetData([]);
      toast({
        title: 'Status Updated',
        description: `${response.message}`,
      });
      setOpen(false);
      getAllTasks();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData._id) {
      updateTask(formData);
      toast({
        title: 'Task Updated',
        description: "Task has been updated successfully.",
      });
      setOpen(false);
    } else {
      createTask(formData);
      toast({
        title: 'Task Added',
        description: `${formData.taskName} has been added to the system.`,
      });
    }
    setOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {isConfirmPause && (
          <ConfirmationDialog
            isOpen={isConfirmPause}
            onClose={() => setIsConfirmPause(false)}
            onConfirm={() => updateTaskStatus(formData._id, formData.taskStatus === 'In Progress' ? 'Pause' : 'Start', formData.compLeadCount)}
            title="Pause Task?"
            description="Please provide a reason or Progress message for pausing the task."
          >
            <div className="mt-2">
              <Label htmlFor="ProgressMessage" className="text-gray-300"><b>Progress message</b></Label>
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
            onConfirm={() => updateTaskStatus(formData._id, 'Complete', formData.compLeadCount)}
            title="Complete Task?"
            description="Please provide a feedback before completing the task."
          >
            <div className="mt-2">
              <Label htmlFor="feedback" className="text-gray-300"><b>Feedback</b></Label>
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

      {(!isConfirmPause && !isConfirmComplete) && <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass-effect border-white/10 text-white" style={{ overflowY: 'auto', height: '90vh', scrollbarWidth: 'none' }}>
          <DialogHeader>
            <DialogTitle>{task ? ((user.role === 'Super Admin' || user.role === 'Admin') ? 'Edit Task' : 'Task details') : 'Create New Task'}</DialogTitle>
            <DialogDescription className="text-gray-400">{task ? 'Update task details.' : 'Add a new task to a project.'}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div>
              <Label htmlFor="taskName" className="text-gray-300">Task Title</Label>
              <Input name="taskName" value={formData.taskName} onChange={handleChange} placeholder="Task Title" required className="bg-white/5 border-white/10" disabled={(user.role !== 'Super Admin' && user.role !== 'Admin')} />
            </div>
            <div>
              <Label htmlFor="description" className="text-gray-300">Task Description</Label>
              <Textarea disabled={(user.role !== 'Super Admin' && user.role !== 'Admin')} name="description" value={formData.description} onChange={handleChange} placeholder="Task Description" className="bg-white/5 border-white/10" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="taskPriority" className="text-gray-300">Priority</Label>
                <Select
                  name="taskPriority"
                  value={formData.taskPriorityId}
                  onOpenChange={async (open) => {
                    if (open && (!Data || Data.length === 0)) {
                      await getTaskPriorityList();
                    }
                  }}
                  disabled={(user.role !== 'Super Admin' && user.role !== 'Admin')}
                  onValueChange={(id) => {
                    if (!id) return;
                    const dept = Data.find(d => d._id === id);
                    if (dept) {
                      handleSelectChange('taskPriorityId', 'taskPriority', dept._id, dept.name);
                    }
                  }}
                >
                  <SelectTrigger className="glass-effect border-white/10">
                    <SelectValue placeholder="Select Priority" >
                      {formData.taskPriority}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="glass-effect border-white/10 text-white">
                    {(Data || []).map((dept) => (
                      <SelectItem key={dept._id} value={dept._id} className="hover:bg-white/10">
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="taskStatus" className="text-gray-300">Status</Label>
                <Select
                  name="taskStatus"
                  value={formData.taskStatusId}
                  onOpenChange={async (open) => {
                    if (open && (!Data || Data.length === 0)) {
                      await getTaskStatusList();
                    }
                  }}
                  disabled={!task}
                  onValueChange={(id) => {
                    if (!id) return;
                    const dept = Data.find(d => d._id === id);
                    if (dept) {
                      handleSelectChange('taskStatusId', 'taskStatus', dept._id, dept.name);
                    }
                  }}
                >
                  <SelectTrigger className="glass-effect border-white/10">
                    <SelectValue placeholder="Select Status" >
                      {formData.taskStatus}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="glass-effect border-white/10 text-white">
                    {(Data || []).map((dept) => (
                      <SelectItem key={dept._id} value={dept._id} className="hover:bg-white/10">
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="taskStatus" className="text-gray-300">Project</Label>
                <Select
                  name="project"
                  value={formData.projectId}
                  onOpenChange={async (open) => {
                    if (open && (!Data || Data.length === 0)) {
                      await getProjectList();
                    }
                  }}
                  disabled={(user.role !== 'Super Admin' && user.role !== 'Admin')}
                  onValueChange={(id) => {
                    if (!id) return;
                    const dept = Data.find(d => d._id === id);
                    if (dept) {
                      handleSelectChange('projectId', 'project', dept._id, dept.projectName);
                    }
                  }}
                >
                  <SelectTrigger className="glass-effect border-white/10">
                    <SelectValue placeholder="Select Project" >
                      {formData.project}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="glass-effect border-white/10 text-white">
                    {(Data || []).map((dept) => (
                      <SelectItem key={dept._id} value={dept._id} className="hover:bg-white/10">
                        {dept.projectName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {!task && <div>
                <Label htmlFor="assignees" className="text-gray-300">Select Members</Label>
                <p className="text-gray-400 text-xs mb-2">Ctrl/Cmd + click to select multiple.</p>
                <select
                  id="assignees"
                  name="assignees"
                  multiple
                  value={formData.assignees}
                  onChange={(e) => handleSelectAssignee('assignees', Array.from(e.target.selectedOptions, option => option.value))}
                  className="w-full h-32 glass-effect border-white/10 rounded-md bg-transparent p-2"
                >
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id} className="bg-slate-800 p-1">{emp.name}</option>
                  ))}
                </select>
              </div>}
            </div>
            <div>
              <Label htmlFor="dueDate" className="text-gray-300">Due Date</Label>
              <Input disabled={(user.role !== 'Super Admin' && user.role !== 'Admin')} id="dueDate" name="dueDate" type="date" value={formData.dueDate} required onChange={handleChange} className="bg-white/5 border-white/10 text-white [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-100" />
            </div>
            <DialogFooter>
              {(user.role === 'Super Admin' || user.role === 'Admin') && <DialogClose asChild><Button type="button" variant="outline" className="border-white/10 hover:bg-white/10">Cancel</Button></DialogClose>}
              {(user.role === 'Super Admin' || user.role === 'Admin') && <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600">Save Task</Button>}
            </DialogFooter>
          </form>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            {(formData.taskStatus !== 'Completed' && formData.assignedTo === user._id) && <Button onClick={() => {
              formData.taskStatus === 'In Progress' ? setIsConfirmPause(true) : updateTaskStatus(formData._id, formData.taskStatus === 'In Progress' ? 'Pause' : 'Start', formData.compLeadCount)
            }} className={`bg-gradient-to-r ${formData.taskStatus === 'In Progress' ? 'from-yellow-500 to-yellow-600' : 'from-green-500 to-green-600'} mr-4`}>{formData.taskStatus === 'In Progress' ? 'Pause Task' : 'Start Task'}</Button>}
            {formData.assignedTo === user._id && <Button onClick={() => { setIsConfirmComplete(true) }} className="bg-gradient-to-r from-blue-500 to-purple-600" disabled={formData.taskStatus === 'Completed'}>{formData.taskStatus === 'Completed' ? 'Task Completed' : 'Complete Task'}</Button>}
          </div>
        </DialogContent>
      </Dialog>}
    </>
  );
};

// Updated TaskCard to include onShowWorkLogs
const TaskCard = ({ task, onEdit, onDelete, employees, onShowHistory, onShowWorkLogs,Permissions }) => {
  const { user } = useAuth();
  const getPriorityColor = (priority) => ({
    "High": "bg-red-500", "Medium": "bg-yellow-500", "Low": "bg-green-500"
  }[priority]);
  const assignee = employees.find(e => e._id === task.assignedTo[0]._id);
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-slate-800/50 rounded-lg border border-white/10">
      <div className="flex justify-between items-start">
        <h4 className="font-bold text-white mb-2">{task.taskName}</h4>
        <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`}></div>
      </div>
      <p className="text-sm text-gray-400 mb-4">{task.description}</p>
      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center gap-2">
          {assignee && <img src={assignee.avatar} alt={assignee.name} className="w-6 h-6 rounded-full" />}
          <span className="text-gray-300">{assignee ? assignee.name : 'Unassigned'}</span>
        </div>
        <div className="flex ">
          {Permissions.isEdit && <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit(task)}><Edit className="w-3 h-3" /></Button>}
          {(user.role === 'Super Admin' || user.role === 'Admin') && (
            <>
              <Button variant="ghost" size="icon" className="h-6 w-5" onClick={() => onDelete(task)}><Trash2 className="w-3 h-3 text-red-400" /></Button>
              <Button variant="ghost" size="icon" className="h-6 w-5" onClick={() => onShowHistory(task.progressDetails)}><History className="w-3 h-3 text-yellow-400" /></Button>
              {/* Added Work Log Button */}
              <Button variant="ghost" size="icon" className="h-6 w-5" onClick={() => onShowWorkLogs(task.workLogs || [])}><Clock className="w-3 h-3 text-blue-400" /></Button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const TasksPage = () => {
  const { user } = useAuth();
  const { tasks, employees, addTask, updateTask } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [task, setTasks] = useState([]);
  const [Employees, setEmployees] = useState([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  // Existing History State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [ProgressDetails, setProgressDetails] = useState([]);

  // NEW: Work Log State
  const [isWorkLogOpen, setIsWorkLogOpen] = useState(false);
  const [workLogDetails, setWorkLogDetails] = useState([]);

  const taskColumns = useMemo(() => ({
    Todo: task.filter(t => t.taskStatusId.name === 'To Do'),
    'In Progress': task.filter(t => t.taskStatusId.name === 'In Progress'),
    Completed: task.filter(t => t.taskStatusId.name === 'Completed'),
    OverDue: task.filter(t => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // reset time to midnight

      const dueDate = new Date(t.dueDate);
      dueDate.setHours(0, 0, 0, 0); // reset time to midnight

      return dueDate < today && t.taskStatusId.name !== 'Completed';
    })
  }), [task]);

  const handleAddNew = () => {
    setSelectedTask(null);
    setIsFormOpen(true);
  };

 const { getPermissionsByPath } = useAuth();
      const [Permissions,setPermissions]=useState({isAdd:false,isView:false,isEdit:false,isDelete:false})
  
      useEffect(()=>{
          getPermissionsByPath(window.location.pathname).then(res=>{
              if(res){
                  setPermissions(res)
              }else{
                  navigate('/dashboard')
              }
          })
    getAllTasks();
    getEmployeeList();
  }, []);

  const getAllTasks = async () => {
    try {
      const response = await apiRequest("Task/getAllTasks/", {
        method: 'POST',
        body: JSON.stringify({ _id: user._id, role: user.role }),
      });

      setTasks(response);
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };
  const getEmployeeList = async () => {
    try {
      const response = await apiRequest("Employee/getAllEmployees/", {
        method: 'POST',
        body: JSON.stringify({}),
      });

      setEmployees(response);
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };
  const deleteTask = async (id) => {
    try {
      const response = await apiRequest("Task/deleteTask/", {
        method: 'POST',
        body: JSON.stringify({ _id: id }),
      });

      getAllTasks();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
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
    setProgressDetails(details);
    setIsHistoryOpen(true);
  };
  
  // NEW Handler for Work Logs
  const handleWorkLogs = (logs) => {
    setWorkLogDetails(logs);
    setIsWorkLogOpen(true);
  };

  const confirmDelete = () => {
    deleteTask(selectedTask._id);
    toast({ title: "Task Deleted" });
    setIsConfirmOpen(false);
    setSelectedTask(null);
  };
  const handleSave = (taskData) => {
    if (selectedTask) {
      updateTask({ ...taskData, id: selectedTask.id });
      toast({ title: "Task Updated" });
    } else {
      addTask(taskData);
      toast({ title: "Task Created" });
    }
  };
  
  // Helper for formatting date/time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'Ongoing';
    return new Date(dateString).toLocaleString('en-IN', { 
        year: 'numeric', month: 'short', day: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <>
      <Helmet><title>Tasks - ENIS-HRMS</title></Helmet>
      <AnimatePresence>{isFormOpen && <TaskForm open={isFormOpen} setOpen={setIsFormOpen} task={selectedTask} onSave={handleSave} getAllTasks={getAllTasks} employees={Employees} />}</AnimatePresence>
      <AnimatePresence>{isConfirmOpen && <ConfirmationDialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={confirmDelete} title="Delete Task?" description="This action cannot be undone." />}</AnimatePresence>
      
      {/* Existing History Modal */}
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
              style={{ backgroundColor: '#c4f4c4' }}
            >
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
              >
                <X size={22} />
              </button>
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'black' }}>Progress Details</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 max-h-[60vh] overflow-y-auto">
                {ProgressDetails.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NEW Work Log Modal (Styled same as History) */}
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
              style={{ backgroundColor: '#e0f2fe' }} // Light blue to distinguish from history, or use #c4f4c4
            >
              <button
                onClick={() => setIsWorkLogOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
              >
                <X size={22} />
              </button>
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'black' }}>Work Timing Log</h2>
              
              <div className="max-h-[60vh] overflow-y-auto">
                  {workLogDetails.length > 0 ? (
                    <table className="w-full text-sm text-left text-gray-700">
                        <thead className="text-xs text-gray-700 uppercase border-b border-gray-400">
                            <tr>
                                <th className="px-2 py-2">Start Time</th>
                                <th className="px-2 py-2">End Time</th>
                                <th className="px-2 py-2 text-right">Hours</th>
                            </tr>
                        </thead>
                        <tbody>
                            {workLogDetails.map((log, idx) => (
                                <tr key={idx} className="border-b border-gray-300 last:border-0">
                                    <td className="px-2 py-2 font-medium">{formatDateTime(log.startTime)}</td>
                                    <td className="px-2 py-2">{formatDateTime(log.endTime)}</td>
                                    <td className="px-2 py-2 text-right font-bold">
                                        {log.hoursWorked ? `${log.hoursWorked} hrs` : '-'}
                                    </td>
                                </tr>
                            ))}
                             {/* Total Hours Calculation */}
                             <tr className="bg-blue-100/50 font-bold border-t border-gray-400">
                                <td className="px-2 py-2" colSpan="2">Total Hours Spent</td>
                                <td className="px-2 py-2 text-right">
                                    {workLogDetails.reduce((acc, log) => acc + (log.hoursWorked || 0), 0).toFixed(2)} hrs
                                </td>
                             </tr>
                        </tbody>
                    </table>
                  ) : (
                      <p className="text-center text-gray-500 italic">No work logs recorded yet.</p>
                  )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Task Board</h1>
            <p className="text-gray-400">Manage project tasks using a Kanban board.</p>
          </div>
          {(user.role === 'Super Admin' || user.role === 'Admin' ||  Permissions.isAdd ) && <Button onClick={handleAddNew} className="bg-gradient-to-r from-blue-500 to-purple-600"><Plus className="w-4 h-4 mr-2" />New Task</Button>}
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {Object.entries(taskColumns).map(([status, tasksInColumn], i) => {
            const cardColors = {
              "Todo": "bg-violet-600",
              "In Progress": "bg-yellow-600",
              "Completed": "bg-green-600",
              "OverDue": "bg-red-600",
            };
            return <motion.div key={status} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card
                className={`border-white/10 h-full ${cardColors[status] || "glass-effect"}`}
              >
                <CardHeader><CardTitle className="text-white">{status} ({tasksInColumn.length})</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {tasksInColumn.map(task => <TaskCard key={task.id} task={task} onEdit={handleEdit} onDelete={handleDelete} onShowHistory={handleHistory} onShowWorkLogs={handleWorkLogs} employees={Employees} Permissions={Permissions}/>)}
                </CardContent>
              </Card>
            </motion.div>
          })}
        </div>
      </div>
    </>
  );
};

export default TasksPage;