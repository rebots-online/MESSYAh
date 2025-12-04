
/**
 * @license
 * Copyright (C)2025 Robin L. M. Cheung, MBA. All rights reserved.
 * Namespace: mba.robin.hkm.visualresearch
*/
import React, { useState, useEffect, useRef } from 'react';
import { GeneratedContent, ComplexityLevel, VisualStyle, Language, SearchResultItem, UploadedFile, MediaType, SettingsTemplate } from './types';
import { 
  researchTopicForPrompt, 
  generateInfographicImage, 
  editInfographicImage,
  generateExplainerVideo,
} from './services/geminiService';
import Infographic from './components/Infographic';
import Loading from './components/Loading';
import IntroScreen from './components/IntroScreen';
import SearchResults from './components/SearchResults';
import { Search, AlertCircle, History, GraduationCap, Palette, Microscope, Compass, Sun, Moon, Key, CreditCard, ExternalLink, DollarSign, Paperclip, X, FileText, Image as ImageIcon, Video, MonitorPlay, Save, Trash2, Settings, Globe } from 'lucide-react';

// The New "Mesh" Logo Component representing the Hyper-Tension Knowledge Mesh
const MeshLogo = () => (
  <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-[spin_20s_linear_infinite]">
    {/* Ring 1 - Cyan (Empirical) */}
    <ellipse cx="50" cy="50" rx="40" ry="15" transform="rotate(0 50 50)" stroke="currentColor" strokeWidth="6" className="text-cyan-500 opacity-80" />
    {/* Ring 2 - Magenta (Rational) */}
    <ellipse cx="50" cy="50" rx="40" ry="15" transform="rotate(60 50 50)" stroke="currentColor" strokeWidth="6" className="text-purple-500 opacity-80" />
    {/* Ring 3 - Amber (Intuitive) */}
    <ellipse cx="50" cy="50" rx="40" ry="15" transform="rotate(120 50 50)" stroke="currentColor" strokeWidth="6" className="text-amber-500 opacity-80" />
    {/* Core Truth - The Renormalized State */}
    <circle cx="50" cy="50" r="6" fill="white" className="animate-pulse" />
  </svg>
);

const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [topic, setTopic] = useState('');
  
  // State initialization with fallbacks, will be overwritten by useEffect if localStorage exists
  const [complexityLevel, setComplexityLevel] = useState<ComplexityLevel>('High School');
  const [visualStyle, setVisualStyle] = useState<VisualStyle>('Default');
  const [language, setLanguage] = useState<Language>('English');
  const [outputFormat, setOutputFormat] = useState<MediaType>('image');
  
  const [attachedFile, setAttachedFile] = useState<UploadedFile | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [loadingFacts, setLoadingFacts] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [contentHistory, setContentHistory] = useState<GeneratedContent[]>([]);
  const [currentSearchResults, setCurrentSearchResults] = useState<SearchResultItem[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Persistence & Templates
  const [templates, setTemplates] = useState<SettingsTemplate[]>([]);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [activeTemplateId, setActiveTemplateId] = useState<string>('custom');

  // API Key State
  const [hasApiKey, setHasApiKey] = useState(false);
  const [checkingKey, setCheckingKey] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Load Settings and Templates from LocalStorage on Mount
  useEffect(() => {
    const savedTemplates = localStorage.getItem('hkm_templates');
    if (savedTemplates) {
      try {
        setTemplates(JSON.parse(savedTemplates));
      } catch (e) { console.error("Failed to load templates", e); }
    }

    const lastSettings = localStorage.getItem('hkm_last_settings');
    if (lastSettings) {
      try {
        const settings = JSON.parse(lastSettings);
        if (settings.complexityLevel) setComplexityLevel(settings.complexityLevel);
        if (settings.visualStyle) setVisualStyle(settings.visualStyle);
        if (settings.language) setLanguage(settings.language);
        if (settings.outputFormat) setOutputFormat(settings.outputFormat);
      } catch (e) { console.error("Failed to load last settings", e); }
    }
  }, []);

  // Save Settings to LocalStorage whenever they change
  useEffect(() => {
    const settings = {
      complexityLevel,
      visualStyle,
      language,
      outputFormat
    };
    localStorage.setItem('hkm_last_settings', JSON.stringify(settings));
    
    // Check if current settings match the active template to toggle "Custom" state
    if (activeTemplateId !== 'custom') {
       const t = templates.find(t => t.id === activeTemplateId);
       if (t) {
         if (t.config.complexityLevel !== complexityLevel || 
             t.config.visualStyle !== visualStyle || 
             t.config.language !== language ||
             t.config.outputFormat !== outputFormat) {
             setActiveTemplateId('custom');
         }
       }
    }
  }, [complexityLevel, visualStyle, language, outputFormat, templates, activeTemplateId]);

  // Check for API Key on Mount
  useEffect(() => {
    const checkKey = async () => {
      try {
        if (window.aistudio && window.aistudio.hasSelectedApiKey) {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          setHasApiKey(hasKey);
        } else {
          setHasApiKey(true);
        }
      } catch (e) {
        console.error("Error checking API key:", e);
      } finally {
        setCheckingKey(false);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio && window.aistudio.openSelectKey) {
      try {
        await window.aistudio.openSelectKey();
        setHasApiKey(true);
        setError(null);
      } catch (e) {
        console.error("Failed to open key selector:", e);
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        setError("File size exceeds 20MB limit.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        setAttachedFile({
          mimeType: file.type,
          data: base64Data,
          name: file.name
        });
        setError(null);
      };
      reader.onerror = () => setError("Failed to read file.");
      reader.readAsDataURL(file);
    }
  };

  const clearFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Template Management Functions
  const saveTemplate = () => {
    if (!newTemplateName.trim()) return;
    const newTemplate: SettingsTemplate = {
      id: Date.now().toString(),
      name: newTemplateName.trim(),
      config: { complexityLevel, visualStyle, language, outputFormat }
    };
    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    localStorage.setItem('hkm_templates', JSON.stringify(updatedTemplates));
    setActiveTemplateId(newTemplate.id);
    setNewTemplateName('');
    setShowSaveTemplate(false);
  };

  const loadTemplate = (id: string) => {
    if (id === 'custom') {
      setActiveTemplateId('custom');
      return;
    }
    const t = templates.find(temp => temp.id === id);
    if (t) {
      setComplexityLevel(t.config.complexityLevel);
      setVisualStyle(t.config.visualStyle);
      setLanguage(t.config.language);
      setOutputFormat(t.config.outputFormat);
      setActiveTemplateId(id);
    }
  };

  const deleteTemplate = (id: string) => {
    const updated = templates.filter(t => t.id !== id);
    setTemplates(updated);
    localStorage.setItem('hkm_templates', JSON.stringify(updated));
    if (activeTemplateId === id) setActiveTemplateId('custom');
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!topic.trim()) {
        setError("Please enter a topic to visualize.");
        return;
    }

    setIsLoading(true);
    setError(null);
    setLoadingStep(1);
    setLoadingFacts([]);
    setCurrentSearchResults([]);
    setLoadingMessage(attachedFile ? `Analysing Orthogonal Source (${attachedFile.name})...` : `Triangulating Truth Sources...`);

    try {
      const researchResult = await researchTopicForPrompt(topic, complexityLevel, visualStyle, language, outputFormat, attachedFile);
      
      setLoadingFacts(researchResult.facts);
      setCurrentSearchResults(researchResult.searchResults);
      
      setLoadingStep(2);
      setLoadingMessage(outputFormat === 'video' ? `Renormalizing Data into Explainer Video...` : `Synthesizing Visual Mesh...`);
      
      let mediaData = '';
      if (outputFormat === 'video') {
         mediaData = await generateExplainerVideo(researchResult.visualPrompt);
      } else {
         mediaData = await generateInfographicImage(researchResult.visualPrompt);
      }
      
      const newContent: GeneratedContent = {
        id: Date.now().toString(),
        data: mediaData,
        type: outputFormat,
        prompt: topic,
        timestamp: Date.now(),
        level: complexityLevel,
        style: visualStyle,
        language: language
      };

      setContentHistory([newContent, ...contentHistory]);
    } catch (err: any) {
      console.error(err);
      if (err.message && (err.message.includes("Requested entity was not found") || err.message.includes("404") || err.message.includes("403"))) {
          setError("Access denied. The selected API key does not have access to the required models. Please select a project with billing enabled.");
          setHasApiKey(false);
      } else {
          setError(`Generation failed: ${err.message || 'Service unavailable'}. Please try again.`);
      }
    } finally {
      setIsLoading(false);
      setLoadingStep(0);
    }
  };

  const handleEdit = async (editPrompt: string) => {
    if (contentHistory.length === 0) return;
    const current = contentHistory[0];
    
    if (current.type !== 'image') {
        setError("Editing is currently only supported for images.");
        return;
    }

    setIsLoading(true);
    setError(null);
    setLoadingStep(2);
    setLoadingMessage(`Refining Mesh Tension: "${editPrompt}"...`);

    try {
      const base64Data = await editInfographicImage(current.data, editPrompt);
      const newContent: GeneratedContent = {
        id: Date.now().toString(),
        data: base64Data,
        type: 'image',
        prompt: editPrompt,
        timestamp: Date.now(),
        level: current.level,
        style: current.style,
        language: current.language
      };
      setContentHistory([newContent, ...contentHistory]);
    } catch (err: any) {
      console.error(err);
      if (err.message && (err.message.includes("Requested entity was not found") || err.message.includes("404") || err.message.includes("403"))) {
          setError("Access denied. Please select a valid API key with billing enabled.");
          setHasApiKey(false);
      } else {
          setError('Modification failed. Try a different command.');
      }
    } finally {
      setIsLoading(false);
      setLoadingStep(0);
    }
  };

  const restoreContent = (content: GeneratedContent) => {
     const newHistory = contentHistory.filter(i => i.id !== content.id);
     setContentHistory([content, ...newHistory]);
  };

  const KeySelectionModal = () => (
    <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="bg-white dark:bg-slate-900 border-2 border-amber-500/50 rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500"></div>
            
            <div className="flex flex-col items-center text-center space-y-6">
                <div className="relative">
                    <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400 mb-2 border-4 border-white dark:border-slate-900 shadow-lg">
                        <CreditCard className="w-8 h-8" />
                    </div>
                </div>
                
                <div className="space-y-3">
                    <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
                        Paid API Key Required
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-medium">
                        This application uses premium Gemini 3 Pro models.
                    </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 w-full text-left">
                    <div className="flex items-start gap-3">
                         <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400 shrink-0">
                            <DollarSign className="w-4 h-4" />
                         </div>
                         <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-200">Billing Required</p>
                             <a 
                                href="https://ai.google.dev/gemini-api/docs/billing" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline mt-1"
                            >
                                View Billing Documentation <ExternalLink className="w-3 h-3" />
                            </a>
                         </div>
                    </div>
                </div>

                <button 
                    onClick={handleSelectKey}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl font-bold shadow-lg shadow-amber-500/20 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                    <Key className="w-4 h-4" />
                    <span>Select Paid API Key</span>
                </button>
            </div>
        </div>
    </div>
  );

  return (
    <>
    {!checkingKey && !hasApiKey && <KeySelectionModal />}

    {showIntro ? (
      <IntroScreen onComplete={() => setShowIntro(false)} />
    ) : (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-sans selection:bg-cyan-500 selection:text-white pb-20 relative overflow-x-hidden animate-in fade-in duration-1000 transition-colors">
      
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-white dark:from-indigo-900 dark:via-slate-950 dark:to-black z-0 transition-colors"></div>
      <div className="fixed inset-0 opacity-5 dark:opacity-20 z-0 pointer-events-none" style={{
          backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
      }}></div>

      {/* Navbar */}
      <header className="border-b border-slate-200 dark:border-white/10 sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-slate-950/60 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4 group">
            <div className="relative scale-90 md:scale-100">
                <div className="absolute inset-0 bg-cyan-500 blur-lg opacity-20 dark:opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 p-2 rounded-xl border border-slate-200 dark:border-white/10 relative z-10 shadow-sm dark:shadow-none">
                   {/* Replaced Icon with MeshLogo */}
                   <MeshLogo />
                </div>
            </div>
            <div className="flex flex-col">
                <span className="font-display font-bold text-lg md:text-2xl tracking-tight text-slate-900 dark:text-white leading-none">
                Robin's AI World <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-amber-600 dark:from-cyan-400 dark:to-amber-400">HKM</span>
                </span>
                <span className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 font-medium">Hybrid Knowledge Mesh: Visual Light Researcher</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
              <button 
                onClick={handleSelectKey}
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium transition-colors border border-slate-200 dark:border-white/10"
                title="Change API Key"
              >
                <Key className="w-3.5 h-3.5" />
                <span>API Key</span>
              </button>

              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors border border-slate-200 dark:border-white/10 shadow-sm"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
          </div>
        </div>
      </header>

      <main className="px-3 sm:px-6 py-4 md:py-8 relative z-10">
        
        <div className={`max-w-6xl mx-auto transition-all duration-500 ${contentHistory.length > 0 ? 'mb-4 md:mb-8' : 'min-h-[50vh] md:min-h-[70vh] flex flex-col justify-center'}`}>
          
          {!contentHistory.length && (
            <div className="text-center mb-6 md:mb-16 space-y-3 md:space-y-8 animate-in slide-in-from-bottom-8 duration-700 fade-in">
              <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-amber-600 dark:text-amber-300 text-[10px] md:text-xs font-bold tracking-widest uppercase shadow-sm dark:shadow-[0_0_20px_rgba(251,191,36,0.1)] backdrop-blur-sm">
                <Compass className="w-3 h-3 md:w-4 md:h-4" /> Deep Research & Visualization
              </div>
              <h1 className="text-3xl sm:text-5xl md:text-8xl font-display font-bold text-slate-900 dark:text-white tracking-tight leading-[0.95] md:leading-[0.9]">
                Hybrid Knowledge <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-purple-600 to-amber-600 dark:from-cyan-400 dark:via-purple-400 dark:to-amber-400">Mesh.</span>
              </h1>
              <p className="text-sm md:text-2xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-light leading-relaxed px-4">
                Redundant. Orthogonal. True. <br/>
                <span className="text-xs md:text-base opacity-70">Visual Light Researcher crowding out the shadows.</span>
              </p>
            </div>
          )}

          {/* Search Form */}
          <form onSubmit={handleGenerate} className={`relative z-20 transition-all duration-300 ${isLoading ? 'opacity-50 pointer-events-none scale-95 blur-sm' : 'scale-100'}`}>
            
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500 rounded-3xl opacity-10 dark:opacity-20 group-hover:opacity-30 dark:group-hover:opacity-40 transition duration-500 blur-xl"></div>
                
                <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-2 rounded-3xl shadow-2xl">
                    
                    {/* Main Input */}
                    <div className="relative flex items-center">
                        <Search className="absolute left-4 md:left-6 w-5 h-5 md:w-6 md:h-6 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="What do you want to visualize or explain?"
                            className="w-full pl-12 md:pl-16 pr-14 md:pr-16 py-3 md:py-6 bg-transparent border-none outline-none text-base md:text-2xl placeholder:text-slate-400 font-medium text-slate-900 dark:text-white"
                        />
                        
                        <div className="absolute right-4 md:right-6">
                          <input 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            className="hidden"
                            accept="image/*,video/*,audio/*,.pdf,.txt,.md,.csv,.json,.xml,.html"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className={`p-2 rounded-full transition-colors ${
                              attachedFile 
                                ? 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400' 
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                            }`}
                            title="Attach media or document for deep research"
                          >
                            <Paperclip className="w-5 h-5" />
                          </button>
                        </div>
                    </div>

                    {/* Attached File Preview */}
                    {attachedFile && (
                      <div className="px-4 pb-2 md:pl-16">
                         <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/50 text-cyan-800 dark:text-cyan-200 text-xs font-medium animate-in slide-in-from-left-2 fade-in">
                            {attachedFile.mimeType.startsWith('image/') ? <ImageIcon className="w-3.5 h-3.5" /> : 
                             attachedFile.mimeType.startsWith('video/') ? <Video className="w-3.5 h-3.5" /> :
                             <FileText className="w-3.5 h-3.5" />}
                            <span className="truncate max-w-[200px]">{attachedFile.name}</span>
                            <button 
                              type="button"
                              onClick={clearFile}
                              className="ml-1 p-0.5 hover:bg-cyan-200 dark:hover:bg-cyan-900 rounded-full transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                         </div>
                      </div>
                    )}

                    {/* Template/Preset Management Bar */}
                    <div className="flex items-center gap-2 px-4 py-2 border-t border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/30 mx-2 rounded-lg mt-2 mb-1">
                        <Settings className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden sm:block">Configuration:</span>
                        
                        <div className="flex-1 flex items-center gap-2 min-w-0">
                           <select 
                             value={activeTemplateId} 
                             onChange={(e) => loadTemplate(e.target.value)}
                             className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-300 border-none focus:ring-0 p-0 cursor-pointer w-full max-w-[150px] truncate"
                           >
                              <option value="custom">Custom (Last Used)</option>
                              {templates.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                              ))}
                           </select>

                           {activeTemplateId !== 'custom' && (
                             <button
                               type="button"
                               onClick={() => deleteTemplate(activeTemplateId)}
                               className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 rounded transition-colors"
                               title="Delete Template"
                             >
                               <Trash2 className="w-3.5 h-3.5" />
                             </button>
                           )}
                        </div>

                        <div className="flex items-center gap-2 border-l border-slate-300 dark:border-white/10 pl-3">
                           {showSaveTemplate ? (
                             <div className="flex items-center gap-2 animate-in slide-in-from-right-4 fade-in">
                               <input 
                                 type="text" 
                                 value={newTemplateName}
                                 onChange={(e) => setNewTemplateName(e.target.value)}
                                 placeholder="Template Name..."
                                 className="w-32 bg-white dark:bg-slate-800 text-xs px-2 py-1 rounded border border-slate-200 dark:border-slate-700 outline-none"
                                 autoFocus
                                 onKeyDown={(e) => {
                                   if (e.key === 'Enter') {
                                     e.preventDefault();
                                     saveTemplate();
                                   }
                                 }}
                               />
                               <button 
                                 type="button" 
                                 onClick={saveTemplate}
                                 className="text-xs bg-cyan-600 text-white px-2 py-1 rounded hover:bg-cyan-500"
                               >
                                 Save
                               </button>
                               <button 
                                 type="button" 
                                 onClick={() => setShowSaveTemplate(false)}
                                 className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                               >
                                 <X className="w-3.5 h-3.5" />
                               </button>
                             </div>
                           ) : (
                             <button 
                               type="button"
                               onClick={() => setShowSaveTemplate(true)}
                               className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 px-2 py-1 rounded hover:bg-cyan-100 dark:hover:bg-cyan-900/40 transition-colors"
                             >
                               <Save className="w-3 h-3" />
                               <span>SAVE CONFIG</span>
                             </button>
                           )}
                        </div>
                    </div>

                    {/* Controls Bar */}
                    <div className="flex flex-col md:flex-row gap-2 p-2">
                    
                    <div className="flex-1 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-white/5 px-4 py-3 flex items-center gap-3 hover:border-cyan-500/30 transition-colors relative overflow-hidden">
                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-cyan-600 dark:text-cyan-400 shrink-0 shadow-sm">
                            <MonitorPlay className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col z-10 w-full overflow-hidden">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Format</label>
                            <select 
                                value={outputFormat} 
                                onChange={(e) => setOutputFormat(e.target.value as MediaType)}
                                className="bg-transparent border-none text-base font-bold text-slate-900 dark:text-slate-100 focus:ring-0 cursor-pointer p-0 w-full hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors truncate pr-4 [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-slate-900 dark:[&>option]:text-slate-100"
                            >
                                <option value="image">Infographic (Image)</option>
                                <option value="video">Explainer (Video)</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex-1 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-white/5 px-4 py-3 flex items-center gap-3 hover:border-cyan-500/30 transition-colors relative overflow-hidden">
                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-cyan-600 dark:text-cyan-400 shrink-0 shadow-sm">
                            <GraduationCap className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col z-10 w-full overflow-hidden">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Audience</label>
                            <select 
                                value={complexityLevel} 
                                onChange={(e) => setComplexityLevel(e.target.value as ComplexityLevel)}
                                className="bg-transparent border-none text-base font-bold text-slate-900 dark:text-slate-100 focus:ring-0 cursor-pointer p-0 w-full hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors truncate pr-4 [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-slate-900 dark:[&>option]:text-slate-100"
                            >
                                <option value="Elementary">Elementary</option>
                                <option value="High School">High School</option>
                                <option value="College">College</option>
                                <option value="Expert">Expert</option>
                            </select>
                        </div>
                    </div>

                    {outputFormat === 'image' && (
                    <div className="flex-1 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-white/5 px-4 py-3 flex items-center gap-3 hover:border-purple-500/30 transition-colors relative overflow-hidden">
                         <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-purple-600 dark:text-purple-400 shrink-0 shadow-sm">
                            <Palette className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col z-10 w-full overflow-hidden">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Aesthetic</label>
                            <select 
                                value={visualStyle} 
                                onChange={(e) => setVisualStyle(e.target.value as VisualStyle)}
                                className="bg-transparent border-none text-base font-bold text-slate-900 dark:text-slate-100 focus:ring-0 cursor-pointer p-0 w-full hover:text-purple-600 dark:hover:text-purple-300 transition-colors truncate pr-4 [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-slate-900 dark:[&>option]:text-slate-100"
                            >
                                <option value="Default">Standard Scientific</option>
                                <option value="Minimalist">Minimalist</option>
                                <option value="Realistic">Photorealistic</option>
                                <option value="Cartoon">Graphic Novel</option>
                                <option value="Vintage">Vintage Lithograph</option>
                                <option value="Futuristic">Cyberpunk HUD</option>
                                <option value="3D Render">3D Isometric</option>
                                <option value="Sketch">Technical Blueprint</option>
                            </select>
                        </div>
                    </div>
                    )}

                     <div className="flex-1 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-white/5 px-4 py-3 flex items-center gap-3 hover:border-green-500/30 transition-colors relative overflow-hidden">
                         <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-green-600 dark:text-green-400 shrink-0 shadow-sm">
                            <Globe className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col z-10 w-full overflow-hidden">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Language</label>
                            <select 
                                value={language} 
                                onChange={(e) => setLanguage(e.target.value as Language)}
                                className="bg-transparent border-none text-base font-bold text-slate-900 dark:text-slate-100 focus:ring-0 cursor-pointer p-0 w-full hover:text-green-600 dark:hover:text-green-300 transition-colors truncate pr-4 [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-slate-900 dark:[&>option]:text-slate-100"
                            >
                                <option value="English">English</option>
                                <option value="Spanish">Spanish</option>
                                <option value="French">French</option>
                                <option value="German">German</option>
                                <option value="Mandarin">Mandarin</option>
                                <option value="Japanese">Japanese</option>
                                <option value="Hindi">Hindi</option>
                                <option value="Arabic">Arabic</option>
                                <option value="Portuguese">Portuguese</option>
                                <option value="Russian">Russian</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 w-full md:w-auto">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full md:w-auto h-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold font-display tracking-wide hover:brightness-110 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                            <Microscope className="w-5 h-5" />
                            <span>{isLoading ? 'ANALYZING...' : 'INITIATE'}</span>
                        </button>
                    </div>

                    </div>
                </div>
            </div>
          </form>
        </div>

        {isLoading && <Loading status={loadingMessage} step={loadingStep} facts={loadingFacts} />}

        {error && (
          <div className="max-w-2xl mx-auto mt-8 p-6 bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-2xl flex items-center gap-4 text-red-800 dark:text-red-200 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 shadow-sm">
            <AlertCircle className="w-6 h-6 flex-shrink-0 text-red-500 dark:text-red-400" />
            <div className="flex-1">
                <p className="font-medium">{error}</p>
                {(error.includes("Access denied") || error.includes("billing")) && (
                    <button 
                        onClick={handleSelectKey}
                        className="mt-2 text-xs font-bold text-red-700 dark:text-red-300 underline hover:text-red-900 dark:hover:text-red-100"
                    >
                        Select a different API key
                    </button>
                )}
            </div>
          </div>
        )}

        {contentHistory.length > 0 && !isLoading && (
            <>
                <Infographic 
                    content={contentHistory[0]} 
                    onEdit={handleEdit} 
                    isEditing={isLoading}
                />
                <SearchResults results={currentSearchResults} />
            </>
        )}

        {contentHistory.length > 1 && (
            <div className="max-w-7xl mx-auto mt-16 md:mt-24 border-t border-slate-200 dark:border-white/10 pt-12 transition-colors">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                    <History className="w-4 h-4" />
                    Session Archives
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
                    {contentHistory.slice(1).map((item) => (
                        <div 
                            key={item.id} 
                            onClick={() => restoreContent(item)}
                            className="group relative cursor-pointer rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 hover:border-cyan-500/50 transition-all shadow-lg bg-white dark:bg-slate-900/50 backdrop-blur-sm aspect-video"
                        >
                            {item.type === 'video' ? (
                                <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                                    <MonitorPlay className="w-8 h-8 text-cyan-500/50" />
                                    <video src={item.data} className="absolute inset-0 w-full h-full object-cover opacity-70" />
                                </div>
                            ) : (
                                <img src={item.data} alt={item.prompt} className="w-full h-full object-cover opacity-90 dark:opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                            )}
                            
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 pt-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                <p className="text-xs text-white font-bold truncate mb-1 font-display">{item.prompt}</p>
                                <div className="flex gap-2">
                                    <span className={`text-[9px] uppercase font-bold tracking-wide px-1.5 py-0.5 rounded-full border ${item.type === 'video' ? 'bg-purple-900/60 border-purple-500/20 text-purple-100' : 'bg-cyan-900/60 border-cyan-500/20 text-cyan-100'}`}>
                                        {item.type}
                                    </span>
                                    {item.level && <span className="text-[9px] text-slate-300 uppercase font-bold tracking-wide px-1.5 py-0.5 rounded-full bg-slate-800/60 border border-slate-500/20">{item.level}</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </main>
      
      {/* Footer Branding */}
      <footer className="w-full text-center py-8 text-[10px] text-slate-400 dark:text-slate-600 uppercase tracking-widest relative z-10">
        <p>Copyright (C)2025 Robin L. M. Cheung, MBA. All rights reserved.</p>
        <p className="mt-1 text-[8px] opacity-70">Namespace: mba.robin.hkm.visualresearch</p>
      </footer>
    </div>
    )}
    </>
  );
};

export default App;
