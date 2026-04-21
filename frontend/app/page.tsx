import { redirect } from 'next/navigation';

export default function Home() {
  // Redireciona para o login por padrão. 
  // Futuramente, aqui pode ser feita a verificação de autenticação.
  redirect('/login');
}
