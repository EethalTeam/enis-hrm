import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Shield, Plus, Edit, Trash2, Settings, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { ALL_MENU_ITEMS } from '@/config/roles';

const RoleForm = ({ open, setOpen, role, onSave }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (open) {
      setName(role ? role.name : '');
    }
  }, [role, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSave({ ...role, name: name.trim() });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="glass-effect border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>{role ? 'Edit Role' : 'Add New Role'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="name" className="text-gray-300">Role Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="glass-effect border-white/10" />
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline" className="border-white/10 hover:bg-white/10">Cancel</Button></DialogClose>
            <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const PermissionsDialog = ({ open, setOpen, role, menuPermissions, onSave }) => {
  const [currentPermissions, setCurrentPermissions] = useState([]);
  const isSuperAdmin = role?.name === 'Super Admin';

  useEffect(() => {
    if (role && menuPermissions) {
      setCurrentPermissions(isSuperAdmin ? ['*'] : menuPermissions[role.name] || []);
    }
  }, [role, menuPermissions, isSuperAdmin, open]);

  const handlePermissionChange = (path, checked) => {
    if (isSuperAdmin) return;
    setCurrentPermissions(prev => {
      const newPermissions = new Set(prev.filter(p => p !== '*'));
      if (checked) {
        newPermissions.add(path);
      } else {
        newPermissions.delete(path);
      }
      return Array.from(newPermissions);
    });
  };

  const handleSave = () => {
    onSave(role.name, currentPermissions);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="glass-effect border-white/10 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Permissions for {role?.name}</DialogTitle>
          <DialogDescription>Select the menus and actions this role can access.</DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto space-y-4 p-1 pr-4">
          {isSuperAdmin ? (
            <div className="text-center p-8 bg-blue-900/50 rounded-lg">
              <Shield className="w-12 h-12 mx-auto mb-4 text-blue-300"/>
              <p className="text-blue-300 font-medium">Super Admin has unconditional access to all features. Permissions cannot be modified.</p>
            </div>
          ) : (
            ALL_MENU_ITEMS.map(item => (
              <div key={item.id} className="p-4 border border-white/10 rounded-lg bg-white/5">
                <div className="flex items-center">
                  <Checkbox 
                    id={`perm-${item.id}`} 
                    checked={currentPermissions.includes(item.path)} 
                    onCheckedChange={(checked) => handlePermissionChange(item.path, checked)}
                  />
                  <Label htmlFor={`perm-${item.id}`} className="ml-3 font-semibold text-base text-white">{item.label}</Label>
                </div>
                {item.subItems && (
                  <div className="ml-8 mt-3 space-y-2 border-l-2 border-white/10 pl-4">
                    {item.subItems.map(subItem => (
                      <div key={subItem.id} className="flex items-center">
                        <Checkbox 
                          id={`perm-${subItem.id}`} 
                          checked={currentPermissions.includes(subItem.path)} 
                          onCheckedChange={(checked) => handlePermissionChange(subItem.path, checked)}
                        />
                        <Label htmlFor={`perm-${subItem.id}`} className="ml-3 text-gray-300">{subItem.label}</Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild><Button type="button" variant="outline" className="border-white/10 hover:bg-white/10">Cancel</Button></DialogClose>
          {!isSuperAdmin && <Button onClick={handleSave} className="bg-gradient-to-r from-green-500 to-teal-500"><Save className="w-4 h-4 mr-2"/>Save Permissions</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


const RolesPage = () => {
  const { roles, addRole, updateRole, deleteRole, menuPermissions, updatePermissions } = useData();
  const { toast } = useToast();
  const [isRoleFormOpen, setIsRoleFormOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState(null);
  const [roleForPermissions, setRoleForPermissions] = useState(null);

  const handleAddNewRole = () => {
    setRoleToEdit(null);
    setIsRoleFormOpen(true);
  };

  const handleEditRole = (role) => {
    if (role.name === 'Super Admin') {
      toast({ title: "Cannot Edit Super Admin", description: "The Super Admin role is locked.", variant: "destructive" });
      return;
    }
    setRoleToEdit(role);
    setIsRoleFormOpen(true);
  };

  const handleDeleteRole = (role) => {
     if (role.name === 'Super Admin') {
      toast({ title: "Cannot Delete Super Admin", description: "The Super Admin role is protected.", variant: "destructive" });
      return;
    }
    setRoleToEdit(role);
    setIsConfirmOpen(true);
  };
  
  const handleManagePermissions = (role) => {
    setRoleForPermissions(role);
    setIsPermissionsOpen(true);
  };

  const confirmDeleteRole = () => {
    deleteRole(roleToEdit.id);
    toast({ title: "Role Deleted" });
    setIsConfirmOpen(false);
    setRoleToEdit(null);
  };

  const handleSaveRole = (roleData) => {
    if (roleToEdit) {
      updateRole({ ...roleData, id: roleToEdit.id });
      toast({ title: "Role Updated" });
    } else {
      const newRole = addRole(roleData);
      if (newRole) {
        updatePermissions({ ...menuPermissions, [newRole.name]: [] });
        toast({ title: "Role Added" });
      } else {
        toast({ title: "Error", description: "Could not add role.", variant: "destructive" });
      }
    }
  };

  const handleSavePermissions = (roleName, permissions) => {
    const newPermissions = { ...menuPermissions, [roleName]: permissions };
    updatePermissions(newPermissions);
    toast({ title: "Permissions Saved", description: `Permissions for ${roleName} have been updated.` });
  };

  return (
    <>
      <Helmet>
        <title>Roles & Permissions - ENIS-HRMS</title>
        <meta name="description" content="Manage user roles and their access permissions across the application." />
      </Helmet>
      
      <AnimatePresence>
        {isRoleFormOpen && <RoleForm open={isRoleFormOpen} setOpen={setIsRoleFormOpen} role={roleToEdit} onSave={handleSaveRole} />}
        {isPermissionsOpen && <PermissionsDialog open={isPermissionsOpen} setOpen={setIsPermissionsOpen} role={roleForPermissions} menuPermissions={menuPermissions || {}} onSave={handleSavePermissions} />}
        {isConfirmOpen && <ConfirmationDialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={confirmDeleteRole} title="Delete Role?" description="This action cannot be undone and may affect users assigned to this role." />}
      </AnimatePresence>

      <div className="space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-white">Roles & Permissions</h1>
            <p className="text-gray-400">Define roles and control access to different modules.</p>
          </div>
          <Button onClick={handleAddNewRole} className="bg-gradient-to-r from-blue-500 to-purple-600">
            <Plus className="w-4 h-4 mr-2" />Add Role
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="glass-effect border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Manage Roles</CardTitle>
                <CardDescription className="text-gray-400">Add, edit, or delete roles and manage their permissions.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Role Name</th>
                                <th>Users</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(roles || []).map(role => (
                                <tr key={role.id}>
                                    <td className="font-medium text-white">{role.name}</td>
                                    <td>
                                        <span className="text-gray-300">N/A</span>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" className="hover:bg-white/10 h-8 w-8" onClick={() => handleManagePermissions(role)}>
                                                <Settings className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="hover:bg-white/10 h-8 w-8" onClick={() => handleEditRole(role)}>
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-red-400 hover:bg-red-400/10 h-8 w-8" onClick={() => handleDeleteRole(role)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
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

export default RolesPage;