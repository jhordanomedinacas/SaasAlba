import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import logoAlba from '../../assets/logo-alba.png';

type Role = 'entrenador' | 'asesor' | null;

export default function Login() {
  const navigate  = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);

  const [role, setRole]         = useState<Role>(null);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  /* ── Starfield ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const dim = Array.from({ length: 140 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 0.8 + 0.2, a: Math.random() * 0.2 + 0.05,
      sp: Math.random() * 0.01 + 0.003, off: Math.random() * Math.PI * 2,
    }));

    const bright = Array.from({ length: 30 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.6, a: Math.random() * 0.35 + 0.2,
      sp: Math.random() * 0.015 + 0.005, off: Math.random() * Math.PI * 2,
    }));

    let t = 0;
    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      dim.forEach(s => {
        const a = Math.min(1, s.a + Math.sin(t * s.sp + s.off) * 0.08);
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fill();
      });

      bright.forEach(s => {
        const a = Math.min(1, s.a + Math.sin(t * s.sp + s.off) * 0.2);
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 5);
        g.addColorStop(0,   `rgba(255,255,255,${a * 0.5})`);
        g.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 5, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fill();
      });

      t++;
    };
    draw();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/inicio');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a1f23 0%, #0F2C32 50%, #0d2a2f 100%)' }}>

      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* Glow central */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
        <div className="w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(255,255,255,0.03) 0%, transparent 70%)' }} />
      </div>

      {/* Línea superior */}
      <div className="absolute top-0 left-0 right-0 h-px z-10"
        style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.12), transparent)' }} />
      {/* Línea inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-px z-10"
        style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)' }} />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm px-6 flex flex-col items-center text-center gap-5 py-12">

        {/* Eyebrow */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-px bg-white/20" />
          <span className="uppercase text-[0.60rem] tracking-[0.25em] text-white/70"
            style={{ fontFamily: 'monospace' }}>
            Plataforma de Entrenamiento
          </span>
          <div className="w-8 h-px bg-white/20" />
        </div>

        {/* Logo + título */}
        <div className="flex flex-col items-center gap-1">
          <img src={logoAlba} alt="Logo Alba" className="w-20 h-20 object-contain mb-1" />
          <h1 className="font-black uppercase tracking-[0.08em] text-white leading-none"
            style={{ fontSize: 'clamp(3rem,9vw,5rem)', textShadow: '0 0 60px rgba(255,255,255,0.10)' }}>
            ALBA
          </h1>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/80"
            style={{ fontFamily: 'monospace' }}>
            Engineering
          </p>
        </div>

        {/* Frase */}
        <p className="text-white/75 text-xs italic" style={{ fontFamily: 'monospace' }}>
          Si lo puedes imaginar, lo puedes programar.
        </p>

        {/* Divisor */}
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 h-px bg-white/10" />
          <div className="w-1 h-1 rotate-45 border border-white/20" />
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Roles o formulario */}
        {!role ? (
          <>
            <p className="text-white/70 text-xs uppercase tracking-widest" style={{ fontFamily: 'monospace' }}>
              Selecciona tu rol
            </p>
            <div className="flex gap-3 w-full">
              <RoleButton
                label="Entrenador"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                  </svg>
                }
                onClick={() => setRole('entrenador')}
              />
              <RoleButton
                label="Asesor"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                  </svg>
                }
                onClick={() => setRole('asesor')}
              />
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">

            {/* Rol activo */}
            <div className="flex items-center justify-between">
              <span className="text-[0.60rem] uppercase tracking-widest text-white/80"
                style={{ fontFamily: 'monospace' }}>
                {role === 'entrenador' ? 'Entrenador' : 'Asesor'}
              </span>
              <button type="button" onClick={() => setRole(null)}
                className="text-[0.60rem] uppercase tracking-widest text-white/50 hover:text-white transition-colors"
                style={{ fontFamily: 'monospace' }}>
                cambiar
              </button>
            </div>

            {/* Email */}
            <div className="text-left">
              <label className="block text-[0.60rem] mb-1.5 uppercase tracking-widest text-white/75"
                style={{ fontFamily: 'monospace' }}>
                Correo
              </label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com" required
                className="w-full px-4 py-2.5 text-sm text-white/80 focus:outline-none transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}
                onFocus={e => (e.target.style.borderColor = 'rgba(255,255,255,0.35)')}
                onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
              />
            </div>

            {/* Password */}
            <div className="text-left">
              <label className="block text-[0.60rem] mb-1.5 uppercase tracking-widest text-white/75"
                style={{ fontFamily: 'monospace' }}>
                Contraseña
              </label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required
                className="w-full px-4 py-2.5 text-sm text-white/80 focus:outline-none transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}
                onFocus={e => (e.target.style.borderColor = 'rgba(255,255,255,0.35)')}
                onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
              />
            </div>

            <CornerButton label="Iniciar Sesión" type="submit" />
          </form>
        )}
      </div>
    </div>
  );
}

function RoleButton({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button" onClick={onClick}
      className="relative flex-1 flex flex-col items-center gap-2.5 py-5 transition-all duration-200 hover:-translate-y-0.5"
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.20)', color: 'rgba(255,255,255,0.90)' }}
      onMouseEnter={e => { const b = e.currentTarget; b.style.background = 'rgba(255,255,255,0.08)'; b.style.borderColor = 'rgba(255,255,255,0.28)'; }}
      onMouseLeave={e => { const b = e.currentTarget; b.style.background = 'rgba(255,255,255,0.04)'; b.style.borderColor = 'rgba(255,255,255,0.12)'; }}
    >
      <Corner />
      {icon}
      <span className="text-[0.65rem] font-semibold uppercase tracking-widest"
        style={{ fontFamily: 'monospace' }}>
        {label}
      </span>
    </button>
  );
}

function CornerButton({ label, type = 'button' }: { label: string; type?: 'button' | 'submit' }) {
  return (
    <button
      type={type}
      className="relative w-full py-3 text-[0.70rem] font-bold uppercase tracking-widest transition-all duration-200 hover:-translate-y-0.5"
      style={{ fontFamily: 'monospace', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.28)', color: 'rgba(255,255,255,0.95)' }}
      onMouseEnter={e => { const b = e.currentTarget; b.style.background = 'rgba(255,255,255,0.12)'; b.style.borderColor = 'rgba(255,255,255,0.35)'; }}
      onMouseLeave={e => { const b = e.currentTarget; b.style.background = 'rgba(255,255,255,0.06)'; b.style.borderColor = 'rgba(255,255,255,0.18)'; }}
    >
      <Corner />
      {label}
    </button>
  );
}

function Corner() {
  return (
    <>
      <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/30" />
      <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/30" />
      <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/30" />
      <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/30" />
    </>
  );
}
