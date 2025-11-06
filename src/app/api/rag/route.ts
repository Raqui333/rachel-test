import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import getEmbedContent from '@/lib/embeddings';
import dedent from 'dedent';
import { supabaseServer } from '@/lib/supabase';

const ai = new GoogleGenAI({});

// In-memory message database (for demonstration purposes)
type Message = { type: 'user' | 'bot'; content: string };
let db: Message[] = [];

const INSTRUCTIONS = dedent`
  Você é Rachel uma **assistente jurídico sênior** com expertise em **análise documental e fundamentação jurídica** 
  no ordenamento brasileiro. Seu objetivo é **responder perguntas jurídicas com base exclusivamente nos documentos fornecidos**, 
  independentemente do setor (ambiental, trabalhista, consumerista, societário, tributário, penal, etc.).

  REGRAS OBRIGATÓRIAS DE ANÁLISE E RESPOSTA:
  1. **Identifique automaticamente o ramo do Direito** envolvido (ex: Ambiental, Civil, Trabalhista, etc.) com base nos documentos.
  2. **Extraia e cite literalmente**:
    - Dispositivos legais mencionados (ex: **art. 927, CC**, **art. 14, §1º, Lei 6.938/81**)
    - Trechos de petições, pareceres, laudos, decisões ou contratos
    - Nomes de partes, processos, juízos, valores, prazos
  3. **Estruture a resposta em tópicos claros**:
  `;

interface MatchType {
  title: string;
  content: string;
  similarity: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body || !body.text || body.text.trim() === '') {
      return new NextResponse('Error: text is required', {
        status: 400,
      });
    }

    const startTime = Date.now();

    const questionEmbedding = await getEmbedContent(body.text);

    const supabase = supabaseServer();
    const { data: matches, error } = await supabase.rpc('match_documents', {
      query_embedding: questionEmbedding,
      match_threshold: 0.7,
      match_count: 5,
    });

    const prompt = dedent`
      Esse é o historico de mensagens, você é o "bot" e "user" é o usuário:
      ${db.map((msg) => `${msg.type}: ${msg.content}`).join('\n')}

      Use **apenas** os documentos recuperados abaixo como fonte de verdade. **Não utilize conhecimento pré-treinado** para criar fatos, leis ou jurisprudência.
      ${matches
        .map(
          (item: MatchType) => `{ similarity: "${item.similarity}", content: "${item.content}" }`
        )
        .join('\n')}
      
      Pergunta do usuário:
      ${body.text}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { systemInstruction: INSTRUCTIONS },
    });

    const endTime = Date.now();
    const thinkingTime = Math.floor((endTime - startTime) / 1000);

    db.push({ type: 'user', content: body.text }, { type: 'bot', content: response.text || '' });

    return new NextResponse(JSON.stringify({ text: response.text, thinkingTime }), {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse('Error occurred', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}
