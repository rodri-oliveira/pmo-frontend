"use client";

"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Header from '@/components/admin/Header';
import Sidebar from '@/components/admin/Sidebar';
import Toolbar from '@mui/material/Toolbar';
import Footer from '@/components/admin/Footer'; // Importando o novo rodapé

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleGestorViewClick = () => {
    router.push('/visao-gestor');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Header handleDrawerToggle={handleDrawerToggle} onGestorViewClick={handleGestorViewClick} />
      <Sidebar />
      <Box
        component="div" // Wrapper for main content and footer
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          minHeight: '100vh', // Ensure this wrapper takes full height
        }}
      >
        <Box
          component="main"
          sx={{
            flexGrow: 1, // Main content grows to push footer down
            p: 3,
            width: '100%',
          }}
        >
          <Toolbar />
          {children}
        </Box>
        <Footer />
      </Box>
    </Box>
  );
}

