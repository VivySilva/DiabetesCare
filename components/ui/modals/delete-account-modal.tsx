import { MdDeleteForever } from "react-icons/md";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export default function DeleteAccountModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}: DeleteAccountModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm px-6">
      <div className="bg-white rounded-[32px] p-8 w-full max-w-[380px] flex flex-col items-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
          <MdDeleteForever size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">Excluir Conta?</h2>
        <p className="text-gray-500 text-center text-sm mb-6 leading-relaxed">
          Tem certeza absoluta que deseja excluir sua conta permanentemente? Esta ação é <strong className="font-extrabold text-red-600">irreversível</strong> e apagará todos os seus dados clínicos, histórico e postagens.
        </p>

        <div className="w-full flex flex-col gap-3">
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className={`w-full text-white font-semibold py-4 rounded-full transition-all shadow-md ${
              isDeleting
                ? "bg-red-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 shadow-red-600/10 active:scale-[0.98]"
            }`}
          >
            {isDeleting ? "Excluindo..." : "Sim, Excluir Minha Conta"}
          </button>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="w-full bg-white text-gray-700 border border-gray-200 font-semibold py-4 rounded-full transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
