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



const drawerWidth = 240;
const wegBlue = '#00579d'; // Azul WEG
const wegLightBlue = '#e3f2fd'; // Azul claro WEG para fundos ativos/hover
const textColorPrimary = 'rgba(0, 0, 0, 0.87)';
const textColorSecondary = 'rgba(0, 0, 0, 0.6)';

const menuItems = [
  { text: 'Dashboard', href: '/dashboard', icon: <DashboardIcon sx={{ color: wegBlue }} /> },
  {
    text: 'Relatórios',
    icon: <BarChartIcon sx={{ color: wegBlue }} />,
    subItems: [
      { text: 'Horas Apontadas', href: '/relatorios', icon: <AssessmentIcon sx={{ color: wegBlue }} /> },
      { text: 'Planejado vs. Realizado', href: '/relatorios/planejado-vs-realizado', icon: <SyncAltIcon sx={{ color: wegBlue }} /> },
    ]
  },


  { text: 'Gerenciamento', href: '/gerenciamento', icon: <FolderIcon sx={{ color: wegBlue }} /> },
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

export default function Sidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState({});

  // Abre submenus que contêm o link ativo na montagem inicial
  React.useEffect(() => {
    const newOpenState = {};
    menuItems.forEach(item => {
      if (item.subItems) {
        const isActive = item.subItems.some(subItem => 
          pathname === `${subItem.href}`
        );
        if (isActive) {
          newOpenState[item.text] = true;
        }
      }
    });
    setOpenMenus(newOpenState);
  }, [pathname]);

  const handleToggle = (text) => {
    setOpenMenus(prev => ({
      ...prev,
      [text]: !prev[text]
    }));
  };

  const renderListItem = (item, isSubItem = false) => {
    const currentPath = item.href ? `${item.href}` : '#';
    const isActive = item.href ? pathname === currentPath : false;
  
    return (
      <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
        <ListItemButton
          component={Link}
          href={currentPath} 
          disabled={!item.href} // Desabilita se não tiver href
          selected={isActive}
          sx={{
            minHeight: isSubItem ? 38 : 48, 
            px: isSubItem ? 3.5 : 2.5, 
            py: isSubItem ? 0.6 : 1,
            mb: 0.5, 
            borderRadius: '4px', 
            margin: '0 8px', 
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
            color: wegBlue, 
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
              const isParentActive = item.subItems.some(subItem => 
                subItem.href && pathname === `${subItem.href}`
              );
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
                        color: wegBlue, 
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
                    <List component="div" disablePadding sx={{ pl: 1 }}>
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

