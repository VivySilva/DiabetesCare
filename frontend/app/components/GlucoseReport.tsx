import {
  MdOutlineWbSunny,
  MdOutlineFreeBreakfast,
  MdOutlineLunchDining,
  MdOutlineRestaurantMenu,
  MdOutlineDinnerDining,
  MdOutlineNightlight,
} from "react-icons/md";

export type GlucoseCategory =
  | "Jejum"
  | "Pós-desjejum"
  | "Pós-prandial"
  | "Pré-prandial"
  | "Pré-jantar"
  | "Pós-jantar"
  | "Antes de dormir";

export interface GlucoseReading {
  category: GlucoseCategory;
  value: number;
  status?: string;
}

const CATEGORY_ICONS: Record<GlucoseCategory, React.ReactNode> = {
  "Jejum":           <MdOutlineWbSunny size={28} />,
  "Pós-desjejum":   <MdOutlineFreeBreakfast size={28} />,
  "Pós-prandial":   <MdOutlineLunchDining size={28} />,
  "Pré-prandial":   <MdOutlineRestaurantMenu size={28} />,
  "Pré-jantar":     <MdOutlineDinnerDining size={28} />,
  "Pós-jantar":     <MdOutlineDinnerDining size={28} />,
  "Antes de dormir":<MdOutlineNightlight size={28} />,
};

// Dados de demonstração
const DEMO_READINGS: GlucoseReading[] = [
  { category: "Jejum",            value: 91.3 },
  { category: "Pós-prandial",     value: 136.1 },
  { category: "Antes de dormir",  value: 120.3, status: "Estável" },
];

interface Props {
  readings?: GlucoseReading[];
}

export default function GlucoseReport({ readings = DEMO_READINGS }: Props) {
  const last3 = readings.slice(-3);
  const previous = last3.slice(0, -1);   
  const latest = last3[last3.length - 1]; 

  return (
    <div className="flex flex-col gap-4 w-[342px]">
      <p className="m-0 text-[var(--dc-cinza-claro-texto)]" style={{ fontFamily: "var(--font-manrope)", fontWeight: 600, fontSize: 14 }}>
        Relatório de Medidas
      </p>

      {previous.length > 0 && (
        <div className="flex gap-3">
          {previous.map((r) => (
            <div
              key={r.category}
              className="flex flex-col justify-between p-4 gap-2 flex-1 bg-white rounded-2xl"
              style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.10)" }}
            >
              <span
                className="uppercase"
                style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: 11, color: "var(--dc-azul)" }}
              >
                {r.category}
              </span>
              <div className="flex items-baseline gap-1">
                <span style={{ fontFamily: "var(--font-manrope)", fontWeight: 800, fontSize: 22, color: "var(--dc-texto)" }}>
                  {r.value}
                </span>
                <span style={{ fontFamily: "var(--font-inter)", fontWeight: 400, fontSize: 12, color: "var(--dc-cinza-claro-texto)" }}>
                  mg/dL
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        className="flex items-center gap-4 p-4 bg-white rounded-2xl"
        style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.10)" }}
      >
        <div
          className="flex items-center justify-center shrink-0 w-12 h-12 rounded-full"
          style={{ background: "var(--dc-azul-claro)", color: "var(--dc-azul)" }}
        >
          {CATEGORY_ICONS[latest.category]}
        </div>

        <div className="flex flex-col gap-0.5 flex-1">
          <span
            className="uppercase"
            style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: 11, color: "var(--dc-cinza-claro-texto)" }}
          >
            {latest.category}
          </span>
          <div className="flex items-baseline gap-1">
            <span style={{ fontFamily: "var(--font-manrope)", fontWeight: 800, fontSize: 22, color: "var(--dc-texto)" }}>
              {latest.value}
            </span>
            <span style={{ fontFamily: "var(--font-inter)", fontWeight: 400, fontSize: 12, color: "var(--dc-cinza-claro-texto)" }}>
              mg/dL
            </span>
          </div>
        </div>

        {latest.status && (
          <span
            className="shrink-0 px-3 py-1 rounded-full uppercase"
            style={{
              fontFamily: "var(--font-inter)",
              fontWeight: 700,
              fontSize: 11,
              background: "var(--dc-cinza-escuro-fundo)",
              color: "var(--dc-cinza-escuro-texto)",
            }}
          >
            {latest.status}
          </span>
        )}
      </div>
    </div>
  );
}
