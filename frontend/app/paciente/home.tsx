import Header from "../components/Header";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header
        title="DiabetesCare"
        titleColor="var(--dc-azul-escuro)"
        variant="home"
      />

      {/* Próximos componentes:
          - Dados de cadastro de glicemia
          - Dashboard
          - Posts educacionais
          - Navbar inferior
      */}
    </main>
  );
}
