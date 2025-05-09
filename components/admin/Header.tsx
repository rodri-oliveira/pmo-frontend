"use client";

import * as React from 'react';
import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { useSession, signOut } from "next-auth/react";
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Link from 'next/link';
import { useTheme } from '@mui/material/styles';

const drawerWidth = 260; // Deve ser o mesmo valor usado no Sidebar

export default function Header({ handleDrawerToggle }: { handleDrawerToggle?: () => void }) {
  const { data: session } = useSession();
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const theme = useTheme();

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleSignOut = async () => {
    handleCloseUserMenu();
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` }, // Ajustado para md em vez de sm para melhor responsividade
        ml: { md: `${drawerWidth}px` },
        // zIndex já é gerenciado pelo theme.components.MuiAppBar.styleOverrides
        // backgroundColor e color também são gerenciados pelo tema
        // boxShadow também é gerenciado pelo tema
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {handleDrawerToggle && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }} // Mostrar apenas em telas menores que md
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              display: { xs: 'none', sm: 'flex' }, // Mostrar a partir de sm
              fontWeight: 600,
              color: theme.palette.primary.main, // Usar cor primária do tema para destaque
            }}
          >
            Gestão PMO Corporativo {/* Nome mais genérico ou título da página atual */}
          </Typography>
        </Box>
        
        {/* Menu do usuário */}
        <Box sx={{ flexGrow: 0 }}>
          <Tooltip title="Opções do usuário">
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar 
                alt={session?.user?.name || "Usuário"} 
                // src="/images/avatar.png" // Pode ser uma imagem padrão ou vinda do usuário
                sx={{ 
                  bgcolor: theme.palette.secondary.main, // Usar cor secundária para o Avatar
                  width: 40,
                  height: 40,
                  fontSize: '1.1rem'
                }}
              >
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            sx={{ mt: '45px' }}
            id="menu-appbar-user"
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
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
          >
            {session?.user?.name && (
              <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                 <Typography variant="subtitle1" fontWeight="600">{session.user.name}</Typography>
                 <Typography variant="body2" color="text.secondary">{session.user.email}</Typography>
              </Box>
            )}
            <MenuItem onClick={handleCloseUserMenu} component={Link} href="/(admin)/perfil">
              <AccountCircleOutlinedIcon sx={{ mr: 1.5, color: 'text.secondary' }} />
              Meu Perfil
            </MenuItem>
            <MenuItem onClick={handleCloseUserMenu} component={Link} href="/(admin)/administracao/configuracoes"> {/* Exemplo de link para configurações */}
              <SettingsOutlinedIcon sx={{ mr: 1.5, color: 'text.secondary' }} />
              Configurações
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleSignOut} sx={{ color: theme.palette.error.main }}>
              <LogoutIcon sx={{ mr: 1.5 }} />
              Sair
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

