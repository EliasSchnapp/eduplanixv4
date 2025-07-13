import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Clock, 
  TrendingUp, 
  Calendar,
  BookOpen,
  CheckCircle,
  Award,
  Flame
} from "lucide-react";
import type { Grade, Homework } from "@shared/schema";

interface ProductivityTrackerProps {
  grades: Grade[];
  homework: Homework[];
}

export default function ProductivityTracker({ grades, homework }: ProductivityTrackerProps) {
  // Calculate productivity metrics
  const totalHomework = homework.length;
  const completedHomework = homework.filter(hw => hw.isCompleted).length;
  const completionRate = totalHomework > 0 ? (completedHomework / totalHomework) * 100 : 0;

  // Calculate grade trends
  const recentGrades = grades.slice(-5);
  const averageGrade = grades.length > 0 ? 
    grades.reduce((sum, grade) => sum + grade.grade, 0) / grades.length : 0;
  const recentAverage = recentGrades.length > 0 ? 
    recentGrades.reduce((sum, grade) => sum + grade.grade, 0) / recentGrades.length : 0;

  // Calculate streak
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    return date;
  });

  const streak = last7Days.reduce((count, date) => {
    const dayHomework = homework.filter(hw => {
      const hwDate = new Date(hw.dueDate);
      return hwDate.toDateString() === date.toDateString() && hw.isCompleted;
    });
    return dayHomework.length > 0 ? count + 1 : count;
  }, 0);

  // Calculate this week's activities
  const thisWeek = homework.filter(hw => {
    const hwDate = new Date(hw.dueDate);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return hwDate >= oneWeekAgo && hwDate <= today;
  });

  const weeklyCompleted = thisWeek.filter(hw => hw.isCompleted).length;
  const weeklyTotal = thisWeek.length;
  const weeklyRate = weeklyTotal > 0 ? (weeklyCompleted / weeklyTotal) * 100 : 0;

  // Determine performance level
  const getPerformanceLevel = () => {
    if (completionRate >= 90) return { level: "Ausgezeichnet", color: "text-green-400", icon: Award };
    if (completionRate >= 75) return { level: "Sehr gut", color: "text-blue-400", icon: TrendingUp };
    if (completionRate >= 60) return { level: "Gut", color: "text-yellow-400", icon: Target };
    return { level: "Verbesserungsbedarf", color: "text-red-400", icon: Clock };
  };

  const performance = getPerformanceLevel();
  const PerformanceIcon = performance.icon;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Completion Rate */}
      <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-cyan-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-cyan-300 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Erledigungsrate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-cyan-100">
                {completionRate.toFixed(0)}%
              </span>
              <Badge variant="outline" className="border-cyan-500/30">
                {completedHomework}/{totalHomework}
              </Badge>
            </div>
            <Progress 
              value={completionRate} 
              className="h-2 bg-slate-800"
            />
            <p className="text-xs text-cyan-400">
              Aufgaben abgeschlossen
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Progress */}
      <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-purple-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-purple-300 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Diese Woche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-purple-100">
                {weeklyRate.toFixed(0)}%
              </span>
              <Badge variant="outline" className="border-purple-500/30">
                {weeklyCompleted}/{weeklyTotal}
              </Badge>
            </div>
            <Progress 
              value={weeklyRate} 
              className="h-2 bg-slate-800"
            />
            <p className="text-xs text-purple-400">
              Wöchentlicher Fortschritt
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Performance Level */}
      <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-green-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-green-300 flex items-center gap-2">
            <PerformanceIcon className="h-4 w-4" />
            Leistungsniveau
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-center">
              <span className={`text-lg font-bold ${performance.color}`}>
                {performance.level}
              </span>
            </div>
            <div className="text-center">
              <span className="text-sm text-green-100">
                Durchschnittsnote: {averageGrade.toFixed(1)}
              </span>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="border-green-500/30">
                {grades.length} Noten
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Streak Counter */}
      <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-orange-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-orange-300 flex items-center gap-2">
            <Flame className="h-4 w-4" />
            Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-center">
              <span className="text-2xl font-bold text-orange-100">
                {streak}
              </span>
            </div>
            <div className="text-center">
              <span className="text-sm text-orange-400">
                Tage produktiv
              </span>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="border-orange-500/30">
                {streak > 0 ? "🔥 Aktiv" : "💤 Pausiert"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}