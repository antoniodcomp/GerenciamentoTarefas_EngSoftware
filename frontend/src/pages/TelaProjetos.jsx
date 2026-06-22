import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects } from '../services/api';

function TelaProjetos() {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Executado ao carregar o componente para buscar a lista de projetos do backend
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await getProjects();
        setProjects(data);
        setError('');
      } catch (err) {
        console.error(err);
        setError('Não foi possível carregar os projetos. Verifique a conexão com o servidor.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Filtra projetos em tempo real (busca pelo nome ou descrição)
  const filteredProjects = projects.filter(project => {
    const term = searchTerm.toLowerCase();
    const matchesName = project.name.toLowerCase().includes(term);
    const matchesDesc = project.description ? project.description.toLowerCase().includes(term) : false;
    return matchesName || matchesDesc;
  });

  // Função para formatar a data no padrão brasileiro DD/MM/AAAA
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    // Ajusta o timezone local para evitar divergência de datas
    const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    return utcDate.toLocaleDateString('pt-BR');
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Meus Projetos</h1>
          <p style={styles.subtitle}>Gerencie e acompanhe o andamento de seus projetos colaborativos</p>
        </div>
        <button onClick={() => navigate('/projetos/novo')} style={styles.addButton}>
          + Novo Projeto
        </button>
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

      {loading && (
        <div style={styles.stateMessage}>Carregando projetos...</div>
      )}

      {error && (
        <div style={{ ...styles.stateMessage, ...styles.errorMessage }}>{error}</div>
      )}

      {!loading && !error && filteredProjects.length === 0 && (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>
            {searchTerm ? 'Nenhum projeto encontrado para a sua busca.' : 'Você ainda não possui projetos cadastrados.'}
          </p>
          {!searchTerm && (
            <button onClick={() => navigate('/projetos/novo')} style={styles.emptyButton}>
              Criar Primeiro Projeto
            </button>
          )}
        </div>
      )}

      {!loading && !error && filteredProjects.length > 0 && (
        <div style={styles.grid}>
          {filteredProjects.map((project) => (
            <div key={project.id} style={styles.card}>
              <div>
                <h3 style={styles.projectTitle}>{project.name}</h3>
                <p style={styles.projectDesc}>
                  {project.description || <i style={{ opacity: 0.6 }}>Sem descrição informada.</i>}
                </p>
              </div>
              <div style={styles.cardFooter}>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Prazo Final:</span>
                  <span style={styles.infoValue}>{formatDate(project.deadline)}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Criado em:</span>
                  <span style={styles.infoValue}>{formatDate(project.created_at)}</span>
                </div>
                <div style={styles.ownerBadge}>
                  Dono: Gestor
                </div>
              </div>
            </div>
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
  card: {
    backgroundColor: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '220px',
    boxShadow: 'var(--shadow)',
    boxSizing: 'border-box'
  },
  projectTitle: {
    margin: '0 0 10px 0',
    fontSize: '20px',
    fontWeight: '600',
    color: 'var(--text-h)'
  },
  projectDesc: {
    fontSize: '15px',
    lineHeight: '1.5',
    margin: '0 0 20px 0',
    color: 'var(--text)',
  },
  cardFooter: {
    borderTop: '1px solid var(--border)',
    paddingTop: '15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px'
  },
  infoLabel: {
    color: 'var(--text)'
  },
  infoValue: {
    fontWeight: '500',
    color: 'var(--text-h)'
  },
  ownerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'var(--accent-bg)',
    color: 'var(--accent)',
    fontSize: '12px',
    fontWeight: '500',
    padding: '4px 10px',
    borderRadius: '20px',
    marginTop: '5px'
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
