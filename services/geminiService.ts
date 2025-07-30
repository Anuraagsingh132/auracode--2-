
import { GoogleGenAI } from "@google/genai";
import type { AiMessage } from "../App";

// --- TYPES (Redefined from App.tsx to avoid import issues) ---
interface FileItem {
  id: string;
  name: string;
  type: 'file';
  language: string;
  content: string;
}
interface FolderItem {
  id:string;
  name: string;
  type: 'folder';
  children: FileSystemItem[];
}
type FileSystemItem = FileItem | FolderItem;


if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = "gemini-2.5-flash";

// --- HELPERS ---

/**
 * Recursively builds a string representing the entire file system structure.
 * @param items The file system items to process.
 * @param pathParts The current path segments.
 * @returns A formatted string of all files and their content.
 */
const buildWorkspaceContext = (items: FileSystemItem[], pathParts: string[] = []): string => {
    return items.map(item => {
        const currentPath = [...pathParts, item.name];
        if (item.type === 'file') {
            return `---
File: /${currentPath.join('/')}
---
\`\`\`${item.language || 'plaintext'}
${item.content}
\`\`\`
`;
        }
        if (item.type === 'folder') {
            return buildWorkspaceContext(item.children, currentPath);
        }
        return '';
    }).filter(Boolean).join('\n');
};

/**
 * Finds the full path of a given item ID in the file system.
 * @param fs The entire file system.
 * @param id The ID of the item to find.
 * @returns The full path string (e.g., /src/components/Button.js).
 */
const getPath = (fs: FileSystemItem[], id: string): string => {
  let path = '';
  const find = (items: FileSystemItem[], parts: string[]): boolean => {
    for (const item of items) {
      const currentPathParts = [...parts, item.name];
      if (item.id === id) {
        path = currentPathParts.join('/');
        return true;
      }
      if (item.type === 'folder') {
        if (find(item.children, currentPathParts)) {
          return true;
        }
      }
    }
    return false;
  };
  find(fs, []);
  return `/${path}`;
};


/**
 * Sends a code snippet to the Gemini API and asks for an explanation, providing full workspace context.
 * @param code The code snippet to explain.
 * @param language The programming language of the snippet.
 * @param fileSystem The entire file system structure.
 * @param activeFileId The ID of the currently active file.
 * @returns A promise that resolves to the explanation text.
 */
export async function explainCode(
  code: string,
  language: string,
  fileSystem: FileSystemItem[],
  activeFileId: string
): Promise<string> {
  const workspaceContext = buildWorkspaceContext(fileSystem);
  const activeFilePath = getPath(fileSystem, activeFileId);
  
  const systemInstruction = `You are Aura, an expert developer and AI assistant specializing in code explanation. Your tone is knowledgeable, calm, and helpful. Explain the provided code snippet clearly and concisely. Focus on the core logic, its purpose, and any important patterns. You MUST consider the entire workspace context provided to understand imports and dependencies between files. Use markdown for formatting.`;
  
  const prompt = `The user's workspace contains the following files:

${workspaceContext}

The user is currently focused on the file "${activeFilePath}" and has highlighted a code snippet.

Please explain this ${language} code snippet:
\`\`\`${language}
${code}
\`\`\`
`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2,
        topP: 0.9,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to get explanation from AI: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the AI.");
  }
}

/**
 * Sends code and an error message to Gemini for debugging help, providing full workspace context.
 * @param code The code that produced the error.
 * @param error The error message.
 * @param language The programming language of the code.
 * @param fileSystem The entire file system structure.
 * @param activeFileId The ID of the file that produced the error.
 * @returns A promise that resolves to the debugging explanation.
 */
export async function debugCode(
  code: string,
  error: string,
  language: string,
  fileSystem: FileSystemItem[],
  activeFileId: string
): Promise<string> {
    const workspaceContext = buildWorkspaceContext(fileSystem);
    const activeFilePath = getPath(fileSystem, activeFileId);

    const systemInstruction = `You are Aura, an expert developer and AI assistant specializing in debugging. Your tone is encouraging and helpful. A user's code has produced an error. Explain the error in simple terms, identify the likely cause in their code, and suggest a specific fix. You MUST consider all files in the provided workspace to identify the root cause, especially for issues related to imports or dependencies between files. Use markdown for formatting.`;

    const prompt = `The user's workspace contains the following files:

${workspaceContext}

The user's code in "${activeFilePath}" produced an error. Can you help me debug it?

Here is the error message:
\`\`\`
${error}
\`\`\`

Here is the full code from "${activeFilePath}" that caused it:
\`\`\`${language}
${code}
\`\`\`

Please analyze the entire workspace and provide a debugging solution.`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.3,
            }
        });
        return response.text;
    } catch (err) {
        console.error("Gemini API call for debugging failed:", err);
        if (err instanceof Error) {
            throw new Error(`Failed to get debugging help from AI: ${err.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the AI.");
    }
}

/**
 * Continues a conversation with the user based on history and workspace context.
 * @param conversationHistory The history of the conversation.
 * @param fileSystem The entire file system structure.
 * @param activeFileId The ID of the currently active file.
 * @returns A promise that resolves to the AI's next response.
 */
export async function askFollowUp(
  conversationHistory: AiMessage[],
  fileSystem: FileSystemItem[],
  activeFileId: string | null
): Promise<string> {
    const workspaceContext = buildWorkspaceContext(fileSystem);
    const activeFilePath = activeFileId ? getPath(fileSystem, activeFileId) : 'an unknown file';

    const systemInstruction = `You are Aura, an expert developer and AI assistant. Your role is to continue a conversation with the user, answering their follow-up questions about their code. Maintain the context from the previous messages and the provided workspace files. Your explanations should be clear, concise, and helpful. Use markdown for formatting, especially for code blocks.`;

    const historyString = conversationHistory.map(turn => {
        if (turn.role === 'model') {
            return `**Aura (AI):**\n${turn.content}`;
        } else { // 'user'
            return `**User:**\n${turn.content}`;
        }
    }).join('\n\n---\n\n');

    const prompt = `You are in a conversation with a user about their code. Continue the conversation naturally.

**Entire Workspace Context:**
${workspaceContext}

---
**Current File In Focus:** ${activeFilePath}
---

**Conversation History (most recent message is last):**
${historyString}

---

Based on this conversation, provide a helpful response to the user's last message.`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.5,
            }
        });
        return response.text;
    } catch (err) {
        console.error("Gemini API call for follow-up failed:", err);
        if (err instanceof Error) {
            throw new Error(`Failed to get follow-up from AI: ${err.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the AI.");
    }
}