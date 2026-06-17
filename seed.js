const fetch = global.fetch;

const API_URL = "http://localhost:3000/api";

const login = async (email, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`Falha no login de ${email}`);
  const json = await res.json();
  return json.data.token;
};

const sendPost = async (endpoint, token, payload) => {
  const res = await fetch(`${API_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) {
    console.error(`❌ Erro em POST /${endpoint}:`, json);
  } else {
    console.log(`✅ Sucesso em POST /${endpoint}:`, json.mensagem || "Criado com sucesso");
  }
};

const runSeed = async () => {
  console.log("🌱 Iniciando o Seeding...");
  try {
    const patientToken = await login("maria@teste.com", "Password123!");
    console.log("🔐 Login do Paciente OK");

    const profToken = await login("carlos@teste.com", "Password123!");
    console.log("🔐 Login do Profissional OK");

    // ==========================================
    // 1. POPULAR GLICEMIA (Paciente)
    // ==========================================
    console.log("🩸 Populando Histórico de Glicemia...");
    const glucoseData = [
      { glucose_value: 95, period: "Jejum", took_insulin: false },
      { glucose_value: 140, period: "Pós-prandial", took_insulin: true, insulin_type: "Rápida", insulin_amount: 5, injection_site: "Abdômen" },
      { glucose_value: 110, period: "Pré-prandial", took_insulin: false },
      { glucose_value: 185, period: "Antes de Dormir", took_insulin: true, insulin_type: "Lenta", insulin_amount: 10, injection_site: "Coxa", symptoms: ["Sede"], symptom_intensity: 3 },
      { glucose_value: 80, period: "Jejum", took_insulin: false },
      { glucose_value: 210, period: "Pós-prandial", took_insulin: true, insulin_type: "Rápida", insulin_amount: 8, injection_site: "Braço" }
    ];

    for (const data of glucoseData) {
      await sendPost("glucose", patientToken, data);
    }

    // ==========================================
    // 2. POPULAR MEDICAMENTOS (Paciente)
    // ==========================================
    console.log("💊 Populando Medicamentos...");
    const medsData = [
      { category: "Medicamento Oral", medication_name: "Metformina 500mg", time: "08:00", notify: true },
      { category: "Insulina", medication_name: "Glargina 15 UI", time: "22:00", notify: false }
    ];

    for (const data of medsData) {
      await sendPost("medications", patientToken, data);
    }

    // ==========================================
    // 3. POPULAR COMUNIDADE (Profissional)
    // ==========================================
    console.log("📰 Populando Feed da Comunidade (Profissional)...");
    const postsData = [
      { 
        title: "A importância da hidratação na Diabetes", 
        content_html: "<p>Beber água adequadamente ajuda a diluir o açúcar no sangue. Pacientes diabéticos devem consumir em média 2L a 3L de água por dia. A desidratação pode piorar a hiperglicemia!</p>", 
        category: "Saúde",
        cover_image_url: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?q=80&w=600&auto=format&fit=crop"
      },
      { 
        title: "Exercício físico e Insulina", 
        content_html: "<p>Sempre verifique sua glicemia antes de praticar esportes. Se estiver muito baixa, consuma um carboidrato. Se estiver muito alta, tenha cautela com o exercício.</p>", 
        category: "Saúde",
        cover_image_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop"
      },
      {
        title: "O que é o Efeito Somogyi e como evitá-lo?",
        content_html: "<p>O efeito Somogyi acontece quando ocorre uma hipoglicemia de madrugada, e em resposta o corpo libera hormônios que aumentam o açúcar, causando hiperglicemia pela manhã.</p><p>Para evitar, seu médico pode ajustar a dose da insulina basal ou recomendar um pequeno lanche antes de dormir.</p>",
        category: "Saúde",
        cover_image_url: "https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?q=80&w=600&auto=format&fit=crop"
      },
      {
        title: "Contagem de Carboidratos: O básico para iniciantes",
        content_html: "<p>A contagem de carboidratos é uma estratégia flexível. Você calcula quantos gramas de carboidratos vai comer e aplica a dose correta de insulina.</p><p>É importante ler os rótulos dos alimentos e conhecer a relação Insulina/Carboidrato que o seu nutricionista definiu.</p>",
        category: "Saúde",
        cover_image_url: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=600&auto=format&fit=crop"
      },
      {
        title: "Atenção com os Pés (Pé Diabético)",
        content_html: "<p>Inspecione seus pés todos os dias. A neuropatia pode diminuir a sensibilidade, fazendo com que pequenos cortes virem úlceras graves.</p><ul><li>Use sapatos confortáveis</li><li>Seque bem entre os dedos</li><li>Nunca corte calos por conta própria</li></ul>",
        category: "Saúde",
        cover_image_url: "https://images.unsplash.com/photo-1606240724602-5b21f896eae8?q=80&w=600&auto=format&fit=crop"
      },
      {
        title: "Sobremesas Low-Carb para o fim de semana",
        content_html: "<p>Ter diabetes não significa cortar os doces para sempre! Você pode preparar receitas com adoçantes naturais como Stevia, Xilitol e Eritritol.</p><p>Experimente um mousse de cacau com abacate ou um bolo de farinha de amêndoas!</p>",
        category: "Saúde",
        cover_image_url: "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=600&auto=format&fit=crop"
      }
    ];

    for (const data of postsData) {
      await sendPost("community", profToken, data);
    }

    // ==========================================
    // 4. POPULAR FÓRUM (Paciente pergunta, Profissional responde)
    // ==========================================
    console.log("💬 Populando Tópicos do Fórum...");
    const forumTopic = { title: "Dúvida sobre consumo de frutas", content: "Quais frutas posso comer à vontade e quais devo evitar para não dar pico de insulina?" };
    await sendPost("forum", patientToken, forumTopic);
    // Nota: A resposta num tópico exigiria capturar o ID do tópico criado. Vamos apenas criar 2 tópicos por agora para ter volume visual.
    
    const forumTopic2 = { title: "Dor nas pernas à noite", content: "Estou sentindo muitas cãibras noturnas. Alguém mais passa por isso?" };
    await sendPost("forum", patientToken, forumTopic2);

    console.log("🎉 Seed concluído com sucesso!");
  } catch (error) {
    console.error("❌ Falha no Seed:", error.message);
  }
};

runSeed();
