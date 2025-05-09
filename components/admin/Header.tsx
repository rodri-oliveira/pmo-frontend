"use client";

import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu'; // Exemplo de ícone, pode ser ajustado
import { useSession, signOut } from "next-auth/react"; // Importar useSession e signOut
import LogoutIcon from '@mui/icons-material/Logout'; // Ícone para o botão de logout

const drawerWidth = 240;

export default function Header({ handleDrawerToggle }: { handleDrawerToggle?: () => void }) {
  const { data: session } = useSession(); // Hook para obter a sessão

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" }); // Redireciona para /login após o logout
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        zIndex: 1200 // Valor fixo em vez de função
      }}
    >
      <Toolbar>
        {handleDrawerToggle && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }} // Mostrar apenas em telas pequenas se o drawer for responsivo
          >
            <MenuIcon />
          </IconButton>
        )}
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Gestão de Projetos e Melhorias 
        </Typography>
        
        {session?.user?.name && (
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            {session.user.name} 
          </Typography>
        )}
        
        <Button 
          color="inherit" 
          onClick={handleSignOut}
          startIcon={<LogoutIcon />}
        >
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}

