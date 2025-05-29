import React, { useState, useRef, useEffect } from 'react';
import { buscarSecoesPorNome, buscarTodasSecoes } from '../../utils/autocomplete';

/**
 * Componente de autocomplete para selecionar seção pelo nome
 * Props:
 *   value: valor atual (id da seção ou objeto {id, nome})
 *   onChange: função chamada com o objeto {id, nome} da seção selecionada
 */
export default function AutocompleteSecaoCascade({ value, onChange, placeholder = 'Digite o nome da seção...' }) {
  const [inputValue, setInputValue] = useState(value && value.nome ? value.nome : '');
  const [sugestoes, setSugestoes] = useState([]);
  const [showSugestoes, setShowSugestoes] = useState(false);
  const [todasSecoes, setTodasSecoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef();

  // Carregar todas as seções ao montar o componente
  useEffect(() => {
    const carregarTodasSecoes = async () => {
      setLoading(true);
      try {
        const secoes = await buscarTodasSecoes();
        setTodasSecoes(secoes);
        setSugestoes(secoes);
      } catch (error) {
        console.error('Erro ao carregar seções:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarTodasSecoes();
  }, []);

  // Atualizar o valor do input quando o value mudar externamente
  useEffect(() => {
    if (value && value.nome) {
      setInputValue(value.nome);
    } else if (!value) {
      setInputValue('');
    }
  }, [value]);

  async function handleInputChange(e) {
    const val = e.target.value;
    setInputValue(val);
    clearTimeout(timeoutRef.current);
    
    if (!val) {
      // Se o campo estiver vazio, mostrar todas as seções
      setSugestoes(todasSecoes);
      setShowSugestoes(true);
      return;
    }
    
    if (val.length >= 2) {
      timeoutRef.current = setTimeout(async () => {
        const sugests = await buscarSecoesPorNome(val);
        setSugestoes(sugests);
        setShowSugestoes(true);
      }, 300);
    } else {
      setSugestoes([]);
      setShowSugestoes(false);
    }
  }

  function handleFocus() {
    // Ao focar, mostrar todas as seções se não houver texto digitado
    if (!inputValue) {
      setSugestoes(todasSecoes);
      setShowSugestoes(true);
    }
  }

  function handleSelect(sugestao) {
    setInputValue(sugestao.nome);
    setShowSugestoes(false);
    setSugestoes([]);
    if (onChange) onChange(sugestao); // Retorna o objeto { id, nome }
  }

  return (
    <div style={{ position: 'relative', width: 240 }}>
      <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 14, color: '#00579D' }}>
        Seção
      </label>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        style={{ 
          width: '100%', 
          padding: '8px 12px', 
          borderRadius: 6, 
          border: '1.5px solid #E0E3E7', 
          fontSize: 15,
          background: loading ? '#f5f5f5' : '#fff'
        }}
        onBlur={() => setTimeout(() => setShowSugestoes(false), 150)}
        disabled={loading}
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
                style={{ 
                  padding: '8px 12px', 
                  cursor: 'pointer', 
                  fontSize: 15,
                  backgroundColor: value && value.id === s.id ? '#E3F1FC' : 'transparent',
                  fontWeight: value && value.id === s.id ? 600 : 400
                }}
            >
              {s.nome}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
