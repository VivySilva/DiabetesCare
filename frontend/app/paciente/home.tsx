import Header from "../components/Header";
import GlucoseSummary from "../components/GlucoseSummary";
import GlucoseReport from "../components/GlucoseReport";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white pb-[91px]">
      <Header
        title="DiabetesCare"
        titleColor="var(--dc-azul-escuro)"
        variant="home"
      />

      <section className="flex flex-col items-center px-[33px] pt-6 gap-6">
        <GlucoseSummary value={115} moment="Em jejum" status="Estável" />

        <GlucoseReport />

        {/* Próximos componentes:
            - Dashboard
            - Posts educacionais
        */}
      </section>

      <Footer />
    </main>
  );
}
