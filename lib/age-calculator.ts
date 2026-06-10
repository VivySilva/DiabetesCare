/**
 * Calcula a idade em anos baseado na data de nascimento.
 * 
 * @param birthDate - A data de nascimento (string no formato YYYY-MM-DD ou Date object)
 * @returns A idade em anos (número inteiro)
 */
export function calculateAge(birthDate: string | Date): number {
  let birth: Date;
  if (typeof birthDate === 'string') {
    const cleanDate = birthDate.split("T")[0];
    const parts = cleanDate.split("-");
    if (parts.length === 3) {
      birth = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    } else {
      birth = new Date(birthDate);
    }
  } else {
    birth = birthDate;
  }
  
  const today = new Date();
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDifference = today.getMonth() - birth.getMonth();
  
  // Se o aniversário ainda não chegou este ano, subtrai 1
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Formata a data de nascimento para o formato brasileiro (DD/MM/YYYY).
 * 
 * @param birthDate - A data de nascimento (string no formato YYYY-MM-DD ou Date object)
 * @returns Data formatada como DD/MM/YYYY
 */
export function formatBirthDate(birthDate: string | Date): string {
  if (typeof birthDate === 'string') {
    const cleanDate = birthDate.split("T")[0];
    const parts = cleanDate.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  }
  
  const birth = birthDate as Date;
  const day = String(birth.getDate()).padStart(2, '0');
  const month = String(birth.getMonth() + 1).padStart(2, '0');
  const year = birth.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Converte data do formato brasileiro (DD/MM/YYYY) para YYYY-MM-DD de forma imune a timezones.
 * 
 * @param dateStr - Data no formato DD/MM/YYYY
 * @returns Data no formato YYYY-MM-DD ou null se inválida
 */
export function convertBrazilianDateToISO(dateStr: string): string | null {
  const parts = dateStr.split('/');
  if (parts.length !== 3) {
    return null;
  }
  
  const [day, month, year] = parts;
  if (!day || !month || !year || day.length !== 2 || month.length !== 2 || year.length !== 4) {
    return null;
  }
  
  const d = parseInt(day);
  const m = parseInt(month);
  const y = parseInt(year);
  
  if (isNaN(d) || isNaN(m) || isNaN(y)) {
    return null;
  }
  
  if (m < 1 || m > 12 || d < 1 || d > 31) {
    return null;
  }
  
  // Retorna a string ISO diretamente sem passar por conversões de timezone
  return `${year}-${month}-${day}`;
}
