import React, { useEffect, useState } from "react";
import { apiRequest } from "@/components/CustomComponents/apiRequest";
import { toast } from "@/components/ui/use-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { Checkbox } from "@/components/ui/checkbox";

const ClientForm = ({ open, onClose, client, refreshClients }) => {
  const [formData, setFormData] = useState({
    _id: "",
    ClientCode: "",
    UserName: "",
    Password: "",
    RoleId: "",
    projects: [],
  });

  const [roles, setRoles] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (open) {
      fetchRoles();
      fetchProjects();
    }
  }, [open]);
  useEffect(() => {
    if (client) {
      setFormData({
        _id: client._id || "",
        ClientCode: client.ClientCode || "",
        UserName: client.UserName || "",
        Password: "",
        RoleId: client.RoleId?._id || client.RoleId || "",
        projects: client.projects?.map((p) => p._id || p) || [],
      });
    } else {
      setFormData({
        _id: "",
        ClientCode: "",
        UserName: "",
        Password: "",
        RoleId: "",
        projects: [],
      });
    }
  }, [client]);
  const fetchRoles = async () => {
    try {
      const res = await apiRequest("RoleBased/getAllRoles", {
        method: "POST",
        body: JSON.stringify({}),
      });
      console.log("Fetched Roles:", res);
      setRoles(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await apiRequest("Project/getAllProjectsforassign", {
        method: "POST",
        body: JSON.stringify({}),
      });

      setProjects(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleProject = (id) => {
    setFormData((prev) => {
      const exists = prev.projects.includes(id);

      return {
        ...prev,
        projects: exists
          ? prev.projects.filter((p) => p !== id)
          : [...prev.projects, id],
      };
    });
  };
  const updateClient = async () => {
    try {
      console.log("Updating Client with data:", formData);

      const result = await apiRequest("Client/updateClient", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      console.log("Update result:", result);

      toast({
        title: "Client updated successfully",
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const handleSubmit = async () => {
    try {
      await updateClient();

      toast({
        title: client ? "Client Updated" : "Client Created",
      });

      refreshClients();
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{client ? "Edit Client" : "Add Client"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* CLIENT CODE */}
          <div>
            <Label>Client Code</Label>
            <Input
              value={formData.ClientCode}
              onChange={(e) =>
                setFormData({ ...formData, ClientCode: e.target.value })
              }
            />
          </div>

          {/* USERNAME */}
          <div>
            <Label>User Name</Label>
            <Input
              value={formData.UserName}
              onChange={(e) =>
                setFormData({ ...formData, UserName: e.target.value })
              }
            />
          </div>

          {/* PASSWORD */}
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              value={formData.Password}
              onChange={(e) =>
                setFormData({ ...formData, Password: e.target.value })
              }
            />
          </div>

          {/* ROLE */}
          <div>
            <Label>Role</Label>

            <Select
              value={formData.RoleId}
              onValueChange={(val) => setFormData({ ...formData, RoleId: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>

              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role._id} value={role._id}>
                    {role.RoleName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* PROJECTS */}
          <div>
            <Label>Projects</Label>

            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border p-3 rounded-md">
              {projects.map((project) => (
                <div key={project._id} className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.projects.includes(project._id)}
                    onCheckedChange={() => toggleProject(project._id)}
                  />

                  <span>{project.projectName}</span>
                </div>
              ))}
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button onClick={handleSubmit}>
              {client ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientForm;
