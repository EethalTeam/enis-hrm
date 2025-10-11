import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { TrendingUp, TrendingDown, Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ConfirmationDialog from '@/components/ConfirmationDialog';

const PayrollComponentForm = ({ open, setOpen, component, onSave, componentType }) => {
  const [formData, setFormData] = useState(
    component || { name: '', type: 'fixed', value: '' }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value) => {
    setFormData(prev => ({ ...prev, type: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setOpen(false);
  };
  
  const title = `${component ? 'Edit' : 'Add'} ${componentType === 'earnings' ? 'Earning' : 'Deduction'}`;
  const description = `Manage payroll ${componentType}.`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="glass-effect border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-gray-400">{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="name" className="text-gray-300">Component Name</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Basic Salary" required className="bg-white/5 border-white/10" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type" className="text-gray-300">Type</Label>
              <Select name="type" value={formData.type} onValueChange={handleSelectChange}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="glass-effect border-white/10 text-white">
                  <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="value" className="text-gray-300">Value</Label>
              <Input id="value" name="value" type="number" value={formData.value} onChange={handleChange} placeholder="e.g., 500 or 50" required className="bg-white/5 border-white/10" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="border-white/10 hover:bg-white/10">Cancel</Button>
            </DialogClose>
            <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600">Save Component</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const PayrollComponentCard = ({ title, icon: Icon, data, onAddNew, onEdit, onDelete, componentType }) => (
  <Card className="glass-effect border-white/10">
    <CardHeader className="flex flex-row items-center justify-between">
      <div className="flex items-center gap-3">
        <Icon className={`w-6 h-6 ${componentType === 'earnings' ? 'text-green-400' : 'text-red-400'}`} />
        <CardTitle className="text-white text-xl">{title}</CardTitle>
      </div>
      <Button size="sm" onClick={onAddNew} className="bg-white/10 hover:bg-white/20">
        <Plus className="w-4 h-4 mr-2" />
        Add New
      </Button>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {data.map(item => (
          <div key={item.id} className="flex justify-between items-center p-3 rounded-lg bg-white/5">
            <div>
              <p className="font-medium text-white">{item.name}</p>
              <p className="text-sm text-gray-400">
                {item.type === 'percentage' ? `${item.value}% of salary` : `₹${item.value} (fixed)`}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" onClick={() => onEdit(item)} className="h-8 w-8 hover:bg-white/10"><Edit className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => onDelete(item)} className="h-8 w-8 hover:bg-red-500/20 text-red-400"><Trash2 className="w-4 h-4" /></Button>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const PayrollSettingsPage = () => {
  const { earnings, deductions, addPayrollComponent, updatePayrollComponent, deletePayrollComponent } = useData();
  const { toast } = useToast();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [componentType, setComponentType] = useState('earnings'); // 'earnings' or 'deductions'

  const handleAddNew = (type) => {
    setComponentType(type);
    setSelectedComponent(null);
    setIsFormOpen(true);
  };

  const handleEdit = (type, component) => {
    setComponentType(type);
    setSelectedComponent(component);
    setIsFormOpen(true);
  };
  
  const handleDelete = (type, component) => {
    setComponentType(type);
    setSelectedComponent(component);
    setIsConfirmOpen(true);
  };
  
  const confirmDelete = () => {
    deletePayrollComponent(componentType, selectedComponent.id);
    toast({
      title: "Component Deleted",
      description: `The ${componentType.slice(0, -1)} "${selectedComponent.name}" has been deleted.`
    });
    setIsConfirmOpen(false);
    setSelectedComponent(null);
  };
  
  const handleSave = (componentData) => {
    const dataToSave = { ...componentData, value: parseFloat(componentData.value) };
    if (selectedComponent) {
      updatePayrollComponent(componentType, { ...dataToSave, id: selectedComponent.id });
      toast({
        title: "Component Updated",
        description: `The ${componentType.slice(0, -1)} "${dataToSave.name}" has been updated.`
      });
    } else {
      addPayrollComponent(componentType, dataToSave);
      toast({
        title: "Component Added",
        description: `The ${componentType.slice(0, -1)} "${dataToSave.name}" has been created.`
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Payroll Settings - ENIS-HRMS</title>
        <meta name="description" content="Manage payroll masters including earnings and deductions." />
      </Helmet>

      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">Payroll Settings</h1>
          <p className="text-gray-400">Manage payroll masters for earnings and deductions.</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <PayrollComponentCard 
              title="Earnings"
              icon={TrendingUp}
              data={earnings}
              onAddNew={() => handleAddNew('earnings')}
              onEdit={(item) => handleEdit('earnings', item)}
              onDelete={(item) => handleDelete('earnings', item)}
              componentType="earnings"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <PayrollComponentCard 
              title="Deductions"
              icon={TrendingDown}
              data={deductions}
              onAddNew={() => handleAddNew('deductions')}
              onEdit={(item) => handleEdit('deductions', item)}
              onDelete={(item) => handleDelete('deductions', item)}
              componentType="deductions"
            />
          </motion.div>
        </div>
      </div>
      
      {isFormOpen && (
        <PayrollComponentForm
          open={isFormOpen}
          setOpen={setIsFormOpen}
          component={selectedComponent}
          onSave={handleSave}
          componentType={componentType}
        />
      )}
      
      {isConfirmOpen && selectedComponent && (
        <ConfirmationDialog
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={confirmDelete}
          title={`Delete ${selectedComponent.name}`}
          description={`Are you sure you want to delete this ${componentType.slice(0,-1)}? This will affect all future payroll calculations.`}
        />
      )}
    </>
  );
};

export default PayrollSettingsPage;