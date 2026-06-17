const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL || "https://dcsfcubukzifscfbnlnx.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjc2ZjdWJ1a3ppZnNjZmJubG54Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTIyMjEzNywiZXhwIjoyMDkwNzk4MTM3fQ.4Hlom21EGOicRwinERPmtWy2gfNbay2KBEfWSfeCDD0";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkMeds() {
  const { data, error } = await supabase
    .from("medication_records")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching medication records:", error);
    return;
  }

  console.log("Found medications count:", data.length);
  data.forEach((med) => {
    console.log(`ID: ${med.id} | Name: ${med.medication_name} | Time: ${JSON.stringify(med.time)} | Notify: ${med.notify} | Created: ${med.created_at}`);
  });
}

checkMeds();
