// Arquivo: app/layout.tsx
// Local: C:\weg\automacaopmofrontend\app\layout.tsx
import * as React from 'react';
import ThemeRegistry from '@/components/ThemeRegistry'; // Importar o ThemeRegistry

// Se você tiver metadados, mantenha-os ou adicione-os aqui
// export const metadata = {
//   title: 'Meu App',
//   description: 'Gerado pelo Next.js',
// };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR"> { /* Ou a linguagem que preferir */ }
      <body>
        <ThemeRegistry>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
