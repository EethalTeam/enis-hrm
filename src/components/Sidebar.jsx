import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, X } from 'lucide-react';
import ENISLogo from '@/data/ENIS-Logo.png';
import SidebarItem from './SidebarItem';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { ALL_MENU_ITEMS } from '@/config/roles';
import { apiRequest } from '@/components/CustomComponents/apiRequest'

const Sidebar = ({ onClose }) => {
  const { user } = useAuth();
  const { menuPermissions } = useData();
  const [MENU,SETMENU]=useState([])
  useEffect(()=>{
    getAllMenus()
  },[])
const getAllMenus = async () => {
  try {
    const response = await apiRequest("Menu/getFormattedMenu", {
      method: 'POST',
      body: JSON.stringify({}),
    });
    SETMENU(response.data)
  } catch (error) {
    console.error("Failed to fetch menus", error);
    return {};
  }
};
  const hasAccess = (path) => {
    const userRole = user.role;
    if (userRole === 'Super Admin') return true;

    const rolePermissions = menuPermissions[userRole];
    // const rolePermissions = ['*'];

    if (!rolePermissions) return false;
    if (rolePermissions.includes('*')) return true;
    
    return rolePermissions.some(p => path===p);
  };

  const filteredMenuItems = MENU.map(item => {
    // const filteredMenuItems = ALL_MENU_ITEMS.map(item => {
    if (user.role === 'Super Admin') return item;
    
    if (item.subItems.length > 0) {
      const accessibleSubItems = item.subItems.filter(sub => hasAccess(sub.path));
      if (accessibleSubItems.length > 0) {
        return { ...item, subItems: accessibleSubItems };
      }
      return null;
    }
    return hasAccess(item.path) ? item : null;
  }).filter(Boolean);

  return (
    <motion.div 
      className="h-full glass-effect border-r border-white/10 flex flex-col"
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#235e10] to-[#235e10] rounded-lg flex items-center justify-center">
              {/* <Building2 className="w-6 h-6 text-white" /> */}
              <img src={ENISLogo} alt="ENIS Logo" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">ENIS</h1>
              <p className="text-xs text-gray-400">HRMS</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide">
        {filteredMenuItems.map((item, index) => (
          <SidebarItem 
            key={item.path} 
            item={item} 
            onClose={onClose} 
            index={index}
          />
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="glass-effect rounded-lg p-4 text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-[#235e10] to-[#235e10] rounded-full mx-auto mb-2 flex items-center justify-center animate-pulse-slow">
            {/* <Building2 className="w-6 h-6 text-white" /> */}
            <img src={ENISLogo} alt="ENIS Logo" />
          </div>
          <p className="text-sm font-medium text-white">System Status</p>
          <p className="text-xs text-green-400">All Systems Online</p>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;