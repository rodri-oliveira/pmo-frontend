# Guia de Integração Front-end com API PMO

Este guia descreve como as telas do front-end podem interagir com os endpoints da API do Sistema de Gestão de Projetos PMO, com foco nos campos de dados e requisitos. A **URL Base** da API é `/backend/v1`.

## Autenticação 🔑

* **Tela de Login:**
    * **Rota Sugerida:** `/login`
    * **Objetivo:** Autenticar o usuário no sistema.
    * **Endpoint da API:** `POST /token`
    * **Dados para Enviar (Front-end -> Back-end):**
        * `username` (string, **obrigatório**)
        * `password` (string, **obrigatório**)
    * **Dados a Receber (Back-end -> Front-end em caso de sucesso):**
        * `access_token` (string)
        * `token_type` (string, ex: "bearer")
    * **Lógica Front-end:**
        * Coletar `username` e `password`.
        * Enviar para `POST /token`.
        * Em caso de sucesso (200 OK), armazenar o `access_token` de forma segura (ex: LocalStorage, Vuex, Redux state) e incluí-lo nos cabeçalhos das requisições subsequentes como `Authorization: Bearer <access_token>`.
        * Em caso de falha (401 Unauthorized), exibir mensagem de erro apropriada.

---
## Gerenciamento de Recursos 🧑‍💼 (Entidade `recurso`)

* **Tela de Listagem/Cadastro de Recursos:**
    * **Rota Sugerida:** `/recursos`
    * **Objetivo:** Listar, criar e (potencialmente) editar/visualizar recursos.
    * **Endpoints da API:**
        * Listar: `GET /recursos/`
        * Criar: `POST /recursos/`
        * Obter por ID: `GET /recursos/{recurso_id}` (para visualizar/editar)
        * Atualizar: `PUT /recursos/{recurso_id}` (para salvar edições)
    * **Dados para Criar Novo Recurso (Front-end -> Back-end via `POST /recursos/`):**
        * `nome` (string, **obrigatório**)
        * `email` (string, **obrigatório**)
        * `equipe_id` (integer, **obrigatório**) - *Front-end deve permitir selecionar de uma lista de equipes (`GET /equipes/`)*.
        * `horas_diarias` (number, **obrigatório**)
        * `jira_account_id` (string, opcional)
        * `ativo` (boolean, opcional, default: `true`)
        * *(Outros campos do modelo `Recurso` da API podem ser incluídos conforme necessidade, como `usuario_id`, `custo_hora`)*
    * **Lógica Front-end (Criação/Edição):**
        * Formulário com os campos acima.
        * Validação dos campos obrigatórios.
        * Dropdown para `equipe_id` populado via `GET /equipes/`.
        * Ao submeter, enviar para `POST /recursos/` (criar) ou `PUT /recursos/{recurso_id}` (atualizar).
    * **Lógica Front-end (Listagem):**
        * Chamar `GET /recursos/`.
        * Exibir a lista de recursos em uma tabela/cards.
        * Permitir filtros (ex: por `nome`, `equipe_id`, `ativo`) conforme os parâmetros da API.
    * **Campos a Exibir na Listagem (exemplos):** `nome`, `email`, `equipe_nome` (se a API retornar), `ativo`.

---
## Gerenciamento de Projetos 🏗️ (Entidade `projeto`)

* **Tela de Listagem/Cadastro de Projetos:**
    * **Rota Sugerida:** `/projetos`
    * **Objetivo:** Listar, criar e (potencialmente) editar/visualizar projetos.
    * **Endpoints da API:**
        * Listar: `GET /projetos/`
        * Criar: `POST /projetos/`
        * Obter por ID: `GET /projetos/{projeto_id}`
        * Atualizar: `PUT /projetos/{projeto_id}`
    * **Dados para Criar/Atualizar Projeto (Front-end -> Back-end via `POST` ou `PUT`):**
        * `nome` (string, **obrigatório** para criar, opcional para atualizar)
        * `status_projeto_id` (integer, **obrigatório** para criar, opcional para atualizar) - *Dropdown populado por `GET /status-projetos/`*.
        * `jira_project_key` (string, opcional)
        * `codigo_empresa` (string, opcional)
        * `descricao` (string, opcional)
        * `data_inicio` (date, "YYYY-MM-DD", opcional)
        * `data_fim` (date, "YYYY-MM-DD", opcional)
        * *(Outros campos do modelo `Projeto` da API, como `ativo`, `orcamento_total`, etc., podem ser incluídos)*
    * **Lógica Front-end (Criação/Edição):**
        * Formulário com os campos acima.
        * Dropdown para `status_projeto_id` populado via `GET /status-projetos/`.
        * Calendários para seleção de datas.
    * **Lógica Front-end (Listagem):**
        * Chamar `GET /projetos/`.
        * Exibir lista. Permitir filtros por `nome`, `status_projeto`, `ativo`.
    * **Campos a Exibir na Listagem (exemplos):** `nome`, `status_projeto_nome` (se a API retornar), `data_inicio`, `data_fim`, `ativo`.

---
## Alocações de Recursos em Projetos 🔗 (Entidade `alocacao_recurso_projeto`)

* **Tela de Gerenciamento de Alocações:**
    * **Rota Sugerida:** `/alocacoes` (geral) ou `/projetos/{projeto_id}/alocacoes` (específico do projeto) ou `/recursos/{recurso_id}/alocacoes` (específico do recurso).
    * **Objetivo:** Alocar recursos a projetos, definir o período e o esforço.
    * **Endpoints da API:**
        * Listar: `GET /alocacoes/` (pode ser filtrado por `recurso_id`, `projeto_id`, etc.)
        * Criar: `POST /alocacoes/`
        * Obter por ID: `GET /alocacoes/{alocacao_id}`
        * Atualizar: `PUT /alocacoes/{alocacao_id}`
    * **Dados para Criar/Atualizar Alocação (Front-end -> Back-end via `POST` ou `PUT`):**
        * `recurso_id` (integer, **obrigatório** para criar) - *Dropdown populado por `GET /recursos/`*.
        * `projeto_id` (integer, **obrigatório** para criar) - *Dropdown populado por `GET /projetos/`*.
        * `data_inicio` (date, "YYYY-MM-DD", **obrigatório** para criar)
        * `data_fim` (date, "YYYY-MM-DD", **obrigatório** para criar)
        * `percentual_alocacao` (number, **obrigatório** para criar)
        * `horas_alocadas` (number, **obrigatório** para criar)
    * **Lógica Front-end:**
        * Formulário com seleção de recurso, projeto e os campos de data e esforço.
        * Validações para garantir que `data_fim` seja posterior a `data_inicio`.
    * **Campos a Exibir na Listagem (exemplos):** `recurso_nome`, `projeto_nome` (se a API retornar), `data_inicio`, `data_fim`, `percentual_alocacao`.

---
## Planejamento de Horas Mensal 🗓️ (Entidade `horas_planejadas_alocacao`)

* **Tela de Planejamento de Horas:** (Esta tela seria idealmente acessada no contexto de uma *Alocação específica*).
    * **Rota Sugerida:** `/alocacoes/{alocacao_id}/planejamento-horas`
    * **Objetivo:** Detalhar ou visualizar, para uma alocação existente, quantas horas são planejadas por mês.
    * **Endpoints da API:**
        * Listar: `GET /planejamento-horas/?alocacao_id={alocacao_id}`
        * *(A API Swagger não detalha `POST`/`PUT` para `planejamento-horas`. Assumindo que o back-end oferece um endpoint para criar/atualizar esses planejamentos, por exemplo, `POST /planejamento-horas/` ou `PUT /planejamento-horas/{planejamento_id}`)*.
    * **Dados para Criar/Atualizar Planejamento (Front-end -> Back-end - hipotético):**
        * `alocacao_id` (integer, **obrigatório**)
        * `ano` (integer, **obrigatório**)
        * `mes` (integer, **obrigatório**)
        * `horas_planejadas` (number, **obrigatório**)
    * **Lógica Front-end (Visualização/Edição):**
        * Ao visualizar uma alocação, esta tela/componente seria carregada.
        * Chamar `GET /planejamento-horas/` filtrando por `alocacao_id`.
        * Exibir uma grade/lista com `ano`, `mes` e `horas_planejadas`.
        * Permitir adicionar novos planejamentos mensais ou editar existentes (ex: uma tabela onde cada linha é um mês/ano e as horas podem ser inseridas/editadas). A submissão de cada linha/novo item chamaria o endpoint `POST` ou `PUT` apropriado.

---
## Apontamentos de Horas ⏱️ (Entidade `apontamento`)

Conforme o menu lateral (`image_c85c02.png`): "Consultar/Gerenciar" e "Criar Apontamento Manual".

* **Tela de Consulta/Gerenciamento de Apontamentos:**
    * **Rota Sugerida:** `/apontamentos` ou `/apontamentos/consulta`
    * **Objetivo:** Listar e filtrar apontamentos de horas.
    * **Endpoint da API:** `GET /apontamentos/`
    * **Lógica Front-end:**
        * Permitir filtros por `recurso_id`, `projeto_id`, `data_inicio`, `data_fim`.
        * Exibir os resultados em uma tabela.
        * **Campos a Exibir (exemplos, baseados no modelo `Apontamento` da API):** `recurso_nome` (ou ID), `projeto_nome` (ou ID), `data_apontamento`, `horas_apontadas`, `descricao`, `jira_issue_key`.

* **Tela de Criação Manual de Apontamento:**
    * **Rota Sugerida:** `/apontamentos/criar`
    * **Objetivo:** Permitir que um usuário crie um apontamento manualmente.
    * **Endpoint da API:** `POST /apontamentos/` (Assumindo que este endpoint existe, conforme modelo `Apontamento` da API e necessidade).
    * **Dados para Criar Novo Apontamento Manual (Front-end -> Back-end):**
        * `recurso_id` (integer, **obrigatório**) - *Dropdown populado por `GET /recursos/`*.
        * `projeto_id` (integer, **obrigatório**) - *Dropdown populado por `GET /projetos/`*.
        * `alocacao_id` (integer, opcional mas recomendado) - *Dropdown de alocações do recurso no projeto*.
        * `data` (date, "YYYY-MM-DD", **obrigatório** - referente a `data_apontamento` da tabela)
        * `horas_apontadas` (number, **obrigatório**)
        * `jira_issue_key` (string, opcional)
        * `descricao` (string, opcional)
        * `fonte_apontamento` (string, ENUM, ex: 'MANUAL', **obrigatório**)
    * **Lógica Front-end:**
        * Formulário para preenchimento dos dados.
        * Ao selecionar Recurso e Projeto, o dropdown de `alocacao_id` poderia ser filtrado para mostrar apenas alocações ativas daquele recurso naquele projeto.

---
## Capacidade RH / Horas Disponíveis por Recurso 📊 (Entidade `horas_disponiveis_rh`)

Baseado na tela `image_c8549b.png` e no menu lateral.

* **Tela de Gerenciamento de Horas Disponíveis:**
    * **Rota Sugerida:** `/capacidade-rh/horas-recurso` (ou similar, como no seu exemplo de URL).
    * **Objetivo:** Definir e consultar as horas disponíveis de um recurso para um determinado mês/ano.
    * **Endpoints da API:** *(A API Swagger não detalha explicitamente endpoints para `horas_disponiveis_rh`. Seriam necessários `GET` para consultar e `POST`/`PUT` para definir/atualizar. Ex: `GET /recursos/{recurso_id}/horas-disponiveis?ano=AAAA&mes=MM` e `POST /recursos/{recurso_id}/horas-disponiveis`)*.
    * **Dados para Definir/Atualizar Horas Disponíveis (Front-end -> Back-end - hipotético):**
        * `recurso_id` (integer, **obrigatório**) - *Selecionado no dropdown "Pesquisar recurso"*.
        * `ano` (integer, **obrigatório**) - *Selecionado no dropdown "Ano"*.
        * `mes` (integer, **obrigatório**) - *Selecionado no dropdown "Mês"*.
        * `horas_disponiveis_mes` (number, **obrigatório**) - *Campo para inserir/atualizar horas*.
    * **Lógica Front-end:**
        * Dropdowns para selecionar `Recurso`, `Ano` e `Mês` conforme a imagem.
        * Ao selecionar os três filtros, fazer uma chamada `GET` (hipotética) para buscar as `horas_disponiveis_mes` atuais para esses parâmetros e exibir no campo apropriado.
        * Permitir a edição do valor e, ao clicar em um botão "Salvar" ou "Atualizar", enviar os dados para o endpoint `POST` ou `PUT` correspondente.

---
## Telas de Apoio (Dropdowns) 🗂️

* **Equipes:**
    * **Endpoint:** `GET /equipes/`
    * **Uso no Front-end:** Popular dropdowns de seleção de equipe (ex: no cadastro de Recursos).
    * **Campos para Dropdown:** `id`, `nome`.
* **Seções:**
    * **Endpoint:** `GET /secoes/`
    * **Uso no Front-end:** Popular dropdowns (ex: no cadastro de Equipes, se houver um CRUD dedicado para Equipes).
    * **Campos para Dropdown:** `id`, `nome`.
* **Status de Projetos:**
    * **Endpoint:** `GET /status-projetos/`
    * **Uso no Front-end:** Popular dropdowns na criação/edição de Projetos.
    * **Campos para Dropdown:** `id`, `nome`.

---
## Relatórios 📈

* **Tela de Relatório de Alocação:**
    * **Rota Sugerida:** `/relatorios/alocacao`
    * **Endpoint da API:** `GET /relatorios/alocacao`
    * **Lógica Front-end (Campos para o usuário preencher/selecionar):**
        * `ano` (select/input, **obrigatório**)
        * `mes` (select/input, opcional)
        * `formato` (select: 'pdf', 'excel', 'csv', opcional)
    * **Interação:** Ao solicitar o relatório, fazer a chamada GET ao endpoint com os parâmetros selecionados. O back-end deve retornar o arquivo ou um link para download.

---

Este documento Markdown deve servir como um bom ponto de partida. Ele pode ser expandido com mais detalhes sobre validações específicas do front-end, estados de tela (loading, erro), e fluxos de usuário mais complexos conforme o desenvolvimento avança.