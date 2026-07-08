import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjetos } from '../hooks/useProjetos';
import { usePerfil } from '../hooks/usePerfil';
import ProjetoCard from '../components/ProjetoCard';

function TelaProjetos() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const { data: projects = [], isPending: isLoading, isError } = useProjetos();

  const { data: usuario } = usePerfil();
  const tipoUsuario = usuario?.tipo_usuario || usuario?.tipo;
  const podeAdicionar = tipoUsuario === 'GESTOR' || tipoUsuario === 'ADMINISTRADOR';

  // Filtra projetos em tempo real (busca pelo nome ou descrição)
  const filteredProjects = projects.filter(project => {
    const term = searchTerm.toLowerCase();
    const matchesName = project.name.toLowerCase().includes(term);
    const matchesDesc = project.description ? project.description.toLowerCase().includes(term) : false;
    return matchesName || matchesDesc;
  });

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Meus Projetos</h1>
          <p style={styles.subtitle}>Gerencie e acompanhe o andamento de seus projetos colaborativos</p>
        </div>
        {podeAdicionar && (
          <button onClick={() => navigate('/projetos/novo')} style={styles.addButton}>
            + Novo Projeto
          </button>
        )}
      </header>

      <div style={styles.searchBarContainer}>
        <input
          type="text"
          placeholder="Pesquisar projetos pelo nome ou descrição..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {isLoading && (
        <div style={styles.stateMessage}>Carregando projetos...</div>
      )}

      {isError && (
        <div style={{ ...styles.stateMessage, ...styles.errorMessage }}>Não foi possível carregar os projetos. Verifique a conexão com o servidor.</div>
      )}

      {!isLoading && !isError && filteredProjects.length === 0 && (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>
            {searchTerm ? 'Nenhum projeto encontrado para a sua busca.' : 'Você ainda não possui projetos cadastrados.'}
          </p>
          {!searchTerm && podeAdicionar && (
            <button onClick={() => navigate('/projetos/novo')} style={styles.emptyButton}>
              Criar Primeiro Projeto
            </button>
          )}
        </div>
      )}

      {!isLoading && !isError && filteredProjects.length > 0 && (
        <div style={styles.grid}>
          {filteredProjects.map((project) => (
            <ProjetoCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '40px 20px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    textAlign: 'left',
    boxSizing: 'border-box'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '20px'
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '32px',
    fontWeight: '600',
    color: 'var(--text-h)'
  },
  subtitle: {
    fontSize: '16px',
    margin: 0,
    color: 'var(--text)'
  },
  addButton: {
    padding: '12px 24px',
    backgroundColor: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    boxShadow: 'var(--shadow)',
    transition: 'transform 0.2s ease',
  },
  searchBarContainer: {
    marginBottom: '30px'
  },
  searchInput: {
    width: '100%',
    padding: '14px 20px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    fontSize: '16px',
    backgroundColor: 'var(--bg)',
    color: 'var(--text-h)',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px'
  },


  stateMessage: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
    color: 'var(--text)'
  },
  errorMessage: {
    color: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'var(--code-bg)',
    borderRadius: '12px',
    border: '1px dashed var(--border)'
  },
  emptyText: {
    fontSize: '16px',
    marginBottom: '20px',
    color: 'var(--text)'
  },
  emptyButton: {
    padding: '10px 20px',
    backgroundColor: 'transparent',
    color: 'var(--accent)',
    border: '1px solid var(--accent)',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  }
};

export default TelaProjetos;
