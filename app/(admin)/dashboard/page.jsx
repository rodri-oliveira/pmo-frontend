"use client";

import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts';

// --- Variáveis de Estilo ---
const styles = {
    wegBlue: '#00579d',      // Azul principal da WEG
    wegGreen: '#00612E',     // Verde para status 'Concluído'
    wegRed: '#d73a3c',       // Vermelho para 'Atrasado' ou 'Acima do Planejado'
    mediumGrey: '#BBBBBB',   // Cinza para 'Backlog'
    darkGrey: '#333333',     // Cinza escuro para textos
    wegYellow: '#ffc107',    // Amarelo para 'Não Iniciado'
    lightGrey: '#f5f5f5',
    white: '#ffffff',
    cardBg: '#ffffff',
    borderColor: '#e0e0e0',
};

// --- Componente de Cartão ---
const DashboardCard = ({ title, value, unit, type = 'default' }) => {
    const [isHovered, setIsHovered] = useState(false);

    const baseCardStyle = {
        backgroundColor: styles.cardBg,
        borderRadius: '12px',
        padding: '25px',
        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.08)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        height: '100%',
        cursor: 'pointer',
    };

    const cardTitleStyle = {
        fontSize: '1.25rem',
        color: styles.wegBlue,
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
        fontSize: '3rem',
        fontWeight: '800',
        color: styles.wegBlue,
    };

    const cardUnitStyle = {
        fontSize: '1.1rem',
        fontWeight: '500',
        marginLeft: '10px',
        color: styles.darkGrey,
    };

    if (type === 'status') {
        cardValueStyle.color = styles.darkGrey;
    }

    const hoverStyle = {
        transform: 'translateY(-5px)',
        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.12)',
    };

    return (
        <div
            style={{ ...baseCardStyle, ...(isHovered ? hoverStyle : {}) }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div style={cardTitleStyle}>{title}</div>
            <div style={valueWrapperStyle}>
                <span style={cardValueStyle}>{value}</span>
                {unit && <span style={cardUnitStyle}>{unit}</span>}
            </div>
        </div>
    );
};

// --- Componente de Legenda Reutilizável ---
const LegendItem = ({ color, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px', marginBottom: '10px' }}>
        <span style={{ width: '15px', height: '15px', backgroundColor: color, borderRadius: '3px', marginRight: '8px' }}></span>
        <span style={{ fontSize: '0.9rem', color: styles.darkGrey }}>{label}</span>
    </div>
);

// --- Componente de Gráfico (Status de Projeto por Seção) ---
const ProjectStatusChart = ({ data }) => {
    const chartPanelStyle = {
        backgroundColor: styles.cardBg,
        borderRadius: '12px',
        padding: '25px',
        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.08)',
        height: '450px', // Altura fixa para o gráfico
        display: 'flex',
        flexDirection: 'column',
    };

    const chartTitleStyle = {
        color: styles.darkGrey,
        marginTop: '0',
        marginBottom: '25px',
        fontSize: '1.4rem',
        fontWeight: 'bold',
    };

    const statusColors = {
        'Em andamento': styles.wegBlue,
        'Concluído': styles.wegGreen,
        'Backlog': styles.mediumGrey,
        'Não Iniciado': styles.wegYellow,
        'Atrasado/Em Risco': styles.wegRed,
    };

    // Extrai todos os status possíveis para garantir que a legenda e as barras sejam consistentes
    const allStatusNames = Object.values(data).reduce((acc, secao) => {
        Object.keys(secao.status).forEach(statusName => {
            if (!acc.includes(statusName)) {
                acc.push(statusName);
            }
        });
        return acc;
    }, []);

    // Transforma os dados para o formato que o Recharts espera
    const chartData = Object.keys(data).map(secao => {
        const secaoData = { name: secao };
        allStatusNames.forEach(statusName => {
            secaoData[statusName] = data[secao].status[statusName]?.percentual || 0;
        });
        return secaoData;
    });

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
                    <p style={{ fontWeight: 'bold', margin: 0 }}>{label}</p>
                    {payload.map(p => (
                        <p key={p.name} style={{ color: p.color, margin: '4px 0' }}>
                            {`${p.name}: ${p.value.toFixed(2)}%`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div style={chartPanelStyle}>
            <h3 style={chartTitleStyle}>Status de Projeto por Seção</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    layout="vertical"
                    data={chartData}
                    margin={{ top: 5, right: 20, left: 20, bottom: 20 }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" unit="%" domain={[0, 100]} tickFormatter={(tick) => Math.round(tick)} />
                    <YAxis type="category" dataKey="name" width={60} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(0, 0, 0, 0.05)'}}/>
                    <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                    {allStatusNames.map(statusName => (
                        <Bar key={statusName} dataKey={statusName} stackId="a" fill={statusColors[statusName] || styles.mediumGrey} name={statusName}>
                            <LabelList dataKey={statusName} position="center" formatter={(value) => value > 5 ? `${Math.round(value)}%` : ''} style={{ fill: 'white', fontWeight: 'bold' }} />
                        </Bar>
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

// --- Componente de Gráfico (Horas Planejadas vs Apontadas) ---
const HoursComparisonChart = ({ data }) => {
    const currentYear = new Date().getFullYear();

    const parseHours = (hourString) => {
        if (!hourString) return 0;
        return parseFloat(String(hourString).replace(/[^0-9.]/g, '')) || 0;
    };

    const chartPanelStyle = {
        backgroundColor: styles.cardBg,
        borderRadius: '12px',
        padding: '25px',
        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.08)',
        height: '450px', // Altura fixa para o gráfico
        display: 'flex',
        flexDirection: 'column',
    };

    const chartTitleStyle = {
        color: styles.darkGrey,
        marginTop: '0',
        marginBottom: '25px',
        fontSize: '1.4rem',
        fontWeight: 'bold',
    };

    const chartData = Object.keys(data).map(secao => ({
        name: secao,
        planejado: parseHours(data[secao].planejado),
        apontado: parseHours(data[secao].apontado),
    }));

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const planejado = payload.find(p => p.dataKey === 'planejado')?.value || 0;
            const apontado = payload.find(p => p.dataKey === 'apontado')?.value || 0;
            const isOver = apontado > planejado;

            return (
                <div style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
                    <p style={{ fontWeight: 'bold', margin: 0 }}>{label}</p>
                    <p style={{ color: styles.wegBlue, margin: '4px 0' }}>
                        Planejado: {Math.round(planejado).toLocaleString('pt-BR')}h
                    </p>
                    <p style={{ color: isOver ? styles.wegRed : styles.wegGreen, margin: '4px 0' }}>
                        Apontado: {Math.round(apontado).toLocaleString('pt-BR')}h
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={chartPanelStyle}>
            <h3 style={chartTitleStyle}>Horas Planejadas vs Apontadas - {currentYear}</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                    data={chartData} 
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 20, bottom: 20 }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" unit="h" tickFormatter={(value) => new Intl.NumberFormat('pt-BR').format(value)} />
                    <YAxis type="category" dataKey="name" width={60} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(0, 0, 0, 0.05)'}}/>
                    <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                    <Bar dataKey="planejado" name="Horas Planejadas" fill={styles.wegBlue}>
                        <LabelList dataKey="planejado" position="insideRight" offset={10} formatter={(value) => `${Math.round(value).toLocaleString('pt-BR')}h`} style={{ fill: 'white', fontWeight: 'bold' }} />
                    </Bar>
                    <Bar dataKey="apontado" name="Horas Apontadas">
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.apontado > entry.planejado ? styles.wegRed : styles.wegGreen} />
                        ))}
                        <LabelList dataKey="apontado" position="insideRight" offset={10} formatter={(value) => `${Math.round(value).toLocaleString('pt-BR')}h`} style={{ fill: 'white', fontWeight: 'bold' }} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};


// --- Componente Principal do Dashboard ---
const PMODashboard = () => {
  const [projetosPorSecao, setProjetosPorSecao] = useState([]);
  const [equipesPorSecao, setEquipesPorSecao] = useState([]);
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

        setProjetosPorSecao(Object.keys(projetosData).map(key => ({ secao: key, total_projetos: projetosData[key] || 0 })));
        setEquipesPorSecao(Object.keys(equipesData).map(key => ({ secao: key, total_equipes: equipesData[key] || 0 })));
        setHorasData(horasData);
        setStatusProjetosData(statusProjetosData);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p style={{ textAlign: 'center', padding: '20px' }}>Carregando dashboard...</p>;
  if (error) return <p style={{ textAlign: 'center', padding: '20px', color: 'red' }}>Erro ao carregar dados: {error}</p>;

  return (
    <Box sx={{ flexGrow: 1, backgroundColor: styles.lightGrey, p: { xs: 2, md: 3 } }}>
      {/* Linha de Cartões */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', marginBottom: '30px' }}>
          {projetosPorSecao.map(secao => (
              <DashboardCard 
                  key={secao.secao} 
                  title={`Projetos Ativos ${secao.secao}`} 
                  value={secao.total_projetos} 
                  unit="projetos"
              />
          ))}
          {equipesPorSecao.map(secao => (
              <DashboardCard 
                  key={secao.secao} 
                  title={`Equipes Ativas ${secao.secao}`} 
                  value={secao.total_equipes} 
                  unit="equipes"
              />
          ))}
      </div>

      {/* Linha de Gráficos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', md: '2fr 1fr', gap: '30px' }}>
          <ProjectStatusChart data={statusProjetosData} />
          <HoursComparisonChart data={horasData} />
      </div>
    </Box>
  );
};

export default PMODashboard;
