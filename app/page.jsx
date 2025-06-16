// Arquivo: app/page.tsx
// Local: C:\weg\automacaopmofrontend\app\page.tsx

import { redirect } from "next/navigation";

export default function HomePage() {
  // Redireciona incondicionalmente para /login
  redirect("/login");
  return null; // Esta linha não será alcançada
}

