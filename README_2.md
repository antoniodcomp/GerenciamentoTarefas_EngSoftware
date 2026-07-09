# Sistema de Gerenciamento de Tarefas

## Sobre o Projeto
Este é um sistema de gerenciamento de projetos e tarefas projetado para equipes de desenvolvimento e engenharia de software. A plataforma foca em produtividade, hierarquia de acesso, e uma interface moderna para acompanhamento de atividades diárias.

## Tecnologias Utilizadas

### Frontend
- React.js
- Vite (ferramenta de build e servidor de desenvolvimento local)
- Tailwind CSS (estilizacao)
- Lucide React (icones)
- React Router DOM (navegacao)
- React Query (gerenciamento de estados assincronos e cache)

### Backend
- Python
- Django
- Django REST Framework (DRF)
- Simple JWT (autenticacao baseada em tokens)
- drf-spectacular (documentacao da API via Swagger)

## Funcionalidades Principais
- Autenticacao e Autorizacao: Suporte a login seguro utilizando tokens JWT e controle baseado em papeis de acesso (Administrador, Gestor, Desenvolvedor/Comum).
- Gestao de Projetos: Criacao, edicao e exclusao de projetos (restrito a gestores e administradores). Listagem inteligente de projetos no menu lateral com base no nivel de permissao do usuario.
- Gestao de Tarefas e Subtarefas: Vinculo hierarquico. Modificacoes de status de tarefas pai propagam em cascata para concluir automaticamente suas respectivas subtarefas.
- Dashboards de Projetos: Telas completas e integradas para acompanhamento de status, percentual de conclusao e verificacao imediata de tarefas atrasadas.
- Interface Moderna: Design utilizando "Glassmorphism", totalmente responsivo e com componentes padronizados.

## Como Executar o Projeto Localmente

### Executando com Docker (Recomendado)

O projeto conta com um ambiente Docker configurado. Para iniciar toda a aplicacao (Frontend, Backend e Banco de Dados PostgreSQL) de forma automatizada:

1. Certifique-se de ter o **Docker** e o **Docker Compose** instalados em sua maquina.
2. Na raiz do projeto, execute o comando:
   ```bash
   docker compose up --build
   ```
3. Acesse as aplicacoes:
   - **Frontend:** http://localhost:5173
   - **Backend (API):** http://localhost:8000

---

### Executando Manualmente

Caso prefira rodar sem o Docker, siga os passos abaixo.

#### Pre-requisitos
- Python 3.10 ou superior
- Node.js 18 ou superior

#### Configurando o Backend
1. Navegue ate a pasta do backend:
   cd backend
2. Crie um ambiente virtual (venv):
   python -m venv venv
3. Ative o ambiente virtual:
   - Linux/Mac: source venv/bin/activate
   - Windows: venv\Scripts\activate
4. Instale as dependencias necessarias:
   pip install -r requirements.txt
5. Aplique as migracoes do banco de dados (se for a primeira vez):
   python manage.py migrate
6. Inicie o servidor de desenvolvimento:
   python manage.py runserver

O backend estara acessivel em http://localhost:8000/

### Configurando o Frontend
1. Em um novo terminal, navegue ate a pasta do frontend:
   cd frontend
2. Instale as dependencias via NPM:
   npm install
3. Inicie o servidor de desenvolvimento Vite:
   npm run dev

O frontend estara acessivel na porta padrao (normalmente http://localhost:5173/).

## Testes Automatizados
O projeto conta com suites de testes unitarios (APITestCase do Django) que validam as regras de negocio principais, incluindo a criacao, permissao de edicao, e a conclusao de tarefas em cascata.

Para executar os testes, assegure-se de que o ambiente virtual esteja ativo na raiz da pasta backend e execute:
python manage.py test boards
