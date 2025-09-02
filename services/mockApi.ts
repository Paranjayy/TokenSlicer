
import { SplitSettings, Boundary, SplitUnit, OutputChunk, ExtractedContent, YouTubeContent, RedditContent, GenericContent, RedditComment } from '../types';

export const countTokens = async (text: string, encoding: string): Promise<number> => {
  // Mock implementation: a simple approximation.
  // In a real app, this would call a backend with a real tokenizer like tiktoken.
  await new Promise(res => setTimeout(res, 150)); // Simulate network latency
  return Math.ceil(text.length / 4);
};

const splitByBoundary = (text: string, boundary: Boundary): string[] => {
    if (boundary === 'sentence') {
        // A simple regex for sentences. Won't handle all edge cases.
        return text.match(/[^.!?]+[.!?]*\s*/g) || [text];
    }
    if (boundary === 'paragraph') {
        return text.split(/(\r\n|\n){2,}/).filter(p => p.trim() !== '');
    }
    return [text]; // 'none' boundary
};

export const splitText = async (text: string, settings: SplitSettings): Promise<OutputChunk[]> => {
    await new Promise(res => setTimeout(res, 500)); // Simulate processing latency

    if (!text.trim()) return [];

    const { size, overlap, boundary, unit } = settings;
    let chunks: string[] = [];
    
    // This is a simplified mock. A real implementation would be much more complex,
    // especially for token-based splitting with boundary awareness.
    if (unit === 'characters' || unit === 'words') {
        const segments = splitByBoundary(text, boundary);
        let currentChunk = "";
        
        segments.forEach(segment => {
            if (currentChunk.length > 0 && (currentChunk.length + segment.length) > size) {
                chunks.push(currentChunk);
                const overlapText = currentChunk.slice(-overlap);
                currentChunk = (overlap > 0 ? overlapText : "") + segment;
            } else {
                currentChunk += segment;
            }
        });
        if (currentChunk.length > 0) chunks.push(currentChunk);
        
        // Final pass to ensure no chunk greatly exceeds size
        const finalChunks: string[] = [];
        chunks.forEach(chunk => {
            for (let i = 0; i < chunk.length; i += size) {
                finalChunks.push(chunk.substring(i, i + size));
            }
        });
        chunks = finalChunks;
        
    } else { // Mock token splitting
        const approxTokens = await countTokens(text, 'cl100k_base');
        const numChunks = Math.ceil(approxTokens / size);
        const charsPerChunk = Math.ceil(text.length / numChunks);
        for(let i = 0; i < text.length; i += (charsPerChunk - overlap)) {
            chunks.push(text.substring(i, i + charsPerChunk));
        }
    }

    if (chunks.length === 0) return [];
    
    return chunks.map((content, i) => ({
        name: `split_${String(i + 1).padStart(3, '0')}_of_${String(chunks.length).padStart(3, '0')}.txt`,
        content: content.trim()
    }));
};

export const extractContent = async (url: string): Promise<ExtractedContent> => {
  await new Promise(res => setTimeout(res, 1200)); // Simulate network and processing latency

  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return {
      type: 'youtube',
      metadata: {
        title: "The Transformer Architecture: Attention Is All You Need",
        channel: "AI Explained",
        duration: "12:34",
        views: 1_234_567,
        thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg", // A placeholder image
      },
      transcript: `(Mock Transcript)
Hello everyone, and welcome back to the channel. Today, we're going to be diving deep into the world of large language models and how they are transforming the way we interact with technology. 
First, let's talk about the architecture. Most modern LLMs are based on the transformer architecture, which was introduced in the paper "Attention Is All You Need". This architecture uses self-attention mechanisms to weigh the importance of different words in the input text. This allows the model to capture long-range dependencies and understand context much more effectively than previous models like LSTMs or RNNs.
One of the key breakthroughs was the idea of pre-training on a massive corpus of text data and then fine-tuning for specific tasks. This two-stage process allows the model to learn general language patterns from the pre-training phase, and then specialize its knowledge for tasks like translation, summarization, or question answering during the fine-tuning phase. This has proven to be incredibly effective.
So, what are the implications of this? We are seeing applications in everything from content creation, where models can generate articles and scripts, to customer service, where chatbots can handle complex queries with remarkable accuracy. The possibilities are truly endless.
Thank you for watching. Don't forget to like and subscribe for more content on AI and machine learning.`,
    } as YouTubeContent;
  }

  if (url.includes('reddit.com')) {
    return {
      type: 'reddit',
      metadata: {
        title: "What's a 'small' thing you started doing that's greatly improved your life?",
        subreddit: "r/AskReddit",
        author: "u/curious_cat",
        score: 4281,
      },
      postBody: "Looking for those little life hacks or habit changes that have a surprisingly big impact. Not looking for \"I started going to the gym\" but more like \"I put my keys in the same spot every day\".",
      comments: [
        { 
          author: 'u/ProductivityPro', score: 2100, body: 'The "two-minute rule". If a task takes less than two minutes to complete, do it immediately instead of putting it off. Cleaning up a small spill, answering a quick email, putting away a dish. It\'s amazing how much it reduces mental clutter.',
          replies: [
            { author: 'u/CleanFreak', score: 540, body: 'This is the one. My apartment has never been cleaner since I started doing this. It stops tiny messes from becoming huge weekend-long cleaning projects.', replies: [] }
          ]
        },
        { author: 'u/HydrationHomie', score: 1500, body: 'Drinking a full glass of water first thing in the morning, before coffee or anything else. It helps you rehydrate after sleeping and I find it wakes me up better than caffeine.', replies: [] },
        { author: 'u/StretchySam', score: 980, body: 'Stretching for 5 minutes before I get out of bed. Just some simple leg and back stretches. It gets rid of all the morning stiffness and makes the rest of the day feel so much better.', replies: [] },
      ] as RedditComment[],
    } as RedditContent;
  }

  // Generic URL fetcher
  return {
    type: 'generic',
    metadata: {
        title: 'The Rise of the Digital Nomad',
        description: 'Fueled by advancements in technology and a global shift towards remote work, more people than ever are trading their traditional office spaces for the freedom of the open road.',
        ogImage: 'https://example.com/images/digital_nomad.jpg'
    }
  } as GenericContent;
};
