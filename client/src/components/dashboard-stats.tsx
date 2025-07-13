import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, BookOpen, Calendar, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import type { Grade, Homework } from "@shared/schema";

interface DashboardStatsProps {
  grades: Grade[];
  homework: Homework[];
}

export default function DashboardStats({ grades, homework }: DashboardStatsProps) {
  // Calculate grade statistics
  const totalGrades = grades.length;
  const averageGrade = totalGrades > 0 ? 
    grades.reduce((sum, grade) => sum + grade.grade, 0) / totalGrades : 0;
  const bestGrade = totalGrades > 0 ? Math.max(...grades.map(g => g.grade)) : 0;
  const worstGrade = totalGrades > 0 ? Math.min(...grades.map(g => g.grade)) : 0;

  // Calculate homework statistics
  const totalHomework = homework.length;
  const completedHomework = homework.filter(hw => hw.isCompleted).length;
  const pendingHomework = totalHomework - completedHomework;
  const completionRate = totalHomework > 0 ? (completedHomework / totalHomework) * 100 : 0;

  // Calculate overdue homework
  const now = new Date();
  const overdueHomework = homework.filter(hw => 
    !hw.isCompleted && new Date(hw.dueDate) < now
  ).length;

  // High priority pending homework
  const highPriorityPending = homework.filter(hw => 
    !hw.isCompleted && hw.priority === 'high'
  ).length;

  // Homework due today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const homeworkDueToday = homework.filter(hw => {
    const dueDate = new Date(hw.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return !hw.isCompleted && dueDate.getTime() === today.getTime();
  }).length;

  const getGradeColor = (grade: number) => {
    if (grade >= 1.0 && grade <= 1.5) return "text-green-400";
    if (grade >= 1.6 && grade <= 2.5) return "text-blue-400";
    if (grade >= 2.6 && grade <= 3.5) return "text-yellow-400";
    if (grade >= 3.6 && grade <= 4.0) return "text-orange-400";
    return "text-red-400";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-blue-500";
    if (percentage >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Grade Overview */}
      <Card className="bg-black/90 border-cyan-500/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-cyan-300">
            Noten-Übersicht
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-cyan-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-cyan-100 mb-1">
            {totalGrades > 0 ? (
              <span className={getGradeColor(averageGrade)}>
                {averageGrade.toFixed(2)}
              </span>
            ) : (
              <span className="text-cyan-400">--</span>
            )}
          </div>
          <p className="text-xs text-cyan-400 mb-3">Durchschnittsnote</p>
          <div className="flex justify-between text-xs">
            <span className="text-cyan-400">
              Beste: <span className="text-green-400">{bestGrade || '--'}</span>
            </span>
            <span className="text-cyan-400">
              Anzahl: <span className="text-cyan-300">{totalGrades}</span>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Homework Completion */}
      <Card className="bg-black/90 border-cyan-500/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-cyan-300">
            Hausaufgaben
          </CardTitle>
          <BookOpen className="h-4 w-4 text-cyan-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-cyan-100 mb-1">
            {completedHomework}/{totalHomework}
          </div>
          <p className="text-xs text-cyan-400 mb-3">Abgeschlossen</p>
          <div className="space-y-2">
            <Progress 
              value={completionRate} 
              className="h-2" 
              style={{ 
                background: 'rgba(6, 182, 212, 0.2)',
              }}
            />
            <div className="flex justify-between text-xs">
              <span className="text-cyan-400">
                {completionRate.toFixed(0)}% erledigt
              </span>
              <span className="text-cyan-400">
                {pendingHomework} offen
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Urgent Tasks */}
      <Card className="bg-black/90 border-cyan-500/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-cyan-300">
            Dringende Aufgaben
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-400 mb-1">
            {overdueHomework + highPriorityPending}
          </div>
          <p className="text-xs text-cyan-400 mb-3">Erfordern Aufmerksamkeit</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="text-xs">
                {overdueHomework} überfällig
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs text-orange-400 border-orange-400">
                {highPriorityPending} hohe Priorität
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Tasks */}
      <Card className="bg-black/90 border-cyan-500/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-cyan-300">
            Heute fällig
          </CardTitle>
          <Clock className="h-4 w-4 text-yellow-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-400 mb-1">
            {homeworkDueToday}
          </div>
          <p className="text-xs text-cyan-400 mb-3">Hausaufgaben</p>
          <div className="flex items-center gap-2">
            {homeworkDueToday > 0 ? (
              <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-400">
                Heute bearbeiten
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-green-400 border-green-400">
                Alles erledigt
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}