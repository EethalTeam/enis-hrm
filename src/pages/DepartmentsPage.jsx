import React, { useState , useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Building, Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { config } from '@/components/CustomComponents/config';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ConfirmationDialog from '@/components/ConfirmationDialog';

const DepartmentForm = ({ open, setOpen, department, getDepartment }) => {
  const [formData, setFormData] = useState(
    department || { departmentName: '', employee:'', departmentHead: '',_id:'' }
  );
    const [Data,SetData] = useState([])

    useEffect(()=>{
     if(department){
      setFormData({
        departmentName: department.departmentName, employee:department.departmentHead?.name || '', departmentHead: department.departmentHead?._id || '',_id:department._id
      })
     }
    },[])
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if(formData._id){
      updateDepartment(formData)
    }else{
      createDepartment(formData)
    }
    setOpen(false);
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
  
    const createDepartment = async (data) => {
      try {
        let url = config.Api + "Department/createDepartment";
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          throw new Error('Failed to create Department');
        }
        const result = await response.json();
        getDepartment()
        return result;
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    };
   const updateDepartment = async(data)=>{
 try {
      let url = config.Api + "Department/updateDepartment";
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update Department');
      }
   getDepartment()
      const result = await response.json();
      return result;
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
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="glass-effect border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>{department ? 'Edit Department' : 'Add New Department'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="departmentName">Department Name</Label>
            <Input id="departmentName" name="departmentName" value={formData.departmentName} onChange={handleChange} required className="bg-white/5" />
          </div>
          <div>
            <Label htmlFor="head">Department Head</Label>
             <Select
                                          name="employee"
                                          value={formData.departmentHead} // store only _id
                                          onOpenChange={async (open) => {
                                            if (open && (!Data || Data.length === 0)) {
                                              await getEmployeeList();
                                            }
                                          }}
                                          onValueChange={(id) => {
                                            if (!id) return;
                                            const dept = Data.find(d => d._id === id);
                                            if (dept) {
                                              handleSelectChange('departmentHead', 'employee', dept._id, dept.name);
                                            }
                                          }}
                                          // required
                                        >
                                          <SelectTrigger className="glass-effect border-white/10">
                                            <SelectValue placeholder="Select Employee" >
                                              {formData.employee}
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
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
            <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const DepartmentsPage = () => {
  const { departments, addDepartment, updateDepartment } = useData();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [Department,setDepartment]= useState([])

  const handleAddNew = () => {
    setSelectedDept(null);
    setIsFormOpen(true);
  };
  let api=false
useEffect(()=>{
  if(Department.length === 0 && !api){
getDepartment()
api=true
  }
}),[Department]
  const getDepartment = async () => {
    try {
      let url = config.Api + "Department/getAllDepartments";
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error('Failed to get department');
      }
      const result = await response.json();
      setDepartment(result)
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
  const deleteDepartment = async(id)=>{
    try {
      let url = config.Api + "Department/deleteDepartment";
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({_id:id}),
      });

      if (!response.ok) {
        throw new Error('Failed to delete Department');
      }

      const result = await response.json();
      getDepartment();
      return result;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
  const handleEdit = (Department) => {
    setSelectedDept(Department);
    setIsFormOpen(true);
  };

  const handleDelete = (dept) => {
    setSelectedDept(dept);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    deleteDepartment(selectedDept);
    toast({ title: "Department Deleted" });
    setIsConfirmOpen(false);
  };

  return (
    <>
      <Helmet>
        <title>Departments - ENIS-HRMS</title>
        <meta name="description" content="Manage company departments." />
      </Helmet>
      <AnimatePresence>
        {isFormOpen && <DepartmentForm open={isFormOpen} setOpen={setIsFormOpen} department={selectedDept} getDepartment={getDepartment} />}
      </AnimatePresence>
      <AnimatePresence>
        {isConfirmOpen && <ConfirmationDialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={confirmDelete} title="Delete Department?" description="This action cannot be undone." />}
      </AnimatePresence>

      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Departments</h1>
            <p className="text-gray-400">Manage your company's departments.</p>
          </div>
          <Button onClick={handleAddNew} className="bg-gradient-to-r from-blue-500 to-purple-600"><Plus className="w-4 h-4 mr-2" />Add Department</Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Department List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead><tr><th>Department Name</th><th>Department Head</th><th>Actions</th></tr></thead>
                  <tbody>
                    {(Department || []).map(dept => (
                      <tr key={dept.id}>
                        <td>{dept.departmentName}</td>
                        <td>{dept.departmentHead.name}</td>
                        <td>
                          <div className="flex gap-2">
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(dept)}><Edit className="w-4 h-4" /></Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400" onClick={() => handleDelete(dept._id)}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
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

export default DepartmentsPage;
