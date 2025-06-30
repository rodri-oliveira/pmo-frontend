import React, { useState, useRef } from 'react';

/**
 * Autocomplete para Seção usando endpoint de filtros-populados
 * Props: value, onChange
 */
export default function AutocompleteSecaoFiltro({ value, onChange }) {
  const [inputValue, setInputValue] = useState(value?.nome || '');
  const [sugestoes, setSugestoes] = useState([]);
  const [showSugestoes, setShowSugestoes] = useState(false);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef();

  async function buscarSecoes(termo) {
    setLoading(true);
    try {
      const resp = await fetch(`/backend/v1/filtros/filtros-populados?entidade=secao&search=${encodeURIComponent(termo||'')}`);
      const data = await resp.json();
      setSugestoes(data.secoes || []);
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
    timeoutRef.current = setTimeout(() => buscarSecoes(val), 300);
    setShowSugestoes(true);
  }

  function handleSelect(sugestao) {
    setInputValue(sugestao.nome);
    setShowSugestoes(false);
    onChange && onChange(sugestao);
  }

  return (
    <div style={{ position: 'relative', width: 240 }}>
      <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 14, color: '#00579D' }}>Seção</label>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => { setShowSugestoes(true); buscarSecoes(inputValue); }}
        placeholder="Digite o nome da seção..."
        style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1.5px solid #E0E3E7', fontSize: 15, background: loading ? '#f5f5f5' : '#fff' }}
        onBlur={() => setTimeout(() => setShowSugestoes(false), 150)}
        disabled={loading}
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
