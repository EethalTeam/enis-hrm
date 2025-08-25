import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const SidebarItem = ({ item, onClose, index }) => {
  const location = useLocation();
  const isActive = item.subItems 
    ? item.subItems.some(sub => location.pathname.startsWith(sub.path))
    : location.pathname.startsWith(item.path);
  
  const [isOpen, setIsOpen] = useState(isActive);

  const toggleOpen = () => {
    if(item.subItems) {
      setIsOpen(!isOpen);
    }
  };

  const containerVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0, transition: { delay: index * 0.05 } },
  };

  const subMenuVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: { height: 'auto', opacity: 1, transition: { staggerChildren: 0.05, when: "beforeChildren" } },
  };
  
  const subItemVariants = {
     hidden: { opacity: 0, x: -10 },
     visible: { opacity: 1, x: 0 },
  };

  if (item.subItems) {
    return (
      <motion.div variants={containerVariants} initial="initial" animate="animate">
        <div
          onClick={toggleOpen}
          className={`sidebar-item cursor-pointer ${isActive ? 'active' : ''}`}
        >
          <item.icon className="w-5 h-5" />
          <span className="font-medium flex-1">{item.label}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={subMenuVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="pl-8 overflow-hidden"
            >
              {item.subItems.map((subItem) => (
                 <motion.div key={subItem.path} variants={subItemVariants}>
                  <NavLink
                    to={subItem.path}
                    className={({isActive: isSubActive}) => `sidebar-item text-sm py-2 ${isSubActive ? 'text-white font-semibold' : 'text-gray-400'}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        if(window.innerWidth < 1024) onClose();
                    }}
                  >
                    {subItem.label}
                  </NavLink>
                 </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="initial" animate="animate">
      <NavLink
        to={item.path}
        className={`sidebar-item ${isActive ? 'active' : ''}`}
        onClick={() => {
            if (window.innerWidth < 1024) onClose();
        }}
      >
        <item.icon className="w-5 h-5" />
        <span className="font-medium">{item.label}</span>
      </NavLink>
    </motion.div>
  );
};

export default SidebarItem;