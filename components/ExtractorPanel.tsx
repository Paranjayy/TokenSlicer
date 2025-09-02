import React, { useState } from 'react';
import { LinkIcon, DownloadIcon, PlusIcon, MinusIcon } from './icons';
import { extractContent } from '../services/mockApi';
import { ExtractedContent, RedditComment } from '../types';
import { downloadAsJson, downloadExtractedAsMarkdown } from '../utils/fileUtils';

const MetadataCard: React.FC<{ metadata: ExtractedContent['metadata'], type: ExtractedContent['type'] }> = ({ metadata, type }) => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Metadata ({type})</h3>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {Object.entries(metadata).map(([key, value]) => (
                 <div key={key}>
                    <span className="font-semibold text-gray-700 dark:text-gray-300 capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
                    {typeof value === 'string' && (value.startsWith('http') || value.startsWith('https')) ? (
                        <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">{value}</a>
                    ) : (
                        <span className="text-gray-600 dark:text-gray-400">{value.toString()}</span>
                    )}
                </div>
            ))}
        </div>
    </div>
);

const TranscriptCard: React.FC<{ text: string }> = ({ text }) => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Transcript</h3>
        </div>
        <div className="p-4 max-h-96 overflow-y-auto">
            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{text}</p>
        </div>
    </div>
);

const Comment: React.FC<{ comment: RedditComment; defaultCollapsed: boolean }> = ({ comment, defaultCollapsed }) => {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
    const hasReplies = comment.replies && comment.replies.length > 0;

    return (
        <div>
            <div className="flex items-start mt-3">
                <div className="w-6 flex-shrink-0 flex justify-center pt-0.5">
                    {hasReplies && (
                        <button 
                            onClick={() => setIsCollapsed(!isCollapsed)} 
                            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                            aria-label={isCollapsed ? 'Expand replies' : 'Collapse replies'}
                        >
                            {isCollapsed ? <PlusIcon className="w-3.5 h-3.5 text-gray-500"/> : <MinusIcon className="w-3.5 h-3.5 text-gray-500" />}
                        </button>
                    )}
                </div>
                <div className="flex-grow">
                    <p className="text-xs">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">{comment.author}</span>
                        <span className="text-gray-500 dark:text-gray-400"> • {comment.score} points</span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 whitespace-pre-wrap">{comment.body}</p>
                </div>
            </div>
            
            {!isCollapsed && hasReplies && (
                <div className="pl-4 border-l-2 border-gray-200 dark:border-gray-700/50 ml-3">
                    {comment.replies.map((reply, index) => (
                        <div key={index} className="pt-2">
                             <Comment comment={reply} defaultCollapsed={true} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const RedditCard: React.FC<{ postBody: string, comments: RedditComment[] }> = ({ postBody, comments }) => (
     <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Reddit Content</h3>
        </div>
        <div className="p-4">
            <h4 className="font-medium text-gray-700 dark:text-gray-300">Post Body</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-4 whitespace-pre-wrap">{postBody}</p>
            <h4 className="font-medium text-gray-700 dark:text-gray-300">Comments</h4>
             <div className="mt-2 max-h-[40rem] overflow-y-auto">
                {comments.map((comment, index) => (
                    <Comment key={index} comment={comment} defaultCollapsed={false} />
                ))}
             </div>
        </div>
    </div>
);

const ExtractionResults: React.FC<{ data: ExtractedContent }> = ({ data }) => {
    return (
        <div className="space-y-4">
            <MetadataCard metadata={data.metadata} type={data.type} />
            {data.type === 'youtube' && <TranscriptCard text={data.transcript} />}
            {data.type === 'reddit' && <RedditCard postBody={data.postBody} comments={data.comments} />}
        </div>
    );
};

const ExtractorPanel: React.FC = () => {
    const [url, setUrl] = useState('');
    const [isFetching, setIsFetching] = useState(false);
    const [extractedData, setExtractedData] = useState<ExtractedContent | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFetch = async () => {
        if (!url) return;
        setIsFetching(true);
        setError(null);
        setExtractedData(null);
        try {
            const content = await extractContent(url);
            setExtractedData(content);
        } catch (err) {
            console.error("Failed to fetch content:", err);
            setError("Failed to fetch content from the URL. Please check the URL and try again.");
        } finally {
            setIsFetching(false);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleFetch();
        }
    };

    return (
        <div className="p-4 md:p-6 flex flex-col gap-6 h-full bg-gray-50 dark:bg-gray-950">
            <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 flex-shrink-0">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Content Extractor</h3>
                    {extractedData && (
                         <div className="flex gap-2">
                             <button onClick={() => downloadExtractedAsMarkdown(extractedData)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700">
                                <DownloadIcon className="w-4 h-4"/> MD
                            </button>
                            <button onClick={() => downloadAsJson(extractedData)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700">
                                <DownloadIcon className="w-4 h-4"/> JSON
                            </button>
                        </div>
                    )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-3">Enter a YouTube, Reddit, or article URL to extract its content and metadata.</p>
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-grow">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter URL..."
                            className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm pl-9 pr-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isFetching}
                        />
                    </div>
                    <button
                        onClick={handleFetch}
                        disabled={isFetching || !url}
                        className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-950 transition-colors duration-200"
                    >
                        {isFetching ? (
                            <div className="flex items-center justify-center w-[106px]">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Fetching...
                            </div>
                        ) : 'Fetch Content'}
                    </button>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto -m-4 md:-m-6 p-4 md:p-6">
                {isFetching && (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-500 dark:text-gray-400">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                            <p className="mt-4 text-lg">Extracting content...</p>
                        </div>
                    </div>
                )}
                {error && (
                    <div className="flex items-center justify-center h-full">
                         <div className="text-center text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                            <h3 className="font-semibold">Extraction Failed</h3>
                            <p className="text-sm">{error}</p>
                         </div>
                    </div>
                )}
                {extractedData && <ExtractionResults data={extractedData} />}
                {!isFetching && !extractedData && !error &&(
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-500 dark:text-gray-400">
                             <h2 className="text-2xl font-semibold">Extraction results will appear here</h2>
                             <p className="mt-2">Enter a URL above and click "Fetch Content".</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExtractorPanel;