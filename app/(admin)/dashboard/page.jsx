"use client";

import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';

// --- Variáveis de Estilo ---
const styles = {
  wegBluePrimary: '#00579d',
  wegBlueDark: '#003f6f',
  textColorDark: '#333',
  cardBg: '#ffffff',
  borderColor: '#e0e0e0',
  dashboardBg: '#f4f7f6',
};

// --- Componente de Cartão ---
const DashboardCard = ({ title, value, unit, type = 'default' }) => {
  const baseCardStyle = {
    backgroundColor: styles.cardBg,
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'transform 0.2s ease-in-out',
    height: '100%', // Garante que todos os cartões tenham a mesma altura
  };

  const cardTitleStyle = {
    fontSize: '1.2rem',
    color: styles.wegBluePrimary,
    fontWeight: 'bold',
    marginBottom: '15px',
    textTransform: 'uppercase',
    letterSpacing: '0.05rem',
  };

  const valueWrapperStyle = {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
  };

  const cardValueStyle = {
    fontSize: '2.8rem',
    fontWeight: '700',
    color: styles.wegBluePrimary,
  };

  const cardUnitStyle = {
    fontSize: '1rem',
    fontWeight: '500',
    marginLeft: '8px',
    color: '#555',
  };

  if (type === 'status') {
    cardValueStyle.color = styles.textColorDark;
  }

  return (
    <div style={baseCardStyle}>
      <div style={cardTitleStyle}>{title}</div>
      <div style={valueWrapperStyle}>
        <span style={cardValueStyle}>{value}</span>
        {unit && <span style={cardUnitStyle}>{unit}</span>}
      </div>
    </div>
  );
};

// --- Componente de Gráfico (Status de Projeto por Seção) ---
const ProjectStatusChart = ({ data }) => {
  const chartPanelStyle = {
    backgroundColor: styles.cardBg,
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
    height: '100%',
  };

  const chartTitleStyle = {
    color: styles.textColorDark,
    marginTop: '0',
    marginBottom: '20px',
    fontSize: '1.3rem',
    borderBottom: `1px solid ${styles.borderColor}`,
    paddingBottom: '10px',
  };

  const sectionStyle = {
    marginBottom: '15px',
    paddingBottom: '15px',
    borderBottom: `1px solid ${styles.borderColor}`,
  };

  const lastSectionStyle = {
    ...sectionStyle,
    marginBottom: '0',
    paddingBottom: '0',
    borderBottom: 'none',
  };

  const sectionTitleStyle = {
    fontWeight: 'bold',
    color: styles.wegBluePrimary,
    fontSize: '1.1rem',
    marginBottom: '10px',
  };

  const statusLineStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.95rem',
    color: styles.textColorDark,
    marginBottom: '5px',
  };

  const statusNameStyle = {
    flex: '1 1 50%',
  };

  const statusValueStyle = {
    flex: '1 1 50%',
    textAlign: 'right',
  };

  const keys = Object.keys(data);

  return (
    <div style={chartPanelStyle}>
      <h3 style={chartTitleStyle}>Status de Projeto por Seção</h3>
      {keys.length > 0 ? (
        keys.map((secao, index) => (
          <div key={secao} style={index === keys.length - 1 ? lastSectionStyle : sectionStyle}>
            <div style={sectionTitleStyle}>
              {secao} (Total: {data[secao].total_projetos})
            </div>
            {Object.keys(data[secao].status).map(statusName => (
              <div key={statusName} style={statusLineStyle}>
                <span style={statusNameStyle}>{statusName}</span>
                <span style={statusValueStyle}>
                  {data[secao].status[statusName].quantidade} ({data[secao].status[statusName].percentual.toFixed(2)}%)
                </span>
              </div>
            ))}
          </div>
        ))
      ) : (
        <p style={{ textAlign: 'center', color: '#bbb', fontStyle: 'italic', paddingTop: '50px' }}>
          (Carregando dados de status...)
        </p>
      )}
    </div>
  );
};

// --- Componente de Gráfico (Horas por Seção) ---
const HoursComparisonChart = ({ data }) => {
  const currentYear = new Date().getFullYear();

  const chartPanelStyle = {
    backgroundColor: styles.cardBg,
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
    height: '100%',
  };

  const chartTitleStyle = {
    color: styles.textColorDark,
    marginTop: '0',
    marginBottom: '20px',
    fontSize: '1.3rem',
    borderBottom: `1px solid ${styles.borderColor}`,
    paddingBottom: '10px',
  };

  const sectionStyle = {
    marginBottom: '15px',
    paddingBottom: '15px',
    borderBottom: `1px solid ${styles.borderColor}`,
  };

  const lastSectionStyle = {
    ...sectionStyle,
    marginBottom: '0',
    paddingBottom: '0',
    borderBottom: 'none',
  };

  const sectionTitleStyle = {
    fontWeight: 'bold',
    color: styles.wegBluePrimary,
    fontSize: '1.1rem',
    marginBottom: '8px',
  };

  const hoursStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '1rem',
    color: styles.textColorDark,
    marginBottom: '5px',
  };

  const keys = Object.keys(data);

  return (
    <div style={chartPanelStyle}>
      <h3 style={chartTitleStyle}>
        Horas Planejadas vs Horas Apontadas por Seção - {currentYear}
      </h3>
      {keys.length > 0 ? (
        keys.map((secao, index) => {
          const isOverBudget = data[secao].apontado > data[secao].planejado;
          const apontadoValueStyle = {
            fontWeight: isOverBudget ? 'bold' : 'normal',
            color: isOverBudget ? '#d32f2f' : styles.textColorDark,
          };

          return (
            <div key={secao} style={index === keys.length - 1 ? lastSectionStyle : sectionStyle}>
              <div style={sectionTitleStyle}>{secao}</div>
              <div style={hoursStyle}>
                <span>Planejado:</span>
                <span>{Math.round(data[secao].planejado).toLocaleString('pt-BR')}h</span>
              </div>
              <div style={hoursStyle}>
                <span>Apontado:</span>
                <span style={apontadoValueStyle}>
                  {Math.round(data[secao].apontado).toLocaleString('pt-BR')}h
                </span>
              </div>
            </div>
          );
        })
      ) : (
        <p style={{ textAlign: 'center', color: '#bbb', fontStyle: 'italic', paddingTop: '50px' }}>
          (Carregando dados de horas...)
        </p>
      )}
    </div>
  );
};


// --- Componente Principal do Dashboard ---
const PMODashboard = () => {
  const [secaoData, setSecaoData] = useState({ SGI: '...', TIN: '...', SEG: '...' });
  const [equipesData, setEquipesData] = useState({ SGI: '...', TIN: '...', SEG: '...' });
  const [horasData, setHorasData] = useState({});
  const [statusProjetosData, setStatusProjetosData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [projetosResponse, equipesResponse, horasResponse, statusProjetosResponse] = await Promise.all([
          fetch('http://localhost:8000/backend/v1/dashboard/projetos-ativos-por-secao'),
          fetch('http://localhost:8000/backend/v1/dashboard/equipes-ativas-por-secao'),
          fetch('http://localhost:8000/backend/v1/dashboard/horas-por-secao'),
          fetch('http://localhost:8000/backend/v1/dashboard/status-projetos-por-secao'),
        ]);

        if (!projetosResponse.ok || !equipesResponse.ok || !horasResponse.ok || !statusProjetosResponse.ok) {
          throw new Error('A resposta da rede não foi ok');
        }
        const projetosData = await projetosResponse.json();
        const equipesData = await equipesResponse.json();
        const horasData = await horasResponse.json();
        const statusProjetosData = await statusProjetosResponse.json();

        setSecaoData({
          SGI: projetosData.SGI || 0,
          TIN: projetosData.TIN || 0,
          SEG: projetosData.SEG || 0,
        });

        setEquipesData({
          SGI: equipesData.SGI || 0,
          TIN: equipesData.TIN || 0,
          SEG: equipesData.SEG || 0,
        });

        setHorasData(horasData);
        setStatusProjetosData(statusProjetosData);

      } catch (err) {
        setError(err.message);
        setSecaoData({ SGI: 'Erro', TIN: 'Erro', SEG: 'Erro' });
        setEquipesData({ SGI: 'Erro', TIN: 'Erro', SEG: 'Erro' });
        setHorasData({});
        setStatusProjetosData({});
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);





  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: styles.dashboardBg,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          p: 3, // padding de 24px (theme.spacing(3))
        }}
      >
        {/* Seção 1: Cartões de Visão Geral */}
        <Box
          component="section"
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 3,
            mb: 3,
          }}
        >
          <DashboardCard title="SGI" value={loading ? '...' : secaoData.SGI} unit="projetos" />
          <DashboardCard title="TIN" value={loading ? '...' : secaoData.TIN} unit="projetos" />
          <DashboardCard title="SEG" value={loading ? '...' : secaoData.SEG} unit="projetos" />
          <DashboardCard title="Total Equipes SGI" value={loading ? '...' : equipesData.SGI} unit="equipes" />
          <DashboardCard title="Total Equipes TIN" value={loading ? '...' : equipesData.TIN} unit="equipes" />
          <DashboardCard title="Total Equipes SEG" value={loading ? '...' : equipesData.SEG} unit="equipes" />
        </Box>

        {/* Seção 2: Gráficos Principais */}
        <Box
          component="section"
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
            gap: 3,
            mb: 3,
          }}
        >
          <ProjectStatusChart data={statusProjetosData} />
          <HoursComparisonChart data={horasData} />
        </Box>


      </Box>
    </Box>
  );
};

export default PMODashboard;
