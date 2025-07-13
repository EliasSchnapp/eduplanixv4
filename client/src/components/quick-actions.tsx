import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  BookOpen, 
  Calendar, 
  Clock, 
  Target, 
  Zap,
  CheckCircle,
  AlertTriangle,
  TrendingUp
} from "lucide-react";
import type { Homework } from "@shared/schema";

interface QuickActionsProps {
  homework: Homework[];
  onAddGrade: () => void;
  onAddHomework: () => void;
  onAddEvent: () => void;
}

export default function QuickActions({ 
  homework, 
  onAddGrade, 
  onAddHomework, 
  onAddEvent 
}: QuickActionsProps) {
  const [showMotivation, setShowMotivation] = useState(false);

  // Calculate quick stats
  const pendingHomework = homework.filter(hw => !hw.isCompleted).length;
  const overdueHomework = homework.filter(hw => 
    !hw.isCompleted && new Date(hw.dueDate) < new Date()
  ).length;
  const todayHomework = homework.filter(hw => {
    const today = new Date();
    const dueDate = new Date(hw.dueDate);
    return !hw.isCompleted && 
           dueDate.toDateString() === today.toDateString();
  }).length;

  const motivationalQuotes = [
    "Großer Erfolg entsteht durch kleine Schritte! 🚀",
    "Du schaffst mehr, als du denkst! 💪",
    "Jede Note bringt dich deinem Ziel näher! 🎯",
    "Bleib fokussiert und du wirst erfolgreich sein! ⭐",
    "Deine Anstrengungen werden sich auszahlen! 🏆",
    "Bildung ist der Schlüssel zu deiner Zukunft! 🔑",
    "Jeder Fehler ist ein Schritt zum Erfolg! 💡",
    "Deine Träume warten auf dich - arbeite dafür! ✨",
    "Mit jedem Tag wirst du besser! 📈",
    "Gib niemals auf, du bist fast da! 🎖️",
    "Wissen ist Macht - sammle es jeden Tag! 📚",
    "Deine harte Arbeit wird belohnt werden! 🌟",
    "Sei stolz auf jeden Fortschritt! 🎉",
    "Du hast das Potenzial für Großes! 🌈",
    "Lerne heute, führe morgen! 👑"
  ];

  const getRandomQuote = () => {
    return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {/* Quick Add Actions */}
      <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-cyan-300 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Schnellaktionen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <Button 
              onClick={onAddGrade}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Note hinzufügen
            </Button>
            <Button 
              onClick={onAddHomework}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white"
              size="sm"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Hausaufgabe erstellen
            </Button>
            <Button 
              onClick={onAddEvent}
              className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-400 hover:to-teal-400 text-white"
              size="sm"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Termin planen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Homework Overview */}
      <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-cyan-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-cyan-300 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Aufgaben-Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-cyan-100 text-sm">Heute fällig</span>
              <Badge variant={todayHomework > 0 ? "destructive" : "secondary"}>
                {todayHomework}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-cyan-100 text-sm">Überfällig</span>
              <Badge variant={overdueHomework > 0 ? "destructive" : "secondary"}>
                {overdueHomework}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-cyan-100 text-sm">Ausstehend</span>
              <Badge variant="outline" className="border-cyan-500/30">
                {pendingHomework}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Motivation Card */}
      <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-purple-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-purple-300 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Motivation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {showMotivation ? (
              <div className="text-center">
                <p className="text-purple-100 text-sm mb-3">
                  {getRandomQuote()}
                </p>
                <Button 
                  onClick={() => setShowMotivation(false)}
                  variant="outline"
                  size="sm"
                  className="border-purple-500/30 text-purple-300"
                >
                  Verstanden!
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-purple-100 text-sm mb-3">
                  Bereit für eine Extraportion Motivation?
                </p>
                <Button 
                  onClick={() => setShowMotivation(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white"
                  size="sm"
                >
                  Los geht's! 🚀
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}