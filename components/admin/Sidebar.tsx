"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Toolbar, Typography, Collapse, Divider, SvgIcon
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined'; // Dashboard
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined'; // Relatórios e Análises
import QueryStatsOutlinedIcon from '@mui/icons-material/QueryStatsOutlined'; // Subitem Relatório
import GroupWorkOutlinedIcon from '@mui/icons-material/GroupWorkOutlined'; // Subitem Relatório
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined'; // Planejamento
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined'; // Subitem Planejamento
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined'; // Gerenciamento
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined'; // Subitem Gerenciamento
import PeopleOutlineOutlinedIcon from '@mui/icons-material/PeopleOutlineOutlined'; // Subitem Gerenciamento
import EditCalendarOutlinedIcon from '@mui/icons-material/EditCalendarOutlined'; // Apontamentos
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'; // Administração
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined'; // Subitem Admin
import SyncProblemOutlinedIcon from '@mui/icons-material/SyncProblemOutlined'; // Subitem Admin
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'; // Subitem Admin
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import TocOutlinedIcon from '@mui/icons-material/TocOutlined';

interface MenuItemType {
  text: string;
  href?: string;
  icon: React.ReactElement<typeof SvgIcon>; // Tipo mais específico para ícones MUI
  subItems?: MenuItemType[];
  adminOnly?: boolean; // Para controlar visibilidade
}

const drawerWidth = 260; // Aumentar um pouco a largura para melhor espaçamento

// Estrutura de menu conforme design_plan.md
const menuItems: MenuItemType[] = [
  { text: 'Dashboard', href: '/dashboard', icon: <DashboardCustomizeOutlinedIcon /> },
  {
    text: 'Relatórios e Análises',
    icon: <AssessmentOutlinedIcon />,
    subItems: [
      { text: 'Horas por Projeto', href: '/relatorios/horas-projeto', icon: <QueryStatsOutlinedIcon /> },
      { text: 'Alocação de Recursos', href: '/relatorios/alocacao-recursos', icon: <GroupWorkOutlinedIcon /> },
      { text: 'Visão Geral de Projetos', href: '/relatorios/dashboard-detalhado', icon: <DashboardCustomizeOutlinedIcon /> },
      { text: 'Consultar Apontamentos', href: '/apontamentos/consultar-gerenciar', icon: <TocOutlinedIcon /> }, // Reutilizado de apontamentos
    ],
  },
  {
    text: 'Planejamento',
    icon: <EventNoteOutlinedIcon />,
    subItems: [
      { text: 'Alocações de Recursos', href: '/planejamento/alocacoes', icon: <AssignmentOutlinedIcon /> },
      { text: 'Capacidade RH', href: '/planejamento/capacidade-rh', icon: <PeopleOutlineOutlinedIcon /> },
      { text: 'Horas por Recurso', href: '/planejamento/horas-recurso', icon: <QueryStatsOutlinedIcon /> },
    ],
  },
  {
    text: 'Gerenciamento',
    icon: <SupervisorAccountOutlinedIcon />,
    subItems: [
      { text: 'Projetos', href: '/gerenciamento/projetos', icon: <FolderOpenOutlinedIcon /> },
      { text: 'Recursos', href: '/gerenciamento/recursos', icon: <PeopleOutlineOutlinedIcon /> },
      { text: 'Equipes', href: '/gerenciamento/equipes', icon: <GroupWorkOutlinedIcon /> },
      { text: 'Seções', href: '/gerenciamento/secoes', icon: <BusinessOutlinedIcon /> },
      { text: 'Status de Projetos', href: '/gerenciamento/status-projetos', icon: <TocOutlinedIcon /> },
    ],
  },
  {
    text: 'Apontamentos',
    icon: <EditCalendarOutlinedIcon />,
    subItems: [
      { text: 'Registrar Apontamento', href: '/apontamentos/criar-manual', icon: <AssignmentOutlinedIcon /> },
      { text: 'Meus Apontamentos', href: '/apontamentos/meus-apontamentos', icon: <TocOutlinedIcon /> }, // Ajustado
    ],
  },
  {
    text: 'Administração',
    icon: <SettingsOutlinedIcon />,
    adminOnly: true, // Exemplo, lógica de role seria necessária
    subItems: [
      { text: 'Usuários', href: '/administracao/usuarios', icon: <PeopleOutlineOutlinedIcon /> },
      { text: 'Configurações do Sistema', href: '/administracao/configuracoes', icon: <SettingsOutlinedIcon /> },
      { text: 'Integração JIRA', href: '/administracao/integracao-jira', icon: <SyncProblemOutlinedIcon /> },
      { text: 'Logs de Atividade', href: '/administracao/logs-atividade', icon: <HistoryOutlinedIcon /> },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  React.useEffect(() => {
    const newOpenState: { [key: string]: boolean } = {};
    menuItems.forEach(item => {
      if (item.subItems) {
        const isActiveParent = item.subItems.some(subItem =>
          subItem.href && pathname === `/(admin)${subItem.href}`
        );
        if (isActiveParent) {
          newOpenState[item.text] = true;
        }
      }
    });
    setOpenMenus(newOpenState);
  }, [pathname]);

  const handleToggle = (text: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [text]: !prev[text]
    }));
  };

  const renderListItem = (item: MenuItemType, isSubItem: boolean = false, parentIsActive: boolean = false) => {
    const currentPath = item.href ? `/(admin)${item.href}` : '#';
    const isActive = item.href ? pathname === currentPath : false;

    // Lógica para adminOnly - em um cenário real, viria do estado do usuário/contexto
    // if (item.adminOnly && userRole !== 'admin') return null;

    return (
      <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
        <ListItemButton
          component={item.href ? Link : 'div'} // 'div' se não houver href para evitar erro de Link
          href={item.href ? currentPath: undefined}
          onClick={!item.href && item.subItems ? () => handleToggle(item.text) : undefined}
          selected={isActive}
          sx={{
            minHeight: isSubItem ? 40 : 48,
            px: isSubItem ? 4 : 2.5, // Aumentar padding para subitens
            py: isSubItem ? 0.8 : 1.2,
            mb: 0.5,
            borderRadius: '6px',
            margin: '0 12px',
            color: isActive ? 'primary.contrastText' : 'inherit', // Cor do texto no item ativo
            backgroundColor: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
            '&.Mui-selected': {
              backgroundColor: 'rgba(255, 255, 255, 0.15)', // Destaque mais sutil para item ativo
              '& .MuiListItemIcon-root': {
                color: 'inherit', // Ícone herda cor do texto (branco)
              },
              '& .MuiListItemText-primary': {
                fontWeight: 'fontWeightBold',
              }
            },
          }}
        >
          <ListItemIcon sx={{
            minWidth: 0,
            mr: 1.5, // Reduzir margem do ícone
            justifyContent: 'center',
            color: 'inherit', // Ícones herdam a cor do texto (branco)
          }}>
            {React.cloneElement(item.icon, { sx: { fontSize: isSubItem ? 20 : 22 } })}
          </ListItemIcon>
          <ListItemText
            primary={item.text}
            primaryTypographyProps={{
              fontSize: isSubItem ? '0.85rem' : '0.9rem',
              fontWeight: isActive ? '600' : '500',
              color: 'inherit',
            }}
          />
          {item.subItems && (
            isOpen ? <ExpandLess sx={{ color: 'rgba(255,255,255,0.7)' }} /> : <ExpandMore sx={{ color: 'rgba(255,255,255,0.7)' }} />
          )}
        </ListItemButton>
        {item.subItems && (
          <Collapse in={openMenus[item.text]} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ pt: 0.5 }}>
              {item.subItems.map((subItem) => renderListItem(subItem, true, isActive))}
            </List>
          </Collapse>
        )}
      </ListItem>
    );
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: 'none',
          // backgroundColor set by theme.components.MuiDrawer.styleOverrides.paper
        },
      }}
    >
      <Toolbar sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: [1],
        // borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        // mb: 1, // Removido para melhor integração visual
        height: 64, // Altura padrão do Toolbar Material UI
        backgroundColor: 'background.paper', // Fundo branco para o logo, conforme design
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      }}>
        <Box
          component="img"
          sx={{
            height: 36, // Ajustar altura do logo
            width: 'auto',
          }}
          alt="Logo da Empresa"
          src="/images/weg-logo.png" // Manter o logo WEG por enquanto
        />
      </Toolbar>
      <Box sx={{ overflowY: 'auto', overflowX: 'hidden', pt: 1, flexGrow: 1 }}>
        <List component="nav" disablePadding>
          {menuItems.map((item) => {
            if (item.subItems) {
              const isParentActive = item.subItems.some(subItem => subItem.href && pathname === `/(admin)${subItem.href}`);
              const isOpen = openMenus[item.text] || isParentActive;

              return (
                <React.Fragment key={item.text}>
                  <ListItem disablePadding sx={{ display: 'block' }}>
                    <ListItemButton
                      onClick={() => handleToggle(item.text)}
                      sx={{
                        minHeight: 48,
                        px: 2.5,
                        py: 1.2,
                        mb: 0.5,
                        borderRadius: '6px',
                        margin: '0 12px',
                        color: isParentActive ? 'primary.contrastText' : 'inherit',
                        backgroundColor: isParentActive && !isOpen ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      <ListItemIcon sx={{
                        minWidth: 0,
                        mr: 1.5,
                        justifyContent: 'center',
                        color: 'inherit',
                      }}>
                        {React.cloneElement(item.icon, { sx: { fontSize: 22 } })}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          fontSize: '0.9rem',
                          fontWeight: '500',
                          color: 'inherit',
                        }}
                      />
                      {isOpen ? <ExpandLess sx={{ color: 'rgba(255,255,255,0.7)' }} /> : <ExpandMore sx={{ color: 'rgba(255,255,255,0.7)' }} />}
                    </ListItemButton>
                  </ListItem>
                  <Collapse in={isOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding sx={{ pt: 0.5 }}>
                      {item.subItems.map((subItem) => renderListItem(subItem, true, isParentActive))}
                    </List>
                  </Collapse>
                </React.Fragment>
              );
            }
            return renderListItem(item, false);
          })}
        </List>
      </Box>
      <Divider sx={{ mt: 'auto', backgroundColor: 'rgba(255,255,255,0.12)' }} />
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          © {new Date().getFullYear()} Empresa X S.A.
        </Typography>
      </Box>
    </Drawer>
  );
}

