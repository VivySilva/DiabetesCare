import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function CommunityPage() {
  return (
    <main className="min-h-screen bg-white pb-[91px]">
      <Header title="Comunidade" variant="home" />

      <section className="flex flex-col items-center justify-center px-[33px] pt-12 gap-6 w-full text-center">
        <h1 className="text-azul">Comunidade</h1>
        <p className="text-cinza-claro-texto">
          Esta tela será desenvolvida em breve. Aqui você poderá interagir com outros pacientes e compartilhar experiências.
        </p>
      </section>

      <Footer />
    </main>
  );
}
