import { MdDeleteForever } from "react-icons/md";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  isDeleting?: boolean;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Excluir",
  isDeleting = false,
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 backdrop-blur-sm px-6">
      <div className="bg-white rounded-[32px] p-8 w-full max-w-[380px] flex flex-col items-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 animate-bounce">
          <MdDeleteForever size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">{title}</h2>
        <p className="text-gray-500 text-center text-sm mb-6 leading-relaxed">
          {message}
        </p>

        <div className="w-full flex flex-col gap-3">
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className={`w-full text-white font-semibold py-4 rounded-full transition-all shadow-md ${
              isDeleting
                ? "bg-red-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 shadow-red-600/10 active:scale-[0.98] cursor-pointer"
            }`}
          >
            {isDeleting ? "Excluindo..." : confirmText}
          </button>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="w-full bg-white text-gray-700 border border-gray-200 font-semibold py-4 rounded-full transition-colors hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
