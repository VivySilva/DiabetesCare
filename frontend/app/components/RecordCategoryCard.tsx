import Link from "next/link";
import { IconType } from "react-icons";

interface RecordCategoryCardProps {
  href: string;
  icon: IconType;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
}

export default function RecordCategoryCard({
  href,
  icon: Icon,
  iconColor,
  iconBg,
  title,
  description,
}: RecordCategoryCardProps) {
  return (
    <Link href={href} className="no-underline w-full">
      <div className="flex flex-col items-start gap-3 w-full cursor-pointer">
        {/* Ícone + Título lado a lado */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-14 h-14 rounded-full shrink-0"
            style={{ background: iconBg }}
          >
            <Icon size={26} color={iconColor} />
          </div>
          <h3 className="m-0">{title}</h3>
        </div>

        {/* Descrição */}
        <p className="m-0 text-cinza-claro-texto">{description}</p>
      </div>
    </Link>
  );
}
