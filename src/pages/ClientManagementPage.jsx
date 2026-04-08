import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";

import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import ConfirmationDialog from "@/components/ConfirmationDialog";
import ClientForm from "@/components/clients/ClientForm";

import { toast } from "@/components/ui/use-toast";
import { apiRequest } from "@/components/CustomComponents/apiRequest";

import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const ClientManagementPage = () => {
  const navigate = useNavigate();
  const { getPermissionsByPath } = useAuth();

  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewClient, setViewClient] = useState(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [Permissions, setPermissions] = useState({
    isAdd: false,
    isView: false,
    isEdit: false,
    isDelete: false,
  });

  useEffect(() => {
    const init = async () => {
      try {
        const res = await getPermissionsByPath(window.location.pathname);

        if (res) {
          setPermissions(res);
        } else {
          navigate("/dashboard");
          return;
        }

        await getAllClients();
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  const getAllClients = async () => {
    try {
      const res = await apiRequest("Client/getAllClients/", {
        method: "POST",
        body: JSON.stringify({}),
      });

      setClients(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error("Error fetching clients:", error);
      setClients([]);
    }
  };

  const filteredClients = clients.filter((client) => {
    return (
      (client.UserName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (client.ClientCode || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredClients.length / rowsPerPage),
  );

  const startIndex = (currentPage - 1) * rowsPerPage;

  const currentClients = filteredClients.slice(
    startIndex,
    startIndex + rowsPerPage,
  );

  const handleRowsPerPageChange = (value) => {
    setRowsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleAddClient = () => {
    console.log("Add Client");
    setIsFormOpen(true);
    setSelectedClient(null);
  };

  const handleEditClient = (client) => {
    setSelectedClient(client);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (client) => {
    setClientToDelete(client);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      if (clientToDelete) {
        await apiRequest(`Client/deleteClient/`, {
          method: "POST",
          body: JSON.stringify({ _id: clientToDelete._id }),
        });

        toast({
          title: "Client Deleted",
          description: `Successfully deleted ${clientToDelete.UserName}`,
        });

        setClientToDelete(null);
        setIsConfirmOpen(false);

        await getAllClients();
      }
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Unable to delete client.",
        variant: "destructive",
      });
    }
  };

  const handleViewClient = (client) => {
    setViewClient(client);
    setIsViewOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>Clients - ENIS HRMS</title>
      </Helmet>

      <AnimatePresence>
        {isFormOpen && (
          <ClientForm
            open={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            client={selectedClient}
            refreshClients={getAllClients}
          />
        )}
      </AnimatePresence>

      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Are you sure?"
        description={`This action will delete ${clientToDelete?.UserName}`}
      />

      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Client Management
              </h1>

              <p className="text-gray-400">Manage organization clients</p>
            </div>

            {Permissions.isAdd && (
              <Button
                onClick={handleAddClient}
                className="bg-gradient-to-r from-blue-500 to-purple-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Client
              </Button>
            )}
          </div>
        </motion.div>

        <Card className="glass-effect border-white/10">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />

              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Client Directory</CardTitle>

            <CardDescription>
              {filteredClients.length} of {clients.length} clients
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <table className="data-table w-full">
                <thead>
                  <tr>
                    <th>Client Code</th>
                    <th>User Name</th>
                    {/* <th>Role</th> */}
                    <th>Projects</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {currentClients.length > 0 ? (
                    currentClients.map((client, index) => (
                      <motion.tr
                        key={client._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: index * 0.05,
                        }}
                      >
                        <td>{client.ClientCode}</td>

                        <td>{client.UserName}</td>

                        {/* <td>{client.RoleId?.roleName || "-"}</td> */}

                        <td>{client.projects?.length || 0}</td>

                        <td>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">
                              {Permissions.isView && (
                                <DropdownMenuItem
                                  onClick={() => handleViewClient(client)}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </DropdownMenuItem>
                              )}

                              {Permissions.isEdit && (
                                <DropdownMenuItem
                                  onClick={() => handleEditClient(client)}
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              )}

                              {Permissions.isDelete && (
                                <DropdownMenuItem
                                  onClick={() => handleDeleteClick(client)}
                                  className="text-red-400"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center py-8 text-gray-400"
                      >
                        No clients found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between mt-4">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>

                <Select
                  value={String(rowsPerPage)}
                  onValueChange={handleRowsPerPageChange}
                >
                  <SelectTrigger className="w-[80px]">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3">
                <Button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  Previous
                </Button>

                <span>
                  Page {currentPage} of {totalPages}
                </span>

                <Button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Client Details</DialogTitle>
            </DialogHeader>

            {viewClient && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-xs">Client Code</p>

                  <p>{viewClient.ClientCode}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-xs">User Name</p>

                  <p>{viewClient.UserName}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-xs">Role</p>

                  <p>{viewClient.RoleId?.RoleName}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-xs">Projects</p>

                  <p>{viewClient.projects?.length}</p>
                  <p>
                    {viewClient.projects
                      ?.map((project) => project.projectName)
                      .join(", ")}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default ClientManagementPage;
