
import React, { useState, useMemo, useEffect } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { config } from '@/components/CustomComponents/config';
import { apiRequest } from '@/components/CustomComponents/apiRequest'

const ProjectForm = ({ open, setOpen, project, onSave, employees ,getAllProjects}) => {
  const [formData, setFormData] = useState(
    project || {_id:'', projectName: '', status: '',statusId:'', budget: '', startDate: '', endDate: '', assignees: [] }
  );
  const [Data,SetData]= useState([])
  useEffect(()=>{
  if(project){
setFormData({
   _id: project._id,
   projectName: project.projectName,
   status: project.projectStatusId.name,
   statusId: project.projectStatusId._id,
   budget: project.budget,
   startDate: project.startDate.split('T')[0],
   endDate: project.endDate.split('T')[0],
   assignees: project.assignedEmployees.map(val=>val._id)})
}
},[project])
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
 const getProjectStatusList = async () => {
      try {
         SetData([]); // clear Data once
        const response = await apiRequest("ProjectStatus/getAllProjectStatus/", {
          method: 'POST',
          body: JSON.stringify({}),
        });
  
        SetData(response)
        // setState(result)
        // setFilteredData(result)
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    }
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
    const handleSelectAssignee = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

const createProject = async (data) => {
    try {
      const response = await apiRequest("Project/createProject/", {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!response) {
         toast({
            title: 'Project Added',
            description: `${response.message}`,
          });
          return
      }
 toast({
            title: 'Project Added',
            description: `${formData.name} has been added to the system.`,
          });
    setOpen(false);
      SetData([])
      getAllProjects()
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
    const updateProject = async (data) => {
    try {
      const response = await apiRequest("Project/updateProject/", {
        method: 'POST',
        body: JSON.stringify(data),
      });

    setOpen(false);
      SetData([])
      getAllProjects()
      // setFilteredData(result)
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
  const handleSubmit = (e) => {
    e.preventDefault();
    // onSave({
    //   ...formData,
    //   budget: parseFloat(formData.budget),
    //   teamSize: formData.assignees.length,
    // });
     if (formData._id) {
          updateProject({ ...formData,
      budget: parseFloat(formData.budget),
      teamSize: formData.assignees.length});
          toast({
            title: 'Project Updated',
            description: "Project has been updated successfully.",
          });
        } else {
          createProject({ ...formData,
      budget: parseFloat(formData.budget),
      teamSize: formData.assignees.length});
        }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="glass-effect border-white/10 text-white" style={{ overflowY: 'auto', height: '90vh', scrollbarWidth: 'none' }}>
        <DialogHeader>
          <DialogTitle>{project ? 'Edit Project' : 'Create New Project'}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {project ? 'Update the details for this project.' : 'Provide the details for the new project.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="projectName" className="text-gray-300">Project Name</Label>
            <Input id="projectName" name="projectName" value={formData.projectName} onChange={handleChange} placeholder="e.g., Q4 Marketing Campaign" required className="bg-white/5 border-white/10" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status" className="text-gray-300">Status</Label>
              <Select
                                            name="status"
                                            value={formData.statusId} // store only _id
                                            onOpenChange={async (open) => {
                                              if (open && (!Data || Data.length === 0)) {
                                                await getProjectStatusList();
                                              }
                                            }}
                                            onValueChange={(id) => {
                                              if (!id) return;
                                              const dept = Data.find(d => d._id === id);
                                              if (dept) {
                                                handleSelectChange('statusId', 'status', dept._id, dept.name);
                                              }
                                            }}
                                            // required
                                          >
                                            <SelectTrigger className="glass-effect border-white/10">
                                              <SelectValue placeholder="Select Status" >
                                                {formData.status}
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
              <Label htmlFor="budget" className="text-gray-300">Budget (₹)</Label>
              <Input id="budget" name="budget" type="number" value={formData.budget} onChange={handleChange} placeholder="e.g., 50000" required className="bg-white/5 border-white/10" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
              <Label htmlFor="startDate" className="text-gray-300">Start Date</Label>
              <Input id="startDate" name="startDate" type="date" value={formData.startDate} onChange={handleChange} required className="bg-white/5 border-white/10 text-white [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-100" />
            </div>
             <div>
              <Label htmlFor="endDate" className="text-gray-300">End Date</Label>
              <Input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleChange} required className="bg-white/5 border-white/10 text-white [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-100" />
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
                onChange={(e) => handleSelectAssignee('assignees', Array.from(e.target.selectedOptions, option => option.value))}
                className="w-full h-32 glass-effect border-white/10 rounded-md bg-transparent p-2"
              >
                  {employees.map(emp => (
                      <option key={emp._id} value={emp._id} className="bg-slate-800 p-1">{emp.name}</option>
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
  const [Projects,setProjects]=useState([])
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [Employees,setEmployees]=useState([])

  const filteredProjects = useMemo(() => Projects.filter(p => {
    const matchesSearch = p.projectName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [Projects, searchTerm, statusFilter]);
    useEffect(()=>{
    getEmployeeList()
    getAllProjects()
  },[])
    const getAllProjects = async () => {
      try {
        const response = await apiRequest("Project/getAllProjects/", {
          method: 'POST',
          body: JSON.stringify({}),
        });
  
        setProjects(response)
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    }
  const getEmployeeList = async () => {
      try {
        const response = await apiRequest("Employee/getAllEmployees/", {
          method: 'POST',
          body: JSON.stringify({}),
        });
  
        setEmployees(response)
        // setState(result)
        // setFilteredData(result)
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    }

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
    toast({ title: "Project Deleted", description: `"${selectedProject.projectName}" has been deleted.` });
    setIsConfirmOpen(false);
    setSelectedProject(null);
  };

  const handleSave = (projectData) => {
    if (selectedProject) {
      updateProject({ ...projectData, id: selectedProject.id });
      toast({ title: "Project Updated", description: `"${projectData.projectName}" has been updated.` });
    } else {
      addProject(projectData);
      toast({ title: "Project Created", description: `"${projectData.projectName}" has been created.` });
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
        {isFormOpen && <ProjectForm open={isFormOpen} setOpen={setIsFormOpen} project={selectedProject} onSave={handleSave} employees={Employees} getAllProjects={getAllProjects}/>}
      </AnimatePresence>
      
      {isConfirmOpen && <ConfirmationDialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={confirmDelete} title={`Delete Project: ${selectedProject.projectName}`} description="This will delete the project and all associated tasks. This action is irreversible."/>}

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
                      <CardTitle className="text-white text-lg">{project.projectName}</CardTitle>
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
                      <p className="text-white font-medium">{new Date(project.startDate.split('T')[0]).toLocaleDateString()} - {new Date(project.endDate.split('T')[0]).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Budget</p>
                      <p className="text-white font-medium">${project.budget  }</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Team</p>
                      <div className="flex -space-x-2">
                        {project.assignedEmployees.map(empId => Employees.find(e => e._id === empId._id)).filter(Boolean).slice(0, 5).map(emp => (
                          // <img key={emp.id} src={emp.avatar} alt={emp.name} className="w-8 h-8 rounded-full border-2 border-slate-700"/>
                            <Avatar className="w-8 h-8">
                                            <AvatarImage src={emp?.avatar} alt={emp?.name} />
                                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                                              {emp.name?.split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                          </Avatar>
                        ))}
                         {project.teamSize > 5 && <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold border-2 border-slate-700">+{project.teamSize - 5}</div>}
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm text-gray-400 mb-1"><span>Progress</span><span>{project.progress || 0}%</span></div>
                      <div className="w-full bg-slate-700 rounded-full h-2.5">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full" style={{ width: `${project.progress || 0}%` }}></div>
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
