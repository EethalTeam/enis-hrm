import React, { useState , useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Briefcase, Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { config } from '@/components/CustomComponents/config';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { apiRequest } from '@/components/CustomComponents/apiRequest'

const DesignationForm = ({ open, setOpen, designation, getDesignation }) => {
  const { departments } = useData();
  const [formData, setFormData] = useState(
    designation || { designationName: '', department: '',departmentId:'',_id:'' }
  );
  useEffect(()=>{
if(designation){
  getDepartmentList()
}
  },[designation])
  // const [state, dispatch] = useReducer(Reducer, initialState);
  const [Designation, setDesignation] = useState([])
  const [isEdit, setIsEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [Department, setDepartment] = useState([])
  const [Data, SetData] = useState([])
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (id, name, key, value) => {
    if (key && name) {
      setFormData(prev => ({ ...prev, [id]: key }))
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if(formData._id){
      updateDesignation(formData)
    }else{
      createDesignation(formData)
    }
    setOpen(false);
  };
    const createDesignation = async (data) => {
      try {
        const res = await apiRequest("Designation/createDesignation", {
          method: 'POST',
          body: JSON.stringify(data),
        });
        getDesignation()
        return res;
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    };
   const updateDesignation = async(data)=>{
 try {
      const res = await apiRequest("Designation/updateDesignation", {
        method: 'POST',
        body: JSON.stringify(data),
      });
   getDesignation()
      return res;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
   }
     const getDepartmentList = async () => {
    try {
      const res = await apiRequest("Employee/getAllDepartments/", {
        method: 'POST',
        body: JSON.stringify({}),
      });
      SetData(res)
      // setState(result)
      // setFilteredData(result)
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="glass-effect border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>{designation ? 'Edit Designation' : 'Add New Designation'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="designationName">Designation Name</Label>
            <Input id="designationName" name="designationName" value={formData.designationName} onChange={handleChange} required className="bg-white/5" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300">Department</label>
                            <Select
              name="department"
              value={formData.departmentId} // store only _id
              onOpenChange={async (open) => {
                if (open && (!Data || Data.length === 0)) {
                  await getDepartmentList();
                }
              }}
              onValueChange={(id) => {
                if (!id) return;
                const dept = Data.find(d => d._id === id);
                if (dept) {
                  handleSelectChange('departmentId', 'department', dept._id || formData.departmentId, dept.departmentName || formData.department);
                }
              }}
              required
            >
              <SelectTrigger className="glass-effect border-white/10">
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent className="glass-effect border-white/10 text-white">
                {(Data || []).map((dept) => (
                  <SelectItem key={dept._id} value={dept._id} className="hover:bg-white/10">
                    {dept.departmentName}
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

const DesignationsPage = () => {
  const { designations, addDesignation, updateDesignation } = useData();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedDesig, setSelectedDesig] = useState(null);
  const [Designation,setDesignation]= useState([])
  const [Data,SetData] = useState([])

  const handleAddNew = () => {
    setSelectedDesig(null);
    setIsFormOpen(true);
  };
  let api=false
useEffect(()=>{
  if(Designation.length === 0 && !api){
getDesignation()
api=true
  }
}),[Designation]
  const getDesignation = async () => {
    try {
      const res = await apiRequest("Designation/getAllDesignation", {
        method: 'POST',
        body: JSON.stringify({}),
      });
      setDesignation(res)
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
  const deleteDesignation = async(id)=>{
    try {
      const res = await apiRequest("Designation/deleteDesignation", {
        method: 'POST',
        body: JSON.stringify({_id:id}),
      });

      getDesignation();
      return res;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
  const handleEdit = (Designation) => {
    const designation={_id:Designation._id,designationName:Designation.designationName,departmentId:Designation.departmentId._id,department:Designation.departmentId.departmentName}
    setSelectedDesig(designation);
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    setSelectedDesig(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    deleteDesignation(selectedDesig);
    toast({ title: "Designation Deleted" });
    setIsConfirmOpen(false);
  };

  return (
    <>
      <Helmet>
        <title>Designations - ENIS-HRMS</title>
        <meta name="description" content="Manage company designations." />
      </Helmet>
      <AnimatePresence>
        {isFormOpen && <DesignationForm open={isFormOpen} setOpen={setIsFormOpen} designation={selectedDesig} getDesignation={getDesignation}/>}
      </AnimatePresence>
      <AnimatePresence>
        {isConfirmOpen && <ConfirmationDialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={confirmDelete} title="Delete Designation?" description="This action cannot be undone." />}
      </AnimatePresence>

      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Designations</h1>
            <p className="text-gray-400">Manage your company's designations.</p>
          </div>
          <Button onClick={handleAddNew} className="bg-gradient-to-r from-blue-500 to-purple-600"><Plus className="w-4 h-4 mr-2" />Add Designation</Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Designation List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead><tr><th>Designation Name</th><th>Department</th><th>Actions</th></tr></thead>
                  <tbody>
                    {(Designation || []).map(desig => (
                      <tr key={desig._id}>
                        <td>{desig.designationName}</td>
                        <td>{desig.departmentId.departmentName}</td>
                        <td>
                          <div className="flex gap-2">
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(desig)}><Edit className="w-4 h-4" /></Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400" onClick={() => handleDelete(desig._id)}><Trash2 className="w-4 h-4" /></Button>
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

export default DesignationsPage;
