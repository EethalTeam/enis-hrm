import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, description, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="glass-effect border-red-500/30 rounded-xl w-full max-w-md"
          >
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
              <p className="text-gray-400 mb-6">{description}</p>

              {/* 🔽 Render custom children here */}
              {children && <div className="mb-4">{children}</div>}

              <div className="flex justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-white/10 hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={onConfirm}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Confirm
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationDialog;