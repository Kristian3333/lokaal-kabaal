'use client';

/**
 * OnboardingChecklist -- compact 4-step progress widget shown on the
 * dashboard until the retailer has activated the product end-to-end.
 * Hidden once all four steps are complete.
 */

import { useState } from 'react';

export interface OnboardingState {
  /** Retailer has at least one flyer saved with bedrijfsnaam */
  flyerReady: boolean;
  /** Retailer set a winkelpincode so shop staff can register conversions */
  pincodeSet: boolean;
  /** Retailer has at least one campaign (any status) */
  campaignCreated: boolean;
  /** Retailer has at least one scanned/converted code */
  firstScan: boolean;
}

interface OnboardingChecklistProps {
  state: OnboardingState;
  /** Navigate to the flyer editor page */
  onGoToFlyer: () => void;
  /** Navigate to settings (pincode section) */
  onGoToSettings: () => void;
  /** Start the new-campaign wizard */
  onStartCampaign: () => void;
}

interface Step {
  done: boolean;
  label: string;
  hint: string;
  cta: string;
  onClick: () => void;
}

export default function OnboardingChecklist({
  state,
  onGoToFlyer,
  onGoToSettings,
  onStartCampaign,
}: OnboardingChecklistProps): React.JSX.Element | null {
  const [dismissed, setDismissed] = useState(false);

  const steps: Step[] = [
    {
      done: state.flyerReady,
      label: 'Ontwerp je eerste flyer',
      hint: 'Vul bedrijfsnaam + logo in, kies een design.',
      cta: 'Naar flyer editor',
      onClick: onGoToFlyer,
    },
    {
      done: state.pincodeSet,
      label: 'Stel je winkelpincode in',
      hint: 'Shop-medewerkers gebruiken deze om conversies te registreren.',
      cta: 'Pincode instellen',
      onClick: onGoToSettings,
    },
    {
      done: state.campaignCreated,
      label: 'Start je eerste campagne',
      hint: 'Kies postcodes, werkgebied en bezorgmaand.',
      cta: 'Nieuwe campagne',
      onClick: onStartCampaign,
    },
    {
      done: state.firstScan,
      label: 'Ontvang je eerste QR-scan',
      hint: 'Zodra de eerste bewoner scant, verschijnt de conversie hier.',
      cta: '',
      onClick: () => { /* wait for flyer delivery */ },
    },
  ];

  const completedCount = steps.filter(s => s.done).length;
  const allDone = completedCount === steps.length;

  if (allDone || dismissed) return null;

  const activeStep = steps.find(s => !s.done);
  const progressPct = Math.round((completedCount / steps.length) * 100);

  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--green-bg) 0%, var(--paper) 100%)',
      border: '1px solid rgba(0,232,122,0.35)',
      borderRadius: 'var(--radius)',
      padding: '20px 24px',
      marginBottom: '20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '3px' }}>
            Aan de slag
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--ink)' }}>
            {completedCount}/{steps.length} stappen afgerond
          </div>
        </div>
        <button
          type="button"
          aria-label="Verberg onboarding checklist"
          onClick={() => setDismissed(true)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--muted)', fontSize: '11px', fontFamily: 'var(--font-mono)',
          }}
        >
          Verberg
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ height: '4px', background: 'rgba(0,0,0,0.06)', borderRadius: '2px', overflow: 'hidden', marginBottom: '16px' }}>
        <div style={{
          height: '100%',
          width: `${progressPct}%`,
          background: 'var(--green)',
          transition: 'width 0.3s ease',
        }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {steps.map((step, i) => {
          const isActive = step === activeStep;
          return (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: isActive ? '10px 12px' : '8px 12px',
                background: isActive ? 'var(--white)' : 'transparent',
                border: isActive ? '1px solid var(--line)' : '1px solid transparent',
                borderRadius: 'var(--radius)',
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                  background: step.done ? 'var(--green)' : 'rgba(0,0,0,0.08)',
                  color: step.done ? 'var(--ink)' : 'var(--muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: 800,
                }}
              >
                {step.done ? '✓' : i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '13px',
                  fontWeight: isActive ? 700 : 500,
                  color: step.done ? 'var(--muted)' : 'var(--ink)',
                  textDecoration: step.done ? 'line-through' : 'none',
                }}>
                  {step.label}
                </div>
                {isActive && (
                  <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                    {step.hint}
                  </div>
                )}
              </div>
              {isActive && step.cta && (
                <button
                  type="button"
                  onClick={step.onClick}
                  style={{
                    padding: '7px 14px', background: 'var(--ink)', color: '#fff',
                    border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer',
                    fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap',
                  }}
                >
                  {step.cta} →
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
