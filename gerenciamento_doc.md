Guia para o Frontend: Gerenciamento de Dados (CRUDs) e Integração com Jira
Princípio Fundamental
Nosso sistema trabalha com duas fontes de dados: o Jira e a entrada manual direta no nosso aplicativo. O fluxo de dados que vem do Jira é sempre unidirecional:

Jira → Nosso App

Isso significa que o Jira é a "fonte da verdade" para os dados que ele gerencia. Nós sincronizamos e exibimos esses dados, mas nunca enviamos modificações de volta para o Jira. A interface do usuário (UI) deve ser construída sobre essa regra.

Comportamento da Interface por Tipo de Dado
| Entidade | Fonte do Dado | Comportamento da UI (CRUD) | | :--- | :--- | :--- | | Projetos (do Jira) | Sincronizado do Jira | Leitura Apenas (Read-Only): Campos como nome, descrição e status devem ser exibidos como não-editáveis. A UI deve indicar visualmente (ex: com um ícone do Jira) que o projeto é gerenciado externamente. Não deve haver botões de "Salvar" ou "Excluir" para estes projetos. | | Projetos (Internos) | Entrada Manual | CRUD Completo: A UI deve fornecer formulários e botões para Criar, Editar e Excluir projetos que são criados manualmente no nosso sistema. | | Apontamentos (do Jira) | Sincronizado do Jira | Leitura Apenas (Read-Only): As horas apontadas no Jira (worklogs) são a fonte da verdade. Devem ser exibidas na UI sem nenhuma opção de edição ou exclusão. | | Apontamentos (Internos) | Entrada Manual | CRUD Completo: Permitir que usuários (geralmente com permissão de gerente) criem, editem e excluam apontamentos manuais. Isso se aplica a projetos internos ou a atividades administrativas que não estão no Jira. | | Alocações & Planejamento de Horas | Entrada Manual | CRUD Completo: Estas são funcionalidades centrais e exclusivas do nosso app. A UI precisa de telas completas para criar, editar, listar e excluir alocações de recursos e o planejamento de suas horas. | | Seção, Equipe, Recurso | Entrada Manual | CRUD Completo: São os blocos de construção da nossa estrutura organizacional. A UI deve permitir o gerenciamento completo (criar, editar, listar, excluir) dessas entidades. | | Status do Projeto | Entrada Manual | CRUD Completo (Admin): Tela de configuração, provavelmente em uma área de administração, para gerenciar os status possíveis que um projeto interno pode ter (ex: "Em Planejamento", "Pausado"). |

Resumo Técnico para o Desenvolvedor Frontend
Regra de Ouro: Antes de renderizar um formulário de edição para um Projeto ou Apontamento, a UI deve verificar se o objeto de dados possui um identificador do Jira (ex: jira_id ou jira_key).
Se sim, renderize os campos principais como texto simples (não-editáveis).
Se não, renderize um formulário de edição normal com botões de salvar e excluir.
Endpoints da API: Os endpoints do backend para DELETE ou UPDATE de projetos/apontamentos que foram sincronizados do Jira provavelmente retornarão um erro de "ação não permitida". A UI deve prevenir que o usuário sequer tente realizar essas ações.
O foco principal do desenvolvimento de novas telas deve ser em criar uma experiência de CRUD rica e completa para as funcionalidades que são o nosso diferencial: Planejamento e Alocação de Recursos.