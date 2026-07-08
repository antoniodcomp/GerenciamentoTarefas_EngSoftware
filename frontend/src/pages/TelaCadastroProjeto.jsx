import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateProjeto } from '../hooks/useProjetos';

function TelaCadastroProjeto() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();

  const createProjetoMutation = useCreateProjeto();
  const loading = createProjetoMutation.isPending;
  const error = formError;

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validações básicas no frontend
    if (!name.trim()) {
      setFormError('O nome do projeto é obrigatório.');
      return;
    }
    if (!deadline) {
      setFormError('O prazo final do projeto é obrigatório.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (deadline < todayStr) {
      setFormError('O prazo final não pode ser uma data no passado.');
      return;
    }

    setFormError('');

    const projectData = {
      name: name.trim(),
      description: description.trim() || null,
      deadline,
    };

    // Dispara a mutation para criar o projeto
    createProjetoMutation.mutate(projectData, {
      onSuccess: () => {
        // Redireciona de volta para a listagem
        navigate('/projetos');
      },
      onError: (err) => {
        console.error(err);
        
        // Exibe erros estruturados vindos do Django REST Framework
        if (err.response && err.response.data) {
          const backendErrors = err.response.data;
          if (typeof backendErrors === 'object') {
            const messages = Object.entries(backendErrors)
              .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(' ') : msgs}`)
              .join(' | ');
            setFormError(messages || 'Erro ao cadastrar o projeto. Verifique os dados.');
          } else {
            setFormError('Ocorreu um erro no servidor. Tente novamente mais tarde.');
          }
        } else {
          setFormError('Não foi possível conectar ao servidor. Tente novamente.');
        }
      }
    });
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Novo Projeto</h1>
        <button onClick={() => navigate('/projetos')} style={styles.backButton}>
          Voltar
        </button>
      </header>

      <div style={styles.formCard}>
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && (
            <div style={styles.errorMessage}>
              {error}
            </div>
          )}

          <div style={styles.formGroup}>
            <label htmlFor="name" style={styles.label}>Nome do Projeto *</label>
            <input
              type="text"
              id="name"
              placeholder="Digite o nome do projeto..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="description" style={styles.label}>Descrição (Opcional)</label>
            <textarea
              id="description"
              placeholder="Descreva os objetivos, equipe envolvida ou detalhes do projeto..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              style={styles.textarea}
              rows="5"
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="deadline" style={styles.label}>Prazo Final *</label>
            <input
              type="date"
              id="deadline"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              disabled={loading}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.buttonContainer}>
            <button
              type="button"
              onClick={() => navigate('/projetos')}
              disabled={loading}
              style={styles.cancelButton}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={styles.submitButton}
            >
              {loading ? 'Salvando...' : 'Salvar Projeto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '40px 20px',
    maxWidth: '700px',
    margin: '0 auto',
    width: '100%',
    textAlign: 'left',
    boxSizing: 'border-box'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px'
  },
  title: {
    margin: 0,
    fontSize: '32px',
    fontWeight: '600',
    color: 'var(--text-h)'
  },
  backButton: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: 'var(--text)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  formCard: {
    backgroundColor: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: 'var(--shadow)'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-h)'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    fontSize: '16px',
    backgroundColor: 'var(--bg)',
    color: 'var(--text-h)',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease'
  },
  textarea: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    fontSize: '16px',
    backgroundColor: 'var(--bg)',
    color: 'var(--text-h)',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    resize: 'vertical',
    transition: 'border-color 0.2s ease'
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '10px'
  },
  cancelButton: {
    padding: '12px 24px',
    backgroundColor: 'transparent',
    color: 'var(--text)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  submitButton: {
    padding: '12px 24px',
    backgroundColor: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    boxShadow: 'var(--shadow)',
    transition: 'all 0.2s ease'
  },
  errorMessage: {
    color: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    padding: '16px',
    fontSize: '14px'
  }
};

export default TelaCadastroProjeto;
