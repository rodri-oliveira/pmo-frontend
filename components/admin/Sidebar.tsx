"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, 
  ListItemText, Toolbar, Typography, Collapse, Divider
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import SyncIcon from '@mui/icons-material/Sync';

interface MenuItemType {
  text: string;
  href?: string; // href é opcional para itens pais que só abrem submenus
  icon: React.ReactNode;
  subItems?: MenuItemType[]; // subItems é um array opcional de MenuItemType
}

const drawerWidth = 240;
const wegBlue = '#00579d'; // Azul WEG
const wegLightBlue = '#e3f2fd'; // Azul claro WEG para fundos ativos/hover
const textColorPrimary = 'rgba(0, 0, 0, 0.87)';
const textColorSecondary = 'rgba(0, 0, 0, 0.6)';

const menuItems: MenuItemType[] = [
  { text: 'Dashboard', href: '/dashboard', icon: <DashboardIcon sx={{ color: wegBlue }} /> },
  {
    text: 'Planejamento',
    icon: <EventNoteIcon sx={{ color: wegBlue }} />,
    subItems: [
      { text: 'Planejar Horas por Recurso', href: '/planejamento/horas-recurso', icon: <BarChartIcon sx={{ color: wegBlue }} /> },
      { text: 'Gerenciar Alocações', href: '/planejamento/alocacoes', icon: <AssignmentIcon sx={{ color: wegBlue }} /> },
      { text: 'Capacidade RH', href: '/planejamento/capacidade-rh', icon: <PeopleAltIcon sx={{ color: wegBlue }} /> },
    ],
  },
  {
    text: 'Apontamentos',
    icon: <AssessmentIcon sx={{ color: wegBlue }} />,
    subItems: [
      { text: 'Consultar/Gerenciar', href: '/apontamentos/consultar-gerenciar', icon: <TocIcon sx={{ color: wegBlue }} /> },
      { text: 'Criar Apontamento Manual', href: '/apontamentos/criar-manual', icon: <AssignmentIcon sx={{ color: wegBlue }} /> },
    ],
  },
  {
    text: 'Gerenciamento',
    icon: <FolderIcon sx={{ color: wegBlue }} />,
    subItems: [
      { text: 'Projetos / Melhorias', href: '/gerenciamento/projetos', icon: <FolderIcon sx={{ color: wegBlue }} /> },
      { text: 'Recursos', href: '/gerenciamento/recursos', icon: <GroupIcon sx={{ color: wegBlue }} /> },
      { text: 'Equipes', href: '/gerenciamento/equipes', icon: <PeopleAltIcon sx={{ color: wegBlue }} /> },
      { text: 'Seções', href: '/gerenciamento/secoes', icon: <BusinessIcon sx={{ color: wegBlue }} /> },
      { text: 'Status de Projetos', href: '/gerenciamento/status-projetos', icon: <TocIcon sx={{ color: wegBlue }} /> },
    ],
  },
  {
    text: 'Administração',
    icon: <AdminPanelSettingsIcon sx={{ color: wegBlue }} />,
    subItems: [
      { text: 'Usuários do Sistema', href: '/administracao/usuarios', icon: <GroupIcon sx={{ color: wegBlue }} /> },
      { text: 'Configurações Gerais', href: '/administracao/configuracoes', icon: <SettingsIcon sx={{ color: wegBlue }} /> },
      { text: 'Integração Jira', href: '/administracao/integracao-jira', icon: <SyncAltIcon sx={{ color: wegBlue }} /> },
      { text: 'Logs de Atividade', href: '/administracao/logs-atividade', icon: <HistoryIcon sx={{ color: wegBlue }} /> },
    ],
  },
];

const StatusIndicator = ({ status }) => {
  if (status === 'Verde') {
    return <CheckCircleIcon sx={{ color: 'green', вертикальныйAlign: 'middle', mr: 0.5 }} />;
  }
  if (status === 'Amarelo') {
    return <WarningIcon sx={{ color: 'orange', вертикальныйAlign: 'middle', mr: 0.5 }} />;
  }
  return <ErrorIcon sx={{ color: 'red', вертикальныйAlign: 'middle', mr: 0.5 }} />;
};

export default function Sidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<{[key: string]: boolean}>({});

  // Abre submenus que contêm o link ativo na montagem inicial
  React.useEffect(() => {
    const newOpenState: {[key: string]: boolean} = {};
    menuItems.forEach(item => {
      if (item.subItems) {
        const isActive = item.subItems.some(subItem => 
          pathname === `/(admin)${subItem.href}`
        );
        if (isActive) {
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

  const renderListItem = (item: MenuItemType, isSubItem: boolean = false) => {
    const currentPath = `/(admin)${item.href}`;
    const isActive = pathname === currentPath;

    return (
      <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
        <ListItemButton
          component={Link}
          href={currentPath}
          selected={isActive}
          sx={{
            minHeight: isSubItem ? 38 : 48, // Altura menor para subitens
            px: isSubItem ? 3.5 : 2.5, // Maior indentação para subitens
            py: isSubItem ? 0.6 : 1,
            mb: 0.5, // Pequeno espaço entre itens
            borderRadius: '4px', // Bordas arredondadas
            margin: '0 8px', // Margem lateral
            backgroundColor: isActive ? wegLightBlue : 'transparent',
            color: isActive ? wegBlue : textColorPrimary,
            '&:hover': {
              backgroundColor: wegLightBlue,
              color: wegBlue,
            },
            '&.Mui-selected': {
              backgroundColor: wegLightBlue,
              color: wegBlue,
              fontWeight: 'fontWeightBold',
              '& .MuiListItemIcon-root': {
                color: wegBlue,
              },
            },
          }}
        >
          <ListItemIcon sx={{
            minWidth: 0,
            mr: isSubItem ? 1.5 : 2,
            justifyContent: 'center',
            color: isActive ? wegBlue : wegBlue, // Ícone sempre azul WEG
          }}>
            {item.icon}
          </ListItemIcon>
          <ListItemText
            primary={item.text}
            primaryTypographyProps={{
              fontSize: isSubItem ? '0.875rem' : '0.95rem',
              fontWeight: isActive ? 'fontWeightBold' : 'fontWeightMedium',
            }}
          />
        </ListItemButton>
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
          borderRight: 'none', // Remover borda padrão
          boxShadow: '2px 0 5px -2px rgba(0,0,0,0.1)', // Sombra sutil
          backgroundColor: '#f8f9fa' // Fundo levemente acinzentado para o Drawer
        },
      }}
    >
      <Toolbar sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: [1],
        borderBottom: '1px solid #dee2e6',
        mb: 1,
        height: 64,
      }}>
        <Box
          component="img"
          sx={{
            height: 40,
            width: 'auto',
          }}
          alt="Logo WEG"
          src="/images/weg-logo.png"
        />
      </Toolbar>
      
      <Box sx={{ overflow: 'auto' }}>
        <List component="nav" disablePadding>
          {menuItems.map((item) => {
            if (item.subItems) {
              const isParentActive = item.subItems.some(subItem => pathname === `/(admin)${subItem.href}`);
              const isOpen = openMenus[item.text] || isParentActive;

              return (
                <React.Fragment key={item.text}>
                  <ListItem disablePadding sx={{ display: 'block' }}>
                    <ListItemButton
                      onClick={() => handleToggle(item.text)}
                      sx={{
                        minHeight: 48,
                        px: 2.5,
                        py: 1,
                        mb: 0.5,
                        borderRadius: '4px',
                        margin: '0 8px',
                        backgroundColor: isParentActive && !isOpen ? wegLightBlue : 'transparent',
                        color: isParentActive ? wegBlue : textColorPrimary,
                        '&:hover': {
                          backgroundColor: wegLightBlue,
                          color: wegBlue,
                        },
                      }}
                    >
                      <ListItemIcon sx={{
                        minWidth: 0,
                        mr: 2,
                        justifyContent: 'center',
                        color: wegBlue, // Ícone sempre azul WEG
                      }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          fontSize: '0.95rem',
                          fontWeight: 'fontWeightMedium',
                        }}
                      />
                      {isOpen ? <ExpandLess sx={{ color: isParentActive ? wegBlue : textColorSecondary }} /> : <ExpandMore sx={{ color: textColorSecondary }}/>}
                    </ListItemButton>
                  </ListItem>
                  <Collapse in={isOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding sx={{ pl: 1 }}> {/* Leve indentação para o grupo de submenus */}
                      {item.subItems.map((subItem) => renderListItem(subItem, true))}
                    </List>
                  </Collapse>
                </React.Fragment>
              );
            }
            return renderListItem(item);
          })}
        </List>
      </Box>
      
      <Divider sx={{ mt: 'auto', mb: 0, backgroundColor: '#dee2e6' }} />
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" sx={{ color: textColorSecondary }}>
          © {new Date().getFullYear()} WEG S.A.
        </Typography>
      </Box>
    </Drawer>
  );
}

