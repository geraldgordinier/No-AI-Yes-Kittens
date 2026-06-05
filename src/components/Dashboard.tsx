import { useState, useEffect } from 'react';
import { checkAIText, AI_MARKERS } from '../lib/aiDetector';
import { ShieldAlert, CheckCircle2, AlertTriangle, SlidersHorizontal, Settings as SettingsIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Dashboard() {
  const [text, setText] = useState("In today's fast-paced world, it's not about working harder, it's about working smarter. Let's delve into the transformative power of AI and how it's a game-changer for ever-evolving industries. Buckle up!");
  const [disabledRules, setDisabledRules] = useState<string[]>([]);
  const [aggressiveness, setAggressiveness] = useState<number>(2);
  const [useAI, setUseAI] = useState<boolean>(false);
  const [geminiKey, setGeminiKey] = useState<string>("");
  const [matches, setMatches] = useState<string[]>([]);
  const [loadingAI, setLoadingAI] = useState<boolean>(false);

  useEffect(() => {
    // Load initial settings
    const loadSettings = () => {
      const saved = localStorage.getItem('disabledAIFilters');
      const savedAgg = localStorage.getItem('aggressivenessLevel');
      const savedUseAI = localStorage.getItem('useAI');
      const savedGeminiKey = localStorage.getItem('geminiKey');
      if (saved) {
        try {
          setDisabledRules(JSON.parse(saved));
        } catch (e) {}
      }
      if (savedAgg) {
        try {
          setAggressiveness(parseInt(savedAgg, 10));
        } catch (e) {}
      }
      if (savedUseAI) setUseAI(savedUseAI === 'true');
      if (savedGeminiKey) setGeminiKey(savedGeminiKey);
    };
    
    loadSettings();
    window.addEventListener('storage', loadSettings);
    return () => window.removeEventListener('storage', loadSettings);
  }, []);

  useEffect(() => {
    let active = true;
    const fetchAI = async () => {
      if (useAI && geminiKey && text.trim().length > 0) {
        setLoadingAI(true);
        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `Analyze the following LinkedIn post and estimate the probability that it was written by an AI (like ChatGPT). Return ONLY a number between 0 and 100 representing the percentage likelihood. Do NOT include any other text, just the number.\n\nPost:\n${text}` }] }]
            })
          });
          const data = await response.json();
          if (active && data.candidates && data.candidates.length > 0) {
            const score = parseFloat(data.candidates[0].content.parts[0].text.trim());
            let threshold = 90;
            if (aggressiveness === 1) threshold = 80;
            else if (aggressiveness === 2) threshold = 50;
            else threshold = 20;

            if (!isNaN(score) && score >= threshold) {
              setMatches([`Gemini AI Detection: ${score}% probability`]);
            } else {
              setMatches([]);
            }
          }
        } catch(e) {
          console.error(e);
        } finally {
          if (active) setLoadingAI(false);
        }
      } else {
        const localMatches = checkAIText(text, disabledRules);
        
        let filteredMatches = localMatches;
        if (aggressiveness === 1 && localMatches.length < 2) filteredMatches = [];
        else if (aggressiveness === 2 && localMatches.length < 1) filteredMatches = [];
        else if (aggressiveness === 3 && localMatches.length < 1) filteredMatches = [];
        
        if (active) setMatches(filteredMatches);
      }
    };
    
    const timeout = setTimeout(fetchAI, 500);
    return () => { active = false; clearTimeout(timeout); };
  }, [text, disabledRules, aggressiveness, useAI, geminiKey]);

  const handleAggressivenessChange = (level: number) => {
    setAggressiveness(level);
    localStorage.setItem('aggressivenessLevel', level.toString());
    
    // Auto-update disabled rules based on level
    const newDisabled: string[] = [];
    AI_MARKERS.forEach(marker => {
      // If marker's required level is higher than current aggressiveness, disable it
      if ((marker.level || 1) > level) {
        newDisabled.push(marker.id);
      }
    });
    
    setDisabledRules(newDisabled);
    localStorage.setItem('disabledAIFilters', JSON.stringify(newDisabled));
    window.dispatchEvent(new Event('storage'));
  };

  const toggleRule = (id: string, isCurrentlyEnabled: boolean) => {
    let newDisabled = [...disabledRules];
    if (isCurrentlyEnabled) {
      if (!newDisabled.includes(id)) newDisabled.push(id);
    } else {
      newDisabled = newDisabled.filter(r => r !== id);
    }
    setDisabledRules(newDisabled);
    localStorage.setItem('disabledAIFilters', JSON.stringify(newDisabled));
    window.dispatchEvent(new Event('storage'));
  };

  const isAI = matches.length > 0;

  return (
    <div className="flex flex-col gap-10 max-w-5xl">
      {/* Filtering Level Control */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6 justify-between">
          <div className="max-w-md">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
              Filter Aggressiveness
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Adjust how strictly the extension checks for AI terminology. 
              Higher levels flag more posts but might trigger false positives.
            </p>
          </div>
          
          <div className="flex-1 max-w-sm">
            <input 
              type="range" 
              min="1" 
              max="3" 
              step="1"
              value={aggressiveness}
              onChange={(e) => handleAggressivenessChange(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-xs font-semibold text-slate-500 mt-3 px-1 hover:text-indigo-600">
              <span className={`transition-colors ${aggressiveness === 1 ? 'text-indigo-600' : ''}`}>Low (Obvious)</span>
              <span className={`transition-colors ${aggressiveness === 2 ? 'text-indigo-600' : ''}`}>Medium</span>
              <span className={`transition-colors ${aggressiveness === 3 ? 'text-indigo-600' : ''}`}>High (Strict)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Playground */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-end">
              <label className="text-sm font-semibold text-slate-800">Test Post Playground</label>
              <div className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
                {AI_MARKERS.length - disabledRules.length} active rules
              </div>
            </div>
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-48 p-4 rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none shadow-sm"
              placeholder="Type or paste a LinkedIn post here..."
            />
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-slate-800">Extension Behavior Preview</label>
            <motion.div 
              layout
              className={`rounded-xl p-6 border shadow-sm transition-colors ${isAI ? 'bg-indigo-50/50 border-indigo-100' : 'bg-emerald-50 border-emerald-100'} flex flex-col items-center justify-center text-center`}
            >
              <AnimatePresence mode="popLayout">
                {loadingAI ? (
                  <motion.div 
                    key="loading"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="flex flex-col items-center gap-4 py-8"
                  >
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="text-sm font-semibold text-slate-800">Checking with Gemini...</div>
                  </motion.div>
                ) : isAI ? (
                  <motion.div 
                    key="ai-detected"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center w-full"
                  >
                    <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-4 relative group">
                       <img 
                          src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&q=80" 
                          alt="Kitten" 
                          className="w-full h-40 object-cover"
                       />
                       <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
                          <div className="flex items-center gap-2 text-white font-medium">
                              <ShieldAlert className="w-4 h-4" />
                              <span>AI Slop Blocked</span>
                          </div>
                       </div>
                    </div>
                    
                    <div className="w-full text-left bg-white/60 p-4 rounded-lg border border-indigo-100 backdrop-blur-sm">
                      <div className="text-xs font-semibold uppercase tracking-wider text-indigo-800 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5" /> Triggered Markers ({matches.length})
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {matches.map((m, i) => (
                          <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="clean"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="flex flex-col items-center gap-4 py-8"
                  >
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-emerald-800">Clear! Looks Human</h3>
                      <p className="text-emerald-700 text-sm mt-1 max-w-sm mx-auto">This post passed the active filters and would be visible in the feed.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>

        {/* AI Control and Rules List */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3 pb-8 border-b border-slate-200">
             <div className="flex justify-between items-center">
               <label className="text-sm font-semibold text-slate-800">AI detects AI (experimental)</label>
               <label className="relative inline-flex items-center cursor-pointer isolate">
                 <input 
                   type="checkbox" 
                   className="sr-only peer" 
                   checked={useAI}
                   onChange={(e) => {
                      setUseAI(e.target.checked);
                      localStorage.setItem('useAI', e.target.checked ? 'true' : 'false');
                   }}
                 />
                 <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
               </label>
             </div>
             <p className="text-xs text-slate-500">
                Override rules and use Google Gemini to detect AI text directly. Aggressiveness maps directly to AI probability % threshold.
             </p>
             {useAI && (
               <div className="mt-2 text-sm bg-slate-50 rounded-lg p-4 border border-slate-200">
                 <label className="block text-xs font-semibold mb-2">Gemini API Key</label>
                 <input 
                   autoFocus
                   type="password"
                   className="w-full h-9 px-3 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm mb-2"
                   placeholder="AIzaSy..."
                   value={geminiKey}
                   onChange={(e) => {
                     setGeminiKey(e.target.value);
                     localStorage.setItem('geminiKey', e.target.value);
                   }}
                 />
                 <div className="text-xs">
                   <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 underline">Get an API key</a>
                 </div>
               </div>
             )}
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <SettingsIcon className="w-4 h-4" />
              Rules
            </label>
            <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-sm max-h-[600px] overflow-y-auto ${useAI ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="divide-y divide-slate-100">
                {AI_MARKERS.map(marker => {
                  const isEnabled = !disabledRules.includes(marker.id);
                  return (
                    <div key={marker.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                      <span className="font-medium text-slate-800">{marker.name}</span>
                      
                      <label className="relative inline-flex items-center cursor-pointer isolate">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={isEnabled}
                          onChange={() => toggleRule(marker.id, isEnabled)}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
