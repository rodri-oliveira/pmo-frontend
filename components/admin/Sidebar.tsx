import Link from 'next/link';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
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
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map((item, index) => (
            <div key={item.text}>
              {item.subItems ? (
                <ListItem disablePadding sx={{ display: 'block' }}>
                  <ListItemButton sx={{ minHeight: 48, justifyContent: 'initial', px: 2.5 }}>
                    <ListItemIcon sx={{ minWidth: 0, mr: 3, justifyContent: 'center' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} sx={{ opacity: 1 }} />
                  </ListItemButton>
                  <List sx={{ pl: 2 }}>
                    {item.subItems.map((subItem) => (
                      <ListItem key={subItem.text} disablePadding sx={{ display: 'block' }}>
                        <Link href={`/(admin)${subItem.href}`} passHref legacyBehavior>
                          <ListItemButton component="a" sx={{ py: 0, minHeight: 32 }}>
                            <ListItemIcon sx={{ minWidth: 0, mr: 3, justifyContent: 'center' }}>
                              {subItem.icon || <div style={{ width: 24 }} />}
                            </ListItemIcon>
                            <ListItemText primary={subItem.text} primaryTypographyProps={{ fontSize: 14, fontWeight: 'medium' }} />
                          </ListItemButton>
                        </Link>
                      </ListItem>
                    ))}
                  </List>
                </ListItem>
              ) : (
                <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                  <Link href={`/(admin)${item.href}`} passHref legacyBehavior>
                    <ListItemButton component="a" sx={{ minHeight: 48, justifyContent: 'initial', px: 2.5 }}>
                      <ListItemIcon sx={{ minWidth: 0, mr: 3, justifyContent: 'center' }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText primary={item.text} sx={{ opacity: 1 }} />
                    </ListItemButton>
                  </Link>
                </ListItem>
              )}
            </div>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}

