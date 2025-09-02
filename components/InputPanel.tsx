import React from 'react';
import SettingsPanel from './SettingsPanel';
import { SplitSettings, TemplateSettings, TemplatePreset } from '../types';

interface InputPanelProps {
    inputText: string;
    setInputText: (text: string) => void;
    counts: { chars: number; words: number; tokens: number; };
    settings: SplitSettings;
    setSettings: React.Dispatch<React.SetStateAction<SplitSettings>>;
    templates: TemplateSettings;
    setTemplates: React.Dispatch<React.SetStateAction<TemplateSettings>>;
    templatePresets: TemplatePreset[];
    setTemplatePresets: React.Dispatch<React.SetStateAction<TemplatePreset[]>>;
    handleSplit: () => void;
    isLoading: boolean;
    estimatedParts: number;
    recommendedChunkSize: number;
    estimatedCost: { total: number; input: number; output: number; } | null;
}

const InputPanel: React.FC<InputPanelProps> = ({ 
    inputText, setInputText, counts, settings, setSettings, templates, setTemplates, 
    templatePresets, setTemplatePresets, handleSplit, isLoading, estimatedParts, 
    recommendedChunkSize, estimatedCost
}) => {
    return (
        <div className="p-4 md:p-6 flex flex-col gap-6">
            <div className="relative">
                <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste your long text here..."
                    className="w-full h-64 p-4 text-base bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-200 resize-y"
                    disabled={isLoading}
                />
                <div className="absolute bottom-3 right-3 flex gap-4 text-xs bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-gray-600 dark:text-gray-400">
                    <span>{counts.chars.toLocaleString()} Chars</span>
                    <span>{counts.words.toLocaleString()} Words</span>
                    <span className="font-semibold">{counts.tokens.toLocaleString()} Tokens</span>
                </div>
            </div>
            
            <SettingsPanel 
                settings={settings}
                setSettings={setSettings}
                templates={templates}
                setTemplates={setTemplates}
                templatePresets={templatePresets}
                setTemplatePresets={setTemplatePresets}
                estimatedParts={estimatedParts}
                recommendedChunkSize={recommendedChunkSize}
                estimatedCost={estimatedCost}
            />
            
            <button
                onClick={handleSplit}
                disabled={isLoading || !inputText}
                className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-950 transition-colors duration-200"
            >
                {isLoading ? 'Slicing...' : 'Slice Text'}
            </button>
        </div>
    );
};

export default InputPanel;
