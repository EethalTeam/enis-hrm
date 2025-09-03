
import React, { useState, useMemo ,useEffect} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { ListTodo, Plus, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
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

const TaskForm = ({ open, setOpen, task, onSave,getAllTasks }) => {
  const { projects, employees } = useData();
  const [formData, setFormData] = useState(
    task || {_id:'', taskName: '', description: '', taskPriority: '',taskPriorityId:'', taskStatus: '',taskStatusId:'', assignee: '',assignedTo:'',project:'', projectId: '', dueDate: '' }
  );
    const [Data,SetData] = useState([])
  useEffect(()=>{
  if(task){
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
     dueDate: task.dueDate.split('T')[0]
    })
  }
  },[task])
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
        let url = config.Api + "Employee/getAllEmployees/";
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });
  
        if (!response.ok) {
          throw new Error('Failed to get State');
        }
  
        const result = await response.json();
        SetData(result)
        // setState(result)
        // setFilteredData(result)
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    }

 const getTaskStatusList = async () => {
      try {
         SetData([]); // clear Data once
        let url = config.Api + "TaskStatus/getAllTaskStatus/";
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });
  
        if (!response.ok) {
          throw new Error('Failed to get State');
        }
  
        const result = await response.json();
        SetData(result)
        // setState(result)
        // setFilteredData(result)
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    }
 const getProjectList = async () => {
      try {
         SetData([]); // clear Data once
        let url = config.Api + "Project/getAllProjects/";
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });
  
        if (!response.ok) {
          throw new Error('Failed to get State');
        }
  
        const result = await response.json();
        SetData(result)
        // setState(result)
        // setFilteredData(result)
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    }
 const getTaskPriorityList = async () => {
      try {
         SetData([]); // clear Data once
        let url = config.Api + "TaskPriority/getAllTaskPriority/";
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });
  
        if (!response.ok) {
          throw new Error('Failed to get State');
        }
  
        const result = await response.json();
        SetData(result)
        // setState(result)
        // setFilteredData(result)
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    }
  const createTask = async (data) => {
    try {
      let url = config.Api + "Task/createTask/";
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to get State');
      }

      SetData([])
      getAllTasks()
      // setFilteredData(result)
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
    const updateTask = async (data) => {
    try {
      let url = config.Api + "Task/updateTask/";
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to get State');
      }

      SetData([])
      getAllTasks()
      // setFilteredData(result)
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
const handleSubmit = (e) => {
    e.preventDefault();
    // onSave(formData);
    if (formData._id) {
          updateTask(formData);
          toast({
            title: 'Task Updated',
            description: "Task has been updated successfully.",
          });
        } else {
          createTask(formData);
          toast({
            title: 'Task Added',
            description: `${formData.taskName} has been added to the system.`,
          });
        }
        setOpen(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="glass-effect border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          <DialogDescription className="text-gray-400">{task ? 'Update task details.' : 'Add a new task to a project.'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <Input name="taskName" value={formData.taskName} onChange={handleChange} placeholder="Task Title" required className="bg-white/5 border-white/10" />
          <Textarea name="description" value={formData.description} onChange={handleChange} placeholder="Task Description" className="bg-white/5 border-white/10" />
          <div className="grid grid-cols-2 gap-4">
            <Select
                                         name="taskPriority"
                                         value={formData.taskPriorityId} // store only _id
                                         onOpenChange={async (open) => {
                                           if (open && (!Data || Data.length === 0)) {
                                             await getTaskPriorityList();
                                           }
                                         }}
                                         onValueChange={(id) => {
                                           if (!id) return;
                                           const dept = Data.find(d => d._id === id);
                                           if (dept) {
                                             handleSelectChange('taskPriorityId', 'taskPriority', dept._id, dept.name);
                                           }
                                         }}
                                         // required
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
            <Select
                                         name="taskStatus"
                                         value={formData.taskStatusId} // store only _id
                                         onOpenChange={async (open) => {
                                           if (open && (!Data || Data.length === 0)) {
                                             await getTaskStatusList();
                                           }
                                         }}
                                         onValueChange={(id) => {
                                           if (!id) return;
                                           const dept = Data.find(d => d._id === id);
                                           if (dept) {
                                             handleSelectChange('taskStatusId', 'taskStatus', dept._id, dept.name);
                                           }
                                         }}
                                         // required
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
             <Select
                                         name="project"
                                         value={formData.projectId} // store only _id
                                         onOpenChange={async (open) => {
                                           if (open && (!Data || Data.length === 0)) {
                                             await getProjectList();
                                           }
                                         }}
                                         onValueChange={(id) => {
                                           if (!id) return;
                                           const dept = Data.find(d => d._id === id);
                                           if (dept) {
                                             handleSelectChange('projectId', 'project', dept._id, dept.projectName);
                                           }
                                         }}
                                         // required
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
                         <Select
                                          name="assignee"
                                          value={formData.assignedTo} // store only _id
                                          onOpenChange={async (open) => {
                                            if (open && (!Data || Data.length === 0)) {
                                              await getEmployeeList();
                                            }
                                          }}
                                          onValueChange={(id) => {
                                            if (!id) return;
                                            const dept = Data.find(d => d._id === id);
                                            if (dept) {
                                              handleSelectChange('assignedTo', 'assignee', dept._id, dept.name);
                                            }
                                          }}
                                          // required
                                        >
                                          <SelectTrigger className="glass-effect border-white/10">
                                            <SelectValue placeholder="Select Employee" >
                                              {formData.assignee}
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
             <Label htmlFor="dueDate" className="text-gray-300">Due Date</Label>
             <Input id="dueDate" name="dueDate" type="date" value={formData.dueDate} onChange={handleChange} className="bg-white/5 border-white/10" />
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline" className="border-white/10 hover:bg-white/10">Cancel</Button></DialogClose>
            <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600">Save Task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const TaskCard = ({ task, onEdit, onDelete, employees }) => {
  const getPriorityColor = (priority) => ({
    "High": "bg-red-500", "Medium": "bg-yellow-500", "Low": "bg-green-500"
  }[priority]);
  const assignee = employees.find(e => e._id === task.assignedTo[0]._id);
  return (
    <motion.div initial={{ opacity: 0, y:10}} animate={{opacity:1, y:0}} className="p-4 bg-slate-800/50 rounded-lg border border-white/10">
      <div className="flex justify-between items-start">
        <h4 className="font-bold text-white mb-2">{task.taskName}</h4>
        <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`}></div>
      </div>
      <p className="text-sm text-gray-400 mb-4">{task.description}</p>
      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center gap-2">
            {assignee && <img src={assignee.avatar} alt={assignee.name} className="w-6 h-6 rounded-full"/>}
            <span className="text-gray-300">{assignee ? assignee.name : 'Unassigned'}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit(task)}><Edit className="w-3 h-3"/></Button>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onDelete(task)}><Trash2 className="w-3 h-3 text-red-400"/></Button>
      </div>
    </motion.div>
  );
};

const TasksPage = () => {
  const { tasks, employees, addTask, updateTask, deleteTask } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [task,setTasks] = useState([])
  const [Employes,setEmployees]=useState([])
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const taskColumns = useMemo(() => ({
    Todo: task.filter(t => t.taskStatusId.name === 'To Do'),
    'In Progress': task.filter(t => t.taskStatusId.name === 'In Progress'),
    Completed: task.filter(t => t.taskStatusId.name === 'Completed'),
  }), [task]);

  const handleAddNew = () => {
    setSelectedTask(null);
    setIsFormOpen(true);
  };

  useEffect(()=>{
    getAllTasks()
    getEmployeeList()
  },[])
  const getAllTasks = async () => {
    try {
      let url = config.Api + "Task/getAllTasks/";
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error('Failed to get State');
      }

      const result = await response.json();
      setTasks(result)
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
    const getEmployeeList = async () => {
      try {
        let url = config.Api + "Employee/getAllEmployees/";
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });
  
        if (!response.ok) {
          throw new Error('Failed to get State');
        }
  
        const result = await response.json();
        setEmployees(result)
        // setState(result)
        // setFilteredData(result)
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    }
    const handleEdit = (task) => {
    setSelectedTask(task);
    setIsFormOpen(true);
  };
  const handleDelete = (task) => {
    setSelectedTask(task);
    setIsConfirmOpen(true);
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

  return (
    <>
      <Helmet><title>Tasks - ENIS-HRMS</title></Helmet>
      <AnimatePresence>{isFormOpen && <TaskForm open={isFormOpen} setOpen={setIsFormOpen} task={selectedTask} onSave={handleSave} getAllTasks={getAllTasks} />}</AnimatePresence>
      <AnimatePresence>{isConfirmOpen && <ConfirmationDialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={confirmDelete} title="Delete Task?" description="This action cannot be undone." />}</AnimatePresence>
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold text-white">Task Board</h1>
                <p className="text-gray-400">Manage project tasks using a Kanban board.</p>
            </div>
            <Button onClick={handleAddNew} className="bg-gradient-to-r from-blue-500 to-purple-600"><Plus className="w-4 h-4 mr-2"/>New Task</Button>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {Object.entries(taskColumns).map(([status, tasksInColumn], i) => (
                <motion.div key={status} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1}}>
                    <Card className="glass-effect border-white/10 h-full">
                        <CardHeader><CardTitle className="text-white">{status} ({tasksInColumn.length})</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {tasksInColumn.map(task => <TaskCard key={task.id} task={task} onEdit={handleEdit} onDelete={handleDelete} employees={Employes}/>)}
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
      </div>
    </>
  );
};

export default TasksPage;
