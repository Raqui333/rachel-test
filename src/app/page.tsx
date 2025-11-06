'use client';

import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { FileText, Upload, X, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const resp = await fetch('/api/storage', {
      method: 'POST',
      body: formData,
    });
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      await Promise.all(files.map((file) => uploadFile(file)));
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar o arquivo',
        description: `Arquivo falhou no envio`,
      });
    } finally {
      setFiles([]);
      setLoading(false);

      toast({
        title: 'Arquivos enviados',
        description: `Os arquivos foram enviados com sucesso`,
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
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Anexar Documentos</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Faça upload de arquivos PDF ou de texto
            </p>
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf,.txt,text/plain,application/pdf"
                multiple
                onChange={handleFileChange}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">Clique para fazer upload</p>
                <p className="text-xs text-muted-foreground">Apenas arquivos PDF e TXT</p>
              </label>
            </div>
            {files.length > 0 && (
              <div className="mt-6 space-y-2">
                <h3 className="text-sm font-medium mb-3">Arquivos Anexados ({files.length})</h3>
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border bg-background"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="pt-4">
                  <Button onClick={handleSubmit} className="w-full" size="lg">
                    {loading ? <LoaderCircle className="animate-spin" /> : 'Enviar Documentos'}
                  </Button>
                </div>
              </div>
            )}
            {loading && (
              <div className="mt-6">
                <p className="text-sm text-muted-foreground">Enviando arquivos...</p>
              </div>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome to your dashboard</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold text-lg mb-2">Home</h3>
            <p className="text-sm text-muted-foreground">
              View your main dashboard overview and statistics
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold text-lg mb-2">Administração</h3>
            <p className="text-sm text-muted-foreground">
              Manage system settings and configurations
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold text-lg mb-2">Moderação</h3>
            <p className="text-sm text-muted-foreground">Monitor and moderate content and users</p>
          </div>
        </div>
      </main>
    </div>
  );
}
