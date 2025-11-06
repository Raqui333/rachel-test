'use client';

import { getAccessToken } from '@/actions/utils';
import Sidebar from '@/components/Sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabaseBrowser } from '@/lib/supabase';
import { fi } from 'date-fns/locale';
import { Download, FileText, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface FileItem {
  folder: string;
  id: string;
  name: string;
  type: string;
  size: string;
}

export default function ModeracaoPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [role, setRole] = useState<string>('');

  useEffect(() => {
    fetch('/api/storage', {
      method: 'GET',
    }).then(async (resp) => {
      const data: FileItem[] = await resp.json();
      setFiles(data);
    });

    getAccessToken().then((token) => {
      const sb = supabaseBrowser();
      sb.auth.getUser(token).then((t) => {
        setRole(t.data.user?.user_metadata.role);
      });
    });
  }, []);

  const handleDelete = async (name: string, id: string) => {
    const resp = await fetch('/api/storage', {
      method: 'DELETE',
      body: JSON.stringify({ fileName: name }),
    });

    if (resp.status === 200) {
      setFiles((prev) => prev.filter((f) => f.id !== id));
    }

    toast({
      title: 'Arquivo Deletado',
      description: `arquivo: ${name}`,
    });
  };

  const handleDeleteAdmin = async (name: string, id: string, folder: string) => {
    const resp = await fetch(`/api/storage/${folder}`, {
      method: 'DELETE',
      body: JSON.stringify({ fileName: name }),
    });

    if (resp.status === 200) {
      setFiles((prev) => prev.filter((f) => f.id !== id));
    }

    toast({
      title: 'Arquivo Deletado',
      description: `arquivo: ${name}`,
    });
  };

  const handleDownload = async (name: string) => {
    try {
      const resp = await fetch(`/api/storage/download/${name}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
      });

      if (resp.status === 200) {
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = name;
        link.click();
      }
    } catch (error) {
      toast({
        title: 'Erro ao baixar o arquivo',
        description: `arquivo: ${name}`,
      });
    } finally {
      toast({
        title: 'Arquivo Baixado',
        description: `arquivo: ${name}`,
      });
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Moderação</h1>
          <p className="text-muted-foreground mt-2">
            Revise e modere arquivos enviados pelos usuários
          </p>
        </div>

        <div className="rounded-lg border bg-card">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Arquivos para Moderação</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Total de {files.length} arquivo{files.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  {role === 'admin' && <th className="text-left p-4 font-medium">Pasta</th>}
                  <th className="text-left p-4 font-medium">Arquivo</th>
                  <th className="text-left p-4 font-medium">Tipo</th>
                  <th className="text-left p-4 font-medium">Tamanho</th>
                  <th className="text-left p-4 font-medium">Ação</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.id} className="border-b hover:bg-muted/50 transition-colors">
                    {role === 'admin' && <td className="p-4">{file.folder}</td>}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{file.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline">{file.type}</Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">{file.size}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => handleDownload(file.name)}
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {role !== 'user' && (
                          <Button
                            aria-label="dasdas"
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              if (role === 'admin') {
                                handleDeleteAdmin(file.name, file.id, file.folder);
                              } else {
                                handleDelete(file.name, file.id);
                              }
                            }}
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
