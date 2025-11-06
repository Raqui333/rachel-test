# Projeto de Demonstração — Next.js + Supabase + RAG + Docker

Este repositório foi criado como **projeto de demonstração de habilidades técnicas**, integrando **Next.js**, **Supabase**, **RAG** e **Docker** em uma aplicação moderna.

O objetivo é apresentar boas práticas de desenvolvimento, configuração de ambiente, e empacotamento de aplicações web com containers.

---

## Tecnologias Utilizadas

- **Next.js** — Framework React moderno para aplicações fullstack.
- **Supabase** — Backend como serviço, com autenticação, banco de dados Postgres com pgvector para RAG e APIs em tempo real.
- **Prisma** - ORM moderno e seguro.
- **RAG** — Retrieval-Augmented Generation
- **Docker** — Para criar um ambiente isolado e replicável de execução.

---

<p align="center">
  <img src="./docs/dashboard.png" width="45%" />
  <img src="./docs/adminpage.png" width="45%" /><br/>
  <img src="./docs/modpage.png" width="45%" />
  <img src="./docs/ragpage.png" width="45%" />
</p>

---

## Configuração do Supabase

1. Crie um projeto no [Supabase](https://supabase.com/).
2. No painel do projeto, vá em **Project Settings → API Keys** e **Data API** e copie as variáveis para seu `.env`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=<sua-url-do-supabase>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<sua-anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<sua-key-privada>
   ```

> As variáveis com o prefixo `NEXT_PUBLIC_` são necessárias para o acesso no frontend e por tanto serão públicas.

3. Clique em `Connect` na parte superior do Supabase e vá até a aba `ORM`, selecione prisma e copio o conteúdo para o seu `.env` também.

```
# Connect to Supabase via connection pooling
DATABASE_URL="postgresql://postgres.....:[YOUR-PASSWORD]@aws-1...."

# Direct connection to the database. Used for migrations
DIRECT_URL="postgresql://postgres.....:[YOUR-PASSWORD]@aws-1-..."
```

4. Em seguida rode os seguintes comandos no seu projeto, eles irão gerar as tabelas no banco de dados.
   `npx prisma migrate deploy`
5. Vá até **Database → Extensions** e ativa a extenção `pgvector` com as configurações padrões.
6. Agora vá até a **SQL Editor** no Supabase e adicione dois arquivos de query.

- Arquivo 01 (configura permissões)

```
-- Create custom user
create user "prisma" with password 'Zbacmq423fI8IA' bypassrls createdb;

-- extend prisma's privileges to postgres (necessary to view changes in Dashboard)
grant "prisma" to "postgres";

-- Grant it necessary permissions over the relevant schemas (public)
grant usage on schema public to prisma;
grant create on schema public to prisma;
grant all on all tables in schema public to prisma;
grant all on all routines in schema public to prisma;
grant all on all sequences in schema public to prisma;
alter default privileges for role postgres in schema public grant all on tables to prisma;
alter default privileges for role postgres in schema public grant all on routines to prisma;
alter default privileges for role postgres in schema public grant all on sequences to prisma;
```

- Arquivo 02 (crie uma função para vector query)

```
create or replace function match_documents (
  query_embedding vector(3072),  -- já que você usa o modelo 'text-embedding-3-large'
  match_threshold float,
  match_count int
)
returns table (
  title text,
  content text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    d.title,
    d.content,
    1 - (d.embedding <=> query_embedding) as similarity
  from "Document" d
  where 1 - (d.embedding <=> query_embedding) > match_threshold
  order by (d.embedding <=> query_embedding) asc
  limit match_count;
end;
$$;
```

Após isso, rode os arquivos nessa sequencia. 7. Vá em **Authentication → Sign In / Providers** e adicione ou ative o provedor de login por email+senha e desmarque a opção de verificação de email.
8 . Agora só seguir lendo o README.

---

## Criando a Imagem Docker

1. Certifique-se de ter o **Docker** instalado em sua máquina.
2. Para gerar a imagem Docker, execute o comando:

   ```bash
   docker build -t nextjs-demo-app .
   ```

   Isso vai usar automaticamente o `.env` na raiz do projeto, então certifique de ter configurado ele antes.

---

## Executando o Projeto

### Localmente (sem Docker)

```bash
npm install --legacy-peer-deps
npm run dev
```

> Esse `--legacy-peer-deps` é devido a base do projeto ter vindo do `v0-dev` da vercel.

O projeto será iniciado em [http://localhost:3000](http://localhost:3000)
E a API poderá ser acessada por [http://localhost:3000/api](http://localhost:3000/api)

### Usando Docker

```bash
docker run -p 3000:3000 --env-file=.env nextjs-demo-app
```

O projeto estará acessível em [http://localhost:3000](http://localhost:3000)

---

## Objetivo do Projeto

Este projeto foi desenvolvido como **prova de conceito e demonstração de competências** nas seguintes áreas:

- Estruturação de projetos com **Next.js**
- Integração de backend e autenticação com **Supabase**
- Controle de Roles (cargos) diversos em ambiente de usuário
- Criação de pipelines de build e execução com **Docker**
- Criação, armazenamento e search de Retrieval-Augmented Generation
- Uso de Inteligência Artificial com informações direcionadas
- Organização e documentação de ambiente de desenvolvimento
- Upload, Download e Gerenciamento de arquivos

---

## Licença

Distribuído sob a licença MIT.  
Sinta-se à vontade para explorar, modificar e aprender com o código.
