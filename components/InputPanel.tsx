import React from 'react';
import SettingsPanel from './SettingsPanel';
import FileDropZone from './FileDropZone';
import { SplitSettings, TemplateSettings, TemplatePreset } from '../types';

/**
 * InputPanel Component
 * Provides the text input area with file upload support, settings panel,
 * and the main split text button.
 */
interface InputPanelProps {
  /** Current input text value */
  inputText: string;
  /** Function to update input text */
  setInputText: (text: string) => void;
  /** Character, word, and token counts for the input text */
  counts: { chars: number; words: number; tokens: number };
  /** Current splitting configuration */
  settings: SplitSettings;
  /** Function to update splitting settings */
  setSettings: React.Dispatch<React.SetStateAction<SplitSettings>>;
  /** Current template settings for chunk formatting */
  templates: TemplateSettings;
  /** Function to update template settings */
  setTemplates: React.Dispatch<React.SetStateAction<TemplateSettings>>;
  /** Available template presets */
  templatePresets: TemplatePreset[];
  /** Function to update template presets */
  setTemplatePresets: React.Dispatch<React.SetStateAction<TemplatePreset[]>>;
  /** Callback to handle text splitting */
  handleSplit: () => void;
  /** Whether a split operation is in progress */
  isLoading: boolean;
  /** Estimated number of chunks to be generated */
  estimatedParts: number;
  /** Recommended chunk size based on model configuration */
  recommendedChunkSize: number;
  /** Estimated cost breakdown for processing */
  estimatedCost: { total: number; input: number; output: number } | null;
  /** Optional callback for when a file is imported */
  onFileImport?: (text: string) => void;
}

const InputPanel: React.FC<InputPanelProps> = ({ 
    inputText, setInputText, counts, settings, setSettings, templates, setTemplates, 
    templatePresets, setTemplatePresets, handleSplit, isLoading, estimatedParts, 
    recommendedChunkSize, estimatedCost, onFileImport
}) => {
    return (
        <div className="p-4 md:p-6 flex flex-col gap-6">
            {inputText.length === 0 && onFileImport && (
                <FileDropZone onFileSelect={onFileImport} disabled={isLoading} />
            )}
            
            <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Text Input
                </label>
                <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste your long text here..."
                    className="w-full h-64 p-4 text-base bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-gray-200 resize-y transition-all duration-200 leading-relaxed"
                    disabled={isLoading}
                    aria-label="Text input for splitting"
                />
                <div className="absolute bottom-3 right-3 flex gap-4 text-xs bg-white dark:bg-gray-700 px-3 py-1.5 rounded-full text-gray-600 dark:text-gray-300 shadow-sm border border-gray-200 dark:border-gray-600 font-medium">
                    <span title="Character count">{counts.chars.toLocaleString()} Chars</span>
                    <span title="Word count">{counts.words.toLocaleString()} Words</span>
                    <span className="text-blue-600 dark:text-blue-400 font-semibold" title="Token count">{counts.tokens.toLocaleString()} Tokens</span>
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
                className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-950 transition-all duration-200"
                aria-busy={isLoading}
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 spinner" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25"/>
                            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        Slicing...
                    </span>
                ) : 'Slice Text'}
            </button>
        </div>
    );
};

export default InputPanel;
