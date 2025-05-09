"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AssessmentIcon from '@mui/icons-material/Assessment';
import GroupIcon from '@mui/icons-material/Group';
import SettingsIcon from '@mui/icons-material/Settings';
import FolderIcon from '@mui/icons-material/Folder';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import BusinessIcon from '@mui/icons-material/Business';
import TocIcon from '@mui/icons-material/Toc';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import HistoryIcon from '@mui/icons-material/History';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', href: '/dashboard', icon: <DashboardIcon /> },
  {
    text: 'Planejamento',
    icon: <EventNoteIcon />,
    subItems: [
      { text: 'Planejar Horas por Recurso', href: '/planejamento/horas-recurso', icon: <BarChartIcon /> },
      { text: 'Gerenciar Alocações', href: '/planejamento/alocacoes', icon: <AssignmentIcon /> },
      { text: 'Capacidade RH', href: '/planejamento/capacidade-rh', icon: <PeopleAltIcon /> },
    ],
  },
  {
    text: 'Apontamentos',
    icon: <AssessmentIcon />,
    subItems: [
      { text: 'Consultar/Gerenciar', href: '/apontamentos/consultar-gerenciar', icon: <TocIcon /> },
      { text: 'Criar Apontamento Manual', href: '/apontamentos/criar-manual', icon: <AssignmentIcon /> },
    ],
  },
  {
    text: 'Gerenciamento',
    icon: <FolderIcon />,
    subItems: [
      { text: 'Projetos / Melhorias', href: '/gerenciamento/projetos', icon: <FolderIcon /> },
      { text: 'Recursos', href: '/gerenciamento/recursos', icon: <GroupIcon /> },
      { text: 'Equipes', href: '/gerenciamento/equipes', icon: <PeopleAltIcon /> },
      { text: 'Seções', href: '/gerenciamento/secoes', icon: <BusinessIcon /> },
      { text: 'Status de Projetos', href: '/gerenciamento/status-projetos', icon: <TocIcon /> },
    ],
  },
  {
    text: 'Administração',
    icon: <AdminPanelSettingsIcon />,
    subItems: [
      { text: 'Usuários do Sistema', href: '/administracao/usuarios', icon: <GroupIcon /> },
      { text: 'Configurações Gerais', href: '/administracao/configuracoes', icon: <SettingsIcon /> },
      { text: 'Integração Jira', href: '/administracao/integracao-jira', icon: <SyncAltIcon /> },
      { text: 'Logs de Atividade', href: '/administracao/logs-atividade', icon: <HistoryIcon /> },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const корпоративCorPrincipal = '#00579d';
  const активнаяCorФона = '#e3f2fd';
  const активнаяCorТекстаИИконки = корпоративCorPrincipal;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { 
          width: drawerWidth, 
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto', py: 1 }}>
        <List disablePadding>
          {menuItems.map((item) => {
            const isParentActive = item.subItems 
              ? item.subItems.some(subItem => pathname === `/(admin)${subItem.href}`) 
              : pathname === `/(admin)${item.href}`;

            return (
              <div key={item.text}>
                {item.subItems ? (
                  <React.Fragment>
                    <ListItemButton
                      sx={{
                        minHeight: 48,
                        justifyContent: 'initial',
                        px: 2.5,
                        py: 1.25,
                      }}
                    >
                      <ListItemIcon sx={{ 
                        minWidth: 0, 
                        mr: 2,
                        justifyContent: 'center',
                        color: корпоративCorPrincipal,
                      }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.text} 
                        primaryTypographyProps={{ 
                          fontWeight: 500,
                        }} 
                      />
                    </ListItemButton>
                    <List disablePadding sx={{ pl: 2.5 }}>
                      {item.subItems.map((subItem) => {
                        const isActive = pathname === `/(admin)${subItem.href}`;
                        return (
                          <ListItem key={subItem.text} disablePadding sx={{ display: 'block' }}>
                            <ListItemButton
                              component={Link}
                              href={`/(admin)${subItem.href}`}
                              selected={isActive}
                              sx={{
                                py: 0.75,
                                pl: 4.5,
                                minHeight: 32,
                                bgcolor: isActive ? активнаяCorФона : 'transparent',
                                '&.Mui-selected': {
                                  backgroundColor: активнаяCorФона,
                                  '&:hover': {
                                    backgroundColor: активнаяCorФона,
                                  }
                                },
                                '&:hover': {
                                   bgcolor: isActive ? активнаяCorФона : 'action.hover',
                                },
                              }}
                            >
                              <ListItemIcon sx={{
                                minWidth: 0,
                                mr: 1.5,
                                justifyContent: 'center',
                                color: isActive ? активнаяCorТекстаИИконки : 'text.secondary',
                                transform: isActive ? 'scale(1.1)' : 'scale(1)',
                                transition: 'transform 0.2s ease-in-out',
                              }}>
                                {subItem.icon || <Box sx={{ width: 24, height: 24 }} />}
                              </ListItemIcon>
                              <ListItemText
                                primary={subItem.text}
                                primaryTypographyProps={{
                                  fontSize: '0.875rem',
                                  fontWeight: isActive ? 'fontWeightMedium' : 'fontWeightRegular',
                                  color: isActive ? активнаяCorТекстаИИконки : 'inherit',
                                }}
                              />
                            </ListItemButton>
                          </ListItem>
                        );
                      })}
                    </List>
                  </React.Fragment>
                ) : (
                  <ListItem disablePadding sx={{ display: 'block' }}>
                    <ListItemButton
                      component={Link}
                      href={`/(admin)${item.href}`}
                      selected={pathname === `/(admin)${item.href}`}
                      sx={{
                        minHeight: 48,
                        justifyContent: 'initial',
                        px: 2.5,
                        py: 1.25,
                        bgcolor: pathname === `/(admin)${item.href}` ? активнаяCorФона : 'transparent',
                        '&.Mui-selected': {
                          backgroundColor: активнаяCorФона,
                          '&:hover': {
                            backgroundColor: активнаяCorФона,
                          }
                        },
                         '&:hover': {
                           bgcolor: pathname === `/(admin)${item.href}` ? активнаяCorФона : 'action.hover',
                        },
                      }}
                    >
                      <ListItemIcon sx={{
                        minWidth: 0,
                        mr: 2,
                        justifyContent: 'center',
                        color: pathname === `/(admin)${item.href}` ? активнаяCorТекстаИИконки : корпоративCorPrincipal,
                      }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.text}
                        primaryTypographyProps={{ 
                          fontWeight: pathname === `/(admin)${item.href}` ? 'fontWeightBold' : 500,
                          color: pathname === `/(admin)${item.href}` ? активнаяCorТекстаИИконки : 'inherit',
                        }} 
                      />
                    </ListItemButton>
                  </ListItem>
                )}
              </div>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
}

