# Automação PMO - Frontend

Este projeto é a interface de frontend para o sistema de Automação do PMO, desenvolvida para fornecer dashboards, relatórios e ferramentas de gerenciamento para equipes e gestores.

## ✨ Funcionalidades Principais

- **Dashboard de Gestor (`/visao-gestor`):** Visualização de capacidade vs. alocação de recursos, com filtros por seção, equipe, recurso e período.
- **Dashboard de Departamento (`/indicadores-departamento`):** KPIs sobre projetos e equipes a nível de departamento.
- **Relatórios (`/relatorios`):** Geração de relatórios como "Planejado vs. Realizado".
- **Gerenciamento de Alocações:** Modais para criar, editar e visualizar alocações de recursos em projetos.
- **Integração com JIRA:** Sincronização de dados de projetos e apontamentos.
- **Autenticação Segura:** Login via Keycloak, gerenciado pelo NextAuth.js.

## 🚀 Stack Tecnológica

- **Framework:** [Next.js](https://nextjs.org/) (React)
- **UI Components:** [Material-UI (MUI)](https://mui.com/)
- **Gráficos:** [ECharts for React](https://echarts.apache.org/)
- **Autenticação:** [NextAuth.js](https://next-auth.js.org/)
- **HTTP Client:** [Axios](https://axios-http.com/) (encapsulado em `services/api.js`)

## ⚙️ Configuração do Ambiente de Desenvolvimento

Siga os passos abaixo para configurar o ambiente local.

### 1. Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [npm](https://www.npmjs.com/)

### 2. Instalação de Dependências

Clone o repositório e instale as dependências:

```bash
npm install
```

### 3. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto. Este arquivo **não** deve ser versionado. Adicione as seguintes variáveis:

| Variável | Descrição | Exemplo |
| :--- | :--- | :--- |
| `AUTH_KEYCLOAK_ID` | Client ID da aplicação no Keycloak. | `automacao-pmo-frontend` |
| `AUTH_KEYCLOAK_SECRET` | Client Secret da aplicação no Keycloak. | `seu-client-secret-aqui` |
| `AUTH_SECRET` | Chave secreta para encriptação da sessão do NextAuth. Gere uma com `openssl rand -base64 32`. | `chave-aleatoria-gerada` |
| `AUTH_KEYCLOAK_ISSUER` | URL base do provedor Keycloak. | `https://auth-qa.weg.net/realms/weg` |
| `NEXT_PUBLIC_API_URL` | URL do backend que o frontend irá consumir. | `http://localhost:8000` |

### 4. Rodando o Servidor

Com as dependências e variáveis de ambiente configuradas, inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador para ver a aplicação.

## 📂 Estrutura de Pastas

- **/app:** Contém as rotas e páginas da aplicação, seguindo o App Router do Next.js.
- **/components:** Componentes React reutilizáveis (ex: gráficos, modais, tabelas).
- **/lib:** Funções utilitárias e configurações globais (ex: `api.js` para configuração do Axios).
- **/public:** Arquivos estáticos, como imagens e fontes.
- **/services:** Funções que encapsulam as chamadas à API backend.
- **/k8s:** Arquivos de configuração para deploy em Kubernetes (ConfigMap, Deployment).

## 📜 Scripts Disponíveis

- `npm run dev`: Inicia o servidor em modo de desenvolvimento.
- `npm run build`: Compila a aplicação para produção.
- `npm run start`: Inicia um servidor de produção após o `build`.
- `npm run lint`: Executa o linter para análise de código.

## 🌐 Deploy

O deploy é automatizado via GitLab CI/CD, utilizando o arquivo `.gitlab-ci.yml`.

O processo consiste em:
1.  **Build:** Construção da imagem Docker a partir do `Dockerfile`.
2.  **Push:** Envio da imagem para o registro de contêineres.
3.  **Deploy:** Aplicação dos manifestos Kubernetes (`k8s/`) no cluster, que criam/atualizam o `Deployment` e o `Service`, injetando as variáveis de ambiente a partir do `ConfigMap`.

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.