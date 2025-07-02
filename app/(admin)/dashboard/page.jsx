"use client";

import React, { useState, useEffect, useRef } from 'react';
// Firebase imports removed, using mock data for visual representation.
import Chart from 'chart.js/auto';

// --- Helper Functions for Chart Rendering ---
const destroyChart = (instance) => {
    if (instance) {
        instance.destroy();
    }
};

const renderPieChart = (canvas, data, options) => {
    return new Chart(canvas, { type: 'pie', data, options });
};

const renderBarChart = (canvas, data, options) => {
    return new Chart(canvas, { type: 'bar', data, options });
};

const renderLineChart = (canvas, data, options) => {
    return new Chart(canvas, { type: 'line', data, options });
};

// --- UI Components ---

const Header = ({ onGestorViewClick }) => (
    <header className="bg-[#00579d] text-white p-4 shadow-md flex items-center justify-between">
        <div className="flex items-center">
            <svg className="h-8 w-8 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line>
            </svg>
            <h1 className="text-xl font-bold">WEG PMO - Gestão de Projetos</h1>
        </div>
        <nav>
            <ul className="flex space-x-4 items-center">
                <li><a href="#" className="hover:underline">Dashboard</a></li>
                <li>
                    <button onClick={onGestorViewClick} className="ml-4 px-4 py-2 bg-white text-[#00579d] rounded-md font-semibold hover:bg-gray-100 transition-colors duration-200 shadow-md">
                        Visão do Gestor
                    </button>
                </li>
            </ul>
        </nav>
    </header>
);

const DashboardCard = ({ title, children, className = '' }) => (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <h2 className="text-lg font-semibold text-[#00579d] mb-4">{title}</h2>
        {children}
    </div>
);

const GestorModal = ({ show, onClose, chartsData }) => {
    const horasApontadasPlanejadasChartRef = useRef(null);
    const utilizacaoRecursosChartRef = useRef(null);
    const projetosStatusHistoricoChartRef = useRef(null);
    const chartInstances = useRef({});

    useEffect(() => {
        if (show && chartsData) {
            const { horasApontadasPlanejadas, utilizacaoRecursos, projetosStatusHistorico } = chartsData;
            // Destroy existing charts before creating new ones
            Object.values(chartInstances.current).forEach(destroyChart);
            chartInstances.current = {};

            if (horasApontadasPlanejadasChartRef.current) {
                chartInstances.current.horas = renderLineChart(horasApontadasPlanejadasChartRef.current, {
                    labels: horasApontadasPlanejadas.labels,
                    datasets: [
                        { label: 'Horas Apontadas', data: horasApontadasPlanejadas.apontadasData, borderColor: '#00579d', backgroundColor: 'rgba(0, 87, 157, 0.2)', fill: true, tension: 0.1 },
                        { label: 'Horas Planejadas', data: horasApontadasPlanejadas.planejadasData, borderColor: '#FFA000', backgroundColor: 'rgba(255, 160, 0, 0.2)', fill: true, tension: 0.1 },
                    ]
                }, { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, title: { display: true, text: 'Horas' } } } });
            }

            if (utilizacaoRecursosChartRef.current) {
                chartInstances.current.recursos = renderBarChart(utilizacaoRecursosChartRef.current, {
                    labels: utilizacaoRecursos.labels,
                    datasets: [{ label: '% Utilização', data: utilizacaoRecursos.data, backgroundColor: '#4CAF50' }]
                }, { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, title: { display: true, text: '% Utilização' } }, x: { title: { display: true, text: 'Recurso' } } }, plugins: { legend: { display: false } } });
            }

            if (projetosStatusHistoricoChartRef.current) {
                chartInstances.current.historico = renderLineChart(projetosStatusHistoricoChartRef.current, {
                    labels: projetosStatusHistorico.labels,
                    datasets: projetosStatusHistorico.datasets
                }, { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, title: { display: true, text: 'Número de Projetos' } } } });
            }
        }

        return () => {
            Object.values(chartInstances.current).forEach(destroyChart);
        };
    }, [show, chartsData, horasApontadasPlanejadasChartRef, utilizacaoRecursosChartRef, projetosStatusHistoricoChartRef]);

    if (!show) return null;

    return (
        <div id="gestorModal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={(e) => e.target.id === 'gestorModal' && onClose()}>
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                <button className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl" onClick={onClose}>&times;</button>
                <h2 className="text-2xl font-bold text-[#00579d] mb-6">Visão do Gestor - Gráficos Analíticos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DashboardCard title="Horas Apontadas vs. Planejadas"><div className="relative h-64"><canvas ref={horasApontadasPlanejadasChartRef}></canvas></div></DashboardCard>
                    <DashboardCard title="Utilização de Recursos"><div className="relative h-64"><canvas ref={utilizacaoRecursosChartRef}></canvas></div></DashboardCard>
                    <DashboardCard title="Projetos por Status (Histórico)" className="md:col-span-2"><div className="relative h-80"><canvas ref={projetosStatusHistoricoChartRef}></canvas></div></DashboardCard>
                </div>
            </div>
        </div>
    );
};

// --- Mock Data for Visual Representation ---
const mockData = {
    secoes: [
        { id: 'sec1', nome: 'Engenharia de Produto' },
        { id: 'sec2', nome: 'Engenharia de Processos' },
        { id: 'sec3', nome: 'Qualidade' },
    ],
    equipes: [
        { id: 'eq1', nome: 'Equipe Alfa', secao_id: 'sec1' },
        { id: 'eq2', nome: 'Equipe Beta', secao_id: 'sec2' },
        { id: 'eq3', nome: 'Equipe Gama', secao_id: 'sec3' },
    ],
    statusProjetos: [
        { id: 'stat1', nome: 'Andamento', is_final: false },
        { id: 'stat2', nome: 'Cancelado', is_final: true },
        { id: 'stat3', nome: 'Parado', is_final: false },
        { id: 'stat4', nome: 'Backlog', is_final: false },
        { id: 'stat5', nome: 'Concluído', is_final: true },
    ],
    recursos: [
        { id: 'rec1', nome: 'João Silva', ativo: true },
        { id: 'rec2', nome: 'Maria Oliveira', ativo: true },
        { id: 'rec3', nome: 'Carlos Pereira', ativo: false },
        { id: 'rec4', nome: 'Ana Costa', ativo: true },
    ],
    projetos: [
        { id: 'proj1', secao_id: 'sec1', status_projeto_id: 'stat1', ativo: true, created_at: { seconds: new Date('2025-01-15').getTime() / 1000 } },
        { id: 'proj2', secao_id: 'sec1', status_projeto_id: 'stat5', ativo: false, created_at: { seconds: new Date('2025-02-20').getTime() / 1000 } },
        { id: 'proj3', secao_id: 'sec2', status_projeto_id: 'stat1', ativo: true, created_at: { seconds: new Date('2025-03-10').getTime() / 1000 } },
        { id: 'proj4', secao_id: 'sec3', status_projeto_id: 'stat2', ativo: false, created_at: { seconds: new Date('2025-04-05').getTime() / 1000 } },
        { id: 'proj5', secao_id: 'sec2', status_projeto_id: 'stat3', ativo: true, created_at: { seconds: new Date('2025-05-01').getTime() / 1000 } },
        { id: 'proj6', secao_id: 'sec1', status_projeto_id: 'stat4', ativo: true, created_at: { seconds: new Date('2025-06-12').getTime() / 1000 } },
    ],
    alocacoes: [
        { id: 'aloc1', projeto_id: 'proj1', recurso_id: 'rec1' },
        { id: 'aloc2', projeto_id: 'proj3', recurso_id: 'rec2' },
        { id: 'aloc3', projeto_id: 'proj5', recurso_id: 'rec4' },
    ],
    apontamentos: [
        { id: 'apont1', projeto_id: 'proj1', recurso_id: 'rec1', horas_apontadas: 20, data_apontamento: { seconds: new Date().getTime() / 1000 } },
        { id: 'apont2', projeto_id: 'proj3', recurso_id: 'rec2', horas_apontadas: 30, data_apontamento: { seconds: new Date().getTime() / 1000 } },
        { id: 'apont3', projeto_id: 'proj1', recurso_id: 'rec1', horas_apontadas: 15, data_apontamento: { seconds: new Date(new Date().setMonth(new Date().getMonth() - 1)).getTime() / 1000 } },
    ],
    horasPlanejadas: [
        { id: 'hp1', alocacao_id: 'aloc1', horas_planejadas: 25, mes: new Date().getMonth() + 1, ano: new Date().getFullYear() },
        { id: 'hp2', alocacao_id: 'aloc2', horas_planejadas: 40, mes: new Date().getMonth() + 1, ano: new Date().getFullYear() },
        { id: 'hp3', alocacao_id: 'aloc1', horas_planejadas: 10, mes: new Date(new Date().setMonth(new Date().getMonth() - 1)).getMonth() + 1, ano: new Date(new Date().setMonth(new Date().getMonth() - 1)).getFullYear() },
    ],
};

// --- Main Page Component ---

const DashboardPage = () => {
    const [dashboardData, setDashboardData] = useState({ projetosPorSecao: {}, horasPorSecaoComparativo: { labels: [], apontadas: [], planejadas: [] }, statusProjetoChart: { labels: [], data: [], colors: [] }, projetosPorEquipeTotal: {}, recursosAtivos: 0 });
    const [gestorChartsData, setGestorChartsData] = useState(null);
    const [showGestorModal, setShowGestorModal] = useState(false);
    const chartInstances = useRef({});
    const horasPorSecaoComparativoChartRef = useRef(null);
    const statusProjetoChartRef = useRef(null);

    // Using mock data for visual representation
    useEffect(() => {
        const { projetos, apontamentos, horasPlanejadas, secoes, equipes, statusProjetos, recursos, alocacoes } = mockData;

        // Process data for main dashboard
        processDashboardData(projetos, apontamentos, horasPlanejadas, secoes, equipes, statusProjetos, recursos, alocacoes);
        // Process data for manager's modal
        processGestorChartsData(projetos, apontamentos, horasPlanejadas, recursos, alocacoes, statusProjetos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array to run only once on mount

    const processDashboardData = (projetos, apontamentos, horasPlanejadas, secoes, equipes, statusProjetos, recursos, alocacoes) => {
        const projetosPorSecao = Object.fromEntries(secoes.map(s => [s.nome, { total: 0, ativos: 0, concluidos: 0 }]));
        const statusConcluidoIds = statusProjetos.filter(s => s.is_final).map(s => s.id);
        projetos.forEach(p => {
            const secao = secoes.find(s => s.id === p.secao_id);
            if (secao && projetosPorSecao[secao.nome]) {
                projetosPorSecao[secao.nome].total++;
                if (p.ativo) projetosPorSecao[secao.nome].ativos++;
                if (statusConcluidoIds.includes(p.status_projeto_id)) projetosPorSecao[secao.nome].concluidos++;
            }
        });

        const { currentMonth, currentYear } = { currentMonth: new Date().getMonth() + 1, currentYear: new Date().getFullYear() };
        const horasPorSecao = Object.fromEntries(secoes.map(s => [s.nome, { apontadas: 0, planejadas: 0 }]));
        apontamentos.forEach(a => {
            const dataApontamento = a.data_apontamento?.seconds ? new Date(a.data_apontamento.seconds * 1000) : new Date();
            if (dataApontamento.getMonth() + 1 === currentMonth && dataApontamento.getFullYear() === currentYear) {
                const projeto = projetos.find(p => p.id === a.projeto_id);
                const secao = secoes.find(s => s.id === projeto?.secao_id);
                if (secao && horasPorSecao[secao.nome]) horasPorSecao[secao.nome].apontadas += (a.horas_apontadas || 0);
            }
        });
        horasPlanejadas.forEach(hp => {
            if (hp.mes === currentMonth && hp.ano === currentYear) {
                const alocacao = alocacoes.find(al => al.id === hp.alocacao_id);
                const projeto = projetos.find(p => p.id === alocacao?.projeto_id);
                const secao = secoes.find(s => s.id === projeto?.secao_id);
                if (secao && horasPorSecao[secao.nome]) horasPorSecao[secao.nome].planejadas += (hp.horas_planejadas || 0);
            }
        });
        const horasPorSecaoComparativo = { labels: Object.keys(horasPorSecao), apontadas: Object.values(horasPorSecao).map(h => h.apontadas), planejadas: Object.values(horasPorSecao).map(h => h.planejadas) };

        const statusCounts = { 'Andamento': 0, 'Cancelado': 0, 'Parado': 0, 'Backlog': 0 };
        projetos.forEach(p => {
            const status = statusProjetos.find(s => s.id === p.status_projeto_id);
            if (status && statusCounts[status.nome] !== undefined) statusCounts[status.nome]++;
        });
        const total = Object.values(statusCounts).reduce((s, c) => s + c, 0);
        const statusProjetoChart = { labels: Object.keys(statusCounts), data: Object.values(statusCounts).map(c => total > 0 ? (c / total * 100).toFixed(2) : 0), colors: ['#00579d', '#F44336', '#FFC107', '#9E9E9E'] };

        const projetosPorEquipeTotal = Object.fromEntries(equipes.map(e => [e.nome, 0]));
        projetos.forEach(p => {
            const equipe = equipes.find(e => e.secao_id === p.secao_id);
            if (equipe) projetosPorEquipeTotal[equipe.nome]++;
        });

        setDashboardData({ projetosPorSecao, horasPorSecaoComparativo, statusProjetoChart, projetosPorEquipeTotal, recursosAtivos: recursos.filter(r => r.ativo).length });
    };

    const processGestorChartsData = (projetos, apontamentos, horasPlanejadas, recursos, alocacoes, statusProjetos) => {
        const monthlyData = {};
        for (let i = 5; i >= 0; i--) {
            const d = new Date(new Date().setMonth(new Date().getMonth() - i));
            monthlyData[`${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`] = { apontadas: 0, planejadas: 0 };
        }
        apontamentos.forEach(a => {
            const d = a.data_apontamento?.seconds ? new Date(a.data_apontamento.seconds * 1000) : new Date();
            const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
            if (monthlyData[key]) monthlyData[key].apontadas += (a.horas_apontadas || 0);
        });
        horasPlanejadas.forEach(hp => {
            const key = `${hp.ano}-${hp.mes.toString().padStart(2, '0')}`;
            if (monthlyData[key]) monthlyData[key].planejadas += (hp.horas_planejadas || 0);
        });
        const horasApontadasPlanejadas = { labels: Object.keys(monthlyData), apontadasData: Object.values(monthlyData).map(d => d.apontadas), planejadasData: Object.values(monthlyData).map(d => d.planejadas) };

        const resourceUtilization = Object.fromEntries(recursos.map(r => [r.nome, { apontadas: 0, alocadas: 0 }]));
        apontamentos.forEach(a => {
            const recurso = recursos.find(r => r.id === a.recurso_id);
            if (recurso) resourceUtilization[recurso.nome].apontadas += (a.horas_apontadas || 0);
        });
        alocacoes.forEach(aloc => {
            const recurso = recursos.find(r => r.id === aloc.recurso_id);
            if (recurso) {
                resourceUtilization[recurso.nome].alocadas += horasPlanejadas.filter(hp => hp.alocacao_id === aloc.id).reduce((sum, hp) => sum + (hp.horas_planejadas || 0), 0);
            }
        });
        const utilizacaoRecursos = { labels: Object.keys(resourceUtilization), data: Object.values(resourceUtilization).map(r => r.alocadas > 0 ? (r.apontadas / r.alocadas * 100).toFixed(2) : 0) };

        const statusHistory = {};
        Object.keys(monthlyData).forEach(month => {
            statusHistory[month] = Object.fromEntries(statusProjetos.map(s => [s.nome, 0]));
        });
        projetos.forEach(p => {
            const d = p.created_at?.seconds ? new Date(p.created_at.seconds * 1000) : new Date();
            const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
            const status = statusProjetos.find(s => s.id === p.status_projeto_id);
            if (statusHistory[key] && status) statusHistory[key][status.nome]++;
        });
        const projetosStatusHistorico = {
            labels: Object.keys(monthlyData),
            datasets: statusProjetos.map((status, i) => ({
                label: status.nome,
                data: Object.values(statusHistory).map(h => h[status.nome] || 0),
                borderColor: ['#00579d', '#4CAF50', '#FFC107', '#F44336', '#9C27B0', '#03A9F4'][i % 6],
                fill: false,
                tension: 0.1
            }))
        };

        setGestorChartsData({ horasApontadasPlanejadas, utilizacaoRecursos, projetosStatusHistorico });
    };

    useEffect(() => {
        Object.values(chartInstances.current).forEach(destroyChart);
        chartInstances.current = {};

        if (dashboardData.statusProjetoChart.labels.length > 0 && statusProjetoChartRef.current) {
            chartInstances.current.status = renderPieChart(statusProjetoChartRef.current, {
                labels: dashboardData.statusProjetoChart.labels,
                datasets: [{ data: dashboardData.statusProjetoChart.data, backgroundColor: dashboardData.statusProjetoChart.colors, hoverOffset: 4 }]
            }, { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { generateLabels: c => c.data.labels.map((l, i) => ({ text: `${l}: ${c.data.datasets[0].data[i]}%`, fillStyle: c.data.datasets[0].backgroundColor[i] })) } }, tooltip: { callbacks: { label: ctx => `${ctx.label}: ${ctx.parsed}%` } } } });
        }
        if (dashboardData.horasPorSecaoComparativo.labels.length > 0 && horasPorSecaoComparativoChartRef.current) {
            chartInstances.current.horas = renderBarChart(horasPorSecaoComparativoChartRef.current, {
                labels: dashboardData.horasPorSecaoComparativo.labels,
                datasets: [
                    { label: 'Horas Apontadas', data: dashboardData.horasPorSecaoComparativo.apontadas, backgroundColor: '#00579d' },
                    { label: 'Horas Planejadas', data: dashboardData.horasPorSecaoComparativo.planejadas, backgroundColor: '#FFA000' }
                ]
            }, { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, title: { display: true, text: 'Horas' } }, x: { title: { display: true, text: 'Seção' } } }, plugins: { legend: { position: 'top' } } });
        }
    }, [dashboardData, horasPorSecaoComparativoChartRef, statusProjetoChartRef]);

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header onGestorViewClick={() => setShowGestorModal(true)} />
            <main className="flex-grow container mx-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashboardCard title="Resumo de Projetos por Seção">
                    {Object.keys(dashboardData.projetosPorSecao).length > 0 ? Object.entries(dashboardData.projetosPorSecao).map(([secao, data]) => (
                        <div key={secao} className="mb-2 p-2 border-b border-gray-200 last:border-b-0">
                            <h3 className="font-semibold text-gray-800">{secao}</h3>
                            <div className="flex items-center justify-between text-sm"><span className="text-gray-600">Total:</span><span className="font-bold">{data.total}</span></div>
                            <div className="flex items-center justify-between text-sm"><span className="text-gray-600">Ativos:</span><span className="font-bold text-green-600">{data.ativos}</span></div>
                            <div className="flex items-center justify-between text-sm"><span className="text-gray-600">Concluídos:</span><span className="font-bold text-blue-600">{data.concluidos}</span></div>
                        </div>
                    )) : <p>Carregando dados...</p>}
                </DashboardCard>
                <DashboardCard title="Horas Planejadas vs Apontadas por Seção" className="md:col-span-2">
                    <div className="relative h-80"><canvas ref={horasPorSecaoComparativoChartRef}></canvas></div>
                </DashboardCard>
                <DashboardCard title="Status dos Projetos (Percentual)">
                    <div className="relative h-80"><canvas ref={statusProjetoChartRef}></canvas></div>
                </DashboardCard>
                <DashboardCard title="Projetos por Equipe">
                    <ul className="list-disc pl-5 text-gray-700 space-y-2">
                        {Object.keys(dashboardData.projetosPorEquipeTotal).length > 0 ? Object.entries(dashboardData.projetosPorEquipeTotal).map(([equipe, total]) => (
                            <li key={equipe}><span className="font-semibold">{equipe}:</span> {total} Projetos</li>
                        )) : <li>Carregando...</li>}
                    </ul>
                </DashboardCard>
                <DashboardCard title="Recursos Ativos">
                    <div className="flex items-center justify-center text-center h-full">
                        <div>
                            <p className="text-gray-600 mb-2">Total de Recursos Ativos:</p>
                            <span className="font-bold text-5xl text-green-600">{dashboardData.recursosAtivos}</span>
                            <p className="text-sm text-gray-500 mt-2">Número de colaboradores atualmente ativos no sistema.</p>
                        </div>
                    </div>
                </DashboardCard>
            </main>
            <GestorModal show={showGestorModal} onClose={() => setShowGestorModal(false)} chartsData={gestorChartsData} />
            <footer className="bg-gray-800 text-white p-4 text-center mt-8">
                <p>&copy; 2025 WEG S.A. - Todos os direitos reservados.</p>
            </footer>
        </div>
    );
};

export default DashboardPage;