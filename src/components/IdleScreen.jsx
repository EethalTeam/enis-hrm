import React from 'react';
import { motion } from 'framer-motion';
import { Coffee, LogOut } from 'lucide-react';
import { useData } from '@/contexts/DataContext';

const IdleScreen = () => {
  const { attendanceStatus } = useData();

  const isBreak = attendanceStatus.break;
  const Icon = isBreak ? Coffee : LogOut;
  const title = isBreak ? "On a Break" : "Day Out";
  const message = isBreak 
    ? "You are currently on a break. Enjoy your time!" 
    : "You have clocked out for the day. See you tomorrow!";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 bg-slate-900/80 backdrop-blur-md z-10 flex items-center justify-center"
    >
      <div className="text-center text-white">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
          className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <Icon className="w-12 h-12 text-white" />
        </motion.div>
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-4xl font-bold mb-2"
        >
          {title}
        </motion.h1>
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg text-gray-400"
        >
          {message}
        </motion.p>
      </div>
    </motion.div>
  );
};

export default IdleScreen;