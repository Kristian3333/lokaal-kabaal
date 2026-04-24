'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import Nav from '@/components/Nav';
import PricingSection from '@/components/PricingSection';
import HeroMapAnim from '@/components/HeroMapAnim';
import ErrorBoundary from '@/components/ErrorBoundary';
import FadeUp from '@/components/landing/FadeUp';
import CountUp from '@/components/landing/CountUp';
import StaggerText from '@/components/landing/StaggerText';
import Testimonials from '@/components/landing/Testimonials';
import ActivityTicker from '@/components/landing/ActivityTicker';
import ExitIntent from '@/components/landing/ExitIntent';
import PartnerStrip from '@/components/landing/PartnerStrip';
import ProefFlyerForm from '@/components/landing/ProefFlyerForm';
import { motion } from 'framer-motion';

const Hero3D = dynamic(() => import('@/components/Hero3D'), { ssr: false });

// ─── Spring config ────────────────────────────────────────────────────────────

const SPRING = { type: 'spring' as const, stiffness: 60, damping: 18, mass: 0.8 };
const SPRING_FAST = { type: 'spring' as const, stiffness: 90, damping: 16, mass: 0.6 };

// ─── CLV data ────────────────────────────────────────────────────────────────

const CLV = [
  { branche: 'Kapsalon', waarde: '€360', sub: 'per vaste klant/jaar · 6–8 knipcycli × €50' },
  { branche: 'Installatiebedrijf', waarde: '€8.000', sub: 'eerste jaar · gem. verbouwbudget nieuwe eigenaar' },
  { branche: 'Restaurant', waarde: '€840', sub: 'per vaste gast/jaar · 2× p/mnd × €35' },
  { branche: 'Bakkerij', waarde: '€520', sub: 'per vaste klant/jaar · dagelijkse terugkeer' },
];

// ─── Stap data ───────────────────────────────────────────────────────────────

const STAPPEN = [
  {
    n: '01',
    titel: 'Kies jouw postcodes',
    tekst: 'Geef aan welke postcodegebieden je wil bereiken. Wij koppelen automatisch alle nieuwe eigendomsoverdrachten in die gebieden aan jouw campagne.',
  },
  {
    n: '02',
    titel: 'Upload je flyerontwerp',
    tekst: 'Upload je eigen ontwerp of laat ons helpen. Elke flyer krijgt automatisch het juiste adres -- gepersonaliseerd voor elke nieuwe bewoner.',
  },
  {
    n: '03',
    titel: 'Bezorgd tussen 28-30e',
    tekst: 'Wij verwerken maandelijks alle overdrachten en sturen een bulkorder naar de drukker. Jouw flyer ligt tussen de 28e en 30e bij elke nieuwe bewoner op de mat.',
  },
];

// ─── LandingPage ──────────────────────────────────────────────────────────────
//
// Full landing page, extracted from app/page.tsx so the latter can be a server
// component that exports page-specific metadata while this stays client-side
// for the framer-motion / dynamic-import interactions.

export default function LandingPage(): React.JSX.Element {
  return (
    <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--paper)', minHeight: '100vh', color: 'var(--ink)' }}>
      <ExitIntent />

      <Nav />

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section style={{
        background: 'var(--ink)',
        padding: '120px 40px 140px',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* 3D particle background */}
        <ErrorBoundary>
          <Hero3D />
        </ErrorBoundary>

        {/* Radial glow */}
        <div style={{
          position: 'absolute', top: '-20%', right: '-10%',
          width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(0,232,122,0.08) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        <div style={{
          maxWidth: '1100px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: '1fr auto',
          gap: '60px', alignItems: 'center',
          position: 'relative', zIndex: 1,
        }} className="hero-grid">

          {/* Left column */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ ...SPRING_FAST, delay: 0.1 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                padding: '5px 14px',
                background: 'rgba(0,232,122,0.06)',
                border: '1px solid rgba(0,232,122,0.15)',
                borderRadius: '20px',
                fontSize: '11px', fontFamily: 'var(--font-mono)',
                color: 'var(--green-dim)', marginBottom: '32px',
                backdropFilter: 'blur(12px)',
              }}
            >
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ width: '6px', height: '6px', background: 'var(--green)', borderRadius: '50%', display: 'inline-block' }}
              />
              Hyperlocal direct mail · bezorgd tussen 28-30e van elke maand
            </motion.div>

            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(48px, 7vw, 82px)',
              lineHeight: 0.98,
              fontWeight: 400,
              color: '#fff',
              letterSpacing: '-0.03em',
              marginBottom: '28px',
              maxWidth: '680px',
            }}>
              <StaggerText text="Van nieuwe bewoner" delay={0.2} />
              <br />
              <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0 0.3em' }}>
                <StaggerText text="naar" delay={0.5} />
                {' '}
                <motion.em
                  initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ ...SPRING, delay: 0.6 }}
                  style={{ color: 'var(--green)', fontStyle: 'italic' }}
                >
                  vaste klant.
                </motion.em>
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: 0.5 }}
              style={{
                fontSize: '18px', color: 'rgba(255,255,255,0.50)',
                lineHeight: 1.75, maxWidth: '520px', marginBottom: '44px',
              }}
            >
              Elke maand verhuizen <strong style={{ color: 'rgba(255,255,255,0.85)' }}>tienduizenden huishoudens</strong> in Nederland. De eerste 30 dagen kiezen ze hun vaste kapper, bakker en installateur. LokaalKabaal zorgt dat jouw flyer als eerste op de mat ligt.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: 0.65 }}
              style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}
            >
              <Link href="/login" style={{
                padding: '16px 32px',
                background: 'var(--green)', color: 'var(--ink)',
                borderRadius: '4px', fontWeight: 800,
                fontSize: '14px', textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                letterSpacing: '-0.01em',
                boxShadow: '0 0 40px rgba(0,232,122,0.25), 0 0 80px rgba(0,232,122,0.1)',
              }}>
                Claim jouw postcodes
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  →
                </motion.span>
              </Link>
              <Link href="/flyers-versturen-nieuwe-bewoners" style={{
                padding: '16px 20px', color: 'rgba(255,255,255,0.45)',
                fontSize: '13px', textDecoration: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
              }}>
                Hoe het werkt
              </Link>
            </motion.div>

            {/* Activity ticker -- real-feel social proof */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: 0.75 }}
              style={{ marginTop: '28px' }}
            >
              <ActivityTicker />
            </motion.div>

            {/* Mini stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ ...SPRING, delay: 0.85 }}
              style={{
                display: 'flex', gap: '40px', marginTop: '60px',
                paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.06)',
                flexWrap: 'wrap',
              }}
            >
              {([
                ['900.000+', 'eigendomsoverdrachten/jaar in NL'],
                ['30 dagen',  'beslissingsvenster nieuwe bewoners'],
                ['4–8%',      'conversieratio welkomstflyer'],
              ] as [string, string][]).map(([n, l], i) => (
                <motion.div
                  key={l}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...SPRING, delay: 0.9 + i * 0.08 }}
                >
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '30px', color: '#fff', marginBottom: '6px', lineHeight: 1, letterSpacing: '-0.02em' }}>{n}</div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.30)', fontFamily: 'var(--font-mono)', lineHeight: 1.4, maxWidth: '140px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>{l}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right column -- animated map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ ...SPRING, delay: 0.4 }}
            className="hero-map-col"
          >
            <ErrorBoundary>
              <HeroMapAnim />
            </ErrorBoundary>
          </motion.div>
        </div>
      </section>

      {/* ── HET MOMENT ──────────────────────────────────────────────────────── */}
      <section style={{ padding: '100px 40px', maxWidth: '1080px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }} className="grid-2">
          <FadeUp>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Het moment
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 400, lineHeight: 1.1, marginBottom: '20px' }}>
              Elke 28-30e ligt jouw flyer<br />
              <em style={{ color: 'var(--muted)' }}>bij nieuwe bewoners op de mat.</em>
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '16px' }}>
              Wanneer iemand verhuist, zijn alle gewoontes doorbroken. Er is geen vaste kapper, geen stamrestaurant, geen vertrouwde installateur. Alles staat open -- en de keuzes worden razendsnel gemaakt.
            </p>
            <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.8 }}>
              Dit is het enige venster. LokaalKabaal zorgt dat jouw flyer in dat venster arriveert -- vóór je concurrent.
            </p>
          </FadeUp>

          {/* Timeline visual */}
          <FadeUp delay={0.1}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {[
                { dag: 'Dag 1',   label: 'Eigendomsoverdracht',    active: false, sub: 'Nieuwe eigenaar betreedt de woning' },
                { dag: '28-30e',  label: 'Jouw flyer arriveert',   active: true,  sub: 'LokaalKabaal bezorgt via PostNL' },
                { dag: 'Week 2',  label: 'Eerste aankoop',         active: false, sub: 'Nieuwe bewoner kiest eerste leverancier' },
                { dag: 'Dag 30',  label: 'Vaste klant gevormd',    active: false, sub: '80% heeft alle leveranciers gekozen' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '16px',
                  padding: '16px 20px',
                  background: item.active ? 'var(--green-bg)' : '#fff',
                  border: `1px solid ${item.active ? 'rgba(0,232,122,0.25)' : 'var(--line)'}`,
                  borderRadius: i === 0 ? 'var(--radius) var(--radius) 0 0' : i === 3 ? '0 0 var(--radius) var(--radius)' : '0',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '10px',
                    color: item.active ? 'var(--green)' : 'var(--muted)',
                    paddingTop: '2px', flexShrink: 0, width: '38px',
                  }}>
                    {item.dag}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: item.active ? 700 : 500, color: item.active ? 'var(--green-dim)' : 'var(--ink)', marginBottom: '2px' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                      {item.sub}
                    </div>
                  </div>
                  {item.active && (
                    <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
                      <span style={{ width: '7px', height: '7px', background: 'var(--green)', borderRadius: '50%', display: 'inline-block' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── HOE HET WERKT ───────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 40px 100px', background: 'var(--paper2)' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <FadeUp style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
              Hoe het werkt
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 400, marginBottom: '12px' }}>
              Drie stappen. <em style={{ color: 'var(--muted)' }}>Dan loopt het vanzelf.</em>
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '14px', maxWidth: '440px', margin: '0 auto', lineHeight: 1.7 }}>
              Stel eenmalig in welke postcodes je wil bereiken. De rest doen wij elke maand automatisch.
            </p>
          </FadeUp>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2px', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--line)' }} className="grid-3">
            {STAPPEN.map((s, i) => (
              <FadeUp key={s.n} delay={i * 0.1}>
                <div style={{ background: '#fff', padding: '36px 32px', height: '100%' }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '32px', height: '32px',
                    background: 'var(--green-bg)', border: '1px solid rgba(0,232,122,0.2)',
                    borderRadius: '6px', marginBottom: '20px',
                    fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--green-dim)',
                  }}>
                    {s.n}
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 400, marginBottom: '12px', lineHeight: 1.25 }}>
                    {s.titel}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.75 }}>
                    {s.tekst}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── SAMEN GROEIEN ───────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--ink)', padding: '100px 40px' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>

          <FadeUp style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '14px' }}>
              Samen groeien
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 400, color: '#fff', marginBottom: '16px', lineHeight: 1.08 }}>
              Jij levert de kwaliteit.<br />
              <em style={{ color: 'rgba(255,255,255,0.3)' }}>Wij zorgen voor de connectie.</em>
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)', maxWidth: '500px', margin: '0 auto', lineHeight: 1.7 }}>
              LokaalKabaal is geen advertentieplatform. We zijn jouw stille partner die elke maand voor nieuwe klanten zorgt -- terwijl jij gewoon je vak uitoefent.
            </p>
          </FadeUp>

          {/* Three-column partnership visual */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr', gap: '0', alignItems: 'center' }} className="samen-grid">

            {/* Ondernemer */}
            <FadeUp delay={0}>
              <div style={{
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', padding: '32px 28px',
                background: 'rgba(255,255,255,0.03)',
                textAlign: 'center',
              }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 18px', fontSize: '22px',
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: '#fff', marginBottom: '8px' }}>Jij</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, fontFamily: 'var(--font-mono)' }}>
                  Levert kwaliteit.<br />Kent jouw vak.
                </div>
              </div>
            </FadeUp>

            {/* Arrow */}
            <FadeUp delay={0.1}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <svg width="32" height="16" viewBox="0 0 32 16" fill="none">
                    <path d="M0 8H28M28 8L22 2M28 8L22 14" stroke="rgba(0,232,122,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>vertrouwen</span>
                </div>
              </div>
            </FadeUp>

            {/* LokaalKabaal */}
            <FadeUp delay={0.2}>
              <div style={{
                border: '2px solid rgba(0,232,122,0.35)',
                borderRadius: '12px', padding: '32px 28px',
                background: 'rgba(0,232,122,0.04)',
                textAlign: 'center',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                  background: 'var(--green)', color: 'var(--ink)',
                  fontSize: '10px', fontWeight: 800, fontFamily: 'var(--font-mono)',
                  padding: '3px 12px', borderRadius: '20px', letterSpacing: '0.06em',
                  textTransform: 'uppercase', whiteSpace: 'nowrap',
                }}>
                  Wij
                </div>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: 'rgba(0,232,122,0.1)', border: '1px solid rgba(0,232,122,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 18px',
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: '#fff', marginBottom: '8px' }}>LokaalKabaal</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, fontFamily: 'var(--font-mono)' }}>
                  Detecteert nieuwe bewoners.<br />Verstuurt jouw flyer.
                </div>
              </div>
            </FadeUp>

            {/* Arrow */}
            <FadeUp delay={0.3}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <svg width="32" height="16" viewBox="0 0 32 16" fill="none">
                    <path d="M0 8H28M28 8L22 2M28 8L22 14" stroke="rgba(0,232,122,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>connectie</span>
                </div>
              </div>
            </FadeUp>

            {/* Nieuwe bewoner */}
            <FadeUp delay={0.4}>
              <div style={{
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', padding: '32px 28px',
                background: 'rgba(255,255,255,0.03)',
                textAlign: 'center',
              }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 18px',
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: '#fff', marginBottom: '8px' }}>Nieuwe bewoner</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, fontFamily: 'var(--font-mono)' }}>
                  Zoekt een vertrouwde<br />lokale ondernemer.
                </div>
              </div>
            </FadeUp>
          </div>

          {/* Result row */}
          <FadeUp delay={0.3} style={{ marginTop: '32px' }}>
            <div style={{
              textAlign: 'center', padding: '24px',
              background: 'rgba(0,232,122,0.05)',
              border: '1px solid rgba(0,232,122,0.15)',
              borderRadius: '12px',
            }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: '#fff' }}>
                Resultaat: <em style={{ color: 'var(--green)' }}>jij wordt hun vaste ondernemer.</em>
              </span>
              <span style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-mono)', marginTop: '6px' }}>
                Elke maand automatisch · zonder extra werk
              </span>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── BRANCH CLV ──────────────────────────────────────────────────────── */}
      <section style={{ padding: '100px 40px', maxWidth: '1080px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'start' }} className="grid-2">

          <FadeUp>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Waarom het werkt
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 400, marginBottom: '20px', lineHeight: 1.15 }}>
              Nieuwe bewoners zijn de meest <em style={{ color: 'var(--muted)' }}>waardevolle doelgroep die bestaat.</em>
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '24px' }}>
              Eén nieuwe vaste klant levert gemiddeld honderden euro&apos;s per jaar op -- vaak meer dan het volledige maandbedrag van je abonnement. De ROI is uitzonderlijk, omdat je in het juiste moment aanwezig bent.
            </p>
            <div style={{
              padding: '16px 20px',
              background: 'var(--green-bg)', border: '1px solid rgba(0,232,122,0.2)',
              borderRadius: 'var(--radius)',
            }}>
              <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', marginBottom: '4px' }}>
                Break-even Wijk-abonnement
              </div>
              <div style={{ fontSize: '14px', color: 'var(--ink)', fontWeight: 600 }}>
                1 nieuwe vaste klant per 2 maanden
              </div>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {CLV.map((b, i) => (
                <div key={i} style={{
                  background: i % 2 === 0 ? '#fff' : 'var(--paper)',
                  border: '1px solid var(--line)',
                  borderRadius: i === 0 ? 'var(--radius) var(--radius) 0 0' : i === CLV.length - 1 ? '0 0 var(--radius) var(--radius)' : '0',
                  padding: '18px 22px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '3px' }}>{b.branche}</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{b.sub}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--green-dim)', flexShrink: 0, marginLeft: '20px' }}>
                    {b.waarde}
                  </div>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── STATS STRIP ─────────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--paper2)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', padding: '60px 40px' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '40px', textAlign: 'center' }} className="grid-3">
          {([
            { value: 900000, suffix: '+', label: 'eigendomsoverdrachten per jaar in Nederland' },
            { value: 30,     suffix: ' dagen', label: 'beslissingsvenster nieuwe bewoners' },
            { value: 8,      suffix: '%', label: 'gemiddelde conversieratio welkomstflyer' },
          ]).map((s, i) => (
            <FadeUp key={i} delay={i * 0.1}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(36px, 5vw, 56px)', color: 'var(--ink)', lineHeight: 1, marginBottom: '10px' }}>
                <CountUp target={s.value} suffix={s.suffix} />
              </div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', lineHeight: 1.5, maxWidth: '160px', margin: '0 auto' }}>
                {s.label}
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── PARTNER LOGOS ────────────────────────────────────────────────────── */}
      <PartnerStrip />

      {/* ── TESTIMONIALS ────────────────────────────────────────────────────── */}
      <Testimonials />

      {/* ── PROEF-FLYER LEAD MAGNET ─────────────────────────────────────────── */}
      <ProefFlyerForm />

      {/* ── PRICING ─────────────────────────────────────────────────────────── */}
      <PricingSection />

      {/* ── FINAL CTA ───────────────────────────────────────────────────────── */}
      <section style={{
        padding: '120px 40px',
        textAlign: 'center',
        maxWidth: '720px',
        margin: '0 auto',
        position: 'relative',
      }}>
        {/* Subtle glow behind CTA */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(0,232,122,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <FadeUp>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '20px' }}>
            Klaar om te groeien?
          </div>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(36px, 5.5vw, 56px)',
            fontWeight: 400, marginBottom: '20px', lineHeight: 1.04,
            letterSpacing: '-0.02em',
          }}>
            Elke maand nieuwe klanten.<br />
            <em style={{ color: 'var(--muted)' }}>Zonder extra werk.</em>
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '16px', marginBottom: '40px', lineHeight: 1.7, maxWidth: '480px', margin: '0 auto 40px' }}>
            Stel eenmalig in. Elke maand verstuurt LokaalKabaal automatisch jouw flyer naar alle nieuwe bewoners in jouw postcodes -- bezorgd tussen de 28e en 30e.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <Link href="/login" style={{
              padding: '18px 44px',
              background: 'var(--ink)', color: '#fff',
              borderRadius: '4px', fontWeight: 800,
              fontSize: '15px', textDecoration: 'none',
              display: 'inline-block',
              letterSpacing: '-0.01em',
              boxShadow: '0 4px 30px rgba(10,10,10,0.2)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}>
              Start nu jouw campagne →
            </Link>
            <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.02em' }}>
              Abonnement vanaf €349/mnd · 15% korting bij jaarcontract
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid var(--line)', padding: '28px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)',
      }}>
        <span>© 2026 LokaalKabaal B.V.</span>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {[
            ['/flyers-versturen-nieuwe-bewoners', 'Nieuwe bewoners'],
            ['/blog', 'Blog'],
            ['/over-ons', 'Over ons'],
            ['/privacy', 'Privacy'],
            ['/voorwaarden', 'Voorwaarden'],
            ['/contact', 'Contact'],
          ].map(([href, label]) => (
            <Link key={href} href={href} style={{ color: 'var(--muted)', textDecoration: 'none' }}>{label}</Link>
          ))}
        </div>
      </footer>

      {/* ── Responsive styles ───────────────────────────────────────────────── */}
      <style>{`
        .hero-grid   { grid-template-columns: 1fr auto !important; }
        .samen-grid  { grid-template-columns: 1fr auto 1fr auto 1fr !important; }
        @media (max-width: 900px) {
          .hero-grid       { grid-template-columns: 1fr !important; }
          .hero-map-col    { display: none !important; }
          .samen-grid      { grid-template-columns: 1fr !important; gap: 12px !important; }
          .samen-grid > *:nth-child(even) { display: none !important; }
        }
        @media (max-width: 768px) {
          section { padding-left: 20px !important; padding-right: 20px !important; }
        }
      `}</style>
    </div>
  );
}
