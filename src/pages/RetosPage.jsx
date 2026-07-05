import { useApp } from '../context/AppContext';
import CareerSelector from '../components/CareerSelector';
import EmptyCareerState from '../components/EmptyCareerState';
import ChallengeCard from '../components/ChallengeCard';
import { CHALLENGE_CATALOG } from '../data/challenges';
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

  return (
    <div className="page">
      <CareerSelector showDelete />

      <div className="retos-header">
        <h2><span className="green">Retos</span> de <span className="blue">Carrera</span></h2>
        <p>
          {career.name} — Activa reglas especiales para tu save y marca el progreso manualmente.
          {!isPro && ' Plan gratis: 1 reto activo.'}
        </p>
      </div>

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
            />
          );
        })}
      </div>
    </div>
  );
}
