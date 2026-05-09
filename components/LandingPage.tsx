import React, { useState, useEffect, useRef } from 'react';
import { ViewState } from '../types';

interface LandingPageProps {
  onNavigate: (view: ViewState) => void;
  onFileSelect: (file: File) => void;
  isNuclearMode: boolean;
  setNuclearMode: (mode: boolean) => void;
}

interface AnalysisPoint {
  top: string;
  left: string;
  label: string;
  subLabel?: string;
  direction: 'left' | 'right';
  delay: number;
  exitDelay: number;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onFileSelect, isNuclearMode, setNuclearMode }) => {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  
  // Separate refs for Image and Video inputs to allow specific "accept" attributes
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Adjusted coordinates to map correctly to the face
  // exitDelay is calculated for Bottom-to-Top disappearance (larger 'top' % values exit first)
  const analysisPoints: AnalysisPoint[] = [
    { top: '35%', left: '42%', label: 'RETINAL PATTERN', subLabel: 'SYNTHETIC MATCH (0.99)', direction: 'left', delay: 200, exitDelay: 600 },
    { top: '55%', left: '65%', label: 'SKIN TEXTURE', subLabel: 'NOISE REPETITION', direction: 'right', delay: 800, exitDelay: 200 },
    { top: '45%', left: '25%', label: 'LIGHTING', subLabel: 'INCONSISTENT SHADOW', direction: 'left', delay: 1400, exitDelay: 400 },
    { top: '80%', left: '55%', label: 'HAIR GEOMETRY', subLabel: 'DISCONTINUOUS PATH', direction: 'right', delay: 2000, exitDelay: 0 },
    { top: '22%', left: '60%', label: 'FOLLICLE DENSITY', subLabel: 'UNNATURAL DISTRIBUTION', direction: 'right', delay: 2600, exitDelay: 800 },
  ];

  useEffect(() => {
    let isActive = true;

    const runAnimationCycle = async () => {
      // Short initial delay before starting
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsLooping(true); // Flag to ensure initial render doesn't trigger exit anims

      while (isActive) {
        // --- PHASE 1: APPEAR ---
        setShowAnalysis(true);
        
        // Wait for entry animations to complete + reading time
        await new Promise(resolve => setTimeout(resolve, 7000));
        
        if (!isActive) break;
        
        // --- PHASE 2: DISAPPEAR (SEQUENCED) ---
        setShowAnalysis(false);
        
        // Wait for sequenced exit to complete
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    };

    runAnimationCycle();

    return () => {
      isActive = false;
    };
  }, []);

  const handleImageUploadClick = () => {
    imageInputRef.current?.click();
  };

  const handleVideoUploadClick = () => {
    videoInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
      onNavigate(ViewState.DASHBOARD);
    }
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-start pt-16 overflow-x-hidden">
      
      {/* Corner Glow Effects */}
      <div className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full pointer-events-none z-0 mix-blend-screen dark:mix-blend-normal"></div>
      <div className="fixed bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-[600px] h-[600px] bg-fuchsia-600/20 blur-[120px] rounded-full pointer-events-none z-0 mix-blend-screen dark:mix-blend-normal"></div>

      {/* Background Ambient Glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vh] bg-fuchsia-600/10 blur-[100px] rounded-full pointer-events-none z-0"></div>
      <div className="fixed inset-0 bg-grid-pattern pointer-events-none z-0 opacity-10 dark:opacity-30 mix-blend-overlay"></div>

      {/* FLOATING PARTICLES LAYER */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {[...Array(40)].map((_, i) => {
           const size = Math.random() * 3 + 1; // 1px to 4px
           return (
             <div 
               key={i}
               className="absolute rounded-full opacity-30 dark:opacity-50 blur-[0.5px] animate-particle"
               style={{
                 top: `${Math.random() * 100}%`,
                 left: `${Math.random() * 100}%`,
                 width: `${size}px`,
                 height: `${size}px`,
                 // Randomize colors between primary purple, fuchsia pink, and white/slate
                 backgroundColor: Math.random() > 0.6 ? '#c026d3' : (Math.random() > 0.3 ? '#7c3bed' : (Math.random() > 0.5 ? '#ffffff' : '#94a3b8')),
                 animationDuration: `${Math.random() * 20 + 15}s`, // Slow float 15-35s
                 animationDelay: `${Math.random() * -30}s`, // Start at random points in animation cycle
               }}
             ></div>
           );
        })}
      </div>

      {/* Hero Section */}
      <section className="relative w-full min-h-[85vh] flex flex-col lg:flex-row items-center justify-center lg:justify-between px-6 lg:px-16 overflow-hidden py-8 gap-8 lg:gap-0 max-w-[1600px] mx-auto">
        
        {/* Cinematic Title Behind Monolith (Centered on screen or behind elements) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
          <h1 className="font-cinema text-[9vw] md:text-[10vw] font-black leading-none tracking-tighter text-slate-900/5 dark:text-white/5 opacity-50 mix-blend-overlay blur-sm">
            IMAGESENSE
          </h1>
        </div>

        {/* LEFT SIDE: 3D Monolith Wrapper */}
        <div className="relative w-full lg:w-1/2 flex items-center justify-center lg:justify-center z-10 animate-float mb-6 lg:mb-0">
          
          {/* Inner Neural Network Glow */}
          <div className="absolute w-[250px] h-[350px] md:w-[380px] md:h-[480px] bg-fuchsia-600/40 blur-[70px] rounded-full animate-pulse-glow pointer-events-none"></div>
          
          {/* THE PORTRAIT (CLIPPED) */}
          <div 
            className="relative w-[250px] h-[320px] md:w-[350px] md:h-[450px] bg-slate-800 bg-cover bg-center bg-no-repeat drop-shadow-[0_0_40px_rgba(192,38,211,0.4)] transition-all duration-1000 ease-out z-10"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop')",
              clipPath: "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)"
            }}
          >
             {/* Strong Magenta Overlay for Theme Matching */}
             <div className="absolute inset-0 bg-fuchsia-600/30 mix-blend-color"></div>
             <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-900/80 via-transparent to-primary/40 mix-blend-multiply"></div>
             
             {/* Holographic Scanlines */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,11,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_4px,6px_100%] pointer-events-none"></div>

             {/* Tech Overlay Lines for AI look */}
             <div className="absolute top-[30%] left-0 w-full h-[1px] bg-fuchsia-400/30 shadow-[0_0_10px_rgba(232,121,249,0.8)]"></div>
             <div className="absolute top-[70%] left-0 w-full h-[1px] bg-fuchsia-400/30 shadow-[0_0_10px_rgba(232,121,249,0.8)]"></div>
             
             {/* Inner border effect */}
             <div className="absolute inset-0 border border-white/20 mix-blend-overlay z-30" style={{clipPath: "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)"}}></div>
          </div>

          {/* THE UI OVERLAY (UNCLIPPED) */}
          <div className="absolute w-[250px] h-[320px] md:w-[350px] md:h-[450px] pointer-events-none z-50">
             {analysisPoints.map((point, index) => (
                <div 
                  key={index} 
                  className="absolute"
                  style={{ top: point.top, left: point.left }}
                >
                  <div className={`relative flex items-center ${point.direction === 'left' ? 'flex-row-reverse -translate-x-full' : 'flex-row'}`}>
                    
                    {/* The Blinking Spot on Face */}
                    <div className={`relative flex items-center justify-center w-2 h-2 shrink-0 transition-opacity duration-300 ${showAnalysis ? 'opacity-100' : 'opacity-0'}`}
                         style={{ transitionDelay: showAnalysis ? `${point.delay}ms` : `${point.exitDelay + 200}ms` }}>
                      <div className="absolute w-full h-full bg-fuchsia-500 rounded-full animate-ping opacity-75"></div>
                      <div className="relative w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,0,255,1)]"></div>
                    </div>

                    {/* Connecting Line */}
                    <div className={`
                        h-[1px] bg-gradient-to-r from-fuchsia-500 via-fuchsia-400 to-transparent 
                        origin-${point.direction === 'left' ? 'right' : 'left'} 
                        transition-opacity duration-300
                        ${showAnalysis ? 'animate-[growLine_1s_ease-out_forwards]' : 'opacity-0'}
                      `}
                      style={{ 
                         width: showAnalysis ? undefined : '0px',
                         animationDelay: showAnalysis ? `${point.delay + 300}ms` : '0ms',
                         transitionDelay: showAnalysis ? '0ms' : `${point.exitDelay}ms`
                      }}
                    ></div>

                    {/* Text Label Container */}
                    <div className={`
                      flex flex-col 
                      bg-white/90 dark:bg-black/80 
                      backdrop-blur-md 
                      border-y border-fuchsia-600/30 dark:border-fuchsia-500/30
                      px-2 py-1.5 min-w-[150px] shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(0,0,0,0.5)] 
                      overflow-hidden
                      ${point.direction === 'left' ? 'border-r-2 border-l-0 border-r-fuchsia-600 dark:border-r-fuchsia-500 mr-[-10px]' : 'border-l-2 border-r-0 border-l-fuchsia-600 dark:border-l-fuchsia-500 ml-[-10px]'}
                      transition-all duration-300
                    `}
                    style={{
                       opacity: showAnalysis ? 1 : 0,
                       transform: showAnalysis ? 'translateY(0)' : 'translateY(10px)',
                       transitionDelay: showAnalysis ? `${point.delay + 800}ms` : `${point.exitDelay}ms`
                    }}
                    >
                      <span className="text-[9px] font-mono text-fuchsia-700 dark:text-fuchsia-300 font-bold tracking-wider mb-0.5 block whitespace-nowrap">
                         {point.label}
                      </span>
                      {/* SubLabel */}
                      <span className={`
                            text-[8px] font-mono text-slate-800 dark:text-white/80 overflow-hidden whitespace-nowrap block border-r-2 border-transparent w-0
                            ${showAnalysis ? 'animate-[typewriter_1s_steps(30)_forwards]' : 'opacity-0'}
                          `}
                            style={{ 
                              animationDelay: showAnalysis ? `${point.delay + 1000}ms` : '0ms' 
                            }}>
                         {point.subLabel}
                      </span>
                    </div>
                  </div>
                </div>
             ))}
          </div>
        </div>

        {/* RIGHT SIDE: Text & Action Area */}
        <div className="z-20 w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left pointer-events-auto pl-0 lg:pl-12">
          
          {/* Tag Line */}
          <p className="mb-5 font-mono text-xs md:text-sm text-fuchsia-700 dark:text-fuchsia-300 tracking-widest uppercase bg-white/40 dark:bg-black/40 backdrop-blur-sm px-5 py-1.5 rounded border border-fuchsia-500/20 shadow-[0_0_15px_rgba(192,38,211,0.2)]">
            Decrypting the Fabric of Reality
          </p>

           {/* Hero Headline */}
           <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-slate-900 dark:text-white leading-tight mb-5">
             Truth in a <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-primary-glow">Synthetic World</span>
           </h2>

          {/* Description */}
          <p className="text-slate-600 dark:text-white/70 text-base leading-relaxed mb-8 font-light max-w-lg">
            Decrypting the fabric of reality. NeuralVerify is an enterprise-grade forensic engine designed to expose the invisible mathematical fingerprints left by modern AI generation—restoring trust in a synthetic world.
          </p>
          
          {/* Action Buttons */}
          <input 
            type="file" 
            ref={imageInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*"
          />
          <input 
            type="file" 
            ref={videoInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="video/*"
          />
          
          <div className="flex flex-col sm:flex-row items-center gap-5 mt-2">
            
            {/* IMAGE BUTTON */}
            <button 
              onClick={handleImageUploadClick}
              className="group relative px-6 py-3 min-w-[160px] bg-fuchsia-900/20 hover:bg-fuchsia-800/30 border border-fuchsia-500/30 text-white font-mono uppercase tracking-widest text-[10px] font-bold transition-all duration-300 hover:shadow-[0_0_30px_rgba(192,38,211,0.3)] active:scale-95"
              style={{ clipPath: "polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)" }}
            >
               {/* Internal Glow Blob */}
               <div className="absolute inset-0 bg-fuchsia-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
               {/* Animated Scan Line */}
               <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-fuchsia-500/20 to-transparent skew-x-12 group-hover:left-[200%] transition-all duration-700 ease-in-out"></div>
               
               {/* Tech Corners */}
               <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-fuchsia-500 opacity-60"></div>
               <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-fuchsia-500 opacity-60"></div>
               
               <div className="relative flex items-center justify-center gap-2">
                 <span className="material-symbols-outlined text-fuchsia-300 group-hover:text-white transition-colors text-base">add_a_photo</span>
                 <span className="text-fuchsia-100 group-hover:text-white transition-colors">Analyze Image</span>
               </div>
            </button>

            {/* VIDEO BUTTON */}
            <button 
              onClick={handleVideoUploadClick}
              className="group relative px-6 py-3 min-w-[160px] bg-cyan-900/20 hover:bg-cyan-800/30 border border-cyan-500/30 text-white font-mono uppercase tracking-widest text-[10px] font-bold transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] active:scale-95"
              style={{ clipPath: "polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)" }}
            >
               {/* Internal Glow Blob */}
               <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
               {/* Animated Scan Line */}
               <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent skew-x-12 group-hover:left-[200%] transition-all duration-700 ease-in-out"></div>

               {/* Tech Corners */}
               <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-500 opacity-60"></div>
               <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-500 opacity-60"></div>

               <div className="relative flex items-center justify-center gap-2">
                 <span className="material-symbols-outlined text-cyan-300 group-hover:text-white transition-colors text-base">video_camera_front</span>
                 <span className="text-cyan-100 group-hover:text-white transition-colors">Analyze Video</span>
               </div>
            </button>

          </div>
        </div>
      </section>

      {/* Technical Deep Dive Section */}
      <section id="details" className="relative w-full max-w-6xl mx-auto px-6 py-16 z-20 scroll-mt-32">
         {/* ... (Existing Content) ... */}
         {/* Note: Shortened for brevity in diff, existing content remains same until Footer area */}
         <div className="mb-12">
            <span className="font-mono text-primary mb-2 block tracking-widest uppercase text-xs">System Architecture</span>
            <h3 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white mb-4">
              Forensics at the <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-primary-glow">Speed of Light</span>
            </h3>
            <p className="max-w-xl text-base text-slate-600 dark:text-white/60">
               Trained on 25,000+ samples. Validated against the Unseen. The mathematical divide between photon and pixel.
            </p>
         </div>
         {/* ... (Rest of tech cards) ... */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="group bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl p-6 backdrop-blur-md">
               <div className="flex items-center gap-4 mb-4">
                  <div className="size-10 rounded-lg bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-500">
                     <span className="material-symbols-outlined text-xl">neurology</span>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">The Neural Core</h4>
               </div>
               <div className="space-y-4">
                  <div className="border-l-2 border-fuchsia-500/30 pl-4">
                     <h5 className="font-mono text-xs text-fuchsia-500 mb-1">ARCHITECTURE</h5>
                     <p className="text-slate-700 dark:text-white/80 font-bold text-sm">Gemini 1.5 Flash (Multimodal Engine)</p>
                     <p className="text-xs text-slate-500 dark:text-white/50 mt-1">Utilizing multimodal zero-shot capabilities for comprehensive anomaly detection.</p>
                  </div>
               </div>
            </div>
             <div className="group bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl p-6 backdrop-blur-md">
               <div className="flex items-center gap-4 mb-4">
                  <div className="size-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                     <span className="material-symbols-outlined text-xl">dataset</span>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">The Data Spectrum</h4>
               </div>
               <div className="space-y-6">
                    <p className="text-xs text-slate-600 dark:text-white/70 mb-4">
                       Bridging the gap between Diffusion models and modern Flow Matching architectures (Flux.1-Dev).
                    </p>
               </div>
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-5">
               <div className="bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl p-5 hover:bg-white/60 dark:hover:bg-white/10 transition-colors">
                  <span className="material-symbols-outlined text-2xl text-primary mb-3">gradient</span>
                  <h5 className="font-bold text-base text-slate-900 dark:text-white mb-2">Neural X-Ray</h5>
                  <p className="text-xs text-slate-600 dark:text-white/60">
                     Real-time Gradient-weighted Class Activation Maps (GradCAM) visualize exactly which pixels triggered detection.
                  </p>
               </div>
               <div className="bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl p-5 hover:bg-white/60 dark:hover:bg-white/10 transition-colors">
                  <span className="material-symbols-outlined text-2xl text-primary mb-3">timelapse</span>
                  <h5 className="font-bold text-base text-slate-900 dark:text-white mb-2">Temporal Sentinel</h5>
                  <p className="text-xs text-slate-600 dark:text-white/60">
                     Frame-by-frame analysis engine constructs a temporal timeline to flag specific timestamps in video deepfakes.
                  </p>
               </div>
               <div className="bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl p-5 hover:bg-white/60 dark:hover:bg-white/10 transition-colors">
                  <span className="material-symbols-outlined text-2xl text-primary mb-3">security</span>
                  <h5 className="font-bold text-base text-slate-900 dark:text-white mb-2">Zero-Retention</h5>
                  <p className="text-xs text-slate-600 dark:text-white/60">
                     Client-Side Persistence Layer. Analysis history is stored in Local Storage/RAM. No central database storage of sensitive uploads.
                  </p>
               </div>
            </div>
         </div>
      </section>

      {/* --- NUCLEAR TOGGLE SECTION --- */}
      <div className="w-full max-w-6xl mx-auto px-6 pb-6 flex justify-center">
         <label className={`
            relative cursor-pointer flex items-center gap-4 px-5 py-2.5 rounded-full 
            border transition-all duration-500 group select-none
            ${isNuclearMode 
               ? 'bg-yellow-400/10 border-yellow-400/50 shadow-[0_0_30px_rgba(250,204,21,0.3)]' 
               : 'bg-white/5 border-white/10 hover:border-white/30'}
         `}>
            <input 
               type="checkbox" 
               className="sr-only" 
               checked={isNuclearMode}
               onChange={() => setNuclearMode(!isNuclearMode)}
            />
            <div className={`relative flex items-center justify-center size-8 rounded-full transition-all duration-500 ${isNuclearMode ? 'bg-yellow-500 text-black rotate-180 scale-110' : 'bg-slate-700 text-slate-400'}`}>
               <span className="material-symbols-outlined text-lg">local_fire_department</span>
            </div>
            <div className="flex flex-col">
               <span className={`font-cinema font-bold text-xs tracking-widest transition-colors duration-300 ${isNuclearMode ? 'text-yellow-400' : 'text-slate-500 dark:text-white/40'}`}>
                  GO NUCLEAR
               </span>
               <span className="text-[9px] font-mono text-slate-500 dark:text-white/30">
                  {isNuclearMode ? 'QUANTUM ACCELERATION ACTIVE' : 'STANDARD ANALYSIS PROTOCOL'}
               </span>
            </div>
            
            {/* Toggle Switch Visual */}
            <div className="relative w-10 h-5 rounded-full bg-slate-900/50 border border-white/10 ml-4 overflow-hidden">
               <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full shadow-md transition-all duration-300 ${isNuclearMode ? 'translate-x-5 bg-yellow-400' : 'translate-x-0 bg-slate-500'}`}></div>
            </div>
         </label>
      </div>


      {/* Footer */}
      <footer className="w-full mt-4 border-t border-black/5 dark:border-glass-border bg-white/80 dark:bg-black/40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-fuchsia-600 text-xs">copyright</span>
            <span className="text-slate-500 dark:text-white/40 text-xs font-mono">2024 ImageSense Systems. All Reality Reserved.</span>
          </div>
          <div className="flex gap-6">
            <a className="text-slate-500 dark:text-white/40 hover:text-fuchsia-500 text-xs font-mono transition-colors" href="#">Protocol</a>
            <a className="text-slate-500 dark:text-white/40 hover:text-fuchsia-500 text-xs font-mono transition-colors" href="#">Status</a>
            <a className="text-slate-500 dark:text-white/40 hover:text-fuchsia-500 text-xs font-mono transition-colors" href="#">Docs</a>
          </div>
        </div>
      </footer>
      
      {/* Animation Styles */}
      <style>{`
        @keyframes growLine {
          from { width: 0; }
          to { width: 100px; }
        }
        
        @keyframes typewriter {
          from { width: 0; border-right-color: rgba(232, 121, 249, 0.8); }
          to { width: 100%; border-right-color: transparent; }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes particle-drift {
           0% { transform: translateY(0) translateX(0); opacity: 0; }
           20% { opacity: 0.8; }
           80% { opacity: 0.8; }
           100% { transform: translateY(-150px) translateX(30px); opacity: 0; }
        }

        .animate-particle {
           animation-name: particle-drift;
           animation-timing-function: linear;
           animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  );
};
