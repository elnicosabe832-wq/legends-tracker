import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';

export default function CreateCareerModal() {
  const { t } = useTranslation();
  const { showCreateModal, setShowCreateModal, createCareer } = useApp();
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');

  if (!showCreateModal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    createCareer(name, subtitle);
    setName('');
    setSubtitle('');
  };

  return (
    <div className="modal-overlay visible" onClick={() => setShowCreateModal(false)}>
      <div className="modal create-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setShowCreateModal(false)}>✕</button>
        <div className="crown">⚽</div>
        <h2>{t('career.modalTitle')}</h2>
        <p>{t('career.modalDesc')}</p>

        <form onSubmit={handleSubmit} className="create-form">
          <label>
            {t('career.teamName')}
            <input
              type="text"
              placeholder={t('career.teamPlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </label>
          <label>
            {t('career.subtitle')}
            <input
              type="text"
              placeholder={t('career.subtitlePlaceholder')}
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </label>
          <button type="submit" className="modal-btn-primary" disabled={!name.trim()}>
            {t('career.create')}
          </button>
        </form>
      </div>
    </div>
  );
}
