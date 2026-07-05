import { useApp } from '../context/AppContext';
import CareerSelector from '../components/CareerSelector';
import EmptyCareerState from '../components/EmptyCareerState';
import ChallengeCard from '../components/ChallengeCard';
import { CHALLENGE_CATALOG, getChallengeById } from '../data/challenges';
import { usePageMeta } from '../hooks/usePageMeta';

export default function RetosPage() {
  usePageMeta({
    title: 'Retos',
    description: 'Retos de Modo Carrera para tu save — cantera, fichajes, ascensos y más.',
    path: '/retos',
  });

  const {
    hasCareer,
    career,
    activeCareer,
    isPro,
    setShowPremiumModal,
    activateChallenge,
    deactivateChallenge,
    incrementChallengeProgress,
    updateChallengeProgress,
    canActivateMoreChallenges,
  } = useApp();

  if (!hasCareer) {
    return (
      <div className="page">
        <CareerSelector />
        <EmptyCareerState
          title="Sin carrera activa"
          description="Crea un Modo Carrera para activar retos y llevar el control de tus reglas especiales."
        />
      </div>
    );
  }

  const activeList = career.challenges?.active || [];
  const activeIds = new Set(activeList.map((a) => a.challengeId));
  const completedCount = activeList.filter((a) => a.status === 'completed').length;

  return (
    <div className="page">
      <CareerSelector showDelete />

      <div className="retos-header">
        <h2><span className="green">Retos</span> de <span className="blue">Carrera</span></h2>
        <p>
          {career.name} — Activa reglas especiales y marca el progreso a mano tras cada temporada.
          {!isPro && ' Plan gratis: 1 reto activo.'}
        </p>
      </div>

      {activeList.length > 0 && (
        <div className="retos-active-summary">
          <strong>{activeList.length} reto{activeList.length !== 1 ? 's' : ''} activo{activeList.length !== 1 ? 's' : ''}</strong>
          {completedCount > 0 && (
            <span> · {completedCount} cumplido{completedCount !== 1 ? 's' : ''}</span>
          )}
        </div>
      )}

      <div className="challenges-grid">
        {CHALLENGE_CATALOG.map((ch) => {
          const entry = activeList.find((a) => a.challengeId === ch.id);
          const isActive = activeIds.has(ch.id);
          const locked = ch.proOnly && !isPro;
          const canActivate = canActivateMoreChallenges || isActive;

          return (
            <ChallengeCard
              key={ch.id}
              challenge={ch}
              activeEntry={entry}
              isActive={isActive}
              canActivate={canActivate}
              locked={locked}
              onUnlock={() => setShowPremiumModal(true)}
              onActivate={() => activateChallenge(activeCareer, ch.id)}
              onDeactivate={() => deactivateChallenge(activeCareer, ch.id)}
              onIncrement={(delta) => incrementChallengeProgress(activeCareer, ch.id, delta)}
              onComplete={() => {
                const c = getChallengeById(ch.id);
                if (c) updateChallengeProgress(activeCareer, ch.id, c.maxProgress);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
