const createAccount = async (data) => {
  try {
    const res = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    
    const json = await res.json();
    if (res.ok) {
      console.log(`✅ Sucesso ao criar: ${data.email}`, json);
    } else {
      console.error(`❌ Erro ao criar: ${data.email}`, json);
    }
  } catch (err) {
    console.error(`❌ Exceção ao criar ${data.email}:`, err.message);
  }
};

const run = async () => {
  const patient = {
    name: "Maria Paciente",
    email: "maria@teste.com",
    password: "Password123!",
    confirmPassword: "Password123!",
    role: "patient"
  };

  const professional = {
    name: "Dr. Carlos Médico",
    email: "carlos@teste.com",
    password: "Password123!",
    confirmPassword: "Password123!",
    role: "professional",
    licenseNumber: "CRM 123456/SP"
  };

  await createAccount(patient);
  await createAccount(professional);
};

run();
