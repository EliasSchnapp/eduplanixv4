import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, User, Lock, LogIn } from "lucide-react";
import logoPath from "@assets/Design ohne Titel (1)_1752353023318.png";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await apiRequest("POST", "/api/login", credentials);
      return response.json();
    },
    onSuccess: () => {
      setLocation("/dashboard");
      toast({
        title: "Erfolgreich angemeldet",
        description: "Willkommen bei der Notenverwaltung!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Anmeldung fehlgeschlagen",
        description: error.message || "Ungültige Anmeldedaten",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Felder aus.",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 d-flex align-items-center justify-content-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        
        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400 rounded-full opacity-30 animate-float pointer-events-none"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
              zIndex: 0
            }}
          />
        ))}
      </div>
      
      <div className="container relative z-20">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <Card className="shadow-2xl bg-black/80 backdrop-blur-sm border border-cyan-500/30">
              <CardHeader className="text-center py-4">
                <div className="mb-4 mx-auto" style={{ width: 'fit-content' }}>
                  <img 
                    src={logoPath} 
                    alt="EDUPLANIX Logo" 
                    className="h-32 w-32 object-contain mx-auto mb-4 filter drop-shadow-lg"
                  />
                </div>
                <p className="text-cyan-300">Melden Sie sich an, um fortzufahren</p>
              </CardHeader>
              <CardContent className="p-4">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <Label htmlFor="username" className="form-label text-cyan-300">
                      <User className="inline mr-2" size={16} />
                      Benutzername
                    </Label>
                    <Input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Benutzername"
                      required
                      className="bg-slate-800/50 border-cyan-500/30 text-cyan-100 placeholder-cyan-400"
                    />
                  </div>
                  <div className="mb-3">
                    <Label htmlFor="password" className="form-label text-cyan-300">
                      <Lock className="inline mr-2" size={16} />
                      Passwort
                    </Label>
                    <Input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Passwort"
                      required
                      className="bg-slate-800/50 border-cyan-500/30 text-cyan-100 placeholder-cyan-400"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-100 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 border-0"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      "Anmelden..."
                    ) : (
                      <>
                        <LogIn className="inline mr-2" size={16} />
                        Anmelden
                      </>
                    )}
                  </Button>
                </form>

              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
