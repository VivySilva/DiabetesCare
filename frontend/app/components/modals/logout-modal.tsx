import { MdLogout } from "react-icons/md";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LogoutModal({
  isOpen,
  onClose,
  onConfirm,
}: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm px-6">
      <div className="bg-white rounded-[32px] p-8 w-full max-w-[360px] flex flex-col items-center shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4">
          <MdLogout size={28} className="translate-x-0.5" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Sair da Conta?</h2>
        <p className="text-gray-500 text-center text-sm mb-8">
          Tem certeza que deseja sair da sua conta?
        </p>

        <div className="w-full flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className="w-full bg-blue-600 text-white font-semibold py-4 rounded-full transition-colors hover:bg-blue-700"
          >
            Sair
          </button>
          <button
            onClick={onClose}
            className="w-full bg-white text-gray-700 border border-gray-200 font-semibold py-4 rounded-full transition-colors hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
