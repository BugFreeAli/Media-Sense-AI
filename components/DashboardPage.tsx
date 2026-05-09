import React, { useState, useEffect, useRef } from 'react';
import { TerminalLog, NormalizedAnalysisResult } from '../types';
import { jsPDF } from 'jspdf';
import { ForensicAgentClient } from '../forensicAgentClient';

interface DashboardPageProps {
  analysisFile?: File | null;
  isNuclearMode: boolean;
}



export const DashboardPage: React.FC<DashboardPageProps> = ({ analysisFile, isNuclearMode }) => {
  const [wireframe, setWireframe] = useState(true);
  const [heatmap, setHeatmap] = useState(false);
  const [logs, setLogs] = useState<TerminalLog[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [apiResult, setApiResult] = useState<NormalizedAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  
  // Nuclear Mode State
  const [nuclearStep, setNuclearStep] = useState(0);

  // Handle File Input & Real API Call
  useEffect(() => {
    let initialLogs: TerminalLog[] = [];

    if (analysisFile) {
        // Reset State
        setIsScanning(true);
        setWireframe(true); 
        setHeatmap(false);
        setApiResult(null);
        setError(null);
        setNuclearStep(0); // Reset nuclear step

        const url = URL.createObjectURL(analysisFile);
        setMediaUrl(url);
        
        const isVideoFile = analysisFile.type.startsWith('video/');
        setIsVideo(isVideoFile);

        // Initial Logs
        initialLogs = [
            { id: '1', timestamp: new Date().toLocaleTimeString(), message: `> Uploading: ${analysisFile.name}`, type: 'info', highlight: true },
            { id: '2', timestamp: new Date().toLocaleTimeString(), message: `> File Size: ${(analysisFile.size / 1024 / 1024).toFixed(2)} MB`, type: 'info' },
            { id: '3', timestamp: new Date().toLocaleTimeString(), message: '> Establishing secure handshake...', type: 'info' },
            { id: '4', timestamp: new Date().toLocaleTimeString(), message: '> Connecting to Neural Engine...', type: 'warning', highlight: true },
        ];
        
        setLogs(initialLogs);

        const performAnalysis = async () => {
            // Increase total duration for Nuclear mode to 12 seconds (3s per step * 4)
            const minScanTime = isNuclearMode ? 12000 : 1000;
            const startTime = Date.now();
            let nuclearInterval: ReturnType<typeof setInterval> | null = null;

            if (isNuclearMode) {
               let step = 1;
               setNuclearStep(1);
               // Each step approx 3s
               nuclearInterval = setInterval(() => {
                  step++;
                  if(step <= 4) setNuclearStep(step);
               }, 3000);
            }

            try {
                setLogs(prev => [...prev, { id: '5', timestamp: new Date().toLocaleTimeString(), message: `> Sending media to Forensic Agent...`, type: 'info' }]);

                const normalizedData = await ForensicAgentClient.analyzeImage(analysisFile);

                setLogs(prev => [
                    ...prev, 
                    { id: '6', timestamp: new Date().toLocaleTimeString(), message: '> Agent response received. Processing...', type: 'info' },
                    { id: '7', timestamp: new Date().toLocaleTimeString(), message: `> Analysis Complete: ${normalizedData.prediction} DETECTED (${normalizedData.confidence}%)`, type: normalizedData.prediction.toLowerCase() === 'ai' ? 'error' : 'success', highlight: true },
                    { id: '8', timestamp: new Date().toLocaleTimeString(), message: `> Report: ${normalizedData.details.forensic_report}`, type: 'info' }
                ]);

                // Wait for animation to finish if needed
                const elapsed = Date.now() - startTime;
                const remaining = minScanTime - elapsed;
                
                if (remaining > 0) {
                    await new Promise(r => setTimeout(r, remaining));
                }

                if (nuclearInterval) clearInterval(nuclearInterval);
                setNuclearStep(0);
                setApiResult(normalizedData);
                setIsScanning(false);

            } catch (err: any) {
                console.error(err);
                if (nuclearInterval) clearInterval(nuclearInterval);
                setNuclearStep(0);
                const errorMessage = err instanceof Error ? err.message : 'Unknown Network Error';
                setLogs(prev => [...prev, { id: 'err', timestamp: new Date().toLocaleTimeString(), message: `> Error: ${errorMessage}`, type: 'error' }]);
                setLogs(prev => [...prev, { id: 'err2', timestamp: new Date().toLocaleTimeString(), message: `> Detection Failed. Check logs above.`, type: 'error' }]);
                setError(errorMessage);
                setIsScanning(false); 
            }
        };

        const timer = setTimeout(() => performAnalysis(), 1000);

        return () => {
            URL.revokeObjectURL(url);
            clearTimeout(timer);
        };
    } else {
        setIsScanning(false);
        setMediaUrl(null); 
        setIsVideo(false);
        setLogs([]);
        setApiResult(null);
    }
  }, [analysisFile]);

  // Auto-scroll logs
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Demo URL
  const demoUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuDcUaanxbwRTjym7yyhDNS9dXeRjfhYU0nDGiSkQPI3o5_y9J402OHcCtsTBScg3y6804f5nE5_J6rBOHHf2NQkZ2jnWJE2e_fRqiHFEE0RcMGgd0awJD6gElV7leoUTjp1diFzBFBDy1a10IYJ8mYZZGQ7hdB_5HAoKxf3Bjf4hsTT6dba9Tn9Ks6xzb7Pd4ovrp0v8pd55i1w5KMKXuq0M-6PAF5PgJ3aN18LGzVClFvw2CmxuNwFxob4HQLZufpBDdV-m9CqEBc";

  // Determine Verdict Colors
  const isAi = apiResult?.prediction?.toLowerCase() === 'ai';
  const verdictColor = isAi ? 'text-danger' : 'text-success';
  const verdictBg = isAi ? 'bg-danger/10' : 'bg-success/10';
  const verdictBorder = isAi ? 'border-danger/20' : 'border-success/20';

  const handleDownloadPDF = () => {
    if (!apiResult) return;
    try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        doc.setTextColor(40, 40, 40);
        doc.text("IMAGESENSE", margin, 30);
        
        doc.setFontSize(10);
        doc.setFont("courier", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text(`SESSION ID: IS-902-ALPHA`, margin, 40);
        doc.text(`DATE: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, margin, 45);
        
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, 50, pageWidth - margin, 50);

        const isAi = apiResult.prediction.toLowerCase() === 'ai';
        const stampColor = isAi ? [220, 53, 69] : [40, 167, 69]; 

        const imgData = apiResult.heatmap_base64; 
        
        let imgHeight = 0;
        let imgY = 60;

        if (imgData && imgData.startsWith("data:image")) {
            const imgProps = doc.getImageProperties(imgData);
            imgHeight = (imgProps.height * (pageWidth - 2 * margin)) / imgProps.width;
            if (imgHeight > 120) imgHeight = 120;
            
            doc.addImage(imgData, 'JPEG', margin, imgY, pageWidth - 2 * margin, imgHeight);
            
            doc.setDrawColor(stampColor[0], stampColor[1], stampColor[2]);
            doc.setLineWidth(2);
            doc.setTextColor(stampColor[0], stampColor[1], stampColor[2]);
            
            const stampW = 60;
            const stampH = 20;
            const stampX = pageWidth - margin - stampW - 10;
            const stampYPos = imgY + 10;
            
            doc.setDrawColor(stampColor[0], stampColor[1], stampColor[2]);
            doc.roundedRect(stampX, stampYPos, stampW, stampH, 2, 2, 'S'); 
            
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.text(isAi ? "FAKE" : "ORIGINAL", stampX + stampW/2, stampYPos + 13, { align: "center" });
            
            doc.setFontSize(6);
            doc.text("VERIFIED BY IMAGESENSE", stampX + stampW/2, stampYPos + 17, { align: "center" });
        }

        const startY = imgY + imgHeight + 20;
        let currentY = startY;
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text("FORENSIC ANALYSIS REPORT", margin, currentY);
        
        currentY += 10;
        doc.setFont("courier", "normal");
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        
        const details = [
            `FILE NAME: ${analysisFile ? analysisFile.name : 'Unknown'}`,
            `PREDICTION VERDICT: ${apiResult.prediction.toUpperCase()}`,
            `CONFIDENCE SCORE: ${apiResult.confidence}%`,
            `AI PROBABILITY MAP: ${(apiResult.probabilities.ai * 100).toFixed(2)}%`,
            `REAL PROBABILITY MAP: ${(apiResult.probabilities.real * 100).toFixed(2)}%`,
            `MODEL ARCHITECTURE: Gemini 1.5 Flash Multimodal`,
            `DETECTION ENGINE: NeuralVerify v2.0`
        ];

        details.forEach((line) => {
            doc.text(line, margin, currentY);
            currentY += 7;
        });

        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("Generated by ImageSense Forensic Engine. This report is computer-generated and immutable.", margin, 280);

        doc.save("ImageSense_Report.pdf");
        setLogs(prev => [...prev, { id: 'pdf', timestamp: new Date().toLocaleTimeString(), message: '> Report generated and downloaded.', type: 'success' }]);

    } catch (err) {
        console.error("PDF Generation Error:", err);
        setLogs(prev => [...prev, { id: 'pdf-err', timestamp: new Date().toLocaleTimeString(), message: '> PDF Generation Failed.', type: 'error' }]);
    }
  };

  const radius = 85;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = apiResult ? circumference - (apiResult.confidence / 100) * circumference : 0;

  return (
    <>
    {/* NUCLEAR MODE FULLSCREEN OVERLAY */}
    {isScanning && isNuclearMode && (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/90 backdrop-blur-2xl overflow-hidden animate-[fadeIn_0.5s_ease-out]">
        
        {/* --- STEP 1: QUANTUM COMPUTERS --- */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ease-in-out ${nuclearStep === 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2000')] bg-cover bg-center opacity-40 mix-blend-screen scale-110 animate-[pulse-slow_4s_infinite]"></div>
             <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black"></div>
             
             <div className="relative z-10 flex flex-col items-center">
                 {/* Icon */}
                 <div className="size-40 border-2 border-cyan-500/20 rounded-full flex items-center justify-center animate-[spin_4s_linear_infinite] shadow-[0_0_30px_rgba(6,182,212,0.2)] bg-black/40 backdrop-blur-sm">
                    <div className="size-32 border border-cyan-400/40 rounded-full animate-[spin_3s_linear_infinite_reverse]"></div>
                    <span className="material-symbols-outlined text-6xl text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">memory</span>
                 </div>
                 
                 {/* HUD Text Box */}
                 <div className="mt-12 bg-black/80 border-x-2 border-cyan-500/50 py-6 px-10 relative overflow-hidden group backdrop-blur-md">
                    <div className="absolute inset-0 bg-cyan-900/10"></div>
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan-500/50"></div>
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-cyan-500/50"></div>
                    
                    <div className="relative z-10 flex flex-col items-center">
                        <h2 className="font-mono text-2xl md:text-4xl text-white font-bold tracking-[0.1em] text-center drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
                           SWITCHING TO<br/>QUANTUM COMPUTERS
                        </h2>
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent my-4 opacity-50"></div>
                        <p className="font-mono text-cyan-300 text-xs tracking-[0.3em] uppercase">
                           // Decrypting Qubit State...
                        </p>
                    </div>
                 </div>
             </div>
        </div>

        {/* --- STEP 2: NASA SERVERS --- */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ease-in-out ${nuclearStep === 2 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000')] bg-cover bg-center opacity-50 mix-blend-screen scale-105"></div>
             <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/LHTJ2C19c5H9q/giphy.gif')] opacity-10 bg-repeat mix-blend-overlay"></div>
             <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80"></div>
             
             <div className="relative z-10 flex flex-col items-center">
                 <div className="size-40 border border-blue-500/30 bg-black/60 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.3)] backdrop-blur-md">
                    <span className="material-symbols-outlined text-7xl text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-pulse">dns</span>
                 </div>
                 
                 <div className="mt-12 bg-black/80 border-y-2 border-blue-500/50 py-6 px-10 relative backdrop-blur-md">
                     <div className="absolute inset-0 bg-blue-900/10"></div>
                     <h2 className="relative z-10 font-mono text-2xl md:text-4xl text-white font-bold tracking-[0.1em] text-center drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]">
                        CONNECTING TO<br/>NASA SERVERS
                     </h2>
                     <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent my-4 opacity-50"></div>
                     <p className="relative z-10 font-mono text-blue-300 text-xs tracking-[0.3em] uppercase text-center">
                        // Handshake Protocol: SECURE
                     </p>
                 </div>
             </div>
        </div>

        {/* --- STEP 3: ELON MUSK --- */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ease-in-out ${nuclearStep === 3 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
             {/* Dramatic Portrait - Positioned to show face properly */}
             <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Elon_Musk_Royal_Society_%28crop2%29.jpg/1200px-Elon_Musk_Royal_Society_%28crop2%29.jpg')] bg-cover opacity-40 grayscale contrast-125" style={{ backgroundPosition: "center 25%" }}></div>
             <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black"></div>
             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
             
             {/* Tech HUD Overlay */}
             <div className="absolute inset-0 border-[20px] border-white/5 pointer-events-none"></div>
             <div className="absolute top-10 right-10 flex flex-col items-end">
                <div className="h-2 w-32 bg-red-500 animate-pulse mb-2"></div>
                <span className="font-mono text-red-500 text-xs tracking-[0.3em]">PRIORITY CHANNEL ALPHA</span>
             </div>

             <div className="relative z-10 flex flex-col items-center">
                 <div className="size-32 bg-white text-black rounded-full flex items-center justify-center font-display font-black text-6xl mb-8 shadow-[0_0_50px_rgba(255,255,255,0.6)]">
                    X
                 </div>
                 
                 <div className="bg-transparent border-y-2 border-red-500/50 py-8 px-12 backdrop-blur-sm relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-black font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                        CONFIDENTIAL
                    </div>
                    <h2 className="font-mono text-2xl md:text-4xl text-white font-bold tracking-[0.1em] text-center drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] leading-tight">
                        CALLING ELON MUSK<br/>FOR PERSONAL OPINION
                    </h2>
                 </div>

                 <div className="mt-8 flex gap-3 items-center bg-black/50 px-4 py-2 rounded-full border border-white/10">
                    <span className="size-3 bg-red-500 rounded-full animate-ping"></span>
                    <span className="font-mono text-white/90 text-xs tracking-widest">ENCRYPTED UPLINK ESTABLISHED</span>
                 </div>
             </div>
        </div>

        {/* --- STEP 4: SATELLITE --- */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ease-in-out ${nuclearStep === 4 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?q=80&w=2000')] bg-cover bg-center opacity-60 mix-blend-screen animate-[pan-slow_10s_linear_infinite]"></div>
             <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
             <div className="absolute inset-0 bg-black/60 radial-gradient(circle at center, transparent 0%, black 100%)"></div>
             
             {/* Target Reticle */}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="size-[500px] border border-green-500/30 rounded-full flex items-center justify-center animate-[spin_10s_linear_infinite]">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-green-500 shadow-[0_0_20px_#22c55e]"></div>
                 </div>
                 <div className="absolute size-[300px] border-2 border-green-500/60 rounded-full border-dashed animate-[spin_5s_linear_infinite_reverse]"></div>
             </div>

             <div className="relative z-10 flex flex-col items-center">
                 <span className="material-symbols-outlined text-8xl text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,1)] animate-bounce">satellite_alt</span>
                 
                 <div className="mt-12 bg-black/80 border border-green-500/50 py-6 px-10 relative">
                     {/* Corner Brackets */}
                     <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-green-500"></div>
                     <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-green-500"></div>
                     <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-green-500"></div>
                     <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-green-500"></div>

                     <h2 className="font-mono text-2xl md:text-4xl text-white font-bold tracking-[0.1em] text-center drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]">
                        WAITING FOR<br/>SATELLITE PREVIEW
                     </h2>
                 </div>
                 
                 <p className="mt-6 font-mono text-green-400/80 tracking-widest text-xs font-bold bg-green-900/40 border border-green-500/20 px-6 py-2 rounded">
                    COORDINATES LOCKED: 34.0522° N, 118.2437° W
                 </p>
             </div>
        </div>
      </div>
    )}

    {/* MAIN CONTENT - BLURRED WHEN NUCLEAR SCANNING */}
    <div className={`flex-1 px-4 py-8 lg:px-20 xl:px-40 animate-[fadeIn_0.5s_ease-out] transition-all duration-700 ${isScanning && isNuclearMode ? 'filter blur-2xl opacity-20 scale-95 pointer-events-none' : ''}`}>
      {/* Page Heading */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 dark:text-white lg:text-5xl">Forensic Scanner</h1>
          <p className="mt-2 text-lg text-slate-500 dark:text-[#a79db9]">Session ID: <span className="font-mono text-primary">IS-902-ALPHA</span></p>
        </div>
        {!isScanning && !error && apiResult && isAi && (
          <div className="flex items-center gap-4 rounded-full border border-danger/30 bg-danger/10 px-4 py-1 backdrop-blur-sm shadow-sm animate-[fadeIn_0.5s_ease-out]">
            <span className="material-symbols-outlined text-danger animate-pulse">warning</span>
            <span className="font-mono text-sm font-bold text-danger">ANOMALY DETECTED</span>
          </div>
        )}
        {error && (
            <div className="flex items-center gap-4 rounded-full border border-danger/30 bg-danger/10 px-4 py-1 backdrop-blur-sm shadow-sm animate-[fadeIn_0.5s_ease-out]">
                <span className="material-symbols-outlined text-danger">error</span>
                <span className="font-mono text-sm font-bold text-danger">SYSTEM FAILURE</span>
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        
        {/* Left Column: Scanner Visualization (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Scanner Card */}
          <div className="group relative overflow-hidden rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-surface-dark shadow-[0_0_30px_rgba(0,0,0,0.1)] dark:shadow-[0_0_30px_rgba(0,0,0,0.3)]">
            
            {/* Top Bar of Scanner */}
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 bg-slate-50 dark:bg-white/5 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 dark:text-white/40 text-sm">{isVideo ? 'videocam' : 'image'}</span>
                <span className="font-mono text-xs text-slate-500 dark:text-white/60 truncate max-w-[200px]">{analysisFile ? analysisFile.name : 'subject_004.png'}</span>
              </div>
              <div className="flex gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${isScanning ? 'bg-primary animate-pulse' : error ? 'bg-danger' : 'bg-slate-300 dark:bg-white/20'}`}></span>
                <span className={`h-1.5 w-1.5 rounded-full ${isScanning ? 'bg-primary animate-pulse delay-100' : error ? 'bg-danger' : 'bg-slate-300 dark:bg-white/20'}`}></span>
                <span className={`h-1.5 w-1.5 rounded-full ${isScanning ? 'bg-primary animate-pulse delay-200' : error ? 'bg-danger' : 'bg-slate-300 dark:bg-white/20'}`}></span>
              </div>
            </div>

            {/* Image Container */}
            <div className="relative aspect-video w-full bg-[#050505] overflow-hidden">
              {/* Background Image / Video */}
              {isVideo ? (
                 <video 
                    src={mediaUrl || ''} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    className={`absolute inset-0 h-full w-full object-contain opacity-80 transition-all duration-700`}
                    style={{
                        filter: heatmap ? "grayscale(100%) contrast(120%)" : "grayscale(0%)"
                    }}
                 />
              ) : (
                <div 
                    className={`absolute inset-0 bg-contain bg-no-repeat bg-center opacity-80 transition-all duration-700`}
                    style={{ 
                        backgroundImage: `url('${mediaUrl || demoUrl}')`,
                        filter: heatmap ? "grayscale(100%) contrast(120%)" : "grayscale(0%)"
                    }}
                ></div>
              )}

              {/* Heatmap Overlay */}
              {heatmap && apiResult?.heatmap_base64 && !isScanning ? (
                <img 
                    src={apiResult.heatmap_base64} 
                    alt="Heatmap" 
                    className="absolute inset-0 w-full h-full object-contain mix-blend-screen opacity-80"
                />
              ) : (
                 <div className={`absolute inset-0 bg-gradient-to-tr from-danger/40 via-transparent to-primary/20 mix-blend-overlay transition-opacity duration-500 ${heatmap && !isScanning ? 'opacity-100' : 'opacity-0'}`}></div>
              )}

              {/* Overlays */}
              <div className={`absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay`}></div>
              <div className={`absolute inset-0 bg-grid-pattern bg-[size:20px_20px] transition-opacity duration-300 ${wireframe ? 'opacity-20' : 'opacity-0'}`}></div>

              {/* Standard Scanning Effect (Hidden in Nuclear Mode because overlay takes over) */}
              {isScanning && !isNuclearMode && (
                <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-primary shadow-[0_0_20px_3px_rgba(124,59,237,0.8),0_0_10px_1px_rgba(255,255,255,0.8)] animate-[scan_3s_ease-in-out_infinite] z-20">
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary/30 to-transparent"></div>
                  <div className="absolute -top-1 left-4 flex gap-1">
                    <span className="h-3 w-0.5 bg-white"></span>
                    <span className="font-mono text-[10px] text-white bg-primary px-1">SCANNING...</span>
                  </div>
                  <div className="absolute -top-1 right-4">
                    <span className="h-3 w-0.5 bg-white"></span>
                  </div>
                </div>
              )}
              
              {/* Detection Box */}
              {!isScanning && !error && apiResult && (
                <div className="absolute top-[20%] left-[40%] h-[40%] w-[25%] border border-primary/50 shadow-[0_0_15px_rgba(124,59,237,0.2)] animate-[fadeIn_0.5s_ease-out]">
                  <div className="absolute -top-3 left-0 bg-primary/20 px-1 py-0.5 backdrop-blur-sm">
                    <p className="font-mono text-[10px] text-primary-glow">CONF: {apiResult.confidence}%</p>
                  </div>
                  <div className="absolute -left-px -top-px h-2 w-2 border-l-2 border-t-2 border-primary"></div>
                  <div className="absolute -right-px -top-px h-2 w-2 border-r-2 border-t-2 border-primary"></div>
                  <div className="absolute -bottom-px -left-px h-2 w-2 border-b-2 border-l-2 border-primary"></div>
                  <div className="absolute -bottom-px -right-px h-2 w-2 border-b-2 border-r-2 border-primary"></div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between border-t border-black/5 dark:border-white/10 bg-slate-50 dark:bg-surface-dark px-6 py-4 min-h-[64px]">
              {isScanning ? (
                 <div className="w-full flex items-center gap-4">
                    <div className="flex-1 h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-primary animate-[loading_4.5s_ease-in-out_forwards] w-0"></div>
                    </div>
                    <span className="font-mono text-xs font-bold text-primary animate-pulse">ANALYZING FRAMES...</span>
                 </div>
              ) : error ? (
                 <div className="flex items-center gap-2 text-danger animate-[fadeIn_0.5s_ease-out]">
                    <span className="material-symbols-outlined text-sm">error</span>
                    <span className="text-xs font-bold tracking-wider">SCAN FAILED</span>
                 </div>
              ) : (
                <>
                  <div className="flex gap-4 animate-[fadeIn_0.5s_ease-out]">
                    <label className="flex cursor-pointer items-center gap-3 group/toggle select-none">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          className="peer sr-only" 
                          checked={wireframe}
                          onChange={() => setWireframe(!wireframe)}
                        />
                        <div className="h-6 w-11 rounded-full bg-slate-300 dark:bg-white/10 peer-focus:outline-none peer-checked:bg-primary/50 transition-colors"></div>
                        <div className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-all shadow-sm ${wireframe ? 'translate-x-5 bg-primary-glow' : ''}`}></div>
                      </div>
                      <span className="text-sm font-medium text-slate-600 dark:text-white/80 group-hover/toggle:text-slate-900 dark:group-hover/toggle:text-white">Wireframe</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-3 group/toggle select-none">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          className="peer sr-only"
                          checked={heatmap}
                          onChange={() => setHeatmap(!heatmap)}
                        />
                        <div className="h-6 w-11 rounded-full bg-slate-300 dark:bg-white/10 peer-focus:outline-none peer-checked:bg-danger/50 transition-colors"></div>
                        <div className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-all shadow-sm ${heatmap ? 'translate-x-5 bg-danger' : ''}`}></div>
                      </div>
                      <span className="text-sm font-medium text-slate-600 dark:text-white/80 group-hover/toggle:text-slate-900 dark:group-hover/toggle:text-white">Heatmap</span>
                    </label>
                  </div>
                  <div className="flex items-center gap-2 text-success animate-[fadeIn_0.5s_ease-out]">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    <span className="text-xs font-bold tracking-wider">SCAN COMPLETE</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Metrics */}
          {!isScanning && !error && apiResult && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 animate-[fadeInUp_0.5s_ease-out_0.2s] opacity-0 fill-mode-forwards">
              <div className="flex flex-col gap-1 rounded-lg border border-black/5 dark:border-white/5 bg-white dark:bg-white/5 p-4 backdrop-blur-sm shadow-sm">
                <span className="font-mono text-xs text-slate-500 dark:text-white/40">ARCHITECTURE</span>
                <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">Gemini 1.5 Flash</span>
              </div>
              <div className="flex flex-col gap-1 rounded-lg border border-black/5 dark:border-white/5 bg-white dark:bg-white/5 p-4 backdrop-blur-sm shadow-sm">
                <span className="font-mono text-xs text-slate-500 dark:text-white/40">REAL PROBABILITY</span>
                <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">{(apiResult.probabilities.real * 100).toFixed(1)}%</span>
              </div>
              <div className="flex flex-col gap-1 rounded-lg border border-black/5 dark:border-white/5 bg-white dark:bg-white/5 p-4 backdrop-blur-sm shadow-sm">
                <span className="font-mono text-xs text-slate-500 dark:text-white/40">RESOLUTION</span>
                <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">1024x1024 px</span>
              </div>
              <div className="flex flex-col gap-1 rounded-lg border border-black/5 dark:border-white/5 bg-white dark:bg-white/5 p-4 backdrop-blur-sm shadow-sm">
                <span className="font-mono text-xs text-slate-500 dark:text-white/40">INFERENCE</span>
                <span className="font-mono text-sm font-bold text-success">42ms</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Verdict */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {(isScanning || error || !apiResult) && (
            <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-black/5 dark:border-white/10 bg-[#f0f0f0] dark:bg-[#050505] font-mono text-xs shadow-inner h-full min-h-[400px] animate-[fadeIn_0.5s_ease-out]">
              <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3">
                <span className="font-bold text-slate-500 dark:text-white/50">SYSTEM LOG</span>
                <div className="flex gap-1">
                  <div className="h-2 w-2 rounded-full bg-red-500/20"></div>
                  <div className="h-2 w-2 rounded-full bg-yellow-500/20"></div>
                  <div className="h-2 w-2 rounded-full bg-green-500/20"></div>
                </div>
              </div>
              <div ref={scrollRef} className="terminal-scroll flex flex-1 flex-col gap-2 overflow-y-auto p-4 text-slate-700 dark:text-white/70">
                {logs.map((log) => (
                  <div key={log.id} className="flex gap-2">
                    <span className="text-slate-400 dark:text-white/30 shrink-0">{log.timestamp}</span>
                    <span className={`${
                      log.type === 'error' ? 'text-danger font-bold' : 
                      log.type === 'success' ? 'text-success font-bold' :
                      log.highlight ? 'text-primary dark:text-primary-glow' : 
                      log.type === 'warning' ? 'text-yellow-600 dark:text-white' : ''
                    }`}>
                      {log.type === 'warning' && <span className="bg-yellow-500/10 dark:bg-white/10 px-1 mr-1">WARNING</span>}
                      {log.message}
                    </span>
                  </div>
                ))}
                <div className="flex gap-2">
                  <span className="text-slate-400 dark:text-white/30">{new Date().toLocaleTimeString()}</span>
                  <span className="animate-pulse">_</span>
                </div>
              </div>
            </div>
          )}

          {!isScanning && !error && apiResult && (
            <>
              <div className={`relative overflow-hidden rounded-xl border ${verdictBorder} bg-white/90 dark:bg-surface-dark/90 p-8 shadow-lg backdrop-blur-xl animate-[fadeInUp_0.5s_ease-out]`}>
                <div className={`absolute -right-20 -top-20 h-64 w-64 rounded-full ${isAi ? 'bg-danger/5 dark:bg-danger/10' : 'bg-success/5 dark:bg-success/10'} blur-[80px]`}></div>
                
                <div className="relative z-10 flex flex-col gap-8">
                  <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
                    <h3 className="text-sm font-bold tracking-widest text-slate-500 dark:text-white/60 uppercase">Verdict Analysis</h3>
                    <span className={`material-symbols-outlined text-xl ${verdictColor}`}>{isAi ? 'gpp_bad' : 'verified_user'}</span>
                  </div>

                  <div className="flex justify-center py-4">
                    <div className="relative flex items-center justify-center">
                       <div className={`absolute inset-0 rounded-full blur-[40px] opacity-20 ${isAi ? 'bg-danger' : 'bg-success'} animate-[pulse_3s_ease-in-out_infinite]`}></div>
                       
                       <svg className="w-56 h-56 transform -rotate-90" viewBox="0 0 200 200">
                          <circle
                            cx="100" cy="100" r={85}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="10"
                            className="text-slate-200 dark:text-white/5"
                          />
                          <circle
                            cx="100" cy="100" r={85}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 85} 
                            strokeDashoffset={apiResult ? 2 * Math.PI * 85 - (apiResult.confidence / 100) * 2 * Math.PI * 85 : 0}
                            className={`transition-all duration-1000 ease-out ${isAi ? 'text-danger' : 'text-success'} ${isAi ? 'animate-neon-red' : 'animate-neon-green'}`}
                          />
                       </svg>
                       
                       <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white drop-shadow-sm">
                            {apiResult.confidence}<span className="text-2xl align-top">%</span>
                          </span>
                          <span className={`text-xs font-bold uppercase tracking-[0.2em] mt-2 ${verdictColor}`}>
                            {isAi ? 'FAKE' : 'REAL'}
                          </span>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className={`flex flex-col items-center rounded-lg border ${verdictBorder} ${verdictBg} p-3 text-center`}>
                        <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-white/50 mb-1">Classification</span>
                        <span className={`font-mono text-sm font-bold ${verdictColor}`}>{apiResult.prediction.toUpperCase()}</span>
                     </div>
                     <div className={`flex flex-col items-center rounded-lg border border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5 p-3 text-center`}>
                        <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-white/50 mb-1">Model Conf.</span>
                        <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">HIGH</span>
                     </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-surface-dark p-4 shadow-sm animate-[fadeInUp_0.5s_ease-out_0.1s] opacity-0 fill-mode-forwards">
                <p className="mb-3 text-xs font-bold uppercase text-slate-500 dark:text-white/40">Export Options</p>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={handleDownloadPDF}
                    className="flex w-full items-center justify-between rounded-lg bg-black/5 dark:bg-white/5 px-4 py-3 text-sm font-medium text-slate-900 dark:text-white transition hover:bg-black/10 dark:hover:bg-white/10 group">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary text-xl">description</span>
                      <span>Download PDF Report</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 dark:text-white/30 text-lg group-hover:translate-y-1 transition-transform">download</span>
                  </button>
                  <button className="flex w-full items-center justify-between rounded-lg bg-black/5 dark:bg-white/5 px-4 py-3 text-sm font-medium text-slate-900 dark:text-white transition hover:bg-black/10 dark:hover:bg-white/10 group">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary text-xl">code</span>
                      <span>Export Metadata JSON</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 dark:text-white/30 text-lg group-hover:translate-y-1 transition-transform">download</span>
                  </button>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
      <style>{`
        @keyframes scan {
          0%, 100% { top: 10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          50% { top: 90%; }
        }
        @keyframes loading {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes neon-red {
            0%, 100% { filter: drop-shadow(0 0 2px #ef4444) opacity(0.8); }
            50% { filter: drop-shadow(0 0 8px #ef4444) opacity(1); }
        }
        @keyframes neon-green {
            0%, 100% { filter: drop-shadow(0 0 2px #10b981) opacity(0.8); }
            50% { filter: drop-shadow(0 0 8px #10b981) opacity(1); }
        }
        @keyframes pulse-slow {
           0%, 100% { transform: scale(1.1); opacity: 0.4; }
           50% { transform: scale(1.15); opacity: 0.6; }
        }
        @keyframes pan-slow {
           0% { background-position: 0% 0%; }
           100% { background-position: 100% 100%; }
        }
        .animate-neon-red {
            animation: neon-red 2s ease-in-out infinite;
        }
        .animate-neon-green {
            animation: neon-green 2s ease-in-out infinite;
        }
        .fill-mode-forwards {
            animation-fill-mode: forwards;
        }
      `}</style>
    </div>
    </>
  );
};