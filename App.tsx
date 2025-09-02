import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import InputPanel from './components/InputPanel';
import OutputPanel from './components/OutputPanel';
import ExtractorPanel from './components/ExtractorPanel';
import useLocalStorage from './hooks/useLocalStorage';
import { SplitSettings, TemplateSettings, OutputChunk, ModelPreset, TemplatePreset, HistoryItem, SplitUnit, Boundary } from './types';
import { MODEL_PRESETS, DEFAULT_PRESET_ID, TEMPLATE_PRESETS } from './constants';
import { countTokens, splitText } from './services/mockApi';
import { ChevronLeftIcon } from './components/icons';

const computeSafePartSize = (params: {
  inputContext: number;
  replyBudget: number;
  guardBandPct: number;
}) => {
  const { inputContext, replyBudget, guardBandPct } = params;
  const guard = Math.floor(inputContext * guardBandPct);
  const raw = inputContext - replyBudget - guard;
  return Math.max(100, raw);
};

const getDefaultSettings = () => {
    const defaultPreset = MODEL_PRESETS.find(p => p.id === DEFAULT_PRESET_ID) as ModelPreset;
    return {
        unit: 'tokens' as SplitUnit,
        size: computeSafePartSize({ 
            inputContext: defaultPreset.inputContext, 
            replyBudget: defaultPreset.defaultReplyBudget, 
            guardBandPct: defaultPreset.defaultGuardBandPct 
        }),
        modelPresetId: DEFAULT_PRESET_ID,
        boundary: 'sentence' as Boundary,
        overlap: 50,
        replyBudget: defaultPreset.defaultReplyBudget,
        guardBandPct: defaultPreset.defaultGuardBandPct,
    };
}

type ActiveTab = 'slicer' | 'extractor';

function App() {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'dark');
  const [inputText, setInputText] = useState<string>('');
  const [counts, setCounts] = useState({ chars: 0, words: 0, tokens: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [outputChunks, setOutputChunks] = useState<OutputChunk[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('slicer');

  const [settings, setSettings] = useLocalStorage<SplitSettings>('splitSettings', getDefaultSettings());
  
  const [templatePresets, setTemplatePresets] = useLocalStorage<TemplatePreset[]>('templatePresets', TEMPLATE_PRESETS);
  const [activeTemplateSettings, setActiveTemplateSettings] = useLocalStorage<TemplateSettings>('activeTemplateSettings', TEMPLATE_PRESETS[0].settings);

  const [history, setHistory] = useLocalStorage<HistoryItem[]>('splitHistory', []);
  const [activeSessionId, setActiveSessionId] = useLocalStorage<string | null>('activeSessionId', null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Load active session on mount
  useEffect(() => {
    if (activeSessionId) {
        const sessionToLoad = history.find(item => item.id === activeSessionId);
        if (sessionToLoad) {
            setInputText(sessionToLoad.inputText);
            setOutputChunks(sessionToLoad.outputChunks);
        } else {
            setActiveSessionId(null);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateCounts = useCallback(async (text: string, encoding: string) => {
    const charCount = text.length;
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    setCounts(prev => ({ ...prev, chars: charCount, words: wordCount, tokens: 0 }));
    if (text.trim()) {
        const tokenCount = await countTokens(text, encoding);
        setCounts({ chars: charCount, words: wordCount, tokens: tokenCount });
    }
  }, []);

  const currentPreset = useMemo(() => {
    return MODEL_PRESETS.find(p => p.id === settings.modelPresetId) || (MODEL_PRESETS.find(p => p.id === DEFAULT_PRESET_ID) as ModelPreset);
  }, [settings.modelPresetId]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      updateCounts(inputText, currentPreset.encoding);
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [inputText, currentPreset.encoding, updateCounts]);

  const handleModelChange = useCallback((presetId: string) => {
    const preset = MODEL_PRESETS.find(p => p.id === presetId) || (MODEL_PRESETS.find(p => p.id === DEFAULT_PRESET_ID) as ModelPreset);
    const newSize = computeSafePartSize({
        inputContext: preset.inputContext,
        replyBudget: preset.defaultReplyBudget,
        guardBandPct: preset.defaultGuardBandPct,
    });
    setSettings(prevSettings => ({
        ...prevSettings,
        modelPresetId: presetId,
        size: newSize,
        replyBudget: preset.defaultReplyBudget,
        guardBandPct: preset.defaultGuardBandPct,
    }));
}, [setSettings]);

  const recommendedChunkSize = useMemo(() => {
    return computeSafePartSize({
        inputContext: currentPreset.inputContext,
        replyBudget: settings.replyBudget,
        guardBandPct: settings.guardBandPct
    });
  }, [currentPreset.inputContext, settings.replyBudget, settings.guardBandPct]);

  useEffect(() => {
    // When recommended chunk size changes (due to reply budget/guard band updates),
    // update the actual size ONLY IF it wasn't manually overridden by the user.
    // This avoids resetting the user's custom size unexpectedly.
    setSettings(prev => {
        const isManuallyOverridden = prev.size > computeSafePartSize({
            inputContext: currentPreset.inputContext,
            replyBudget: prev.replyBudget,
            guardBandPct: prev.guardBandPct
        }) + 1; // Add tolerance
        
        const wasJustDefault = prev.size === computeSafePartSize({
            inputContext: currentPreset.inputContext,
            replyBudget: prev.replyBudget, // This is a bit tricky, we need previous values.
            guardBandPct: prev.guardBandPct
        });

        // A simpler heuristic: if the user hasn't touched it, it should match the old recommendation.
        // Let's just update the size when the model changes via handleModelChange.
        // And let the user manually adjust. The override warning is enough.
        return prev;
    });
  }, [recommendedChunkSize, setSettings, currentPreset]);


  const estimatedParts = useMemo(() => {
      if (!counts.tokens || !settings.size) return 0;
      if (settings.unit === 'tokens') return Math.ceil(counts.tokens / settings.size);
      if (settings.unit === 'characters') return Math.ceil(counts.chars / settings.size);
      if (settings.unit === 'words') return Math.ceil(counts.words / settings.size);
      return 0;
  }, [counts, settings.size, settings.unit]);

  const estimatedCost = useMemo(() => {
    if (!currentPreset.pricing || counts.tokens === 0) return null;
    const inputCost = (counts.tokens / 1000) * currentPreset.pricing.inputPer1k;
    let outputCost = 0;
    if (currentPreset.pricing.outputPer1k > 0 && estimatedParts > 0 && settings.replyBudget > 0) {
        const estimatedOutputTokens = estimatedParts * settings.replyBudget; 
        outputCost = (estimatedOutputTokens / 1000) * currentPreset.pricing.outputPer1k;
    }
    return { total: inputCost + outputCost, input: inputCost, output: outputCost };
  }, [counts.tokens, currentPreset.pricing, estimatedParts, settings.replyBudget]);
  
  const handleNewSession = useCallback(() => {
    setActiveSessionId(null);
    setInputText('');
    setOutputChunks([]);
    setSettings(getDefaultSettings());
    setActiveTemplateSettings(TEMPLATE_PRESETS[0].settings);
    setIsSidebarOpen(false);
    setActiveTab('slicer');
  }, [setActiveSessionId, setSettings, setActiveTemplateSettings]);

  const handleSplit = async () => {
    setIsLoading(true);
    let chunks: OutputChunk[] = [];
    try {
      chunks = await splitText(inputText, settings);
      setOutputChunks(chunks);

      const title = inputText.split('\n')[0].trim().substring(0, 50) || 'Untitled Session';
      
      if (activeSessionId) {
        setHistory(prev => prev.map(item => item.id === activeSessionId ? { ...item, title, inputText, outputChunks: chunks, timestamp: Date.now() } : item));
      } else {
        const newSessionId = `session-${Date.now()}`;
        const newHistoryItem: HistoryItem = {
          id: newSessionId,
          title,
          timestamp: Date.now(),
          inputText,
          outputChunks: chunks,
        };
        setHistory(prev => [newHistoryItem, ...prev]);
        setActiveSessionId(newSessionId);
      }
    } catch (error) {
      console.error("Failed to split text:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSession = useCallback((id: string) => {
    const sessionToLoad = history.find(item => item.id === id);
    if (sessionToLoad) {
        setActiveSessionId(id);
        setInputText(sessionToLoad.inputText);
        setOutputChunks(sessionToLoad.outputChunks);
        setIsSidebarOpen(false);
        setActiveTab('slicer');
    }
  }, [history, setActiveSessionId]);

  const handleDeleteSession = useCallback((id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    if (activeSessionId === id) {
        handleNewSession();
    }
  }, [activeSessionId, setHistory, handleNewSession]);
  
  // This replaces the buggy useEffect that was previously here.
  const handleSettingsChange = (newSettings: React.SetStateAction<SplitSettings>) => {
      if(typeof newSettings === 'function') {
          setSettings(prev => {
              const updated = newSettings(prev);
              if (updated.modelPresetId !== prev.modelPresetId) {
                  handleModelChange(updated.modelPresetId);
                  return prev; // handleModelChange will trigger the final update.
              }
              return updated;
          });
      } else {
           if (newSettings.modelPresetId !== settings.modelPresetId) {
               handleModelChange(newSettings.modelPresetId);
           } else {
               setSettings(newSettings);
           }
      }
  };

  const TabButton: React.FC<{tab: ActiveTab, label: string}> = ({ tab, label }) => (
      <button
          onClick={() => setActiveTab(tab)}
          className={`px-3 py-2 font-medium text-sm rounded-t-lg focus:outline-none whitespace-nowrap ${activeTab === tab 
              ? 'bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-800 border-t border-x text-blue-600 dark:text-blue-500' 
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
      >
          {label}
      </button>
  );

  return (
    <div className="min-h-screen h-screen font-sans text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-950 flex overflow-hidden">
      <Sidebar 
        history={history}
        activeSessionId={activeSessionId}
        onNewSession={handleNewSession}
        onLoadSession={handleLoadSession}
        onDeleteSession={handleDeleteSession}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <div className="flex-1 flex flex-col min-h-0">
        <Header theme={theme} setTheme={setTheme} onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-grow min-h-0 flex flex-col">
            <div className="flex-shrink-0 px-4 md:px-6 border-b border-gray-200 dark:border-gray-800">
                <nav className="flex space-x-2" aria-label="Tabs">
                    <TabButton tab="slicer" label="Slicer" />
                    <TabButton tab="extractor" label="Extractor" />
                </nav>
            </div>
            
            <div className="flex-grow min-h-0 bg-gray-100 dark:bg-gray-900">
                {activeTab === 'slicer' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 h-full bg-gray-50 dark:bg-gray-950">
                        <div className="lg:border-r lg:border-gray-200 dark:lg:border-gray-800 overflow-y-auto">
                            <InputPanel
                                inputText={inputText}
                                setInputText={setInputText}
                                counts={counts}
                                settings={settings}
                                setSettings={handleSettingsChange}
                                templates={activeTemplateSettings}
                                setTemplates={setActiveTemplateSettings}
                                templatePresets={templatePresets}
                                setTemplatePresets={setTemplatePresets}
                                handleSplit={handleSplit}
                                isLoading={isLoading}
                                estimatedParts={estimatedParts}
                                recommendedChunkSize={recommendedChunkSize}
                                estimatedCost={estimatedCost}
                            />
                        </div>
                        <div className="h-full hidden lg:block overflow-y-auto">
                            <OutputPanel chunks={outputChunks} templates={activeTemplateSettings} isLoading={isLoading} />
                        </div>
                        {/* Modal-like display for mobile */}
                        {(isLoading || outputChunks.length > 0) && activeTab === 'slicer' && (
                             <div className="lg:hidden fixed inset-0 bg-gray-50 dark:bg-gray-950 z-20 top-[57px] flex flex-col">
                                <div className="flex-shrink-0 p-2 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-sm">
                                    <button onClick={() => setOutputChunks([])} className="flex items-center gap-1 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800">
                                        <ChevronLeftIcon className="w-5 h-5" />
                                        <span className="text-sm font-medium">Back</span>
                                    </button>
                                    <h2 className="text-lg font-semibold">Output</h2>
                                    <div className="w-16"></div>
                                </div>
                                <div className="flex-grow overflow-y-auto">
                                    <OutputPanel chunks={outputChunks} templates={activeTemplateSettings} isLoading={isLoading} />
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <ExtractorPanel />
                )}
            </div>
        </main>
      </div>
    </div>
  );
}

export default App;
