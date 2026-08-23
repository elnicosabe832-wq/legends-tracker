import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  formatTransferFee,
  getPlayerProfile,
  transferProfitPct,
} from '../utils/playerProfileUtils';

export default function RetireToHallModal({ player, career, onConfirm, onCancel }) {
  const { t } = useTranslation();
  const [saleFee, setSaleFee] = useState('');

  useEffect(() => {
    if (!player || !career) {
      setSaleFee('');
      return;
    }
    const profile = getPlayerProfile(career, player.name);
    setSaleFee(profile.saleFee != null ? String(profile.saleFee) : '');
  }, [player, career]);

  if (!player) return null;

  const profile = career ? getPlayerProfile(career, player.name) : null;
  const buy = profile?.transferFee;
  const pct = transferProfitPct(buy, saleFee === '' ? null : Number(saleFee));

  return (
    <div className="modal-overlay visible" onClick={onCancel}>
      <div className="modal retire-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onCancel}>✕</button>
        <div className="retire-modal-icon">👑</div>
        <h2>{t('playerProfile.retireTitle')}</h2>
        <p className="retire-modal-text">
          {t('playerProfile.retireText', { name: player.name })}
        </p>
        <p className="retire-modal-sub">
          {t('playerProfile.retireStats', {
            goals: player.goals,
            assists: player.assists,
            matches: player.matches,
          })}
        </p>

        <label className="retire-sale-field">
          {t('playerProfile.saleFee')}
          <input
            type="number"
            min={0}
            step={100000}
            inputMode="numeric"
            placeholder="8000000"
            value={saleFee}
            onChange={(e) => setSaleFee(e.target.value)}
          />
          <small>{t('playerProfile.saleHint')}</small>
        </label>

        {(buy != null || saleFee) && (
          <div className="player-profile-preview">
            {formatTransferFee(buy) && (
              <span>{t('playerProfile.bought')}: {formatTransferFee(buy)}</span>
            )}
            {formatTransferFee(saleFee === '' ? null : Number(saleFee)) && (
              <span>
                {t('playerProfile.sold')}: {formatTransferFee(Number(saleFee))}
              </span>
            )}
            {pct != null && (
              <strong className={pct >= 0 ? 'profit' : 'loss'}>
                {pct >= 0 ? '+' : ''}{pct}% {t('playerProfile.roi')}
              </strong>
            )}
          </div>
        )}

        <div className="modal-actions premium-modal-actions">
          <button
            type="button"
            className="modal-btn-primary"
            onClick={() => onConfirm(saleFee)}
          >
            {t('playerProfile.retireConfirm')}
          </button>
          <button type="button" className="modal-btn-secondary" onClick={onCancel}>
            {t('playerProfile.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
