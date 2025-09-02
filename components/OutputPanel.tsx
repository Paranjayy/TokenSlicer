
import React, { useState } from 'react';
import { OutputChunk, TemplateSettings } from '../types';
import { downloadAsZip, downloadAsMarkdown } from '../utils/fileUtils';
import { CopyIcon, CheckIcon, DownloadIcon } from './icons';

interface OutputPanelProps {
    chunks: OutputChunk[];
    templates: TemplateSettings;
    isLoading: boolean;
}

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button onClick={handleCopy} className="p-2 rounded-md text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors">
            {copied ? <CheckIcon className="w-5 h-5 text-green-500" /> : <CopyIcon className="w-5 h-5" />}
        </button>
    );
};


const OutputPanel: React.FC<OutputPanelProps> = ({ chunks, templates, isLoading }) => {
    const hasOutput = chunks.length > 0;
    const hasInstructions = templates.firstMessage.trim().length > 0;

    return (
        <div className="p-4 md:p-6 bg-gray-100 dark:bg-gray-900 h-full">
            {!hasOutput && !isLoading && (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                        <h2 className="text-2xl font-semibold">Your chunks will appear here</h2>
                        <p className="mt-2">Configure your settings and click "Slice Text".</p>
                    </div>
                </div>
            )}
            {isLoading && (
                 <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        <p className="mt-4 text-lg">Processing your text...</p>
                    </div>
                </div>
            )}
            {hasOutput && (
                <div className="flex flex-col h-full">
                    <div className="flex-shrink-0 mb-4 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Output Chunks ({chunks.length})</h2>
                         <div className="flex gap-2">
                             <button onClick={() => downloadAsMarkdown(chunks, templates)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700">
                                <DownloadIcon className="w-4 h-4"/> MD
                            </button>
                            <button onClick={() => downloadAsZip(chunks, templates)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700">
                                <DownloadIcon className="w-4 h-4"/> ZIP
                            </button>
                        </div>
                    </div>
                    <div className="flex-grow overflow-y-auto space-y-4 pr-2 -mr-2">
                        {hasInstructions && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg">
                                <div className="p-3 flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-blue-800 dark:text-blue-300">Global Instructions</h3>
                                        <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">{templates.firstMessage}</p>
                                    </div>
                                    <CopyButton text={templates.firstMessage} />
                                </div>
                            </div>
                        )}
                        {chunks.map((chunk, index) => (
                             <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                                <div className="p-3 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                                    <h4 className="font-mono text-sm font-semibold text-gray-700 dark:text-gray-300">{chunk.name}</h4>
                                    <CopyButton text={chunk.content} />
                                </div>
                                <div className="p-4 max-h-48 overflow-y-auto">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{chunk.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OutputPanel;
