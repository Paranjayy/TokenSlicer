
import { ModelPreset, TemplatePreset } from './types';

export const MODEL_PRESETS: ModelPreset[] = [
  // --- OpenAI ---
  {
    id: 'openai:gpt-4.1-api',
    label: 'GPT-4.1 (API)',
    provider: 'openai',
    platform: 'API',
    inputContext: 1_000_000,
    outputContext: 16_000,
    pricing: { inputPer1k: 0.005, outputPer1k: 0.015, unit: 'tokens' },
    capabilities: ['reasoning', 'vision', 'tool_calling'],
    status: 'premium',
    encoding: 'o200k_base',
    defaultReplyBudget: 8000,
    defaultGuardBandPct: 0.02,
    notes: 'OpenAI\'s long-context flagship model via API.',
  },
  {
    id: 'openai:gpt-4o-api',
    label: 'GPT-4o (API)',
    provider: 'openai',
    platform: 'API',
    inputContext: 128_000,
    outputContext: 4096,
    pricing: { inputPer1k: 0.005, outputPer1k: 0.015, unit: 'tokens' },
    capabilities: ['fast', 'vision', 'reasoning', 'image_generation'],
    status: 'default',
    encoding: 'o200k_base',
    defaultReplyBudget: 4000,
    defaultGuardBandPct: 0.02,
    notes: 'Fast, multimodal model. API supports 128K context.',
  },
  {
    id: 'openai:gpt-5-chat',
    label: 'GPT-5 (ChatGPT)',
    provider: 'openai',
    platform: 'ChatGPT.com',
    inputContext: 34815,
    outputContext: 34815,
    encoding: 'o200k_base',
    capabilities: ['reasoning', 'effort_control'],
    status: 'new',
    defaultReplyBudget: 4000,
    defaultGuardBandPct: 0.03,
    notes: 'Context window as observed on ChatGPT.com.',
  },
  {
    id: 'openai:gpt-5-thinking-chat',
    label: 'GPT-5 Thinking (ChatGPT)',
    provider: 'openai',
    platform: 'ChatGPT.com',
    inputContext: 196608,
    outputContext: 196608,
    encoding: 'o200k_base',
    capabilities: ['reasoning', 'effort_control', 'pdf_comprehension'],
    status: 'new',
    defaultReplyBudget: 8000,
    defaultGuardBandPct: 0.02,
    notes: 'Large context for complex tasks on ChatGPT.com.',
  },

  // --- Google ---
  {
    id: 'google:gemini-2.5-pro',
    label: 'Gemini 2.5 Pro',
    provider: 'google',
    platform: 'AI Studio',
    inputContext: 1_048_576,
    outputContext: 65536,
    pricing: { inputPer1k: 0.0035, outputPer1k: 0.0105, unit: 'tokens' },
    capabilities: ['reasoning', 'vision', 'tool_calling'],
    status: 'premium',
    encoding: 'google',
    defaultReplyBudget: 8000,
    defaultGuardBandPct: 0.02,
    notes: 'Google\'s flagship model with a 1M context window. 2M coming soon.',
  },
  {
    id: 'google:gemini-2.5-flash',
    label: 'Gemini 2.5 Flash',
    provider: 'google',
    platform: 'AI Studio',
    inputContext: 1_048_576,
    outputContext: 8192,
    pricing: { inputPer1k: 0.00035, outputPer1k: 0.00105, unit: 'tokens' },
    capabilities: ['fast', 'reasoning'],
    encoding: 'google',
    defaultReplyBudget: 4000,
    defaultGuardBandPct: 0.02,
    notes: 'Optimized for speed and efficiency with a large context.',
  },

  // --- Anthropic ---
  {
    id: 'anthropic:claude-3.5-sonnet',
    label: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    platform: 'API',
    inputContext: 200_000,
    outputContext: 4096,
    pricing: { inputPer1k: 0.003, outputPer1k: 0.015, unit: 'tokens' },
    capabilities: ['reasoning', 'vision'],
    status: 'new',
    encoding: 'anthropic',
    defaultReplyBudget: 4000,
    defaultGuardBandPct: 0.02,
    notes: 'High-performance model from Anthropic, strong in reasoning.',
  },

  // --- Open Source / Other ---
  {
    id: 'mistral:mistral-large',
    label: 'Mistral Large',
    provider: 'mistral',
    platform: 'API',
    inputContext: 32000,
    outputContext: 32000,
    pricing: { inputPer1k: 0.004, outputPer1k: 0.012, unit: 'tokens' },
    capabilities: ['reasoning', 'tool_calling'],
    encoding: 'cl100k_base', // Mistral uses a SentencePiece tokenizer, but cl100k_base is a decent approximation
    defaultReplyBudget: 4000,
    defaultGuardBandPct: 0.05,
    notes: 'Flagship model from Mistral AI.'
  },
  {
    id: 'custom',
    label: 'Custom',
    provider: 'other',
    inputContext: 8000,
    outputContext: 2000,
    encoding: 'cl100k_base',
    defaultReplyBudget: 1000,
    defaultGuardBandPct: 0.05,
    notes: 'A generic starting point for custom configurations.',
  },
];

export const DEFAULT_PRESET_ID = 'openai:gpt-4o-api';

export const TEMPLATE_PRESETS: TemplatePreset[] = [
    {
        id: 'default',
        label: 'Default (Safe Acknowledgment)',
        settings: {
            firstMessage: 'Please analyze the following text provided in multiple parts. I will send you the content in chunks. Do not provide any analysis or response until I explicitly ask you to, after I have sent all the parts. Your only response to each part should be "OK." to acknowledge receipt.',
            perChunkHeader: '[START PART {part}/{total}]',
            perChunkFooter: '[END PART {part}/{total}]',
        },
    },
    {
        id: 'summarization',
        label: 'Summarization Task',
        settings: {
            firstMessage: 'You are an expert summarizer. I will provide a long document in several parts. Please wait until I have sent all parts, which will be indicated by "[END OF DOCUMENT]". After that, provide a concise summary of the entire document.',
            perChunkHeader: '--- Part {part} of {total} ---',
            perChunkFooter: '--- End of Part {part} ---',
        },
    },
    {
        id: 'qa',
        label: 'Question & Answer',
        settings: {
            firstMessage: 'I am providing a document in chunks for you to use as a knowledge base. Please process each part. After I send the final part, I will start asking you questions about the content.',
            perChunkHeader: '--- CONTEXT PART {part}/{total} ---',
            perChunkFooter: '',
        },
    }
];