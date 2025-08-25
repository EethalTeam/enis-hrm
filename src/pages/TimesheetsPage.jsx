
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Clock, Calendar, Plus, Download, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import TimeTracker from '@/components/timesheets/TimeTracker';
import TimesheetStats from '@/components/timesheets/TimesheetStats';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import ConfirmationDialog from '@/components/ConfirmationDialog';

const TimesheetForm = ({ open, setOpen, entry, onSave }) => {
  const { projects, tasks } = useData();
  const [formData, setFormData] = useState(
    entry || { date: '', projectId: '', taskId: '', hours: '', description: '' }
  );
  
  const projectTasks = useMemo(() => tasks.filter(t => t.projectId === formData.projectId), [tasks, formData.projectId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value, ...(name === 'projectId' && { taskId: '' }) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, hours: parseFloat(formData.hours) });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="glass-effect border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>{entry ? 'Edit Time Entry' : 'Add Time Entry'}</DialogTitle>
          <DialogDescription className="text-gray-400">Log your work hours for a specific task.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required className="bg-white/5" />
            </div>
            <div>
              <Label htmlFor="hours">Hours</Label>
              <Input id="hours" name="hours" type="number" step="0.1" value={formData.hours} onChange={handleChange} required className="bg-white/5" />
            </div>
          </div>
          <div>
            <Label htmlFor="projectId">Project</Label>
            <Select name="projectId" value={formData.projectId} onValueChange={(v) => handleSelectChange('projectId', v)} required>
              <SelectTrigger className="bg-white/5"><SelectValue placeholder="Select Project" /></SelectTrigger>
              <SelectContent className="glass-effect">{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="taskId">Task</Label>
            <Select name="taskId" value={formData.taskId} onValueChange={(v) => handleSelectChange('taskId', v)} required disabled={!formData.projectId}>
              <SelectTrigger className="bg-white/5"><SelectValue placeholder="Select Task" /></SelectTrigger>
              <SelectContent className="glass-effect">{projectTasks.map(t => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Describe the work done..." className="bg-white/5" />
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline" className="border-white/10">Cancel</Button></DialogClose>
            <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600">Save Entry</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};


const TimesheetsPage = () => {
  const { timesheetEntries, projects, tasks, addTimesheetEntry, updateTimesheetEntry, deleteTimesheetEntry } = useData();
  const [selectedWeek, setSelectedWeek] = useState(new Date().toISOString().slice(0, 10));
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleAddNew = () => {
    setSelectedEntry(null);
    setIsFormOpen(true);
  };

  const handleEdit = (entry) => {
    setSelectedEntry(entry);
    setIsFormOpen(true);
  };
  
  const handleDelete = (entry) => {
    setSelectedEntry(entry);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    deleteTimesheetEntry(selectedEntry.id);
    toast({ title: "Entry Deleted" });
    setIsConfirmOpen(false);
  };

  const handleSave = (entryData) => {
    if (selectedEntry) {
      updateTimesheetEntry({ ...entryData, id: selectedEntry.id });
      toast({ title: "Entry Updated" });
    } else {
      addTimesheetEntry(entryData);
      toast({ title: "Entry Added" });
    }
  };

  const timesheetStats = useMemo(() => {
    const totalHours = timesheetEntries.reduce((sum, e) => sum + e.hours, 0);
    const uniqueProjects = new Set(timesheetEntries.map(e => e.projectId)).size;
    return [
      { title: 'Total Hours', value: `${totalHours.toFixed(1)}h`, color: 'from-blue-500 to-cyan-500', icon: Clock },
      { title: 'Submitted Entries', value: timesheetEntries.length, color: 'from-green-500 to-emerald-500', icon: Clock },
      { title: 'Projects Worked On', value: uniqueProjects, color: 'from-purple-500 to-pink-500', icon: Calendar },
      { title: 'Avg. Daily', value: totalHours > 0 ? `${(totalHours / 5).toFixed(1)}h` : '0.0h', color: 'from-orange-500 to-red-500', icon: Clock }
    ];
  }, [timesheetEntries]);

  const handleExportTimesheet = () => toast({ title: "🚧 Feature Not Implemented" });
  const handleSubmitForApproval = () => toast({ title: "🚧 Feature Not Implemented" });

  return (
    <>
      <Helmet>
        <title>Timesheet Management - ENIS-HRMS</title>
        <meta name="description" content="Track work hours, manage billable time, and generate comprehensive timesheet reports." />
      </Helmet>

      <AnimatePresence>
        {isFormOpen && <TimesheetForm open={isFormOpen} setOpen={setIsFormOpen} entry={selectedEntry} onSave={handleSave} />}
      </AnimatePresence>
      <AnimatePresence>
        {isConfirmOpen && <ConfirmationDialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={confirmDelete} title="Delete Time Entry?" description="This action cannot be undone." />}
      </AnimatePresence>

      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Timesheets</h1>
            <p className="text-gray-400">Track and manage your work hours.</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleAddNew} className="bg-gradient-to-r from-blue-500 to-purple-600"><Plus className="w-4 h-4 mr-2" />Add Entry</Button>
            <Button onClick={handleExportTimesheet} variant="outline" className="border-white/10"><Download className="w-4 h-4 mr-2" />Export</Button>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <TimeTracker />
        </motion.div>

        <TimesheetStats stats={timesheetStats} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
           <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Timesheet Entries</CardTitle>
              <CardDescription className="text-gray-400">Your logged hours for this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Project</th>
                      <th>Task</th>
                      <th>Hours</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timesheetEntries.map((entry, index) => {
                      const project = projects.find(p => p.id === entry.projectId);
                      const task = tasks.find(t => t.id === entry.taskId);
                      return(
                      <motion.tr key={entry.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
                        <td className="text-gray-300">{new Date(entry.date).toLocaleDateString()}</td>
                        <td className="text-white font-medium">{project?.name || 'N/A'}</td>
                        <td className="text-gray-300">{task?.title || 'N/A'}</td>
                        <td className="text-white font-semibold">{entry.hours.toFixed(1)}h</td>
                        <td>
                          <span className={`status-badge ${entry.status === 'Approved' ? 'status-active' : 'status-pending'}`}>{entry.status}</span>
                        </td>
                        <td>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-white/10" onClick={() => handleEdit(entry)}><Edit className="w-4 h-4" /></Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:bg-red-500/20 hover:text-red-400" onClick={() => handleDelete(entry)}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </td>
                      </motion.tr>
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

export default TimesheetsPage;
