const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL || "https://dcsfcubukzifscfbnlnx.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjc2ZjdWJ1a3ppZnNjZmJubG54Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTIyMjEzNywiZXhwIjoyMDkwNzk4MTM3fQ.4Hlom21EGOicRwinERPmtWy2gfNbay2KBEfWSfeCDD0";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data: users, error: err1 } = await supabase.from("users").select("*").limit(1);
  console.log("Users table structure (1 row):", err1 ? err1.message : users);

  const { data: patients, error: err2 } = await supabase.from("patients").select("*").limit(1);
  console.log("Patients table structure (1 row):", err2 ? err2.message : patients);

  const { data: professionals, error: err3 } = await supabase.from("professionals").select("*").limit(1);
  console.log("Professionals table structure (1 row):", err3 ? err3.message : professionals);
}

checkSchema();
