import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle } from 'lucide-react';

const VARIANTS = {
  danger: {
    border: 'border-red-500/30',
    iconBg: 'bg-red-500/20',
    iconColor: 'text-red-400',
    Icon: AlertTriangle,
    confirmClassName: 'bg-red-600 hover:bg-red-700',
  },
  success: {
    border: 'border-green-500/30',
    iconBg: 'bg-green-500/20',
    iconColor: 'text-green-400',
    Icon: CheckCircle,
    confirmClassName: 'bg-green-600 hover:bg-green-700',
  },
};

const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  children,
  confirmLabel = 'Confirm',
  confirmDisabled = false,
  variant = 'danger', // 'danger' (delete/reject) | 'success' (approve)
}) => {
  const { border, iconBg, iconColor, Icon, confirmClassName } =
    VARIANTS[variant] || VARIANTS.danger;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className={`glass-effect ${border} rounded-xl w-full max-w-md`}
          >
            <div className="p-8 text-center">
              <div className={`w-16 h-16 ${iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Icon className={`w-8 h-8 ${iconColor}`} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
              <p className="text-gray-400 mb-6">{description}</p>

              {/* 🔽 Render custom children here */}
              {children && <div className="mb-4">{children}</div>}

              <div className="flex justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={confirmDisabled}
                  className="border-white/10 hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={onConfirm}
                  disabled={confirmDisabled}
                  className={confirmClassName}
                >
                  {confirmLabel}
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