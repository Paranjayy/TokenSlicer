import { OutputChunk, TemplateSettings, TemplatePreset, ExtractedContent, RedditComment } from '../types';

declare const JSZip: any;

const applyTemplate = (content: string, part: number, total: number, header: string, footer: string) => {
  const replacePlaceholders = (template: string) =>
    template.replace(/{part}/g, String(part)).replace(/{total}/g, String(total));

  return `${replacePlaceholders(header)}\n${content}\n${replacePlaceholders(footer)}`;
};

export const downloadAsZip = (chunks: OutputChunk[], templates: TemplateSettings) => {
  const zip = new JSZip();
  const total = chunks.length;

  if (templates.firstMessage.trim()) {
    zip.file("000_instructions.txt", templates.firstMessage);
  }

  chunks.forEach((chunk, index) => {
    const partNumber = index + 1;
    const contentWithTemplate = applyTemplate(chunk.content, partNumber, total, templates.perChunkHeader, templates.perChunkFooter);
    zip.file(chunk.name, contentWithTemplate);
  });
  
  zip.generateAsync({ type: "blob" }).then(function(content: Blob) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = "tokenslicer_chunks.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
};

export const downloadAsMarkdown = (chunks: OutputChunk[], templates: TemplateSettings) => {
  const total = chunks.length;
  let markdownContent = "";

  if (templates.firstMessage.trim()) {
    markdownContent += `## Global Instructions\n\n\`\`\`\n${templates.firstMessage}\n\`\`\`\n\n---\n\n`;
  }

  chunks.forEach((chunk, index) => {
    const partNumber = index + 1;
    const contentWithTemplate = applyTemplate(chunk.content, partNumber, total, templates.perChunkHeader, templates.perChunkFooter);
    markdownContent += `### Part ${partNumber} of ${total}\n\n`;
    markdownContent += `\`\`\`\n${contentWithTemplate}\n\`\`\`\n\n---\n\n`;
  });

  const blob = new Blob([markdownContent], { type: 'text/markdown' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = "tokenslicer_chunks.md";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportTemplates = (templates: TemplatePreset[]) => {
  const jsonContent = JSON.stringify(templates, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = "tokenslicer_templates.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// --- New Extractor Utils ---

const sanitizeFilename = (name: string) => {
    return name.replace(/[^a-z0-9_\-]/gi, '_').substring(0, 100);
}

export const downloadAsJson = (data: ExtractedContent) => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${sanitizeFilename(data.metadata.title)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const formatRedditComments = (comments: RedditComment[], depth = 0): string => {
  let markdown = '';
  const indent = '  '.repeat(depth) + '* ';
  comments.forEach(comment => {
    markdown += `${indent}**${comment.author}** (${comment.score} points):\n`;
    markdown += `${'  '.repeat(depth + 1)}${comment.body.replace(/\n/g, `\n${'  '.repeat(depth + 1)}`)}\n\n`;
    if (comment.replies && comment.replies.length > 0) {
      markdown += formatRedditComments(comment.replies, depth + 1);
    }
  });
  return markdown;
};

export const downloadExtractedAsMarkdown = (data: ExtractedContent) => {
  let markdownContent = `# ${data.metadata.title}\n\n`;
  
  markdownContent += `## Metadata\n\n`;
  for (const [key, value] of Object.entries(data.metadata)) {
    if (key === 'title') continue;
    markdownContent += `* **${key}:** ${value}\n`;
  }
  markdownContent += '\n---\n\n';

  switch(data.type) {
    case 'youtube':
      markdownContent += `## Transcript\n\n${data.transcript}\n`;
      break;
    case 'reddit':
      markdownContent += `## Post Body\n\n${data.postBody}\n\n---\n\n## Comments\n\n`;
      markdownContent += formatRedditComments(data.comments);
      break;
    case 'generic':
      markdownContent += `## Description\n\n${data.metadata.description || 'N/A'}\n`;
      break;
  }
  
  const blob = new Blob([markdownContent], { type: 'text/markdown' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${sanitizeFilename(data.metadata.title)}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
