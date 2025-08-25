
import React, { useState, useMemo } from 'react';
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

const TaskForm = ({ open, setOpen, task, onSave }) => {
  const { projects, employees } = useData();
  const [formData, setFormData] = useState(
    task || { title: '', description: '', priority: 'Medium', status: 'Todo', assignee: '', projectId: '', dueDate: '' }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
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
          <Input name="title" value={formData.title} onChange={handleChange} placeholder="Task Title" required className="bg-white/5 border-white/10" />
          <Textarea name="description" value={formData.description} onChange={handleChange} placeholder="Task Description" className="bg-white/5 border-white/10" />
          <div className="grid grid-cols-2 gap-4">
            <Select name="priority" value={formData.priority} onValueChange={(v) => handleSelectChange('priority', v)}>
                <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Priority" /></SelectTrigger>
                <SelectContent className="glass-effect"><SelectItem value="High">High</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Low">Low</SelectItem></SelectContent>
            </Select>
            <Select name="status" value={formData.status} onValueChange={(v) => handleSelectChange('status', v)}>
                <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent className="glass-effect"><SelectItem value="Todo">Todo</SelectItem><SelectItem value="In Progress">In Progress</SelectItem><SelectItem value="Completed">Completed</SelectItem></SelectContent>
            </Select>
            <Select name="projectId" value={formData.projectId} onValueChange={(v) => handleSelectChange('projectId', v)}>
                <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Project" /></SelectTrigger>
                <SelectContent className="glass-effect">{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
            </Select>
            <Select name="assignee" value={formData.assignee} onValueChange={(v) => handleSelectChange('assignee', v)}>
                <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Assignee" /></SelectTrigger>
                <SelectContent className="glass-effect">{employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
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
  const assignee = employees.find(e => e.id === task.assignee);
  return (
    <motion.div initial={{ opacity: 0, y:10}} animate={{opacity:1, y:0}} className="p-4 bg-slate-800/50 rounded-lg border border-white/10">
      <div className="flex justify-between items-start">
        <h4 className="font-bold text-white mb-2">{task.title}</h4>
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
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const taskColumns = useMemo(() => ({
    Todo: tasks.filter(t => t.status === 'Todo'),
    'In Progress': tasks.filter(t => t.status === 'In Progress'),
    Completed: tasks.filter(t => t.status === 'Completed'),
  }), [tasks]);

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
  const confirmDelete = () => {
    deleteTask(selectedTask.id);
    toast({ title: "Task Deleted" });
    setIsConfirmOpen(false);
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
      <AnimatePresence>{isFormOpen && <TaskForm open={isFormOpen} setOpen={setIsFormOpen} task={selectedTask} onSave={handleSave} />}</AnimatePresence>
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
                            {tasksInColumn.map(task => <TaskCard key={task.id} task={task} onEdit={handleEdit} onDelete={handleDelete} employees={employees}/>)}
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
