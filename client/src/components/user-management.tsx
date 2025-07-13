import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, UserPlus, Trash2, Crown, Shield, UserCheck, Key } from "lucide-react";
import type { InsertUser } from "@shared/schema";

interface User {
  id: number;
  username: string;
  role?: string;
}

export default function UserManagement() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<InsertUser>({
    username: "",
    password: "",
    role: "user",
  });
  const [resetPasswordUserId, setResetPasswordUserId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");

  // Get all users
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      const response = await apiRequest("POST", "/api/users", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setFormData({ username: "", password: "", role: "user" });
      toast({
        title: "Benutzer erfolgreich erstellt",
        description: "Der neue Benutzer wurde zu Ihrer Liste hinzugefügt.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler beim Erstellen",
        description: error.message || "Der Benutzer konnte nicht erstellt werden.",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/users/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Benutzer gelöscht",
        description: "Der Benutzer wurde erfolgreich gelöscht.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler beim Löschen",
        description: error.message || "Der Benutzer konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ id, newPassword }: { id: number; newPassword: string }) => {
      await apiRequest("PATCH", `/api/users/${id}/password`, { newPassword });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setResetPasswordUserId(null);
      setNewPassword("");
      toast({
        title: "Passwort zurückgesetzt",
        description: "Das Benutzerpasswort wurde erfolgreich geändert.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler beim Zurücksetzen",
        description: error.message || "Das Passwort konnte nicht zurückgesetzt werden.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Benutzernamen an.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.password.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie ein Passwort an.",
        variant: "destructive",
      });
      return;
    }

    createUserMutation.mutate(formData);
  };

  const handleDelete = (user: User) => {
    if (user.username === "EliasSchnapp") {
      toast({
        title: "Fehler",
        description: "Der Haupt-Admin EliasSchnapp kann nicht gelöscht werden.",
        variant: "destructive",
      });
      return;
    }

    if (window.confirm(`Möchten Sie den Benutzer "${user.username}" wirklich löschen?`)) {
      deleteUserMutation.mutate(user.id);
    }
  };

  const handleResetPassword = (user: User) => {
    setResetPasswordUserId(user.id);
    setNewPassword("");
  };

  const submitPasswordReset = () => {
    if (!newPassword || newPassword.length < 3) {
      toast({
        title: "Fehler",
        description: "Das Passwort muss mindestens 3 Zeichen lang sein.",
        variant: "destructive",
      });
      return;
    }

    if (resetPasswordUserId) {
      resetPasswordMutation.mutate({ id: resetPasswordUserId, newPassword });
    }
  };

  if (isLoading) {
    return (
      <div className="text-center p-4">
        <div className="spinner-border text-cyan-300 mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-cyan-300">Lade Benutzer...</p>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="d-flex align-items-center mb-4">
        <Crown className="me-2 text-cyan-300" size={24} />
        <h4 className="mb-0 text-cyan-300">Admin-Bereich: Benutzerverwaltung</h4>
      </div>
      
      <div className="row">
        <div className="col-lg-4 mb-4">
          <Card className="bg-black/90 border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-cyan-300">
                <UserPlus className="inline mr-2" size={20} />
                Neuen Benutzer erstellen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <Label htmlFor="username" className="text-cyan-300">Benutzername</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Benutzername eingeben"
                    required
                    className="bg-slate-800/50 border-cyan-500/30 text-cyan-100 placeholder-cyan-400"
                  />
                </div>
                
                <div className="mb-3">
                  <Label htmlFor="password" className="text-cyan-300">Passwort</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Passwort eingeben"
                    required
                    className="bg-slate-800/50 border-cyan-500/30 text-cyan-100 placeholder-cyan-400"
                  />
                </div>
                
                <div className="mb-3">
                  <Label htmlFor="role" className="text-cyan-300">Benutzerrolle</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: "admin" | "user") => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-cyan-500/30 text-cyan-100">
                      <SelectValue placeholder="Rolle auswählen" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-cyan-500/30">
                      <SelectItem value="user" className="text-cyan-300 hover:bg-cyan-500/20">
                        <div className="flex items-center gap-2">
                          <UserCheck size={16} />
                          Benutzer
                        </div>
                      </SelectItem>
                      <SelectItem value="admin" className="text-cyan-300 hover:bg-cyan-500/20">
                        <div className="flex items-center gap-2">
                          <Shield size={16} />
                          Administrator
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button
                  type="submit"
                  className="w-100 bg-black/90 hover:bg-slate-800/50 text-cyan-300 border-cyan-500/30"
                  disabled={createUserMutation.isPending}
                >
                  {createUserMutation.isPending ? (
                    "Erstellen..."
                  ) : (
                    <>
                      <UserPlus className="inline mr-2" size={16} />
                      Benutzer erstellen
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        
        <div className="col-lg-8">
          <Card className="bg-black/90 border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-cyan-300">
                <Users className="inline mr-2" size={20} />
                Alle Benutzer
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0 bg-black/90 border-cyan-500/30">
                  <thead className="bg-slate-800/50">
                    <tr>
                      <th className="text-cyan-300">ID</th>
                      <th className="text-cyan-300">Benutzername</th>
                      <th className="text-cyan-300">Rolle</th>
                      <th className="text-cyan-300">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-4 text-cyan-300">
                          Keine Benutzer gefunden
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id} className="bg-black/50">
                          <td className="text-cyan-100">{user.id}</td>
                          <td>
                            <strong className="text-cyan-100">{user.username}</strong>
                            {(user.username === "EliasSchnapp" || user.role === "admin") && (
                              <Crown className="inline ml-2 text-warning" size={14} />
                            )}
                          </td>
                          <td>
                            {user.role === "admin" || user.username === "EliasSchnapp" ? (
                              <Badge variant="destructive" className="bg-gradient-to-r from-purple-500 to-pink-500">
                                <Shield size={12} className="mr-1" />
                                Admin
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-300">
                                <UserCheck size={12} className="mr-1" />
                                Benutzer
                              </Badge>
                            )}
                          </td>
                          <td>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleResetPassword(user)}
                                disabled={resetPasswordMutation.isPending}
                                className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20"
                                title="Passwort zurücksetzen"
                              >
                                <Key size={14} />
                              </Button>
                              {user.username !== "EliasSchnapp" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(user)}
                                  disabled={deleteUserMutation.isPending}
                                  className="border-red-500/30 text-red-300 hover:bg-red-500/20"
                                  title="Benutzer löschen"
                                >
                                  <Trash2 size={14} />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Password Reset Modal */}
      {resetPasswordUserId && (
        <Dialog open={resetPasswordUserId !== null} onOpenChange={() => setResetPasswordUserId(null)}>
          <DialogContent className="bg-black/90 border-cyan-500/30">
            <DialogHeader>
              <DialogTitle className="text-cyan-300">
                <Key className="inline mr-2" size={20} />
                Passwort zurücksetzen
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="newPassword" className="text-cyan-300">
                  Neues Passwort
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Neues Passwort eingeben"
                  className="bg-slate-800/50 border-cyan-500/30 text-cyan-100 placeholder-cyan-400"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={submitPasswordReset}
                  disabled={resetPasswordMutation.isPending}
                  className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border-cyan-500/30"
                >
                  {resetPasswordMutation.isPending ? "Wird gesetzt..." : "Passwort setzen"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setResetPasswordUserId(null)}
                  className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20"
                >
                  Abbrechen
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}