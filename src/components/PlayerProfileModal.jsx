import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PLAYER_ORIGIN,
  formatTransferFee,
  normalizePlayerProfile,
  transferProfitPct,
  getPlayerProfile,
} from '../utils/playerProfileUtils';

export default function PlayerProfileModal({
  player,
  career,
  onSave,
  onClose,
}) {
  const { t } = useTranslation();
  const existing = player ? getPlayerProfile(career, player.name) : null;

  const [age, setAge] = useState('');
  const [origin, setOrigin] = useState('');
  const [transferFee, setTransferFee] = useState('');
  const [saleFee, setSaleFee] = useState('');

  useEffect(() => {
    if (!player) return;
    const p = getPlayerProfile(career, player.name);
    setAge(p.age != null ? String(p.age) : '');
    setOrigin(p.origin || '');
    setTransferFee(p.transferFee != null ? String(p.transferFee) : '');
    setSaleFee(p.saleFee != null ? String(p.saleFee) : '');
  }, [player, career]);

  if (!player) return null;

  const preview = normalizePlayerProfile({
    age,
    origin: origin || null,
    transferFee,
    saleFee,
  });
  const pct = transferProfitPct(preview.transferFee, preview.saleFee);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave?.(player.name, preview);
    onClose?.();
  };

  return (
    <div className="modal-overlay visible" onClick={onClose}>
      <div className="modal player-profile-modal" onClick={(ev) => ev.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose}>✕</button>
        <div className="player-profile-icon">👤</div>
        <h2>{player.name}</h2>
        <p className="player-profile-sub">
          {player.pos} · {player.goals}⚽ {player.assists}🎯 · {player.matches} PJ
        </p>
        <p className="player-profile-hint">{t('playerProfile.hint')}</p>

        <form className="player-profile-form" onSubmit={handleSubmit}>
          <label>
            {t('playerProfile.age')}
            <input
              type="number"
              min={15}
              max={50}
              inputMode="numeric"
              placeholder="25"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </label>

          <fieldset className="player-profile-origin">
            <legend>{t('playerProfile.origin')}</legend>
            <label className={`origin-option${origin === PLAYER_ORIGIN.academy ? ' active' : ''}`}>
              <input
                type="radio"
                name="origin"
                checked={origin === PLAYER_ORIGIN.academy}
                onChange={() => setOrigin(PLAYER_ORIGIN.academy)}
              />
              🏫 {t('playerProfile.originAcademy')}
            </label>
            <label className={`origin-option${origin === PLAYER_ORIGIN.signing ? ' active' : ''}`}>
              <input
                type="radio"
                name="origin"
                checked={origin === PLAYER_ORIGIN.signing}
                onChange={() => setOrigin(PLAYER_ORIGIN.signing)}
              />
              💰 {t('playerProfile.originSigning')}
            </label>
            <label className={`origin-option${!origin ? ' active' : ''}`}>
              <input
                type="radio"
                name="origin"
                checked={!origin}
                onChange={() => setOrigin('')}
              />
              {t('playerProfile.originUnknown')}
            </label>
          </fieldset>

          <label>
            {t('playerProfile.transferFee')}
            <input
              type="number"
              min={0}
              step={100000}
              inputMode="numeric"
              placeholder="5000000"
              value={transferFee}
              onChange={(e) => setTransferFee(e.target.value)}
              disabled={origin === PLAYER_ORIGIN.academy}
            />
            <small>{t('playerProfile.feeHint')}</small>
          </label>

          <label>
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

          {(preview.transferFee != null || preview.saleFee != null) && (
            <div className="player-profile-preview">
              {formatTransferFee(preview.transferFee) && (
                <span>{t('playerProfile.bought')}: {formatTransferFee(preview.transferFee)}</span>
              )}
              {formatTransferFee(preview.saleFee) && (
                <span>{t('playerProfile.sold')}: {formatTransferFee(preview.saleFee)}</span>
              )}
              {pct != null && (
                <strong className={pct >= 0 ? 'profit' : 'loss'}>
                  {pct >= 0 ? '+' : ''}{pct}% {t('playerProfile.roi')}
                </strong>
              )}
            </div>
          )}

          <div className="modal-actions premium-modal-actions">
            <button type="submit" className="modal-btn-primary">
              {t('playerProfile.save')}
            </button>
            <button type="button" className="modal-btn-secondary" onClick={onClose}>
              {t('playerProfile.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
