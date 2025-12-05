
/**
 * @license
 * Copyright (C)2025 Robin L. M. Cheung, MBA. All rights reserved.
 * Namespace: mba.robin.hkm.visualresearch
 * 
 * MEDIA ASSETS NOTE:
 * The animations and visuals in this component are procedurally generated using CSS3 and SVG.
 * There are no external image or video files.
 * To use these assets in other platforms, you would port the CSS @keyframes (found in index.css) and HTML structure.
 * Icons are from 'lucide-react': https://lucide.dev/
*/
import React, { useState, useEffect, useMemo } from 'react';
import { Play, Hexagon, ShieldCheck, Zap } from 'lucide-react';

interface IntroScreenProps {
  onComplete: () => void;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState(0); 
  // 0: Orthogonal Chaos (Eccentric wandering)
  // 1: Convergence (The Gathering)
  // 2: Renormalization (Phase Locking - Centering the eccentricity)
  // 3: Purification (Expelling fallacy/noise)
  // 4: Truth State (Stable Mesh)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1500); // Begin convergence
    const t2 = setTimeout(() => setPhase(2), 3500); // Phase Lock (Remove eccentricity)
    const t3 = setTimeout(() => setPhase(3), 4500); // Purge Noise
    const t4 = setTimeout(() => setPhase(4), 5500); // UI Reveal

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const handleEnter = () => {
    onComplete();
  };

  // Memoize particles to prevent random jitter on re-renders
  const particles = useMemo(() => {
    return Array.from({ length: 30 }).map(() => ({
      x: (Math.random() - 0.5) * 800,
      y: (Math.random() - 0.5) * 800,
      z: (Math.random() - 0.5) * 800
    }));
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center overflow-hidden font-display perspective-1000">
      
      {/* Deep Space Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-black to-black"></div>
      
      {/* THE HYBRID KNOWLEDGE MESH ANIMATION */}
      <div className="relative w-96 h-96 flex items-center justify-center preserve-3d">
        
        {/* Intersection Core (The Truth) */}
        <div className={`absolute top-1/2 left-1/2 w-4 h-4 bg-white rounded-full blur-[1px] z-50 transition-all duration-700 ${phase >= 3 ? 'opacity-100' : 'opacity-0'}`}
             style={{ 
                 animation: phase >= 3 ? 'core-ignition 4s ease-out forwards' : 'none',
                 boxShadow: '0 0 30px white' 
             }}>
        </div>

        {/* 
            DYNAMIC ECCENTRICITY LOGIC:
            - Phases 0-1: transform-origin is OFF-CENTER (e.g., 40% 60%). 
              This causes the planes to "wobble" and the intersection point to wander.
            - Phase 2+: transform-origin snaps to 50% 50%.
              This represents "Phase Locking" or "Renormalization".
        */}

        {/* Plane 1: Cyan (Empirical) */}
        <div className={`absolute inset-0 m-auto w-80 h-80 border border-cyan-400/50 rounded-full bg-gradient-to-t from-cyan-500/20 to-cyan-500/0 shadow-[0_0_40px_rgba(34,211,238,0.2)] preserve-3d transition-all duration-[2000ms] ease-in-out mix-blend-screen`}
             style={{ 
               animation: 'plane-gyrate-1 12s linear infinite',
               opacity: phase >= 1 ? 1 : 0,
               transformOrigin: phase < 2 ? '42% 58%' : '50% 50%', // Eccentric -> Centered
               transform: phase < 1 ? 'scale(1.8) rotateX(90deg)' : undefined
             }}>
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(34,211,238,0.1)_60%)] rounded-full"></div>
        </div>

        {/* Plane 2: Magenta (Rational) */}
        <div className={`absolute inset-0 m-auto w-80 h-80 border border-purple-400/50 rounded-full bg-gradient-to-tr from-purple-500/20 to-purple-500/0 shadow-[0_0_40px_rgba(168,85,247,0.2)] preserve-3d transition-all duration-[2000ms] ease-in-out mix-blend-screen`}
             style={{ 
               animation: 'plane-gyrate-2 15s linear infinite',
               opacity: phase >= 1 ? 1 : 0,
               transformOrigin: phase < 2 ? '58% 45%' : '50% 50%', // Eccentric -> Centered
               transform: phase < 1 ? 'scale(1.8) rotateY(90deg)' : undefined
             }}>
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(168,85,247,0.1)_60%)] rounded-full"></div>
        </div>

        {/* Plane 3: Amber (Intuitive) */}
        <div className={`absolute inset-0 m-auto w-80 h-80 border border-amber-400/50 rounded-full bg-gradient-to-bl from-amber-500/20 to-amber-500/0 shadow-[0_0_40px_rgba(251,191,36,0.2)] preserve-3d transition-all duration-[2000ms] ease-in-out mix-blend-screen`}
             style={{ 
               animation: 'plane-gyrate-3 18s linear infinite',
               opacity: phase >= 1 ? 1 : 0,
               transformOrigin: phase < 2 ? '50% 65%' : '50% 50%', // Eccentric -> Centered
               transform: phase < 1 ? 'scale(1.8) rotateZ(90deg)' : undefined
             }}>
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(251,191,36,0.1)_60%)] rounded-full"></div>
        </div>
        
        {/* Phase 3: Expelling Fallacy (Noise Particles) */}
        {phase === 3 && particles.map((p, i) => (
             <div key={i} 
                  className="absolute top-1/2 left-1/2 w-1 h-1 bg-slate-500 rounded-full"
                  style={{
                    '--tx': `${p.x}px`,
                    '--ty': `${p.y}px`,
                    '--tz': `${p.z}px`,
                    animation: `eject-fallacy 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards`
                  } as React.CSSProperties}>
             </div>
        ))}

      </div>

      {/* PHASE 4: UI REVEAL */}
      <div className={`absolute bottom-20 md:bottom-32 flex flex-col items-center transition-all duration-1000 z-50 ${phase >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
         
         <div className="flex items-center gap-2 mb-4 animate-in fade-in zoom-in duration-1000 delay-300">
             <ShieldCheck className="w-5 h-5 text-emerald-400" />
             <span className="text-[10px] text-emerald-400 tracking-widest uppercase font-bold">Protocol: Renormalized Truth</span>
         </div>

         <h1 className="text-3xl md:text-6xl font-bold text-white mb-2 tracking-tight text-center font-display" 
             style={{ animation: phase >= 4 ? 'text-reveal 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards' : 'none' }}>
            Hybrid Knowledge <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-amber-400 filter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">Mesh</span>
         </h1>
         
         <p className="text-slate-400 text-xs md:text-sm uppercase tracking-[0.3em] mb-8 text-center max-w-lg leading-relaxed">
            Where separate truths converge, <br/>tension crowds out the shadow.
         </p>
         
         <button 
            onClick={handleEnter}
            className="group relative px-10 py-4 bg-transparent overflow-hidden rounded-full transition-all hover:scale-105"
         >
            <div className="absolute inset-0 w-full h-full bg-slate-900 border border-cyan-500/50 rounded-full group-hover:bg-cyan-950/50 transition-colors"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative flex items-center gap-3">
                <Hexagon className="w-4 h-4 text-cyan-300 fill-cyan-900/50" />
                <span className="text-white font-bold tracking-widest text-xs">ENTER VISUAL RESEARCHER</span>
                <Play className="w-3 h-3 text-cyan-300 fill-current" />
            </div>
         </button>
      </div>

      {/* Skip Button */}
      <button 
        onClick={onComplete}
        className="absolute top-8 right-8 text-[10px] text-slate-600 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-2 group"
      >
        <Zap className="w-3 h-3 group-hover:text-amber-400 transition-colors" />
        Skip Sequence
      </button>

      {/* Mandate Footer */}
      <div className="absolute bottom-6 text-center w-full text-[8px] text-slate-700 uppercase tracking-widest opacity-50">
         Ad Maiorem Gloriam Dei Mei • Robin's AI World
      </div>

    </div>
  );
};

export default IntroScreen;
