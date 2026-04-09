export async function getTest() {
  const res = await fetch("http://localhost:3001");
  return res.text();
}