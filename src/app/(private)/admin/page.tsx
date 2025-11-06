'use client';

import Sidebar from '@/components/Sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useEffect, useState } from 'react';

type UserRole = 'user' | 'mod' | 'admin';

interface User {
  id: string;
  userId: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
}
export default function AdministracaoPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users);
      });
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      setUsers((prevUsers) =>
        prevUsers.map((user) => {
          if (user.userId === userId) {
            return { ...user, role: newRole };
          }
          return user;
        })
      );
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'mod':
        return 'default';
      case 'user':
        return 'secondary';
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card">
        <Sidebar />
      </aside>

      {/* Main Content */}
      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Administração</h1>
          <p className="text-muted-foreground mt-2">Gerencie usuários e suas permissões</p>
        </div>

        <div className="rounded-lg border bg-card">
          <div className="p-6 border-b">
            <h3 className="font-semibold text-lg">Gerenciamento de Usuários</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Visualize e altere os cargos dos usuários do sistema
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cargo Atual</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length > 0 &&
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.fullName}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant={user.role === 'user' ? 'default' : 'outline'}
                          onClick={() => handleRoleChange(user.userId, 'user')}
                          disabled={user.role === 'user'}
                        >
                          USER
                        </Button>
                        <Button
                          size="sm"
                          variant={user.role === 'mod' ? 'default' : 'outline'}
                          onClick={() => handleRoleChange(user.userId, 'mod')}
                          disabled={user.role === 'mod'}
                        >
                          MOD
                        </Button>
                        <Button
                          size="sm"
                          variant={user.role === 'admin' ? 'default' : 'outline'}
                          onClick={() => handleRoleChange(user.userId, 'admin')}
                          disabled={user.role === 'admin'}
                        >
                          ADMIN
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
