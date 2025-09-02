import React, { useState, useMemo, useRef, useEffect } from 'react';
import { SplitSettings, TemplateSettings, ModelPreset, SplitUnit, Boundary, ModelProvider, TemplatePreset } from '../types';
import { MODEL_PRESETS, TEMPLATE_PRESETS } from '../constants';
import { ChevronDownIcon, SearchIcon, StarIcon, OpenAIIcon, GoogleIcon, AnthropicIcon, ChipIcon, CheckIcon, SaveIcon, UploadIcon, DownloadIcon } from './icons';
import { exportTemplates } from '../utils/fileUtils';

interface SettingsPanelProps {
    settings: SplitSettings;
    setSettings: React.Dispatch<React.SetStateAction<SplitSettings>>;
    templates: TemplateSettings;
    setTemplates: React.Dispatch<React.SetStateAction<TemplateSettings>>;
    templatePresets: TemplatePreset[];
    setTemplatePresets: React.Dispatch<React.SetStateAction<TemplatePreset[]>>;
    estimatedParts: number;
    recommendedChunkSize: number;
    estimatedCost: { total: number; input: number; output: number; } | null;
}

const ProviderIcon: React.FC<{ provider: ModelProvider, className?: string }> = ({ provider, className }) => {
    switch (provider) {
        case 'openai': return <OpenAIIcon className={className} />;
        case 'google': return <GoogleIcon className={className} />;
        case 'anthropic': return <AnthropicIcon className={className} />;
        default: return <ChipIcon className={className} />;
    }
};

const ModelSelector: React.FC<{ selectedId: string, onSelect: (id: string) => void }> = ({ selectedId, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const popoverRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const selectedPreset = MODEL_PRESETS.find(p => p.id === selectedId) as ModelPreset;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node) && triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredModels = useMemo(() => 
        MODEL_PRESETS.filter(p => p.label.toLowerCase().includes(searchQuery.toLowerCase()) || p.provider.toLowerCase().includes(searchQuery.toLowerCase()))
    , [searchQuery]);

    const groupedModels = useMemo(() => 
        filteredModels.reduce((acc, model) => {
            const provider = model.provider;
            if (!acc[provider]) acc[provider] = [];
            acc[provider].push(model);
            return acc;
        }, {} as Record<ModelProvider, ModelPreset[]>)
    , [filteredModels]);

    const providerOrder: ModelProvider[] = ['openai', 'google', 'anthropic', 'mistral', 'xai', 'other'];

    const handleSelect = (id: string) => {
        onSelect(id);
        setIsOpen(false);
        setSearchQuery('');
    };

    return (
        <div className="relative w-full">
            <button
                ref={triggerRef}
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <div className="flex items-center gap-2">
                    <ProviderIcon provider={selectedPreset.provider} className="w-5 h-5" />
                    <span className="font-medium">{selectedPreset.label}</span>
                </div>
                <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div ref={popoverRef} className="absolute z-20 top-full mt-2 w-full md:w-[400px] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden">
                    <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                        <div className="relative">
                             <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                             <input
                                type="text"
                                placeholder="Search models..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-100 dark:bg-gray-900 border-transparent rounded-md pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                             />
                        </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto p-2">
                        {providerOrder.map(provider => (
                           groupedModels[provider] && (
                               <div key={provider} className="mb-2">
                                   <h4 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 px-2 py-1 capitalize">{provider}</h4>
                                   {groupedModels[provider].map(preset => (
                                       <button key={preset.id} onClick={() => handleSelect(preset.id)} className="w-full text-left flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50">
                                            <ProviderIcon provider={preset.provider} className="w-5 h-5 flex-shrink-0" />
                                            <div className="flex-grow">
                                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{preset.label}</p>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                    <span>{Math.round(preset.inputContext / 1000)}k context</span>
                                                    {preset.pricing && <span>• ${preset.pricing.inputPer1k * 1000}/M</span>}
                                                </div>
                                            </div>
                                            {selectedId === preset.id && <CheckIcon className="w-5 h-5 text-blue-500" />}
                                       </button>
                                   ))}
                               </div>
                           )
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, setSettings, templates, setTemplates, templatePresets, setTemplatePresets, estimatedParts, recommendedChunkSize, estimatedCost }) => {
    const importFileInputRef = useRef<HTMLInputElement>(null);

    const handlePresetChange = (presetId: string) => {
        const preset = MODEL_PRESETS.find(p => p.id === presetId) as ModelPreset;
        setSettings({
            ...settings,
            modelPresetId: presetId,
            size: recommendedChunkSize, // Set to new recommended size
            replyBudget: preset.defaultReplyBudget,
            guardBandPct: preset.defaultGuardBandPct,
        });
    };

    const handleSettingChange = <K extends keyof SplitSettings,>(key: K, value: SplitSettings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };
    
    const handleTemplateChange = <K extends keyof TemplateSettings,>(key: K, value: TemplateSettings[K]) => {
        setTemplates(prev => ({ ...prev, [key]: value }));
    };

    const handleTemplatePresetChange = (presetId: string) => {
        const preset = templatePresets.find(p => p.id === presetId);
        if (preset) {
            setTemplates(preset.settings);
        }
    };
    
    const handleSaveTemplate = () => {
        const name = prompt("Enter a name for your new template preset:", "My Custom Template");
        if (name) {
            const newPreset: TemplatePreset = {
                id: `custom-${Date.now()}`,
                label: name,
                settings: templates,
            };
            setTemplatePresets(prev => [...prev, newPreset]);
            alert(`Template "${name}" saved!`);
        }
    };
    
    const handleImportTemplates = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const result = e.target?.result;
                if (typeof result !== 'string') throw new Error("File is not readable");
                const importedPresets = JSON.parse(result) as TemplatePreset[];
                // Basic validation
                if (Array.isArray(importedPresets) && importedPresets.every(p => p.id && p.label && p.settings)) {
                    // Merge and remove duplicates, giving preference to imported ones
                    const existingIds = new Set(importedPresets.map(p => p.id));
                    const merged = [...importedPresets, ...templatePresets.filter(p => !existingIds.has(p.id))];
                    setTemplatePresets(merged);
                    alert(`${importedPresets.length} templates imported successfully.`);
                } else {
                    throw new Error("Invalid template file format.");
                }
            } catch (error) {
                console.error("Failed to import templates:", error);
                alert("Failed to import templates. Please check the file format.");
            }
        };
        reader.readAsText(file);
    };


    const isSizeOverridden = settings.size > recommendedChunkSize;

    const activeTemplateId = useMemo(() => {
        const matchingPreset = templatePresets.find(p => JSON.stringify(p.settings) === JSON.stringify(templates));
        return matchingPreset ? matchingPreset.id : 'custom';
    }, [templates, templatePresets]);

    return (
        <div className="space-y-6">
            {/* Model & Splitting */}
            <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Chunking Strategy</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1 md:col-span-2">
                        <label htmlFor="model-preset" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Model Preset</label>
                        <ModelSelector selectedId={settings.modelPresetId} onSelect={handlePresetChange} />
                    </div>
                    <div>
                        <label htmlFor="split-unit" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Split Unit</label>
                        <select id="split-unit" value={settings.unit} onChange={(e) => handleSettingChange('unit', e.target.value as SplitUnit)} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="tokens">Tokens</option>
                            <option value="characters">Characters</option>
                            <option value="words">Words</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="chunk-size" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Chunk Size</label>
                        <div className="relative">
                            <input type="number" id="chunk-size" value={settings.size} onChange={(e) => handleSettingChange('size', parseInt(e.target.value, 10) || 0)} className={`w-full bg-white dark:bg-gray-800 border rounded-md px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isSizeOverridden ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`} />
                        </div>
                         {isSizeOverridden && <p className="text-xs text-red-500 mt-1">Warning: Size exceeds recommended maximum of {recommendedChunkSize}.</p>}
                    </div>
                     <div>
                        <label htmlFor="boundary" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Boundary</label>
                        <select id="boundary" value={settings.boundary} onChange={(e) => handleSettingChange('boundary', e.target.value as Boundary)} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="none">None</option>
                            <option value="sentence">Sentence</option>
                            <option value="paragraph">Paragraph</option>
                        </select>
                    </div>
                    <div className="col-span-1 md:col-span-2">
                        <label htmlFor="overlap" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Overlap ({settings.overlap} {settings.unit})</label>
                        <input type="range" id="overlap" min="0" max="500" step="10" value={settings.overlap} onChange={(e) => handleSettingChange('overlap', parseInt(e.target.value, 10))} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                    </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700/50 space-y-4">
                    <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300">Advanced Configuration</h4>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="reply-budget" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Reply Budget</label>
                            <input type="number" id="reply-budget" value={settings.replyBudget} onChange={(e) => handleSettingChange('replyBudget', parseInt(e.target.value, 10) || 0)} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                         <div>
                            <label htmlFor="guard-band" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Guard Band (%)</label>
                            <input type="number" id="guard-band" step="0.01" value={settings.guardBandPct} onChange={(e) => handleSettingChange('guardBandPct', parseFloat(e.target.value) || 0)} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700/50 flex justify-around items-center text-center">
                     <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Est. Chunks</p>
                        <p className="font-bold text-lg text-blue-600 dark:text-blue-500">{estimatedParts}</p>
                     </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Rec. Size</p>
                        <p className="font-bold text-lg text-gray-700 dark:text-gray-200">{recommendedChunkSize.toLocaleString()}</p>
                     </div>
                      <div className="relative group">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Est. Cost</p>
                        <p className="font-bold text-lg text-green-600 dark:text-green-500">{estimatedCost !== null ? `$${estimatedCost.total.toFixed(5)}` : 'N/A'}</p>
                        {estimatedCost !== null && estimatedCost.total > 0 && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                Input: ${estimatedCost.input.toFixed(5)}
                                <br />
                                Output: ${estimatedCost.output.toFixed(5)}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
                            </div>
                        )}
                     </div>
                </div>
            </div>

            {/* Templates */}
            <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Templates</h3>
                    <div className="flex items-center gap-2">
                        <select
                            value={activeTemplateId}
                            onChange={(e) => handleTemplatePresetChange(e.target.value)}
                            className="text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm px-2 py-1 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            {templatePresets.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                             {activeTemplateId === 'custom' && <option value="custom" disabled>Custom</option>}
                        </select>
                        <button onClick={handleSaveTemplate} title="Save Current as New Template" className="p-1.5 text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 rounded-md"><SaveIcon className="w-4 h-4" /></button>
                        <input type="file" ref={importFileInputRef} onChange={handleImportTemplates} className="hidden" accept=".json" />
                        <button onClick={() => importFileInputRef.current?.click()} title="Import Templates" className="p-1.5 text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 rounded-md"><UploadIcon className="w-4 h-4" /></button>
                        <button onClick={() => exportTemplates(templatePresets)} title="Export All Templates" className="p-1.5 text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 rounded-md"><DownloadIcon className="w-4 h-4" /></button>
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                         <label htmlFor="first-message" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Global Instructions (First Message)</label>
                         <textarea id="first-message" rows={3} value={templates.firstMessage} onChange={e => handleTemplateChange('firstMessage', e.target.value)} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., You are a helpful assistant. Please summarize the following text."></textarea>
                    </div>
                    <div>
                         <label htmlFor="chunk-header" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Per-Chunk Header</label>
                         <input type="text" id="chunk-header" value={templates.perChunkHeader} onChange={e => handleTemplateChange('perChunkHeader', e.target.value)} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., [START PART {part}/{total}]" />
                    </div>
                     <div>
                         <label htmlFor="chunk-footer" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Per-Chunk Footer</label>
                         <input type="text" id="chunk-footer" value={templates.perChunkFooter} onChange={e => handleTemplateChange('perChunkFooter', e.target.value)} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., [END PART {part}/{total}]" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPanel;