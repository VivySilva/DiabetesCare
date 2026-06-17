import supabase from '../config/supabase';

async function testCategory(cat: string) {
  const { data, error } = await supabase
    .from("community_posts")
    .insert([
      {
        author_id: "2c78c10e-1d9f-4731-8609-9ee6b5ff7376",
        title: `Test category ${cat}`,
        cover_image_url: null,
        category: cat,
        content_html: "<p>Test</p>",
        is_moderated: false
      }
    ])
    .select();

  if (error) {
    // console.log(`❌ ${cat}: error code ${error.code}, message: ${error.message}`);
  } else {
    console.log(`✅ ${cat}: success! ID ${data[0].id}`);
    await supabase.from("community_posts").delete().eq("id", data[0].id);
  }
}

async function run() {
  const tests = [
    "Medicação", "Medicações", "Medicamentos", "Insulina", "Tratamento", "Dicas", "Prevenção", "Saúde Geral", "Outros", "Alimentação", "Exercício", "Medicamento"
  ];
  for (const t of tests) {
    await testCategory(t);
  }
}

run();
