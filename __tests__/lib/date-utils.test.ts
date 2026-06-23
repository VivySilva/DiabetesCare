import { describe, expect, test } from "vitest";
import {
  buildWeeklyChartDays,
  parseRecordDate,
  recordsForLocalDate,
  toLocalDateKey,
} from "@/lib/date-utils";

describe("date-utils (gráfico de glicemia)", () => {
  test("registro de terça deve cair na coluna TER", () => {
    const tuesday = new Date(2026, 5, 23, 15, 30, 0);
    const records = [
      {
        created_at: tuesday.toISOString(),
        glucose_value: 120,
        period: "Jejum",
      },
    ];

    const week = buildWeeklyChartDays(tuesday);
    const tuesdayColumn = week.find((day) => day.label === "TER");

    expect(tuesdayColumn).toBeTruthy();
    expect(recordsForLocalDate(records, tuesdayColumn!.date)).toHaveLength(1);
  });

  test("data YYYY-MM-DD não deve voltar um dia no fuso local", () => {
    const tuesday = new Date(2026, 5, 23);
    const records = [{ created_at: "2026-06-23", glucose_value: 110, period: "Jejum" }];

    expect(toLocalDateKey(parseRecordDate("2026-06-23"))).toBe("2026-06-23");
    expect(recordsForLocalDate(records, tuesday)).toHaveLength(1);
  });

  test("semana deve terminar no dia atual", () => {
    const tuesday = new Date(2026, 5, 23);
    const week = buildWeeklyChartDays(tuesday);

    expect(week.at(-1)?.label).toBe("TER");
  });
});
