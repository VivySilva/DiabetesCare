export interface Post {
  id: string;
  title: string;
  author: string;
  avatarUrl?: string;
  date: string;
  image: string;
  content: string[];
  authorId?: string;
  authorRole?: string;
}

export const COMMUNITY_POSTS: Post[] = [
  {
    id: "post-1",
    title: "Alimentos que ajudam a estabilizar a glicemia matinal",
    author: "Dra. Beatriz Silva",
    date: "24 de Maio, 2024",
    image: "https://pixeluss.com/wp-content/uploads/2025/02/Alimentos-Ajudam-Regular-Glicose.jpg",
    content: [
      "O fenômeno do amanhecer pode ser um desafio para quem convive com o diabetes. Iniciar o dia com as escolhas certas no café da manhã é fundamental para evitar picos de insulina e manter a energia estável até o almoço.",
      "A chave não está apenas em restringir carboidratos, mas em como combiná-los. Ao adicionar fibras solúveis e gorduras saudáveis, retardamos a absorção de glicose na corrente sanguínea.",
      "1. Sementes de Chia e Linhaça",
      "Poderosas aliadas da digestão lenta, essas sementes criam um gel no estômago que impede a subida rápida do açúcar. Além disso, são ricas em Ômega-3, combatendo inflamações sistêmicas.",
      "2. Ovos e Proteínas Magras",
      "A proteína ajuda a aumentar a saciedade e diminui a velocidade da digestão, evitando assim que o nível de glicose dispare. Um a dois ovos mexidos ou cozidos pela manhã podem fazer uma enorme diferença no seu controle."
    ]
  },
  {
    id: "post-2",
    title: "A importância do exercício físico no controle da resistência à insulina",
    author: "Dr. Roberto Mendes (Endocrinologista)",
    date: "15 de Maio, 2024",
    image: "https://s2-ge.glbimg.com/FDK1_bXf8e0AYSOrAZK2noQsW7A=/1254x0/filters:format(jpeg)/https://i.s3.glbimg.com/v1/AUTH_bc8228b6673f488aa253bbcb03c80ec5/internal_photos/bs/2021/1/U/rN7nPlQpenr2BtQwI5Kg/exercicios-alimentacao.jpg",
    content: [
      "Praticar atividades físicas não serve apenas para manter a forma ou queimar calorias. O exercício tem um papel direto e fundamental em como o seu corpo processa e utiliza a insulina.",
      "Quando você realiza exercícios aeróbicos ou treinamento de força, as células musculares se tornam temporariamente mais sensíveis à insulina. Isso significa que o seu corpo precisa de menos insulina para transportar a glicose do sangue para dentro das células, reduzindo os níveis totais.",
      "Recomendação de Especialistas",
      "A orientação geral é buscar pelo menos 150 minutos de atividade física moderada por semana. Uma simples caminhada mais vigorosa após o almoço ou o jantar, por apenas 15 a 20 minutos, já ajuda de forma significativa a minimizar os picos glicêmicos pós-prandiais.",
      "Lembre-se sempre de conversar com sua equipe médica e de verificar suas taxas antes do exercício para evitar quadros de hipoglicemia surpresa."
    ]
  },
  {
    id: "post-3",
    title: "Saúde Mental e Diabetes: O impacto invisível do estresse na glicemia",
    author: "Psic. Camila Fernandes",
    date: "02 de Maio, 2024",
    image: "https://universo.uniateneu.edu.br/wp-content/uploads/2023/10/Saude-mental.jpg",
    content: [
      "Você sabia que o seu estado emocional pode refletir diretamente nos números do seu glicosímetro? O estresse constante não afeta apenas a mente; ele causa mudanças fisiológicas profundas e reais.",
      "Ao estarmos sob forte tensão, nosso corpo entra em estado de alerta e libera grandes quantidades de hormônios como cortisol e adrenalina. O corpo, entendendo que precisa de 'energia rápida' para uma possível fuga, faz com que o fígado despeje reservas de glicose diretamente na corrente sanguínea.",
      "Dicas para Manejo de Estresse",
      "Como é impossível eliminar todas as fontes de estresse moderno, precisamos mudar a forma como reagimos a elas. A respiração profunda, higiene do sono e pausas focadas longe das telas e redes sociais têm mostrado resultados clínicos práticos na diminuição da resistência à insulina emocional.",
      "Compartilhar as angústias do diabetes (conhecido como Burnout do Diabetes) com amigos, família ou num ambiente terapêutico também é uma forma comprovada de abaixar a carga mental do tratamento."
    ]
  }
];
