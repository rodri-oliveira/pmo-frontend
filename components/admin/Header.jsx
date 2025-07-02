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
              variant="contained"
              sx={{ backgroundColor: '#fff', color: '#00579d', fontWeight: 600, '&:hover': { backgroundColor: '#f5f5f5' } }}
              onClick={onGestorViewClick}
            >
              Visão do Gestor
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
        backgroundColor: '#fff',
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
        
        {/* Menu de navegação principal no topo */}
        <Tabs 
          value={getActiveTab()} 
          sx={{ 
            flexGrow: 1,
            '& .MuiTab-root': {
              color: '#555',
              '&.Mui-selected': {
                color: '#00579d',
                fontWeight: 600
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#00579d'
            }
          }}
        >
          <Tab 
            label="Planejamento" 
            component={Link}
            href="/admin/planejamento/horas-recurso"
          />
          <Tab 
            label="Apontamentos" 
            component={Link}
            href="/apontamentos/consultar-gerenciar"
          />
          <Tab 
            label="Gerenciamento" 
            component={Link}
            href="/gerenciamento/projetos"
          />
          <Tab 
            label="Administração" 
            component={Link}
            href="/administracao/configuracoes"
          />
        </Tabs>
        
        {/* Menu do usuário */}
        <Box sx={{ flexGrow: 0, ml: 2 }}>
          <Tooltip title="Opções do usuário">
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar 
                alt={session?.user?.name || "Usuário"} 
                sx={{ 
                  bgcolor: '#00579d',
                  width: 40,
                  height: 40
                }}
              >
                {session?.user?.name ? session.user.name.charAt(0) : "U"}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            sx={{ mt: '45px' }}
            id="menu-appbar"
            anchorEl={anchorElUser}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
          >
            {session?.user?.name && (
              <MenuItem disabled>
                <Typography textAlign="center">{session.user.name}</Typography>
              </MenuItem>
            )}
            <MenuItem onClick={handleCloseUserMenu} component={Link} href="/perfil">
              <Typography textAlign="center">Meu Perfil</Typography>
            </MenuItem>
            <MenuItem onClick={handleSignOut}>
              <Typography textAlign="center" sx={{ display: 'flex', alignItems: 'center' }}>
                <LogoutIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                Sair
        </Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

