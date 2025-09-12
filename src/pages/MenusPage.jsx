import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Plus, Search, Filter, MoreHorizontal, Phone, Mail, Edit, Trash2, Menu as MenuIcon, IndianRupee, Globe, Users, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { config } from '@/components/CustomComponents/config';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/components/CustomComponents/apiRequest'

const MenuForm = ({ open, setOpen, menu, onSave, getAllMenus }) => {
  const { user } = useAuth();
  const { menus } = useData();
  const [formData, setFormData] = useState(
    menu || {
      _id: '', 
      label: '', 
      id: '', 
      path: '', 
      icon: '', 
      parentId: '', 
      parent: '',
      order: 0, 
      isActive: true
    }
  );
  const [Data, SetData] = useState([]);
  useEffect(() => {
    if (menu) {
      setFormData({
        _id: menu._id,
        label: menu.label,
        id: menu.id,
        path: menu.path,
        icon: menu.icon,
        parentId: menu.parentId?._id || '',
        parent: menu.parentId?.label || '',
        order: menu.order,
        isActive: menu.isActive
      });
    }
  }, [menu]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
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

  const getParentMenuList = async () => {
    try {
      SetData([]); // clear Data once
      const response = await apiRequest("Menu/getAllMenus/", {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const filteredMenus = response.data.filter(m => m.parentId === null);

      SetData(filteredMenus);
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  const createMenu = async (data) => {
    try {
      const response = await apiRequest("Menu/createMenu/", {
        method: 'POST',
        body: JSON.stringify(data),
      });
      SetData([]);
      getAllMenus();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  const updateMenu = async (data) => {
    try {
      const response = await apiRequest("Menu/updateMenu/", {
        method: 'POST',
        body: JSON.stringify(data),
      });
      SetData([]);
      getAllMenus();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData._id) {
      updateMenu({ 
        ...formData, 
        order: parseInt(formData.order),
        _id: formData._id,
        parentId: formData.parentId || null
      });
      toast({
        title: 'Menu Updated',
        description: "Menu has been updated successfully.",
      });
    } else {
      createMenu({ 
        ...formData, 
        order: parseInt(formData.order),
        parentId: formData.parentId || null
      });
      toast({
        title: 'Menu Added',
        description: `${formData.label} has been added to the system.`,
      });
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="glass-effect border-white/10 text-white max-w-2xl" style={{ overflowY: 'auto', height: '90vh', scrollbarWidth: 'none' }}>
        <DialogHeader>
          <DialogTitle>{menu ? 'Edit Menu' : 'Add New Menu'}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {menu ? 'Update the details for this menu item.' : 'Enter the details for the new menu item.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Label</Label>
              <Input 
                name="label" 
                value={formData.label} 
                onChange={handleChange} 
                placeholder="e.g., Dashboard" 
                required 
                className="bg-white/5" 
                disabled={(user.role !== 'Super Admin' && user.role !== 'Admin')}
              />
            </div>
            <div>
              <Label>Menu ID</Label>
              <Input 
                name="id" 
                value={formData.id} 
                onChange={handleChange} 
                placeholder="e.g., dashboard.main" 
                required 
                className="bg-white/5" 
                disabled={(user.role !== 'Super Admin' && user.role !== 'Admin')}
              />
            </div>
            <div>
              <Label>Path</Label>
              <Input 
                name="path" 
                value={formData.path} 
                onChange={handleChange} 
                placeholder="e.g., /dashboard" 
                required 
                className="bg-white/5" 
                disabled={(user.role !== 'Super Admin' && user.role !== 'Admin')}
              />
            </div>
            <div>
              <Label>Icon</Label>
              <Input 
                name="icon" 
                value={formData.icon} 
                onChange={handleChange} 
                placeholder="e.g., Users" 
                className="bg-white/5" 
                disabled={(user.role !== 'Super Admin' && user.role !== 'Admin')}
              />
            </div>
            <div>
              <Label>Parent Menu</Label>
              <Select
                name="parent"
                value={formData.parentId}
                onOpenChange={async (open) => {
                  if (open && (!Data || Data.length === 0)) {
                    await getParentMenuList();
                  }
                }}
                onValueChange={(id) => {
                  if (id === "none") {
                    handleSelectChange('parentId', 'parent', '', 'None');
                    return;
                  }
                  if (!id) return;
                  const parentMenu = Data.find(d => d._id === id);
                  if (parentMenu) {
                    handleSelectChange('parentId', 'parent', parentMenu._id, parentMenu.label);
                  }
                }}
              >
                <SelectTrigger className="glass-effect border-white/10">
                  <SelectValue placeholder="Select Parent Menu">
                    {formData.parent || 'None'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="glass-effect border-white/10 text-white" style={{ overflowY: 'auto', height: '250px', scrollbarWidth: 'none' }}>
                  <SelectItem value="none" className="hover:bg-white/10">
                    None (Top Level)
                  </SelectItem>
                  {(Data || []).map((parentMenu) => (
                    <SelectItem key={parentMenu._id} value={parentMenu._id} className="hover:bg-white/10">
                      {parentMenu.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Order</Label>
              <Input 
                name="order" 
                type="number" 
                value={formData.order} 
                onChange={handleChange} 
                placeholder="e.g., 1" 
                className="bg-white/5" 
                disabled={(user.role !== 'Super Admin' && user.role !== 'Admin')}
              />
            </div>
            <div className="col-span-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, isActive: checked }))
                  }
                  disabled={(user.role !== 'Super Admin' && user.role !== 'Admin')}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="border-white/10">Cancel</Button>
            </DialogClose>
            <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600">Save Menu</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const MenusPage = () => {
  const { user } = useAuth();
  const { deleteMenu } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [menus, setMenus] = useState([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const filteredMenus = useMemo(() => menus.filter(menu => {
    const matchesSearch = menu.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         menu.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         menu.path.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && menu.isActive) ||
                         (statusFilter === 'inactive' && !menu.isActive);
    return matchesSearch && matchesStatus;
  }), [menus, searchTerm, statusFilter]);

  const handleAddMenu = () => {
    setSelectedMenu(null);
    setIsFormOpen(true);
  };

  useEffect(() => {
    getAllMenus();
  }, []);

  const getAllMenus = async () => {
    try {
       const response = await apiRequest("Menu/getAllMenus/", {
        method: 'POST',
        body: JSON.stringify({ _id: user._id, role: user.role }),
      });
      setMenus(response.data || response);
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  const handleEditMenu = (menu) => {
    setSelectedMenu(menu);
    setIsFormOpen(true);
  };

  const handleDeleteMenu = (menu) => {
    setSelectedMenu(menu);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    deleteMenu(selectedMenu._id);
    toast({ 
      title: "Menu Deleted", 
      description: `"${selectedMenu.label}" has been deleted.` 
    });
    setIsConfirmOpen(false);
    setSelectedMenu(null);
  };

  const handleSaveMenu = (menuData) => {
    if (selectedMenu) {
      updateMenu({ ...menuData, id: selectedMenu.id });
      toast({ 
        title: "Menu Updated", 
        description: `"${menuData.label}" has been updated.` 
      });
    } else {
      createMenu(menuData);
      toast({ 
        title: "Menu Added", 
        description: `"${menuData.label}" has been created.` 
      });
    }
  };

  const getStatusColor = (isActive) => 
    isActive 
      ? 'text-green-400 bg-green-500/20 border-green-500/30'
      : 'text-gray-500 bg-gray-500/20 border-gray-500/30';

  return (
    <>
      <Helmet>
        <title>Menu Management - ENIS-HRMS</title>
        <meta name="description" content="Comprehensive menu management system for organizing navigation structure and menu hierarchy." />
      </Helmet>

      <AnimatePresence>
        {isFormOpen && <MenuForm open={isFormOpen} setOpen={setIsFormOpen} menu={selectedMenu} onSave={handleSaveMenu} getAllMenus={getAllMenus} />}
      </AnimatePresence>
      <AnimatePresence>
        {isConfirmOpen && <ConfirmationDialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={confirmDelete} title={`Delete Menu: ${selectedMenu?.label}`} description="This action cannot be undone." />}
      </AnimatePresence>

      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Menu Management</h1>
            <p className="text-gray-400">Manage navigation menus and hierarchy structure.</p>
          </div>
          <div>
            <Button onClick={handleAddMenu} className="bg-gradient-to-r from-blue-500 to-purple-600">
              <Plus className="w-4 h-4 mr-2" />Add Menu
            </Button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-effect border-white/10">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    placeholder="Search menus..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="pl-10 glass-effect" 
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px] glass-effect">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-effect">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Menus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Menu</th>
                      <th>Path</th>
                      <th>Parent</th>
                      <th>Order</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMenus.map(menu => {
                      return (
                        <tr key={menu._id}>
                          <td>
                            <div className="font-medium text-white">{menu.label}</div>
                            <div className="text-xs text-gray-400">{menu.id}</div>
                          </td>
                          <td className="text-white">{menu.path}</td>
                          <td className="text-white">{menu.parentTitle || 'Top Level'}</td>
                          <td className="text-white">{menu.order}</td>
                          <td>
                            <span className={`status-badge ${getStatusColor(menu.isActive)}`}>
                              {menu.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <div className="flex gap-1">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="glass-effect">
                                  <DropdownMenuItem onClick={() => handleEditMenu(menu)}>
                                    <Edit className="w-4 h-4 mr-2" />Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-400" onClick={() => handleDeleteMenu(menu)}>
                                    <Trash2 className="w-4 h-4 mr-2" />Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
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

export default MenusPage;