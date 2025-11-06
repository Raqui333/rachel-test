-- Ativar extensão (se ainda não estiver ativa)
CREATE EXTENSION IF NOT EXISTS vector;


-- Adicionar coluna vetorial na tabela (1536 dims é comum p/ OpenAI embeddings)
ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS embedding vector(3072);


-- Tabela de perfis vinculada ao auth.users


-- RLS
ALTER TABLE "Document" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Profile" ENABLE ROW LEVEL SECURITY;


-- Policies: cada usuário só enxerga seus documentos
CREATE POLICY doc_select_own ON "Document"
FOR SELECT USING (auth.uid()::text = "userId");


CREATE POLICY doc_insert_own ON "Document"
FOR INSERT WITH CHECK (auth.uid()::text = "userId");


CREATE POLICY doc_update_own ON "Document"
FOR UPDATE USING (auth.uid()::text = "userId")
WITH CHECK (auth.uid()::text = "userId");


-- Profile policy: ler só seu perfil
CREATE POLICY profile_select_self ON "Profile"
FOR SELECT USING (auth.uid()::text = "userId");
