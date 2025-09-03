import React, { useState ,useEffect} from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Clock, Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { config } from '@/components/CustomComponents/config';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ConfirmationDialog from '@/components/ConfirmationDialog';

const ShiftForm = ({ open, setOpen, shift, onSave, getShift  }) => {
  const [formData, setFormData] = useState(
    shift || { shiftName: '', startTime: '', endTime: '', hourlyRate: '',totalHours:'' }
  );
   useEffect(() => {
    // Only calculate if both times exist
    if (!formData.startTime || !formData.endTime) return;

    const calculateHours = (startTime, endTime) => {
      const [sh, sm] = startTime.split(":").map(Number);
      const [eh, em] = endTime.split(":").map(Number);

      let startMinutes = sh * 60 + sm;
      let endMinutes = eh * 60 + em;

      // handle overnight shifts
      if (endMinutes < startMinutes) {
        endMinutes += 24 * 60; // add 24 hours
      }

      const totalMinutes = endMinutes - startMinutes;
      return totalMinutes / 60; // return as decimal hours
    };


    const result = calculateHours(formData.startTime, formData.endTime);
    setFormData(prev => ({ ...prev, totalHours: result }));
  }, [formData.startTime, formData.endTime]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    createShift(formData)
    setOpen(false);
  };
    const createShift = async (data) => {
      try {
        let url = config.Api + "Shift/createShift";
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          throw new Error('Failed to create Shift');
        }
        const result = await response.json();
        getShift()
        return result;
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="glass-effect border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>{shift ? 'Edit Shift' : 'Add New Shift'}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {shift ? 'Update the details for this shift.' : 'Create a new work shift for your organization.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="shiftName" className="text-gray-300">Shift Name</Label>
            <Input id="shiftName" name="shiftName" value={formData.shiftName} onChange={handleChange} placeholder="e.g., Morning Shift" required className="bg-white/5 border-white/10" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime" className="text-gray-300">Start Time</Label>
              <Input id="startTime" name="startTime" type="time" value={formData.startTime} onChange={handleChange} required className="bg-white/5 border-white/10" />
            </div>
            <div>
              <Label htmlFor="endTime" className="text-gray-300">End Time</Label>
              <Input id="endTime" name="endTime" type="time" value={formData.endTime} onChange={handleChange} required className="bg-white/5 border-white/10" />
            </div>
          </div>
          <div>
            <Label htmlFor="hourlyRate" className="text-gray-300">Hourly Rate ($)</Label>
            <Input id="hourlyRate" name="hourlyRate" type="number" value={formData.hourlyRate} onChange={handleChange} placeholder="e.g., 25.50" required className="bg-white/5 border-white/10" />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="border-white/10 hover:bg-white/10">Cancel</Button>
            </DialogClose>
            <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600">Save Shift</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};


const ShiftsPage = () => {
  const { shifts, addShift, updateShift, deleteShift } = useData();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [Shift,setShift]= useState([])

  const handleAddNew = () => {
    setSelectedShift(null);
    setIsFormOpen(true);
  };
useEffect(()=>{
  if(Shift.length === 0){
getShift()
  }
}),[Shift]
  const getShift = async () => {
    try {
      let url = config.Api + "Shift/getAllShifts";
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error('Failed to get Shift');
      }
      const result = await response.json();
      setShift(result)
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
  const handleEdit = (shift) => {
    setSelectedShift(shift);
    setIsFormOpen(true);
  };

  const handleDelete = (shift) => {
    setSelectedShift(shift);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    deleteShift(selectedShift.id);
    toast({
      title: "Shift Deleted",
      description: `The shift "${selectedShift.shiftName}" has been successfully deleted.`,
    });
    setIsConfirmOpen(false);
    setSelectedShift(null);
  };

  const handleSave = (shiftData) => {
    const dataToSave = {
        ...shiftData,
        hourlyRate: parseFloat(shiftData.hourlyRate),
        color: shiftData.color || 'bg-gray-500' 
    };

    if (selectedShift) {
      updateShift({ ...dataToSave, id: selectedShift.id });
      toast({
        title: "Shift Updated",
        description: `The shift "${dataToSave.shiftName}" has been successfully updated.`,
      });
    } else {
      addShift(dataToSave);
      toast({
        title: "Shift Added",
        description: `The shift "${dataToSave.shiftName}" has been successfully created.`,
      });
    }
  };


  return (
    <>
      <Helmet>
        <title>Shift Management - ENIS-HRMS</title>
        <meta name="description" content="Manage employee work shifts, schedules, and assignments." />
        <meta property="og:title" content="Shift Management - ENIS-HRMS" />
        <meta property="og:description" content="Efficiently create, edit, and assign work shifts to streamline workforce management." />
      </Helmet>

      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Shift Management</h1>
            <p className="text-gray-400">Define and manage work shifts for your organization</p>
          </div>
          <Button 
            onClick={handleAddNew}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Shift
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Available Shifts
              </CardTitle>
              <CardDescription className="text-gray-400">
                A list of all defined work shifts in your organization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Shift Name</th>
                      <th>Time</th>
                      <th>Hourly Rate</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Shift.length > 0 && Shift.map((shift, index) => (
                      <motion.tr
                        key={shift.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <td>
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-white">{shift.shiftName}</span>
                          </div>
                        </td>
                        <td className="text-gray-300">
                          {shift.endTime ? `${shift.startTime} - ${shift.endTime}` : shift.startTime}
                        </td>
                        <td className="text-cyan-400">${typeof shift.hourlyRate === 'number' ? shift.hourlyRate.toFixed(2) : 'N/A'}</td>
                        <td>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(shift)}
                              className="border-white/10 hover:bg-white/10"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(shift)}
                              className="bg-red-500/10 text-red-400 border-red-400/20 hover:bg-red-500/20"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {isFormOpen && (
        <ShiftForm
          open={isFormOpen}
          setOpen={setIsFormOpen}
          shift={selectedShift}
          onSave={handleSave}
          getShift={getShift}
        />
      )}

      {isConfirmOpen && selectedShift && (
        <ConfirmationDialog
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={confirmDelete}
          title={`Delete Shift: ${selectedShift.shiftName}`}
          description="Are you sure you want to delete this shift? This action cannot be undone."
        />
      )}
    </>
  );
};

export default ShiftsPage;