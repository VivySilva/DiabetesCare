import { MdOutlineWaterDrop } from "react-icons/md";

interface GlucoseSummaryProps {
  value?: number;
  moment?: string;
  status?: string;
}

export default function GlucoseSummary({
  value,
  moment = "Sem registros",
  status = "---",
}: GlucoseSummaryProps) {
  const displayValue = value !== undefined && value !== null ? value : "--";
  return (
    <div
      className="flex flex-col justify-between p-8 gap-4 w-[342px] h-[226px] bg-white rounded-[32px]"
      style={{ boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.15)" }}
    >
      <p className="m-0 text-[var(--dc-cinza-escuro-texto)]" style={{ fontFamily: "var(--font-manrope)", fontWeight: 600, fontSize: 14 }}>
        Resumo da Glicemia
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span style={{ fontFamily: "var(--font-manrope)", fontWeight: 800, fontSize: 48, color: "var(--dc-azul)", lineHeight: 1 }}>
            {displayValue}
          </span>
          <span style={{ fontFamily: "var(--font-inter)", fontWeight: 400, fontSize: 14, color: "var(--dc-cinza-claro-texto)" }}>
            mg/dL
          </span>
        </div>

        <MdOutlineWaterDrop
          size={80}
          className="text-[var(--dc-cinza-claro-fundo)] opacity-60 shrink-0"
        />
      </div>

      <div className="flex items-center gap-2">
        <span
          className="detail px-3 py-1 rounded-full uppercase"
          style={{ background: "var(--dc-azul-claro)", color: "var(--dc-azul-escuro)" }}
        >
          {moment}
        </span>
        {status && (
          <span
            className="detail px-3 py-1 rounded-full uppercase"
            style={{ background: "var(--dc-cinza-escuro-fundo)", color: "var(--dc-cinza-escuro-texto)" }}
          >
            {status}
          </span>
        )}
      </div>
    </div>
  );
}
