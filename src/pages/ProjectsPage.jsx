
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { FolderKanban, Plus, Search, Filter, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ProjectForm = ({ open, setOpen, project, onSave }) => {
  const { employees } = useData();
  const [formData, setFormData] = useState(
    project || { name: '', status: 'Planning', budget: '', startDate: '', endDate: '', assignees: [] }
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
    onSave({
      ...formData,
      budget: parseFloat(formData.budget),
      teamSize: formData.assignees.length,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="glass-effect border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>{project ? 'Edit Project' : 'Create New Project'}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {project ? 'Update the details for this project.' : 'Provide the details for the new project.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="name" className="text-gray-300">Project Name</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Q4 Marketing Campaign" required className="bg-white/5 border-white/10" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status" className="text-gray-300">Status</Label>
              <Select name="status" value={formData.status} onValueChange={(v) => handleSelectChange('status', v)}>
                <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent className="glass-effect border-white/10 text-white">
                  <SelectItem value="Planning">Planning</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="budget" className="text-gray-300">Budget ($)</Label>
              <Input id="budget" name="budget" type="number" value={formData.budget} onChange={handleChange} placeholder="e.g., 50000" required className="bg-white/5 border-white/10" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
              <Label htmlFor="startDate" className="text-gray-300">Start Date</Label>
              <Input id="startDate" name="startDate" type="date" value={formData.startDate} onChange={handleChange} required className="bg-white/5 border-white/10" />
            </div>
             <div>
              <Label htmlFor="endDate" className="text-gray-300">End Date</Label>
              <Input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleChange} required className="bg-white/5 border-white/10" />
            </div>
          </div>
           <div>
              <Label htmlFor="assignees" className="text-gray-300">Assign Team</Label>
              <p className="text-gray-400 text-xs mb-2">Ctrl/Cmd + click to select multiple.</p>
              <select
                id="assignees"
                name="assignees"
                multiple
                value={formData.assignees}
                onChange={(e) => handleSelectChange('assignees', Array.from(e.target.selectedOptions, option => option.value))}
                className="w-full h-32 glass-effect border-white/10 rounded-md bg-transparent p-2"
              >
                  {employees.map(emp => (
                      <option key={emp.id} value={emp.id} className="bg-slate-800 p-1">{emp.name}</option>
                  ))}
              </select>
            </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline" className="border-white/10 hover:bg-white/10">Cancel</Button></DialogClose>
            <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600">Save Project</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};


const ProjectsPage = () => {
  const { projects, employees, addProject, updateProject, deleteProject } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const filteredProjects = useMemo(() => projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [projects, searchTerm, statusFilter]);
  
  const handleAddNew = () => {
    setSelectedProject(null);
    setIsFormOpen(true);
  };
  
  const handleEdit = (project) => {
    setSelectedProject(project);
    setIsFormOpen(true);
  };

  const handleDelete = (project) => {
    setSelectedProject(project);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    deleteProject(selectedProject.id);
    toast({ title: "Project Deleted", description: `"${selectedProject.name}" has been deleted.` });
    setIsConfirmOpen(false);
    setSelectedProject(null);
  };

  const handleSave = (projectData) => {
    if (selectedProject) {
      updateProject({ ...projectData, id: selectedProject.id });
      toast({ title: "Project Updated", description: `"${projectData.name}" has been updated.` });
    } else {
      addProject(projectData);
      toast({ title: "Project Created", description: `"${projectData.name}" has been created.` });
    }
  };

  const getStatusColor = (status) => ({
    "In Progress": "text-blue-400 border-blue-400/50 bg-blue-400/10",
    "Completed": "text-green-400 border-green-400/50 bg-green-400/10",
    "Planning": "text-yellow-400 border-yellow-400/50 bg-yellow-400/10",
    "On Hold": "text-gray-400 border-gray-400/50 bg-gray-400/10",
  }[status] || "text-gray-400 border-gray-400/50 bg-gray-400/10");

  return (
    <>
      <Helmet>
        <title>Projects - ENIS-HRMS</title>
        <meta name="description" content="Manage all company projects from a centralized dashboard." />
      </Helmet>

      <AnimatePresence>
        {isFormOpen && <ProjectForm open={isFormOpen} setOpen={setIsFormOpen} project={selectedProject} onSave={handleSave} />}
      </AnimatePresence>
      
      {isConfirmOpen && <ConfirmationDialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={confirmDelete} title={`Delete Project: ${selectedProject.name}`} description="This will delete the project and all associated tasks. This action is irreversible."/>}

      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Projects</h1>
            <p className="text-gray-400">Oversee all ongoing and completed company projects.</p>
          </div>
          <Button onClick={handleAddNew} className="bg-gradient-to-r from-blue-500 to-purple-600"><Plus className="w-4 h-4 mr-2"/>New Project</Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Card className="glass-effect border-white/10">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Search projects..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 glass-effect" />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px] glass-effect"><SelectValue /></SelectTrigger>
                  <SelectContent className="glass-effect border-white/10">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Planning">Planning</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <motion.div key={project.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
              <Card className="glass-effect h-full flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white text-lg">{project.name}</CardTitle>
                      <CardDescription className={`text-xs font-semibold px-2 py-1 rounded-full inline-block mt-2 ${getStatusColor(project.status)}`}>{project.status}</CardDescription>
                    </div>
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass-effect">
                        <DropdownMenuItem onClick={() => handleEdit(project)} className="hover:bg-white/10"><Edit className="w-4 h-4 mr-2"/>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(project)} className="text-red-400 hover:!text-red-400 hover:!bg-red-500/20"><Trash2 className="w-4 h-4 mr-2"/>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-400">Timeline</p>
                      <p className="text-white font-medium">{new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Budget</p>
                      <p className="text-white font-medium">${project.budget.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Team</p>
                      <div className="flex -space-x-2">
                        {project.assignees.map(empId => employees.find(e => e.id === empId)).filter(Boolean).slice(0, 5).map(emp => (
                          <img key={emp.id} src={emp.avatar} alt={emp.name} className="w-8 h-8 rounded-full border-2 border-slate-700"/>
                        ))}
                         {project.teamSize > 5 && <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold border-2 border-slate-700">+{project.teamSize - 5}</div>}
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm text-gray-400 mb-1"><span>Progress</span><span>{project.progress}%</span></div>
                      <div className="w-full bg-slate-700 rounded-full h-2.5">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </>
  );
};

export default ProjectsPage;
