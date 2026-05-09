import React, { useState } from 'react';
import { ViewState } from './types';
import { LandingPage } from './components/LandingPage';
import { DashboardPage } from './components/DashboardPage';
import { ThemeToggle } from './components/ThemeToggle';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.LANDING);
  const [analysisFile, setAnalysisFile] = useState<File | null>(null);
  const [isNuclearMode, setIsNuclearMode] = useState(false);

  const handleNewScan = () => {
    setAnalysisFile(null);
    setCurrentView(ViewState.LANDING);
  };

  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen w-full relative">
      {/* Navigation (Sticky) - z-index increased to 100 */}
      <nav className={`fixed top-0 left-0 w-full z-[100] px-6 py-4 border-b transition-colors duration-300 ${
        currentView === ViewState.LANDING 
          ? 'border-glass-border glass-panel dark:bg-black/20 bg-white/20 backdrop-blur-md' 
          : 'border-white/10 bg-surface-dark/80 backdrop-blur-md dark:bg-surface-dark/80 bg-white/90'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between relative">
          {/* Logo Section */}
          <div className="flex items-center gap-2 cursor-pointer z-50" onClick={handleNewScan}>
            <div className={`size-6 rounded-full flex items-center justify-center transition-colors ${currentView === ViewState.LANDING ? 'bg-primary/20 text-primary' : 'bg-primary text-white'}`}>
              <span className="material-symbols-outlined text-[16px]">all_inclusive</span>
            </div>
            <span className={`font-cinema font-bold text-lg tracking-widest ${currentView === ViewState.LANDING ? 'text-slate-900 dark:text-white/90' : 'text-slate-900 dark:text-white'}`}>IMAGESENSE</span>
          </div>

          {/* Center Navigation Links (Only on Landing) - Positioned Absolutely */}
          {currentView === ViewState.LANDING && (
            <div className="hidden md:flex items-center gap-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40">
              <a 
                className="text-xs font-mono uppercase tracking-widest text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-colors duration-300 cursor-pointer" 
                onClick={(e) => { e.preventDefault(); handleScrollTo('details'); }}
                href="#details"
              >
                About
              </a>
              <a className="text-xs font-mono uppercase tracking-widest text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-colors duration-300" href="#">Technology</a>
              <a className="text-xs font-mono uppercase tracking-widest text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-colors duration-300" href="#">Access</a>
            </div>
          )}

          {/* Right Side Actions & Navigation */}
          <div className="flex items-center gap-4 z-50">
            <div className="flex items-center gap-3">
              <ThemeToggle />
              
              {currentView === ViewState.LANDING ? (
                <button 
                  onClick={() => setCurrentView(ViewState.DASHBOARD)}
                  className="flex items-center gap-2 px-4 py-2 rounded bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 hover:border-primary/50 transition-all duration-300 group"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary group-hover:text-slate-900 dark:group-hover:text-white transition-colors">fingerprint</span>
                  <span className="text-xs font-mono uppercase font-bold text-slate-700 dark:text-white/80 group-hover:text-slate-900 dark:group-hover:text-white">Login</span>
                </button>
              ) : (
                <div className="hidden md:flex gap-3">
                  <button className="group flex items-center gap-2 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 transition hover:bg-black/5 dark:hover:bg-white/10">
                    <span className="material-symbols-outlined text-slate-500 dark:text-white/70 text-[18px]">settings</span>
                    <span className="text-xs font-bold tracking-wide text-slate-700 dark:text-white">CONFIG</span>
                  </button>
                  <button 
                    onClick={handleNewScan}
                    className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 shadow-[0_0_15px_rgba(124,59,237,0.4)] transition hover:bg-primary-glow text-white"
                  >
                    <span className="text-xs font-bold tracking-wide">NEW SCAN</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Render */}
      <main className="flex flex-col min-h-screen">
        {currentView === ViewState.LANDING ? (
          <LandingPage 
            onNavigate={setCurrentView} 
            onFileSelect={setAnalysisFile} 
            isNuclearMode={isNuclearMode}
            setNuclearMode={setIsNuclearMode}
          />
        ) : (
          <div className="pt-20 lg:pt-24 flex-1 flex flex-col bg-background-light dark:bg-background-dark min-h-screen transition-colors duration-300">
             {/* Dashboard Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-danger/5 via-background-light dark:via-background-dark/90 to-background-light dark:to-background-dark"></div>
              <div className="absolute inset-0 bg-grid-pattern bg-[size:40px_40px] opacity-[0.03] dark:opacity-[0.07]"></div>
            </div>
            
            <div className="relative z-10 flex h-full grow flex-col">
              <DashboardPage analysisFile={analysisFile} isNuclearMode={isNuclearMode} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;