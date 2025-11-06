import { GoogleGenAI } from '@google/genai';

export default async function getEmbedContent(content: string) {
  const ai = new GoogleGenAI({});

  if (!content || content.trim() === '') {
    throw new Error('No content provided');
  }

  try {
    const response = await ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: content,
    });

    if (!response || !response.embeddings || !response.embeddings[0].values) {
      throw new Error('Error: Embedding not generated');
    }

    return response.embeddings[0].values;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Error generating embedding:' + error);
  }
}
