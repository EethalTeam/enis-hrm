import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Shield, Plus, Edit, Trash2, Settings, Save, Eye, UserPlus, FileEdit, Trash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { config } from '@/components/CustomComponents/config';
import { apiRequest } from '@/components/CustomComponents/apiRequest'

// ------------------ API FUNCTIONS ------------------
const getRole = async (setRoles) => {
  try {
    const response = await apiRequest("RoleBased/getAllRoles", {
        method: 'POST',
        body: JSON.stringify({}),
      });
    setRoles(response.data || []);
  } catch (error) {
    console.error("Failed to fetch roles", error);
    setRoles([]);
  }
};

const getAllMenus = async () => {
  try {
    const response = await apiRequest("RoleBased/getAllMenus", {
      method: 'POST',
      body: JSON.stringify({}),
    });
    return response.data || {};
  } catch (error) {
    console.error("Failed to fetch menus", error);
    return {};
  }
};

const updateMenusAndAccess = async (roleId, menus) => {
  try {
    const response = await apiRequest("RoleBased/updateMenusAndAccess", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        _id: roleId,
        menus: menus
      }),
    });
    return response;
  } catch (error) {
    console.error("Failed to update permissions", error);
    throw error;
  }
};

const createRole = async (data, setRoles) => {
  const response = await apiRequest("RoleBased/createRole", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  await getRole(setRoles);
  return response;
};

const updateRoleApi = async (data, setRoles) => {
  const response = await apiRequest("RoleBased/updateRole", {
    method: 'POST',
    body: JSON.stringify(data),
  });
  await getRole(setRoles);
  return response;
};

const deleteRoleApi = async (id, setRoles) => {
  const response = await apiRequest("RoleBased/deleteRole", {
    method: 'POST',
    body: JSON.stringify({ _id: id }),
  });
  await getRole(setRoles);
  return response;
};

// ------------------ ROLE FORM ------------------
const RoleForm = ({ open, setOpen, role, onSave }) => {
  const [RoleName, setRoleName] = useState('');

  useEffect(() => {
    if (open) {
      setRoleName(role ? role.RoleName : '');
    }
  }, [role, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (RoleName.trim()) {
      onSave({ ...role, RoleName: RoleName.trim() });
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
            <Input id="name" value={RoleName} onChange={(e) => setRoleName(e.target.value)} required className="glass-effect border-white/10" />
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

// ------------------ PERMISSIONS DIALOG ------------------
const PermissionsDialog = ({ open, setOpen, role, onSave }) => {
  const [menus, setMenus] = useState([]);
  const [currentPermissions, setCurrentPermissions] = useState({});
  console.log(currentPermissions,"currentPermissions")
  const [loading, setLoading] = useState(true);
  const isSuperAdmin = role?.RoleName === "Super Admin";
  // const isSuperAdmin = false;

  useEffect(() => {
    if (open && role) {
      loadMenusAndPermissions();
    }
  }, [role, open]);

  const loadMenusAndPermissions = async () => {
    try {
      setLoading(true);
      const menusResponse = await getAllMenus();
      const flatMenus = menusResponse || [];

      // Build parent-child hierarchy
      const parentMenus = flatMenus.filter((m) => !m.parentId);
      const hierarchicalMenus = parentMenus.map((parent) => ({
        ...parent,
        subMenus: flatMenus.filter((child) => child.parentId === parent._id),
      }));

      setMenus(hierarchicalMenus);

      // Initialize permissions
      const permissions = {};
      if (role?.permissions) {
        role.permissions.forEach((perm) => {
          permissions[perm.menuId] = {
            isView: perm.isView || false,
            isAdd: perm.isAdd || false,
            isEdit: perm.isEdit || false,
            isDelete: perm.isDelete || false,
          };
        });
      }
      setCurrentPermissions(permissions);
    } catch (error) {
      console.error("Error loading menus:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Toggle individual permission
  const handlePermissionChange = (menuId, permission, checked) => {
    // if (isSuperAdmin) return;
console.log(menuId, permission, checked,"menuId, permission, checked")
    setCurrentPermissions((prev) => {
      const updated = {
        ...prev,
        [menuId]: {
          ...prev[menuId],
          [permission]: checked,
        },
      };

      // If no permissions are selected, remove the menu entry
      const perms = updated[menuId];
      if (!perms.isView && !perms.isAdd && !perms.isEdit && !perms.isDelete) {
        delete updated[menuId];
      }

      return updated;
    });
  };

  // 🔹 Toggle all permissions for a menu
  const handleSelectAllForMenu = (menuId, checked) => {
    if (isSuperAdmin) return;

    if (checked) {
      // All permissions selected
      setCurrentPermissions((prev) => ({
        ...prev,
        [menuId]: {
          isView: true,
          isAdd: true,
          isEdit: true,
          isDelete: true,
        },
      }));
    } else {
      // All permissions cleared
      setCurrentPermissions((prev) => {
        const updated = { ...prev };
        delete updated[menuId];
        return updated;
      });
    }
  };

  const isMenuFullySelected = (menuId) => {
    const perms = currentPermissions[menuId];
    return perms && (perms.isView || perms.isAdd || perms.isEdit || perms.isDelete);
  };

  const isMenuPartiallySelected = (menuId) => {
    const perms = currentPermissions[menuId];
    return (
      perms &&
      (perms.isView || perms.isAdd || perms.isEdit || perms.isDelete) &&
      !isMenuFullySelected(menuId)
    );
  };

  const handleSave = async () => {
    try {
      const menusToUpdate = Object.entries(currentPermissions)
        .filter(([_, perms]) => perms.isView || perms.isAdd || perms.isEdit || perms.isDelete)
        .map(([menuId, perms]) => ({
          menuId,
          ...perms,
        }));
        console.log(menusToUpdate,"menusToUpdate")
      await updateMenusAndAccess(role._id, menusToUpdate);
      onSave();
      setOpen(false);
    } catch (error) {
      console.error("Error saving permissions:", error);
      throw error;
    }
  };

  const renderPermissionIcon = (type) => {
    const iconProps = { className: "w-4 h-4" };
    switch (type) {
      case "isView":
        return <Eye {...iconProps} />;
      case "isAdd":
        return <UserPlus {...iconProps} />;
      case "isEdit":
        return <FileEdit {...iconProps} />;
      case "isDelete":
        return <Trash {...iconProps} />;
      default:
        return null;
    }
  };

  const getPermissionLabel = (type) => {
    switch (type) {
      case "isView":
        return "View";
      case "isAdd":
        return "Add";
      case "isEdit":
        return "Edit";
      case "isDelete":
        return "Delete";
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass-effect border-white/10 text-white max-w-4xl">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-gray-300">Loading menus...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="glass-effect border-white/10 text-white max-w-4xl">
        <DialogHeader>
          <DialogTitle>Manage Permissions for {role?.RoleName}</DialogTitle>
          <DialogDescription>
            Select the menus and specific access rights this role can have.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto space-y-4 p-1 pr-4">
          {/* {isSuperAdmin ? (
            <div className="text-center p-8 bg-blue-900/50 rounded-lg">
              <Shield className="w-12 h-12 mx-auto mb-4 text-blue-300" />
              <p className="text-blue-300 font-medium">
                Super Admin has unconditional access to all features. Permissions cannot be
                modified.
              </p>
            </div>
          ) : ( */}
            <>
              {menus.map((parentMenu) => (
                <div
                  key={parentMenu._id}
                  className="border border-white/10 rounded-lg bg-white/5"
                >
                  {/* Parent Menu */}
                  <div className="p-4 border-b border-white/10 bg-white/10">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={`select-all-${parentMenu._id}`}
                        checked={isMenuFullySelected(parentMenu._id)}
                        indeterminate={isMenuPartiallySelected(parentMenu._id)}
                        onCheckedChange={(checked) =>
                          handleSelectAllForMenu(parentMenu._id, checked)
                        }
                      />
                      <Label
                        htmlFor={`select-all-${parentMenu._id}`}
                        className="font-semibold text-lg text-white cursor-pointer"
                      >
                        {parentMenu.label}
                      </Label>
                    </div>

                    <div className="flex flex-wrap gap-6 mt-3">
                      {["isView", "isAdd", "isEdit", "isDelete"].map((permission) => (
                        <div key={permission} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${parentMenu._id}-${permission}`}
                            checked={currentPermissions[parentMenu._id]?.[permission] || false}
                            onCheckedChange={(checked) =>
                              handlePermissionChange(parentMenu._id, permission, checked)
                            }
                          />
                          <Label
                            htmlFor={`${parentMenu._id}-${permission}`}
                            className="flex items-center space-x-2 text-gray-300 cursor-pointer"
                          >
                            {renderPermissionIcon(permission)}
                            <span>{getPermissionLabel(permission)}</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sub Menus */}
                  {parentMenu.subMenus?.length > 0 && (
                    <div className="p-4 space-y-4">
                      {parentMenu.subMenus.map((subMenu) => (
                        <div
                          key={subMenu._id}
                          className="ml-6 p-3 border border-white/5 rounded-lg bg-white/3"
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <Checkbox
                              id={`select-all-${subMenu._id}`}
                              checked={isMenuFullySelected(subMenu._id)}
                              indeterminate={isMenuPartiallySelected(subMenu._id)}
                              onCheckedChange={(checked) =>
                                handleSelectAllForMenu(subMenu._id, checked)
                              }
                            />
                            <Label
                              htmlFor={`select-all-${subMenu._id}`}
                              className="font-medium text-white cursor-pointer"
                            >
                              {subMenu.label}
                            </Label>
                          </div>

                          <div className="flex flex-wrap gap-6 ml-6">
                            {["isView", "isAdd", "isEdit", "isDelete"].map((permission) => (
                              <div key={permission} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`${subMenu._id}-${permission}`}
                                  checked={currentPermissions[subMenu._id]?.[permission] || false}
                                  onCheckedChange={(checked) =>
                                    handlePermissionChange(subMenu._id, permission, checked)
                                  }
                                />
                                <Label
                                  htmlFor={`${subMenu._id}-${permission}`}
                                  className="flex items-center space-x-2 text-gray-300 cursor-pointer"
                                >
                                  {renderPermissionIcon(permission)}
                                  <span>{getPermissionLabel(permission)}</span>
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </>
          {/* )} */}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="border-white/10 hover:bg-white/10"
            >
              Cancel
            </Button>
          </DialogClose>
          {/* {!isSuperAdmin && ( */}
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-green-500 to-teal-500"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Permissions
            </Button>
          {/* )} */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ------------------ MAIN COMPONENT ------------------
const RolesPage = () => {
  const { toast } = useToast();
  const [roles, setRoles] = useState([]);
  const [isRoleFormOpen, setIsRoleFormOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState(null);
  const [roleForPermissions, setRoleForPermissions] = useState(null);

  useEffect(() => {
    getRole(setRoles);
  }, []);
useEffect(()=>{
let rolepath=roles.reduce((acc,curr)=>{
  if(!acc[curr.RoleName]){
return {...acc,[curr.RoleName]:curr.permissions.map(val=>val.menuDetails.path)}
  }else{
return acc
  }
},{})
},[roles])
  const handleAddNewRole = () => {
    setRoleToEdit(null);
    setIsRoleFormOpen(true);
  };

  const handleEditRole = (role) => {
    if (role.RoleName === 'Super Admin') {
      toast({ title: "Cannot Edit Super Admin", description: "The Super Admin role is locked.", variant: "destructive" });
      return;
    }
    setRoleToEdit(role);
    setIsRoleFormOpen(true);
  };

  const handleDeleteRole = (role) => {
    if (role.RoleName === 'Super Admin') {
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

  const confirmDeleteRole = async () => {
    try {
      await deleteRoleApi(roleToEdit._id, setRoles);
      toast({ title: "Role Deleted" });
      setIsConfirmOpen(false);
      setRoleToEdit(null);
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleSaveRole = async (roleData) => {
    try {
      if (roleToEdit) {
        await updateRoleApi({ ...roleData, _id: roleToEdit._id }, setRoles);
        toast({ title: "Role Updated" });
      } else {
        const newRole = await createRole(roleData, setRoles);
        if (newRole) {
          toast({ title: "Role Added" });
        }
      }
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handlePermissionsSaved = () => {
    toast({ title: "Permissions Saved", description: `Permissions for ${roleForPermissions?.RoleName} have been updated.` });
    getRole(setRoles); // Refresh roles data
  };

  return (
    <>
      <Helmet>
        <title>Roles & Permissions - ENIS-HRMS</title>
        <meta name="description" content="Manage user roles and their access permissions across the application." />
      </Helmet>

      <AnimatePresence>
        {isRoleFormOpen && <RoleForm open={isRoleFormOpen} setOpen={setIsRoleFormOpen} role={roleToEdit} onSave={handleSaveRole} />}
        {isPermissionsOpen && <PermissionsDialog open={isPermissionsOpen} setOpen={setIsPermissionsOpen} role={roleForPermissions} onSave={handlePermissionsSaved} />}
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
                      <th>Role Code</th>
                      <th>Role Name</th>
                      <th>Permissions</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.map(role => (
                      <tr key={role._id}>
                        <td className="font-mono text-sm text-gray-300">{role.RoleCode}</td>
                        <td className="font-medium text-white">{role.RoleName}</td>
                        <td>
                          <span className="text-gray-300">
                            {role.totalPermissions || 0} menu{(role.totalPermissions || 0) !== 1 ? 's' : ''}
                          </span>
                        </td>
                        <td>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            role.isActive ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                          }`}>
                            {role.isActive ? 'Active' : 'Inactive'}
                          </span>
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