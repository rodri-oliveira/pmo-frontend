
'use client';
import { Roboto, Inter } from 'next/font/google'; // Adicionando Inter como opção, mas mantendo Roboto por enquanto
import { createTheme, alpha } from '@mui/material/styles';

const roboto = Roboto({
    weight: ['300', '400', '500', '700'],
    subsets: ['latin'],
    display: 'swap',
});

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
});

// Paleta de Cores Corporativa (baseada no design_plan.md)
const primaryMain = '#003366'; // Azul escuro principal (ex: WEG Azul Corporativo)
const secondaryMain = '#007bff'; // Azul mais claro para acentos (ex: botões secundários, links)
const successMain = '#28a745'; // Verde para sucesso e chamadas para ação positivas
const errorMain = '#dc3545'; // Vermelho para erros
const warningMain = '#ffc107'; // Amarelo para avisos
const infoMain = '#17a2b8'; // Azul claro para informações

const greyColors = {
    50: '#fafafa',
    100: '#f5f5f5', // Fundo de página/cards mais claro
    200: '#eeeeee',
    300: '#e0e0e0', // Bordas, divisores
    400: '#bdbdbd',
    500: '#9e9e9e', // Texto secundário
    600: '#757575',
    700: '#616161', // Texto principal
    800: '#424242',
    900: '#212121', // Títulos escuros
    A100: '#d5d5d5',
    A200: '#aaaaaa',
    A400: '#303030',
    A700: '#616161',
};

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: primaryMain,
            light: alpha(primaryMain, 0.8),
            dark: alpha(primaryMain, 0.9),
            contrastText: '#ffffff',
        },
        secondary: {
            main: secondaryMain,
            light: alpha(secondaryMain, 0.8),
            dark: alpha(secondaryMain, 0.9),
            contrastText: '#ffffff',
        },
        error: {
            main: errorMain,
        },
        warning: {
            main: warningMain,
        },
        info: {
            main: infoMain,
        },
        success: {
            main: successMain,
        },
        grey: greyColors,
        text: {
            primary: greyColors[700],
            secondary: greyColors[500],
            disabled: greyColors[400],
        },
        background: {
            default: greyColors[100], // Fundo padrão da aplicação
            paper: '#ffffff', // Fundo de componentes como Card, Paper
        },
        divider: alpha(greyColors[900], 0.12),
    },
    typography: {
        fontFamily: roboto.style.fontFamily, // Mantendo Roboto, mas Inter está disponível
        h1: {
            fontSize: '2.5rem',
            fontWeight: 700,
            color: greyColors[900],
        },
        h2: {
            fontSize: '2rem',
            fontWeight: 700,
            color: greyColors[900],
        },
        h3: {
            fontSize: '1.75rem',
            fontWeight: 700,
            color: greyColors[800],
        },
        h4: {
            fontSize: '1.5rem',
            fontWeight: 500,
            color: greyColors[800],
        },
        h5: {
            fontSize: '1.25rem',
            fontWeight: 500,
            color: greyColors[700],
        },
        h6: {
            fontSize: '1rem',
            fontWeight: 500,
            color: greyColors[700],
        },
        subtitle1: {
            fontSize: '1rem',
            fontWeight: 400,
            color: greyColors[600],
        },
        subtitle2: {
            fontSize: '0.875rem',
            fontWeight: 500,
            color: greyColors[600],
        },
        body1: {
            fontSize: '1rem',
            fontWeight: 400,
            lineHeight: 1.5,
            color: greyColors[700],
        },
        body2: {
            fontSize: '0.875rem',
            fontWeight: 400,
            lineHeight: 1.43,
            color: greyColors[600],
        },
        button: {
            textTransform: 'none', // Botões com texto em caixa normal, não maiúsculas
            fontWeight: 500,
        },
        caption: {
            fontSize: '0.75rem',
            fontWeight: 400,
            color: greyColors[500],
        },
        overline: {
            fontSize: '0.75rem',
            fontWeight: 400,
            textTransform: 'uppercase',
            color: greyColors[500],
        },
    },
    shape: {
        borderRadius: 8, // Bordas levemente arredondadas para um visual moderno
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#ffffff', // Header com fundo branco
                    color: greyColors[800],
                    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)', // Sombra suave
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: primaryMain, // Menu lateral com a cor primária escura
                    color: '#ffffff',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    padding: '8px 22px',
                },
                containedPrimary: {
                    '&:hover': {
                        backgroundColor: alpha(primaryMain, 0.9),
                    },
                },
                containedSecondary: {
                    '&:hover': {
                        backgroundColor: alpha(secondaryMain, 0.9),
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
                },
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    backgroundColor: greyColors[50],
                    '& .MuiTableCell-root': {
                        fontWeight: 600,
                        color: greyColors[700],
                    },
                },
            },
        },
        MuiListItemIcon: {
            styleOverrides: {
                root: {
                    color: 'inherit', // Para ícones no Drawer herdarem a cor branca
                    minWidth: '40px',
                },
            },
        },
        MuiListItemText: {
            styleOverrides: {
                primary: {
                     // Para texto no Drawer herdar a cor branca
                }
            }
        }
    },
});

export default theme;

