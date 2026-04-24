import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '@/components/Nav';

export const metadata: Metadata = {
  title: 'De neurowetenschap van de nieuwe bewoner: waarom flyers in de eerste maand werken',
  description: 'Waarom verhuizers meer open staan voor nieuwe merken, wat Wendy Woods cue-context-routine framework betekent voor lokale retailers, en hoe je de eerste 30-dagen window benut.',
  alternates: { canonical: 'https://lokaalkabaal.agency/blog/neurowetenschap-nieuwe-bewoner' },
  openGraph: {
    title: 'De neurowetenschap van de nieuwe bewoner | LokaalKabaal',
    description: 'Waarom gewoontevorming na een verhuizing het gouden venster is voor lokaal MKB.',
    url: 'https://lokaalkabaal.agency/blog/neurowetenschap-nieuwe-bewoner',
  },
};

const SECTIES = [
  {
    kop: 'Een verhuizing is een cue-reset',
    tekst: `Wendy Wood, hoogleraar psychologie aan USC, onderzoekt al twee decennia hoe gewoontes werken. Haar kernbevinding: 43% van ons dagelijks gedrag is automatisch. We kiezen niet bewust de route naar de bakker, welke koffie we drinken, of waar we onze was laten stomen. Die keuzes staan vast.

Wat die automatisering intact houdt, zijn cues. Je rijdt elke dag langs dezelfde supermarkt, dus daar doe je boodschappen. Je ziet elke ochtend dezelfde kapperszaak, dus daar knip je. Context drijft routine.

Een verhuizing vaagt al die cues weg. Nieuwe straat, nieuwe ochtendwandeling, nieuwe buurtroute. Het brein is tijdelijk gedwongen om opnieuw keuzes te maken. En onderzoek laat zien dat in dat interval consumenten significant meer nieuwe merken proberen dan in een stabiele periode.`,
  },
  {
    kop: 'Het 30-dagen gouden venster',
    tekst: `Woods vond dat de gewoonte-formatiefase gemiddeld 66 dagen duurt voor een volledige automatisering, maar de eerste keuze wordt vaak al in week 2-4 gemaakt. Zodra iemand twee of drie keer bij dezelfde bakker is geweest, begint het cue-response-reward circuit in de basale ganglia zich vast te zetten. Daarna kost het 3-5x meer marketinginspanning om die voorkeur te doorbreken.

Voor lokale retailers betekent dit: kom te laat en je concurreert tegen een automatisme. Kom op tijd en je concurreert tegen een overweging. Dat is een totaal ander marketingbudget per gewonnen klant.`,
  },
  {
    kop: 'Waarom digitale kanalen hier minder effectief zijn',
    tekst: `Google Ads en Meta Ads werken op keyword-intent en demografische targeting. Ze weten vaak niet dat iemand net verhuisd is, en als ze het wel weten (via IP-address wijziging of een verhuis-formulier), zijn er al 200 andere adverteerders die dezelfde signalen hebben opgepikt.

Een fysieke flyer benut een ander kanaal: het huis zelf. De brievenbus van een net verhuisde woning heeft een radicaal hogere attentie-waarde dan de inbox. Er is minder concurrentie, de context is fysiek (je staat letterlijk in je nieuwe ruimte), en het verwerkingsniveau is trager en dieper. Neuromarketing-onderzoek van Bangor University laat zien dat tastbaar materiaal een 70% hogere "memory trace" oplevert dan hetzelfde materiaal digitaal.`,
  },
  {
    kop: 'Wat dit betekent voor jouw campagne',
    tekst: `Een paar praktische implicaties:

1. Timing boven volume. Drie flyers gedistribueerd in de eerste 14 dagen na verhuizing hebben een hogere conversie dan 30 flyers in een willekeurige maand. Het Kadaster-signaal dat LokaalKabaal gebruikt, maakt die timing haalbaar.

2. Context beats korting. Een flyer die opent met "Welkom in de Gildebuurt" verslaat een flyer die opent met "20% korting". De eerste valideert dat de ontvanger herkend is; de tweede voelt als mass-mail.

3. Eerste bezoek > eerste aankoop. De bakker die een gratis koffie aanbiedt bij eerste bezoek bouwt goodwill zonder marge-druk. De eerste aankoop volgt bijna altijd op bezoek 2 of 3.

4. Herhalen werkt, maar subtiel. Een welkomstflyer na 2 weken, een top-3 buurtgidsje na 4 weken, een seizoensgebonden aanbod na 6 weken. Dat is het ritme waarop de gewoonte-formatie synchroniseert met jouw merk.`,
  },
  {
    kop: 'De meetbare kant',
    tekst: `Wat dit bijzonder maakt: in tegenstelling tot traditionele direct mail is het resultaat meetbaar. Elke flyer heeft een unieke QR-code die naar een landingspagina leidt waarop de ontvanger een korting verzilvert. Je ziet per PC4 hoe veel nieuwe bewoners reageren, je ziet welke welkomsboodschap converteert, en je ziet na 30/60/90 dagen wie opnieuw is gekomen.

Dat gedrag -- herhaalbezoek -- is de beste indicator voor toekomstige CLV. Een nieuwe klant die binnen 30 dagen drie keer is gekomen, heeft 5-7x de lifetime value van een eenmalig bezoek. Onze data-logica in de gemeente- en branche-benchmarks berekent dit automatisch, zodat je niet hoeft te wachten tot het jaareinde om te weten of de campagne terugverdient.`,
  },
  {
    kop: 'Wetenschap, geen magie',
    tekst: `Dit is geen silver bullet. Niet iedereen verhuist op hetzelfde moment, niet iedereen wordt direct klant, en niet elke branche heeft dezelfde urgentie (een loodgieter heeft minder tijdskritiek dan een bakker of een kapper). Maar de onderliggende cognitieve realiteit -- een tijdelijk open venster voor gewoontevorming -- is robuust over decennia onderzoek.

Wat blijft, is een heldere implicatie voor lokaal ondernemerschap: als er één moment is waarop de acquisitiekosten van een klant dramatisch dalen, is het de eerste maand na hun verhuizing. En dat moment is zichtbaar, via het Kadaster, via QR-conversies, en via retention-rapportages.

Wie er op dat moment is, bouwt voor jaren.`,
  },
];

export default function BlogNeurowetenschap(): React.JSX.Element {
  return (
    <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--paper)', minHeight: '100vh', color: 'var(--ink)' }}>
      <Nav />

      <article style={{ maxWidth: '680px', margin: '0 auto', padding: '60px 40px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', background: 'var(--green-bg)', padding: '3px 8px', borderRadius: '2px', letterSpacing: '.06em' }}>NEUROMARKETING</span>
          <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>6 min lezen · 24 april 2026</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '46px', fontWeight: 400, lineHeight: 1.1, marginBottom: '24px' }}>
          De neurowetenschap van de nieuwe bewoner
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--muted)', lineHeight: 1.65, marginBottom: '40px', fontStyle: 'italic', borderLeft: '3px solid var(--green)', paddingLeft: '20px' }}>
          &ldquo;Een verhuizing is geen logistieke gebeurtenis. Het is een cognitieve reset waarin 43% van iemands automatische gedrag tijdelijk ter discussie staat.&rdquo;
        </p>

        {SECTIES.map(s => (
          <div key={s.kop} style={{ marginBottom: '40px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: 400, marginBottom: '14px', lineHeight: 1.25 }}>
              {s.kop}
            </h2>
            <div style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.75, whiteSpace: 'pre-line' }}>
              {s.tekst}
            </div>
          </div>
        ))}

        <div style={{ marginTop: '60px', padding: '32px', background: 'var(--paper2)', borderRadius: 'var(--radius)', border: '1px solid var(--line)' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 400, marginBottom: '12px' }}>
            Verder lezen
          </h3>
          <ul style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, margin: 0, paddingLeft: '20px' }}>
            <li><Link href="/blog/eerste-kennismaking" style={{ color: 'var(--green-dim)' }}>De Eerste Kennismaking</Link>: waarom de eerste flyer zelden direct tot aankoop leidt en toch het belangrijkste contactmoment is.</li>
            <li><Link href="/blog/hyperlokaal" style={{ color: 'var(--green-dim)' }}>Waarom hyperlokaal werkt</Link>: de impact van postcode-precisie op conversie.</li>
            <li><Link href="/blog/digitale-moeheid" style={{ color: 'var(--green-dim)' }}>Digitale moeheid</Link>: waarom papier juist nu beter scoort op attentie dan twee jaar geleden.</li>
          </ul>
        </div>

        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <Link href="/#prijzen" style={{
            display: 'inline-block', padding: '14px 32px', background: 'var(--ink)', color: '#fff',
            fontSize: '14px', fontWeight: 800, textDecoration: 'none', borderRadius: '4px',
          }}>
            Bekijk abonnementen →
          </Link>
        </div>
      </article>
    </div>
  );
}
