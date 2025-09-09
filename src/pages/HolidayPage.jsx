import React, { useState , useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Building, Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { config } from '@/components/CustomComponents/config';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/components/CustomComponents/apiRequest'

const HolidayForm = ({ open, setOpen, holiday,getHoliday }) => {
    const { user } = useAuth();
  const [formData, setFormData] = useState(
    { holidayName: '',date:'',type:'Full-day',createdBy:user._id,_id:''}
  );
  console.log(formData,"formData")
    useEffect(()=>{
    if(holiday){
    setFormData({
       _id: holiday._id,
       holidayName: holiday.holidayName,
       date: holiday.date.split('T')[0]
      })
    }
    },[holiday])
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if(formData._id){
      updateHoliday(formData)
    }else{
      createHoliday(formData)
    }
    setOpen(false);
  };
    const createHoliday = async (data) => {
      try {
        let url = config.Api + "Holiday/createHoliday";
         const response = await apiRequest("Holiday/createHoliday/", {
          method: 'POST',
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          throw new Error('Failed to create Holiday');
        }
        // const result = await response.json();
        getHoliday()
        return response;
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    };
   const updateHoliday = async(data)=>{
 try {
      let url = config.Api + "Holiday/updateHoliday";
      const response = await apiRequest("Holiday/updateHoliday/", {
          method: 'POST',
          body: JSON.stringify(data),
        });
   getHoliday()
    //   const result = await response.json();
      return response;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
   }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="glass-effect border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>{holiday ? 'Edit Holiday' : 'Add New Holiday'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="holidayName">Holiday</Label>
            <Input id="holidayName" name="holidayName" value={formData.holidayName} onChange={handleChange} required className="bg-white/5" />
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" name="date" value={formData.date} onChange={handleChange} className="bg-white/5 text-white [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-100" />
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

const HolidayPage = () => {
  const { holiday, addHoliday, updateHoliday } = useData();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [Holiday,setHoliday]= useState([])
console.log(Holiday,"Holiday")
  const handleAddNew = () => {
    setSelectedHoliday(null);
    setIsFormOpen(true);
  };
  let api=false
useEffect(()=>{
  if(Holiday.length === 0 && !api){
getHoliday()
api=true
  }
}),[Holiday]
  const getHoliday = async () => {
    try {
      let url = config.Api + "Holiday/getAllHoliday";
const response = await apiRequest("Holiday/getAllHolidays/", {
          method: 'POST',
          body: JSON.stringify({}),
        });
      console.log(response,"response")
    //   const result = await response.json();
      setHoliday(response)
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
  const deleteHoliday = async(id)=>{
    try {
      let url = config.Api + "Holiday/deleteHoliday";
      const response = await apiRequest("Holiday/deleteHoliday/", {
          method: 'POST',
          body: JSON.stringify({_id:id}),
        });
      if (!response.ok) {
        throw new Error('Failed to delete Holiday');
      }

      const result = await response.json();
      getHoliday();
      return result;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
  const handleEdit = (Holiday) => {
    setSelectedHoliday(Holiday);
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    setSelectedHoliday(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    deleteHoliday(selectedHoliday);
    toast({ title: "Holiday Deleted" });
    setIsConfirmOpen(false);
  };

  return (
    <>
      <Helmet>
        <title>Holiday - ENIS-HRMS</title>
        <meta name="description" content="Manage company holiday." />
      </Helmet>
      <AnimatePresence>
        {isFormOpen && <HolidayForm open={isFormOpen} setOpen={setIsFormOpen} holiday={selectedHoliday} getHoliday={getHoliday}/>}
      </AnimatePresence>
      <AnimatePresence>
        {isConfirmOpen && <ConfirmationDialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={confirmDelete} title="Delete Holiday?" description="This action cannot be undone." />}
      </AnimatePresence>

      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Holiday</h1>
            <p className="text-gray-400">Manage your company's holiday.</p>
          </div>
          <Button onClick={handleAddNew} className="bg-gradient-to-r from-blue-500 to-purple-600"><Plus className="w-4 h-4 mr-2" />Add Holiday</Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Holiday List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead><tr><th>Holiday</th><th>Actions</th></tr></thead>
                  <tbody>
                    {(Holiday || []).map(holid => (
                      <tr key={holid._id}>
                        <td>{holid.holidayName}</td>
                        <td>
                          <div className="flex gap-2">
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(holid)}><Edit className="w-4 h-4" /></Button>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400" onClick={() => handleDelete(holid._id)}><Trash2 className="w-4 h-4" /></Button>
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

export default HolidayPage;