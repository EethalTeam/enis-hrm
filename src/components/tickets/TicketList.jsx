import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

const TicketList = ({ tickets, getStatusColor, getPriorityColor, getCategoryIcon, handleEditTicket, handleAssignTicket, handleUpdateStatus }) => {
  return (
    <div className="space-y-4">
      {tickets.map((ticket, index) => (
        <motion.div
          key={ticket.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="p-6 glass-effect rounded-lg hover:bg-white/10 transition-all duration-200"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-lg">
                  {getCategoryIcon(ticket.category)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold">{ticket.title}</h3>
                    <span className="text-xs text-gray-500">#{ticket.id}</span>
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-1">{ticket.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Category & Priority</p>
                  <p className="text-sm text-white">{ticket.category}</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(ticket.priority)} mt-1`}>
                    {ticket.priority}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Assigned To</p>
                  <p className="text-sm text-white">{ticket.assignedTo}</p>
                  <p className="text-xs text-gray-400">Created by {ticket.createdBy}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Created</p>
                  <p className="text-sm text-white">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-400">{new Date(ticket.createdAt).toLocaleTimeString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Due Date</p>
                  <p className="text-sm text-white">{new Date(ticket.dueDate).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-400">
                    {Math.ceil((new Date(ticket.dueDate) - new Date()) / (1000 * 60 * 60 * 24))} days left
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                {ticket.status}
              </span>
              
              {ticket.status !== 'Resolved' && (
                <div className="flex gap-2">
                  {ticket.status === 'Open' && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(ticket, 'In Progress')}
                      className="bg-blue-600 hover:bg-blue-700 text-xs"
                    >
                      Start Work
                    </Button>
                  )}
                  {ticket.status === 'In Progress' && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(ticket, 'Resolved')}
                      className="bg-green-600 hover:bg-green-700 text-xs"
                    >
                      Resolve
                    </Button>
                  )}
                </div>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-white/10">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-effect border-white/10">
                  <DropdownMenuItem onClick={() => handleEditTicket(ticket)} className="hover:bg-white/10">
                    Edit Ticket
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAssignTicket(ticket)} className="hover:bg-white/10">
                    Reassign
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleUpdateStatus(ticket, 'Closed')} className="hover:bg-white/10 text-red-400">
                    Close Ticket
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default TicketList;