import React from 'react';
import { useNavigate } from 'react-router-dom';

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  return utcDate.toLocaleDateString('pt-BR');
};

export default function ProjetoCard({ project }) {
  const navigate = useNavigate();

  return (
    <div 
      style={{ ...styles.card, cursor: 'pointer' }}
      onClick={() => navigate(`/projetos/${project.id}/dashboard`)}
      title="Clique para ver o dashboard deste projeto"
    >
      <div>
        <h3 style={styles.projectTitle}>{project.name}</h3>
        <p style={styles.projectDesc}>
          {project.description || <i style={{ opacity: 0.6 }}>Sem descrição informada.</i>}
        </p>
      </div>
      <div style={styles.cardFooter}>
        <div style={styles.dateRow}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={styles.calendarIcon}
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span style={styles.infoLabel}>Início:</span>
          <span style={styles.infoValue}>{formatDate(project.created_at)}</span>
        </div>
        <div style={styles.dateRow}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={styles.calendarIcon}
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span style={styles.infoLabel}>Fim:</span>
          <span style={styles.infoValue}>{formatDate(project.deadline)}</span>
        </div>
        <div style={styles.footerRow}>
          <div style={styles.membersIndicator} title={`${project.participantes?.length || 0} membros no projeto`}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{ marginRight: '6px', opacity: 0.8 }}
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>{project.participantes?.length || 0} membros</span>
          </div>
          <div style={styles.ownerBadge}>
            Dono: Gestor
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
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
    gap: '4px'
  },
  infoLabel: {
    color: 'var(--text)',
    marginRight: '6px'
  },
  infoValue: {
    fontWeight: '500',
    color: 'var(--text-h)'
  },
  ownerBadge: {
    backgroundColor: 'var(--accent-bg)',
    color: 'var(--accent)',
    fontSize: '12px',
    fontWeight: '500',
    padding: '4px 10px',
    borderRadius: '20px',
  },
  dateRow: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '13px',
    color: 'var(--text)',
  },
  calendarIcon: {
    marginRight: '8px',
    color: 'var(--text)',
    opacity: 0.6,
    flexShrink: 0
  },
  footerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '10px',
  },
  membersIndicator: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '13px',
    color: 'var(--text)',
    fontWeight: '500',
  },
};
