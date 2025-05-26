import React, { useState, useRef } from 'react';
import { buscarRecursosPorNome } from '../utils/autocomplete';

/**
 * Componente de autocomplete para selecionar recurso pelo nome
 * Props:
 *   value: valor atual (id do recurso)
 *   onChange: função chamada com o id do recurso selecionado
 */
export default function AutocompleteRecurso({ value, onChange, placeholder = 'Digite o nome do recurso...' }) {
  const [inputValue, setInputValue] = useState('');
  const [sugestoes, setSugestoes] = useState([]);
  const [showSugestoes, setShowSugestoes] = useState(false);
  const timeoutRef = useRef();

  async function handleInputChange(e) {
    const val = e.target.value;
    setInputValue(val);
    clearTimeout(timeoutRef.current);
    if (val.length >= 2) {
      timeoutRef.current = setTimeout(async () => {
        const sugests = await buscarRecursosPorNome(val);
        setSugestoes(sugests);
        setShowSugestoes(true);
      }, 300);
    } else {
      setSugestoes([]);
      setShowSugestoes(false);
    }
  }

  function handleSelect(sugestao) {
    setInputValue(sugestao.nome);
    setShowSugestoes(false);
    setSugestoes([]);
    if (onChange) onChange(sugestao); // Agora retorna o objeto inteiro: { id, nome }
  }

  return (
    <div style={{ position: 'relative', width: 240 }}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1.5px solid #E0E3E7', fontSize: 15 }}
        onFocus={() => { /* Não mostra sugestões ao focar sem digitar */ }}
        onBlur={() => setTimeout(() => setShowSugestoes(false), 150)}
      />
      {showSugestoes && sugestoes.length > 0 && (
        <ul style={{
          position: 'absolute',
          zIndex: 10,
          background: '#fff',
          border: '1px solid #ccc',
          borderRadius: 6,
          margin: 0,
          padding: '4px 0',
          width: '100%',
          maxHeight: 180,
          overflowY: 'auto',
          boxShadow: '0 2px 8px #0002',
          listStyle: 'none'
        }}>
          {sugestoes.map((s, idx) => (
            <li key={idx}
                onMouseDown={() => handleSelect(s)}
                style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 15 }}
            >
              {s.nome}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
