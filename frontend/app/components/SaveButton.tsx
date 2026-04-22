import { IconType } from "react-icons";
import { MdCheckCircleOutline } from "react-icons/md";

interface SaveButtonProps {
  label?: string;
  icon?: IconType;
  onClick?: () => void;
  className?: string;
}

export default function SaveButton({
  label = "Salvar Registro",
  icon: Icon = MdCheckCircleOutline,
  onClick,
  className = "",
}: SaveButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center w-full h-[60px] gap-3 rounded-full text-white cursor-pointer hover:opacity-90 transition-opacity bg-gradient-to-r from-azul-escuro to-azul ${className}`}
      style={{
        boxShadow: "0px 8px 16px rgba(37, 99, 235, 0.24)",
      }}
    >
      <Icon size={24} color="#FFFFFF" />
      <span className="font-semibold" style={{ fontFamily: "var(--font-manrope)", fontSize: 16 }}>
        {label}
      </span>
    </button>
  );
}
