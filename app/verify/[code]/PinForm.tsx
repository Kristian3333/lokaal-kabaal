'use client';

import { useState } from 'react';

export default function PinForm({ code, accentColor }: { code: string; accentColor?: string }) {
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const handleSubmit = async () => {
    if (pin.length < 4) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/verify/${code}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pincode: pin }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'conversie') {
        setResult({ ok: true, message: 'Conversie geregistreerd!' });
        setPin('');
      } else {
        setResult({ ok: false, message: data.message || 'Fout opgetreden' });
      }
    } catch {
      setResult({ ok: false, message: 'Netwerkfout -- probeer opnieuw' });
    } finally {
      setLoading(false);
    }
  };

  if (result?.ok) {
    return (
      <div style={{
        marginTop: '20px', padding: '16px 20px', borderRadius: '12px',
        background: '#E8FFF4', border: '1px solid #B8F0D5', textAlign: 'center',
      }}>
        <div style={{ fontSize: '24px', marginBottom: '6px' }}>&#9733;</div>
        <div style={{ fontSize: '15px', fontWeight: 700, color: '#00875A' }}>
          {result.message}
        </div>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          marginTop: '16px', padding: '10px 20px', borderRadius: '10px',
          border: '1px dashed #ccc', background: 'transparent',
          fontSize: '12px', color: '#999', cursor: 'pointer',
          width: '100%',
        }}
      >
        Medewerker? Tik hier om te verzilveren
      </button>
    );
  }

  return (
    <div style={{
      marginTop: '16px', padding: '16px 20px', borderRadius: '12px',
      background: '#FAFAFA', border: '1px solid #E5E5E5',
    }}>
      <div style={{ fontSize: '13px', fontWeight: 700, color: '#333', marginBottom: '8px' }}>
        Winkelpincode invoeren
      </div>
      <div style={{ fontSize: '11px', color: '#999', marginBottom: '12px', lineHeight: 1.5 }}>
        Voer de 4-cijferige pincode in die je van je werkgever hebt gekregen.
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={pin}
          onChange={e => {
            setPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 6));
            setResult(null);
          }}
          onKeyDown={e => { if (e.key === 'Enter' && pin.length >= 4) handleSubmit(); }}
          placeholder="0000"
          style={{
            fontFamily: "'SF Mono', monospace", fontSize: '22px', fontWeight: 700,
            letterSpacing: '0.2em', textAlign: 'center', width: '140px',
            padding: '10px', border: '2px solid #E5E5E5', borderRadius: '10px',
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={loading || pin.length < 4}
          style={{
            padding: '10px 20px', background: loading ? '#999' : (accentColor || '#0A0A0A'),
            color: '#fff', border: 'none', borderRadius: '10px',
            fontWeight: 700, fontSize: '14px',
            cursor: loading ? 'wait' : 'pointer',
            opacity: pin.length < 4 ? 0.4 : 1,
          }}
        >
          {loading ? '...' : 'Verzilver'}
        </button>
      </div>
      {result && !result.ok && (
        <div style={{
          marginTop: '8px', padding: '6px 12px', borderRadius: '8px',
          background: '#FFF2F2', color: '#CC0000', fontSize: '12px', fontWeight: 600,
        }}>
          {result.message}
        </div>
      )}
    </div>
  );
}
