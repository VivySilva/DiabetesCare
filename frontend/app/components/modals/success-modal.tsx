"use client";
import { motion, AnimatePresence } from "framer-motion";
import { HiCheckCircle } from "react-icons/hi";

interface SuccessModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

export default function SuccessModal({ isOpen, message, onClose }: SuccessModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-sm bg-white rounded-[32px] p-8 flex flex-col items-center text-center shadow-2xl"
          >
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
              <HiCheckCircle className="text-green-500 w-12 h-12" />
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Sucesso!
            </h3>
            <p className="text-gray-500 font-medium mb-8">
              {message}
            </p>

            <button
              onClick={onClose}
              className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl hover:bg-gray-800 transition-colors active:scale-[0.98]"
            >
              Entendi
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
