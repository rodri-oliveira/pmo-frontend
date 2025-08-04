"use client";

import React from 'react';
import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useSession, signOut } from "next-auth/react";
import LogoutIcon from '@mui/icons-material/Logout';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const drawerWidth = 240;

export default function Header({ handleDrawerToggle, onGestorViewClick }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [anchorElUser, setAnchorElUser] = useState(null);
  
  // Determinar qual tab está ativa com base no pathname
  const getActiveTab = () => {
    if (pathname === '/dashboard') return false; // Não seleciona nenhuma aba para o dashboard
    if (pathname?.includes('/planejamento')) return 0;
    if (pathname?.includes('/apontamentos')) return 1;
    if (pathname?.includes('/gerenciamento')) return 2;
    if (pathname?.includes('/administracao')) return 3;
    return false; // Padrão para não selecionar nenhuma aba
  };
  
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleSignOut = async () => {
    handleCloseUserMenu();
    await signOut({ callbackUrl: "/login" });
  };

  // Se estivermos no dashboard, renderiza o header personalizado (barra azul simples)
  if (pathname === '/dashboard') {
    return (
      <AppBar position="fixed" sx={{ backgroundColor: '#00579d', zIndex: 2000, width: '100vw', left: 0, top: 0 }}>
        <Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 0.5, backgroundColor: '#fff', border: '1px solid #fff', borderRadius: 1, display: 'flex', alignItems: 'center' }}>
              <Box component="img" src="/images/weg-logo.png" alt="Logo WEG" sx={{ height: 28, width: 'auto' }} />
            </Box>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              WEG PMO - Gestão de Projetos
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Typography component={Link} href="/dashboard" sx={{ color: '#fff', textDecoration: 'none', fontWeight: 500 }}>
              Dashboard
            </Typography>
            <Button
              component={Link}
              href="/visao-gestor"
              sx={{
                backgroundColor: '#00612E',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '0.875rem',
                textTransform: 'none',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: '#004d1f',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 8px rgba(0, 97, 46, 0.3)'
                }
              }}
            >
              Controle de Capacidade e Alocação
            </Button>
            <Button
              component={Link}
              href="/indicadores-departamento"
              sx={{
                backgroundColor: '#00579d',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '0.875rem',
                textTransform: 'none',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: '#00447c',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 8px rgba(0, 87, 157, 0.3)'
                }
              }}
            >
              Indicadores do Departamento
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
    );
  }

  // Header padrão para demais páginas
  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        zIndex: 1200,
        backgroundColor: '#fafafa',
        color: '#333',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      <Toolbar>
        {handleDrawerToggle && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <Typography 
          variant="h6" 
          noWrap 
          component="div" 
          sx={{ 
            display: { xs: 'none', md: 'flex' }, 
            mr: 4,
            color: '#00579d',
            fontWeight: 600
          }}
        >
          Automação PMO
        </Typography>
        
        {/* Abas de navegação removidas conforme solicitado */}
        <Box sx={{ flexGrow: 1 }} />
        
        {/* Menu do usuário removido conforme solicitado */}
      </Toolbar>
    </AppBar>
  );
}

