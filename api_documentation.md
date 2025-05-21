# Guia Consolidado de Integração Front-end com API PMO (Revisado)

## Visão Geral

Este documento descreve como as telas do front-end devem interagir com os endpoints da API do Sistema de Gestão de Projetos e Melhorias da WEG (PMO). Ele consolida informações da especificação da API e de um guia de integração anterior, com correções baseadas na estrutura final do banco de dados.

**URL Base da API**: `/backend/v1` [cite: 1]

## Autenticação 🔑

A API utiliza autenticação via token OAuth2. Todos os endpoints (exceto o webhook do Jira, se aplicável) requerem autenticação[cite: 1].

### Adaptar os métodos de busca para aceitar array direto ou { items: [...] } (padrão defensivo).

### Tela de Login

* **Rota Sugerida no Front-end:** `/login`
* **Objetivo:** Autenticar o usuário no sistema.
* **Endpoint da API Principal:** `POST /auth/token` (ou `POST /token` - verificar a implementação final) [cite: 1]
* **Corpo da Requisição (application/x-www-form-urlencoded):**
    * `username` (string, **obrigatório**): O e-mail do usuário[cite: 1].
    * `password` (string, **obrigatório**)[cite: 1].
* **Resposta de Sucesso (200 OK):** [cite: 1]
    ```json
    {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "token_type": "bearer"
    }
    ```
* **Lógica Front-end:**
    * Coletar `username` (e-mail) e `password`.
    * Enviar para o endpoint de autenticação.
    * Em caso de sucesso (200 OK), armazenar o `access_token` de forma segura e incluí-lo nos cabeçalhos `Authorization: Bearer <access_token>` das requisições subsequentes.
    * Tratar respostas de erro (ex: 401 Unauthorized para credenciais inválidas ou usuário inativo)[cite: 1].

### Tela de Criação de Usuário (Administração)

* **Rota Sugerida no Front-end:** `/admin/usuarios/criar`
* **Objetivo:** Permitir que um administrador crie novas contas de usuário.
* **Endpoint da API Principal:** `POST /usuarios` [cite: 1]
* **Autenticação:** Requer Bearer Token JWT de um usuário com `role` "ADMIN"[cite: 1].
* **Corpo da Requisição (application/json - Schema: `UserCreate`):** [cite: 1]
    ```json
    {
      "email": "novo.usuario@example.com",
      "nome": "Novo Usuário de Teste",
      "password": "senhaSegura123",
      "role": "RECURSO",
      "recurso_id": 10,
      "ativo": true
    }
    ```
* **Campos da Requisição:**
    * `email` (string, formato de email, **obrigatório**)[cite: 1].
    * `nome` (string, **obrigatório**)[cite: 1].
    * `password` (string, mínimo 8 caracteres, **obrigatório**)[cite: 1].
    * `role` (string enum: "ADMIN", "GESTOR", "RECURSO" - *conforme seu ENUM `userrole`*, **obrigatório**)[cite: 1].
    * `recurso_id` (integer, opcional): ID do `recurso` associado (se aplicável)[cite: 1].
    * `ativo` (boolean, opcional, default: `true`)[cite: 1].
* **Resposta de Sucesso (200 OK - Schema: `UserBase`):** [cite: 1]
    ```json
    {
      "email": "novo.usuario@example.com",
      "nome": "Novo Usuário de Teste",
      "role": "RECURSO",
      "recurso_id": 10,
      "ativo": true
    }
    ```
* **Respostas de Erro:**
    * `400 Bad Request`: E-mail já em uso ou dados inválidos (ex: senha curta)[cite: 1].
    * `401 Unauthorized`: Token JWT ausente, inválido ou expirado[cite: 1].
    * `403 Forbidden`: Usuário autenticado não é administrador[cite: 1].

---
## Gerenciamento de Seções (Entidade `secao`)

* **Rota Sugerida no Front-end:** `/secoes`
* **Endpoints da API:**
    * Listar: `GET /secoes/`[cite: 1].
    * Criar: `POST /secoes/`[cite: 1].
    * Obter por ID: `GET /secoes/{secao_id}`[cite: 1].
    * Atualizar: `PUT /secoes/{secao_id}`[cite: 1].
    * Excluir: `DELETE /secoes/{secao_id}`[cite: 1].
* **Corpo da Requisição para Criar (Schema `SecaoCreateDTO`):** [cite: 1]
    * `nome` (string, **obrigatório**).
    * `descricao` (string, opcional).
* **Corpo da Requisição para Atualizar (Schema `SecaoUpdateDTO`):** [cite: 1]
    * `nome` (string, opcional).
    * `descricao` (string, opcional).
    * `ativo` (boolean, opcional).
* **Resposta (Schema `SecaoDTO`):** [cite: 1]
    * `id` (integer).
    * `nome` (string).
    * `descricao` (string, opcional).
    * `ativo` (boolean).
    * `data_criacao` (datetime).
    * `data_atualizacao` (datetime).
* **Lógica Front-end (Listagem):** Permitir filtros por `apenas_ativos` e paginação (`skip`, `limit`)[cite: 1].

---
## Gerenciamento de Equipes (Entidade `equipe`)

* **Rota Sugerida no Front-end:** `/equipes`
* **Endpoints da API:**
    * Listar: `GET /equipes/`[cite: 1].
    * Criar: `POST /equipes/`[cite: 1].
    * Obter por ID: `GET /equipes/{equipe_id}`[cite: 1].
    * Atualizar: `PUT /equipes/{equipe_id}`[cite: 1].
    * Excluir: `DELETE /equipes/{equipe_id}`[cite: 1].
* **Corpo da Requisição para Criar (Schema `EquipeCreateDTO`):** [cite: 1]
    * `nome` (string, **obrigatório**).
    * `secao_id` (integer, **obrigatório**) - *Dropdown populado por `GET /secoes/`*.
    * `descricao` (string, opcional).
* **Corpo da Requisição para Atualizar (Schema `EquipeUpdateDTO`):** [cite: 1]
    * `nome` (string, opcional).
    * `descricao` (string, opcional).
    * `secao_id` (integer, opcional).
    * `ativo` (boolean, opcional).
* **Resposta (Schema `EquipeDTO`):** [cite: 1]
    * `id` (integer).
    * `nome` (string).
    * `descricao` (string, opcional).
    * `secao_id` (integer).
    * `ativo` (boolean).
    * `data_criacao` (datetime).
    * `data_atualizacao` (datetime).
* **Lógica Front-end (Listagem):** Permitir filtros por `apenas_ativos`, `secao_id` e paginação (`skip`, `limit`)[cite: 1].

---
## Gerenciamento de Recursos 🧑‍💼 (Entidade `recurso`)

* **Rota Sugerida no Front-end:** `/recursos`
* **Endpoints da API:**
    * Listar: `GET /recursos/`[cite: 1].
    * Criar: `POST /recursos/`[cite: 1].
    * Obter por ID: `GET /recursos/{recurso_id}`[cite: 1].
    * Atualizar: `PUT /recursos/{recurso_id}`[cite: 1].
    * Excluir: `DELETE /recursos/{recurso_id}`[cite: 1].
* **Corpo da Requisição para Criar (Schema `RecursoCreateDTO` - campos conforme DB):**
    * `nome` (string, **obrigatório**).
    * `email` (string, formato email, **obrigatório**).
    * `equipe_principal_id` (integer, opcional) - *Dropdown populado por `GET /equipes/`*.
    * `matricula` (string, opcional).
    * `cargo` (string, opcional).
    * `jira_user_id` (string, opcional).
    * `data_admissao` (date, opcional, formato "YYYY-MM-DD").
    * `ativo` (boolean, **obrigatório** - *pois `NOT NULL` no DB, a API deve ter um default ou exigir*).
* **Corpo da Requisição para Atualizar (Schema `RecursoUpdateDTO` - campos conforme DB):**
    * Todos os campos acima são opcionais para atualização.
* **Resposta (Schema `RecursoDTO` - campos conforme DB):**
    * `id` (integer).
    * `nome` (string).
    * `email` (string).
    * `equipe_principal_id` (integer, opcional).
    * `matricula` (string, opcional).
    * `cargo` (string, opcional).
    * `jira_user_id` (string, opcional).
    * `data_admissao` (date, opcional).
    * `ativo` (boolean).
    * `data_criacao` (datetime).
    * `data_atualizacao` (datetime).
* **Lógica Front-end (Listagem):** Permitir filtros por `apenas_ativos`, `equipe_id` e paginação (`skip`, `limit`)[cite: 1].

---
## Gerenciamento de Status de Projetos (Entidade `status_projeto`)

* **Rota Sugerida no Front-end:** `/admin/status-projetos`
* **Endpoints da API:**
    * Listar: `GET /status-projetos/`[cite: 1].
    * Criar: `POST /status-projetos/`[cite: 1].
    * Obter por ID: `GET /status-projetos/{status_id}`[cite: 1].
    * Atualizar: `PUT /status-projetos/{status_id}`[cite: 1].
    * Excluir: `DELETE /status-projetos/{status_id}`[cite: 1].
* **Corpo da Requisição para Criar (Schema `StatusProjetoCreateDTO`):** [cite: 1]
    * `nome` (string, **obrigatório**).
    * `descricao` (string, opcional).
    * `is_final` (boolean, opcional, default: `false`).
    * `ordem_exibicao` (integer, opcional).
* **Resposta (Schema `StatusProjetoDTO`):** [cite: 1]
    * `id` (integer).
    * `nome` (string).
    * `descricao` (string, opcional).
    * `is_final` (boolean).
    * `ordem_exibicao` (integer, opcional).
    * `data_criacao` (datetime).
    * `data_atualizacao` (datetime).
* **Lógica Front-end (Listagem):** Permitir paginação (`skip`, `limit`)[cite: 1].

---
## Gerenciamento de Projetos 🏗️ (Entidade `projeto`)

* **Rota Sugerida no Front-end:** `/projetos`
* **Endpoints da API:**
    * Listar: `GET /projetos/`[cite: 1].
    * Criar: `POST /projetos/`[cite: 1].
    * Obter por ID: `GET /projetos/{projeto_id}`[cite: 1].
    * Atualizar: `PUT /projetos/{projeto_id}`[cite: 1].
    * Excluir: `DELETE /projetos/{projeto_id}`[cite: 1].
* **Corpo da Requisição para Criar (Schema `ProjetoCreateSchema` - campos conforme DB):**
    * `nome` (string, **obrigatório**).
    * `status_projeto_id` (integer, **obrigatório**) - *Dropdown populado por `GET /status-projetos/`*.
    * `ativo` (boolean, **obrigatório** - *pois `NOT NULL` no DB, a API deve ter um default ou exigir*).
    * `codigo_empresa` (string, opcional).
    * `descricao` (text, opcional).
    * `jira_project_key` (string, opcional).
    * `data_inicio_prevista` (date, opcional, formato "YYYY-MM-DD").
    * `data_fim_prevista` (date, opcional, formato "YYYY-MM-DD").
* **Resposta (Schema `ProjetoDTO` - campos conforme DB):**
    * `id` (integer).
    * `nome` (string).
    * `status_projeto_id` (integer).
    * `codigo_empresa` (string, opcional).
    * `descricao` (text, opcional).
    * `jira_project_key` (string, opcional).
    * `data_inicio_prevista` (date, opcional).
    * `data_fim_prevista` (date, opcional).
    * `ativo` (boolean).
    * `data_criacao` (datetime).
    * `data_atualizacao` (datetime).
* **Lógica Front-end (Listagem):** Permitir filtros por `status_projeto`, `apenas_ativos` e paginação (`skip`, `limit`)[cite: 1].

---
## Alocações de Recursos em Projetos 🔗 (Entidade `alocacao_recurso_projeto`)

* **Rota Sugerida no Front-end:** `/alocacoes` ou integrada.
* **Endpoints da API:**
    * Listar: `GET /alocacoes/`[cite: 1].
    * Criar: `POST /alocacoes/`[cite: 1].
    * Obter por ID: `GET /alocacoes/{alocacao_id}`[cite: 1].
    * Atualizar: `PUT /alocacoes/{alocacao_id}`[cite: 1].
    * Excluir: `DELETE /alocacoes/{alocacao_id}`[cite: 1].
* **Corpo da Requisição para Criar (campos conforme DB):**
    * `recurso_id` (integer, **obrigatório**) - *Dropdown populado por `GET /recursos/`*.
    * `projeto_id` (integer, **obrigatório**) - *Dropdown populado por `GET /projetos/`*.
    * `data_inicio_alocacao` (date, **obrigatório**, formato "YYYY-MM-DD").
    * `data_fim_alocacao` (date, opcional, formato "YYYY-MM-DD").
* **Resposta (campos conforme DB, mais nomes agregados se API fornecer):**
    * `id` (integer).
    * `recurso_id` (integer).
    * `projeto_id` (integer).
    * `data_inicio_alocacao` (date).
    * `data_fim_alocacao` (date, opcional).
    * `data_criacao` (datetime).
    * `data_atualizacao` (datetime).
    * `recurso_nome` (string, opcional).
    * `projeto_nome` (string, opcional).
* **Lógica Front-end (Listagem):** Permitir filtros por `recurso_id`, `projeto_id`, `data_inicio`, `data_fim`[cite: 1].

---
## Planejamento de Horas Mensal 🗓️ (Entidade `horas_planejadas_alocacao`)

* **Rota Sugerida no Front-end:** `/alocacoes/{alocacao_id}/planejamento` ou integrada.
* **Endpoints da API:**
    * Listar por Alocação: `GET /planejamento-horas/alocacao/{alocacao_id}`[cite: 1].
    * Listar por Recurso e Período: `GET /planejamento-horas/recurso/{recurso_id}`[cite: 1].
    * Criar/Atualizar: `POST /planejamento-horas/`[cite: 1].
    * Excluir: `DELETE /planejamento-horas/{planejamento_id}`[cite: 1].
* **Corpo da Requisição para Criar/Atualizar (Schema `PlanejamentoHorasCreate`):** [cite: 1]
    * `alocacao_id` (integer, **obrigatório**).
    * `ano` (integer, **obrigatório**).
    * `mes` (integer, **obrigatório**, 1-12).
    * `horas_planejadas` (number, float, **obrigatório**).
* **Resposta (Schema `PlanejamentoHorasResponse`):** [cite: 1]
    * `id` (integer).
    * `alocacao_id` (integer).
    * `projeto_id` (integer, readOnly).
    * `recurso_id` (integer, readOnly).
    * `ano` (integer).
    * `mes` (integer).
    * `horas_planejadas` (number, float).

---
## Apontamentos de Horas ⏱️ (Entidade `apontamento`)

* **Rota Sugerida no Front-end:** `/apontamentos` (listar), `/apontamentos/criar` (criar manualmente).
* **Endpoints da API:**
    * Listar: `GET /apontamentos/`[cite: 1].
    * Criar Manual: `POST /apontamentos/` (Schema `ApontamentoCreateSchema`)[cite: 1].
    * Obter por ID: `GET /apontamentos/{apontamento_id}`[cite: 1].
    * Atualizar Manual: `PUT /apontamentos/{apontamento_id}` (Schema `ApontamentoUpdateSchema`)[cite: 1].
    * Excluir Manual: `DELETE /apontamentos/{apontamento_id}`[cite: 1].
    * Agregações: `GET /apontamentos/agregacoes`[cite: 1].
* **Corpo da Requisição para Criar Manual (Schema `ApontamentoCreateSchema` - campos conforme DB):**
    * `recurso_id` (integer, **obrigatório**) - *Dropdown de recursos*.
    * `projeto_id` (integer, **obrigatório**) - *Dropdown de projetos*.
    * `data_apontamento` (date, **obrigatório**, formato "YYYY-MM-DD").
    * `horas_apontadas` (number, **obrigatório**, >0 e <=24).
    * `fonte_apontamento` (string, **obrigatório**, ENUM: "MANUAL", "JIRA" - *conforme seu ENUM*).
    * `jira_worklog_id` (string, opcional).
    * `jira_issue_key` (string, opcional, max 50).
    * `data_hora_inicio_trabalho` (datetime, opcional, formato "YYYY-MM-DDTHH:MM:SS").
    * `descricao` (text, opcional).
    * `id_usuario_admin_criador` (integer, opcional) - *API pode preencher com usuário logado.*
    * `data_sincronizacao_jira` (datetime, opcional).
* **Resposta (Schema `ApontamentoResponseSchema` - campos conforme DB):** [cite: 1]
    * Todos os campos da tabela `apontamento`.
* **Lógica Front-end (Listagem):** Permitir filtros avançados conforme `api_swagger.md` (ex: `recurso_id`, `projeto_id`, `data_inicio`, `data_fim`, `fonte_apontamento`, etc.) e paginação (`skip`, `limit`)[cite: 1].

---
## Capacidade RH / Horas Disponíveis por Recurso 📊 (Entidade `horas_disponiveis_rh`)

* **Rota Sugerida no Front-end:** `/capacidade-rh/horas-recurso` (baseado no menu e tela fornecida)
* **Objetivo:** Definir e consultar as horas disponíveis de um recurso para um determinado mês/ano.
* **Endpoints da API (Hipotéticos - Precisam ser definidos na API Swagger):**
    * Consultar: `GET /horas-disponiveis-rh/?recurso_id={id}&ano={ano}&mes={mes}`
    * Criar/Atualizar: `POST /horas-disponiveis-rh/` (ou PUT se for para um registro específico)
* **Dados para Envio (Front-end -> Back-end - Hipotético, campos conforme DB):**
    * `recurso_id` (integer, **obrigatório**).
    * `ano` (smallint, **obrigatório**).
    * `mes` (integer, **obrigatório**, 1-12).
    * `horas_disponiveis_mes` (numeric, **obrigatório**).
* **Lógica Front-end:**
    * Dropdowns para selecionar `Recurso`, `Ano` e `Mês`.
    * Ao selecionar, buscar dados via GET.
    * Permitir edição e salvar via POST/PUT.

---
## Relatórios 📈

* **Rota Sugerida no Front-end:** `/relatorios/*` (uma sub-rota para cada tipo de relatório)
* **Endpoints da API:**
    * `GET /relatorios/horas-apontadas`[cite: 1].
    * `GET /relatorios/comparativo-planejado-realizado`[cite: 1].
    * `GET /relatorios/horas-por-projeto`[cite: 1].
    * `GET /relatorios/horas-por-recurso`[cite: 1].
    * `GET /relatorios/planejado-vs-realizado`[cite: 1].
    * `GET /relatorios/disponibilidade-recursos`[cite: 1].
* **Lógica Front-end:**
    * Para cada relatório, apresentar os filtros de query relevantes (ex: `ano`, `mes`, `recurso_id`, etc.)[cite: 1].
    * Ao solicitar, fazer a chamada GET com os parâmetros.
    * Exibir os dados recebidos em tabelas ou gráficos.
* **Referência API Completa:** `api_swagger.md` (Seção "Relatórios").

---

**Nota Final:** Este guia consolidado visa ser a principal referência prática para o desenvolvimento front-end. Para detalhes exaustivos de cada endpoint, todos os possíveis códigos de erro, e a especificação técnica completa, a equipe de front-end deve sempre consultar a documentação oficial da API (`api_swagger.md` ou a versão mais atualizada disponível). É crucial que a documentação Swagger seja mantida em sincronia com o back-end.