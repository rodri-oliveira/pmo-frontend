import React, { useState, useRef, useEffect } from 'react';

/**
 * Autocomplete para Equipe usando endpoint de filtros-populados
 * Props: value, onChange, secaoId
 */
export default function AutocompleteEquipeFiltro({ value, onChange, secaoId }) {
  const [inputValue, setInputValue] = useState(value?.nome || '');
  const [sugestoes, setSugestoes] = useState([]);
  const [showSugestoes, setShowSugestoes] = useState(false);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef();

  useEffect(() => {
    setInputValue(value?.nome || '');
  }, [value]);

  useEffect(() => {
    setSugestoes([]);
    setInputValue('');
  }, [secaoId]);

  async function buscarEquipes(termo) {
    setLoading(true);
    try {
      const url = `/backend/filtros/filtros-populados?entidade=equipe&secao_id=${secaoId}&search=${encodeURIComponent(termo||'')}`;
      const resp = await fetch(url);
      const data = await resp.json();
      setSugestoes(data.equipes || []);
    } catch (e) {
      setSugestoes([]);
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(e) {
    const val = e.target.value;
    setInputValue(val);
    clearTimeout(timeoutRef.current);
    if (!val) {
      setSugestoes([]);
      setShowSugestoes(false);
      onChange && onChange(null);
      return;
    }
    timeoutRef.current = setTimeout(() => buscarEquipes(val), 300);
    setShowSugestoes(true);
  }

  function handleSelect(sugestao) {
    setInputValue(sugestao.nome);
    setShowSugestoes(false);
    onChange && onChange(sugestao);
  }

  return (
    <div style={{ position: 'relative', width: 240 }}>
      <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 14, color: '#00579D' }}>Equipe</label>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => { setShowSugestoes(true); buscarEquipes(inputValue); }}
        placeholder="Digite o nome da equipe..."
        style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1.5px solid #E0E3E7', fontSize: 15, background: loading ? '#f5f5f5' : '#fff' }}
        onBlur={() => setTimeout(() => setShowSugestoes(false), 150)}
        disabled={loading || !secaoId}
      />
      {inputValue && !loading && (
        <span
          onMouseDown={e => { e.preventDefault(); setInputValue(''); setSugestoes([]); onChange && onChange(null); }}
          style={{ position: 'absolute', right: 12, top: 36, cursor: 'pointer', fontSize: 16, color: '#999' }}
        >×</span>
      )}
      {showSugestoes && sugestoes.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', maxHeight: 200, overflowY: 'auto', background: '#fff', border: '1px solid #ccc', borderRadius: 4, zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
          {sugestoes.map(sugestao => (
            <div
              key={sugestao.id}
              onClick={() => handleSelect(sugestao)}
              style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eee', transition: 'background 0.2s' }}
              onMouseEnter={e => e.target.style.background = '#f5f5f5'}
              onMouseLeave={e => e.target.style.background = '#fff'}
            >
              {sugestao.nome}
            </div>
          ))}
        </div>
      )}
      {showSugestoes && (
        <div onClick={() => setShowSugestoes(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 }} />
      )}
    </div>
  );
}
