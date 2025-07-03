"use client";

import React from 'react';
import Box from '@mui/material/Box';

const styles = {
    footer: {
        width: '100%',
        padding: '15px 20px',
        backgroundColor: '#f4f7f6', // Cor de fundo consistente com o dashboard
        textAlign: 'center',
        borderTop: '1px solid #e0e0e0',
        color: '#555555',
        fontSize: '0.85rem',
    },
};

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <Box component="footer" sx={styles.footer}>
            © {currentYear} WEG S.A.
        </Box>
    );
};

export default Footer;
