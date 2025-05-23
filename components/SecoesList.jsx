import React, { useEffect, useState } from "react";
import { getSecoes } from "../services/api";

export default function SecoesList() {
  const [secoes, setSecoes] = useState([]);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function fetchSecoes() {
      setCarregando(true);
      setErro(null);
      try {
        const data = await getSecoes();
        setSecoes(data);
      } catch (err) {
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    }
    fetchSecoes();
  }, []);

  if (carregando) return <div>Carregando...</div>;
  if (erro) return <div style={{ color: "red" }}>Erro: {erro}</div>;

  return (
    <div>
      <h2>Lista de Seções</h2>
      <ul>
        {secoes.map(secao => (
          <li key={secao.id}>
            <strong>{secao.nome}</strong> - {secao.descricao}
          </li>
        ))}
      </ul>
    </div>
  );
}
