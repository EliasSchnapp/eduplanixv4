import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Clock, 
  Zap,
  Star,
  Trophy,
  Calendar,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";
import type { Grade, Homework } from "@shared/schema";

interface DashboardMetric {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: any;
  color: string;
  description: string;
}

interface PerformanceInsight {
  id: string;
  type: 'strength' | 'weakness' | 'opportunity' | 'trend';
  title: string;
  description: string;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  confidence: number;
}

interface AdvancedDashboardProps {
  grades: Grade[];
  homework: Homework[];
}

export default function AdvancedDashboard({ grades, homework }: AdvancedDashboardProps) {
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [insights, setInsights] = useState<PerformanceInsight[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'semester'>('month');

  useEffect(() => {
    calculateMetrics();
    generateInsights();
  }, [grades, homework, selectedTimeframe]);

  const calculateMetrics = () => {
    const now = new Date();
    const timeframeDays = selectedTimeframe === 'week' ? 7 : selectedTimeframe === 'month' ? 30 : 90;
    const startDate = new Date(now.getTime() - timeframeDays * 24 * 60 * 60 * 1000);

    // Filter data by timeframe
    const recentGrades = grades.filter(g => new Date(g.createdAt) >= startDate);
    const recentHomework = homework.filter(hw => new Date(hw.createdAt) >= startDate);

    // Calculate current metrics
    const currentAverage = grades.length > 0 ? grades.reduce((sum, g) => sum + g.grade, 0) / grades.length : 0;
    const recentAverage = recentGrades.length > 0 ? recentGrades.reduce((sum, g) => sum + g.grade, 0) / recentGrades.length : 0;
    const gradeChange = recentGrades.length > 0 ? recentAverage - currentAverage : 0;

    const completedHomework = homework.filter(hw => hw.isCompleted).length;
    const totalHomework = homework.length;
    const completionRate = totalHomework > 0 ? (completedHomework / totalHomework) * 100 : 0;

    const recentCompletedHomework = recentHomework.filter(hw => hw.isCompleted).length;
    const recentTotalHomework = recentHomework.length;
    const recentCompletionRate = recentTotalHomework > 0 ? (recentCompletedHomework / recentTotalHomework) * 100 : 0;
    const completionChange = recentTotalHomework > 0 ? recentCompletionRate - completionRate : 0;

    // Study consistency (how many days with activity)
    const studyDays = new Set(
      [...recentGrades.map(g => new Date(g.createdAt).toDateString()),
       ...recentHomework.map(hw => new Date(hw.createdAt).toDateString())]
    ).size;

    const studyConsistency = (studyDays / timeframeDays) * 100;

    // Productivity score
    const weightedScore = (
      (completionRate * 0.4) + 
      ((6 - currentAverage) / 5 * 100 * 0.4) + 
      (studyConsistency * 0.2)
    );

    const newMetrics: DashboardMetric[] = [
      {
        id: 'grade_average',
        title: 'Notendurchschnitt',
        value: currentAverage.toFixed(2),
        change: gradeChange,
        changeType: gradeChange < 0 ? 'positive' : gradeChange > 0 ? 'negative' : 'neutral',
        icon: TrendingUp,
        color: 'bg-blue-500',
        description: `${gradeChange > 0 ? 'Verschlechterung' : gradeChange < 0 ? 'Verbesserung' : 'Stabil'} um ${Math.abs(gradeChange).toFixed(2)}`
      },
      {
        id: 'completion_rate',
        title: 'Erledigungsrate',
        value: `${completionRate.toFixed(0)}%`,
        change: completionChange,
        changeType: completionChange > 0 ? 'positive' : completionChange < 0 ? 'negative' : 'neutral',
        icon: CheckCircle,
        color: 'bg-green-500',
        description: `${completionChange > 0 ? '+' : ''}${completionChange.toFixed(0)}% seit letztem ${selectedTimeframe === 'week' ? 'Woche' : selectedTimeframe === 'month' ? 'Monat' : 'Semester'}`
      },
      {
        id: 'study_consistency',
        title: 'Lern-Konsistenz',
        value: `${studyConsistency.toFixed(0)}%`,
        change: studyDays - (timeframeDays * 0.5),
        changeType: studyDays > (timeframeDays * 0.5) ? 'positive' : 'negative',
        icon: Calendar,
        color: 'bg-purple-500',
        description: `${studyDays} von ${timeframeDays} Tagen aktiv`
      },
      {
        id: 'productivity_score',
        title: 'Produktivitäts-Score',
        value: weightedScore.toFixed(0),
        change: 0, // Would need historical data to calculate
        changeType: 'neutral',
        icon: Zap,
        color: 'bg-yellow-500',
        description: 'Basierend auf Noten, Aufgaben und Konsistenz'
      }
    ];

    setMetrics(newMetrics);
  };

  const generateInsights = () => {
    const newInsights: PerformanceInsight[] = [];

    // Subject performance analysis
    const subjectStats = grades.reduce((acc, grade) => {
      if (!acc[grade.subject]) {
        acc[grade.subject] = [];
      }
      acc[grade.subject].push(grade.grade);
      return acc;
    }, {} as Record<string, number[]>);

    Object.entries(subjectStats).forEach(([subject, grades]) => {
      const average = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
      
      if (average <= 2.0) {
        newInsights.push({
          id: `strength_${subject}`,
          type: 'strength',
          title: `Stärke in ${subject}`,
          description: `Ausgezeichneter Durchschnitt von ${average.toFixed(1)}. Weiter so!`,
          actionable: false,
          priority: 'low',
          confidence: 90
        });
      } else if (average > 3.5) {
        newInsights.push({
          id: `weakness_${subject}`,
          type: 'weakness',
          title: `Verbesserungsbedarf in ${subject}`,
          description: `Durchschnitt von ${average.toFixed(1)} deutet auf Schwierigkeiten hin. Zusätzliche Lernzeit empfohlen.`,
          actionable: true,
          priority: 'high',
          confidence: 85
        });
      }
    });

    // Homework patterns
    const overdueHomework = homework.filter(hw => !hw.isCompleted && new Date(hw.dueDate) < new Date());
    const highPriorityPending = homework.filter(hw => !hw.isCompleted && hw.priority === 'high');

    if (overdueHomework.length > 0) {
      newInsights.push({
        id: 'overdue_issue',
        type: 'weakness',
        title: 'Überfällige Aufgaben',
        description: `${overdueHomework.length} Aufgaben sind überfällig. Prioritäten setzen und abarbeiten.`,
        actionable: true,
        priority: 'high',
        confidence: 100
      });
    }

    if (highPriorityPending.length > 2) {
      newInsights.push({
        id: 'high_priority_load',
        type: 'opportunity',
        title: 'Hohe Arbeitsbelastung',
        description: `${highPriorityPending.length} wichtige Aufgaben ausstehend. Zeitmanagement optimieren.`,
        actionable: true,
        priority: 'medium',
        confidence: 80
      });
    }

    // Learning trends
    const recentGrades = grades.slice(-10);
    if (recentGrades.length >= 5) {
      const firstHalf = recentGrades.slice(0, Math.floor(recentGrades.length / 2));
      const secondHalf = recentGrades.slice(Math.floor(recentGrades.length / 2));
      
      const firstAvg = firstHalf.reduce((sum, g) => sum + g.grade, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, g) => sum + g.grade, 0) / secondHalf.length;
      
      if (secondAvg < firstAvg - 0.3) {
        newInsights.push({
          id: 'improving_trend',
          type: 'trend',
          title: 'Positive Entwicklung',
          description: `Notenverbesserung um ${(firstAvg - secondAvg).toFixed(1)} in den letzten Einträgen erkennbar.`,
          actionable: false,
          priority: 'low',
          confidence: 75
        });
      } else if (secondAvg > firstAvg + 0.3) {
        newInsights.push({
          id: 'declining_trend',
          type: 'weakness',
          title: 'Verschlechternder Trend',
          description: `Notenverschlechterung um ${(secondAvg - firstAvg).toFixed(1)} beobachtet. Lernstrategie überprüfen.`,
          actionable: true,
          priority: 'high',
          confidence: 75
        });
      }
    }

    // Opportunities
    const completionRate = homework.length > 0 ? (homework.filter(hw => hw.isCompleted).length / homework.length) * 100 : 0;
    if (completionRate > 80 && completionRate < 95) {
      newInsights.push({
        id: 'completion_opportunity',
        type: 'opportunity',
        title: 'Exzellenz-Potenzial',
        description: `Mit ${completionRate.toFixed(0)}% Erledigungsrate sehr nah an der Perfektion. Letzter Schub möglich!`,
        actionable: true,
        priority: 'medium',
        confidence: 85
      });
    }

    setInsights(newInsights);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'strength': return Star;
      case 'weakness': return AlertTriangle;
      case 'opportunity': return Lightbulb;
      case 'trend': return TrendingUp;
      default: return Brain;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'strength': return 'border-green-500/50 bg-green-500/10';
      case 'weakness': return 'border-red-500/50 bg-red-500/10';
      case 'opportunity': return 'border-blue-500/50 bg-blue-500/10';
      case 'trend': return 'border-purple-500/50 bg-purple-500/10';
      default: return 'border-cyan-500/50 bg-cyan-500/10';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500/30 text-red-300';
      case 'medium': return 'border-yellow-500/30 text-yellow-300';
      case 'low': return 'border-green-500/30 text-green-300';
      default: return 'border-cyan-500/30 text-cyan-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-cyan-300">Erweiterte Analyse</h2>
          <p className="text-cyan-400">Tiefgreifende Einblicke in deine Lernleistung</p>
        </div>
        <div className="flex gap-2">
          {(['week', 'month', 'semester'] as const).map((timeframe) => (
            <Button
              key={timeframe}
              variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeframe(timeframe)}
              className={selectedTimeframe === timeframe ? 
                'bg-gradient-to-r from-cyan-500 to-blue-500' : 
                'border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10'
              }
            >
              {timeframe === 'week' ? 'Woche' : timeframe === 'month' ? 'Monat' : 'Semester'}
            </Button>
          ))}
        </div>
      </div>

      {/* Advanced Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const IconComponent = metric.icon;
          return (
            <Card key={metric.id} className="bg-gradient-to-br from-black/90 to-slate-900/90 border-cyan-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-cyan-300 flex items-center gap-2 text-sm">
                  <div className={`p-2 rounded-lg ${metric.color}/20`}>
                    <IconComponent className="h-4 w-4 text-cyan-300" />
                  </div>
                  {metric.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-cyan-100 mb-1">
                  {metric.value}
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={
                      metric.changeType === 'positive' ? 'border-green-500/30 text-green-300' :
                      metric.changeType === 'negative' ? 'border-red-500/30 text-red-300' :
                      'border-gray-500/30 text-gray-300'
                    }
                  >
                    {metric.changeType === 'positive' ? '↗️' : metric.changeType === 'negative' ? '↘️' : '→'}
                    {metric.change !== 0 ? Math.abs(metric.change).toFixed(1) : '0'}
                  </Badge>
                </div>
                <p className="text-xs text-cyan-400 mt-2">{metric.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Performance Insights */}
      <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-purple-300 flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Leistungs-Einblicke
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insights.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 mx-auto mb-4 text-purple-400 opacity-50" />
              <p className="text-purple-100">Sammle mehr Daten für detaillierte Einblicke</p>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.map((insight) => {
                const IconComponent = getInsightIcon(insight.type);
                return (
                  <div key={insight.id} className={`border rounded-lg p-4 ${getInsightColor(insight.type)}`}>
                    <div className="flex items-start gap-3">
                      <IconComponent className="h-5 w-5 mt-1 text-purple-300" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-purple-100">{insight.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {insight.confidence}% sicher
                          </Badge>
                          <Badge variant="outline" className={`text-xs ${getPriorityColor(insight.priority)}`}>
                            {insight.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs border-purple-500/30 capitalize">
                            {insight.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-purple-300 mb-2">{insight.description}</p>
                        {insight.actionable && (
                          <Badge variant="outline" className="border-purple-500/30 text-xs">
                            Handlungsempfehlung verfügbar
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Learning Velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-green-300 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Lern-Geschwindigkeit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-green-300">Noten pro Woche</span>
                  <span className="text-sm text-green-100">
                    {(grades.length / Math.max(1, Math.ceil((Date.now() - new Date(grades[0]?.createdAt || Date.now()).getTime()) / (7 * 24 * 60 * 60 * 1000)))).toFixed(1)}
                  </span>
                </div>
                <Progress value={Math.min(100, (grades.length / 20) * 100)} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-green-300">Aufgaben pro Woche</span>
                  <span className="text-sm text-green-100">
                    {(homework.length / Math.max(1, Math.ceil((Date.now() - new Date(homework[0]?.createdAt || Date.now()).getTime()) / (7 * 24 * 60 * 60 * 1000)))).toFixed(1)}
                  </span>
                </div>
                <Progress value={Math.min(100, (homework.length / 15) * 100)} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-green-300">Aktive Tage (%)</span>
                  <span className="text-sm text-green-100">
                    {(() => {
                      const activeDays = new Set([
                        ...grades.map(g => new Date(g.createdAt).toDateString()),
                        ...homework.map(hw => new Date(hw.createdAt).toDateString())
                      ]).size;
                      const totalDays = Math.max(1, Math.ceil((Date.now() - Math.min(
                        new Date(grades[0]?.createdAt || Date.now()).getTime(),
                        new Date(homework[0]?.createdAt || Date.now()).getTime()
                      )) / (24 * 60 * 60 * 1000)));
                      return ((activeDays / totalDays) * 100).toFixed(0);
                    })()}%
                  </span>
                </div>
                <Progress value={(() => {
                  const activeDays = new Set([
                    ...grades.map(g => new Date(g.createdAt).toDateString()),
                    ...homework.map(hw => new Date(hw.createdAt).toDateString())
                  ]).size;
                  const totalDays = Math.max(1, Math.ceil((Date.now() - Math.min(
                    new Date(grades[0]?.createdAt || Date.now()).getTime(),
                    new Date(homework[0]?.createdAt || Date.now()).getTime()
                  )) / (24 * 60 * 60 * 1000)));
                  return (activeDays / totalDays) * 100;
                })()} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-blue-300 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Zielerreichung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-100 mb-2">
                  {(() => {
                    const totalScore = metrics.reduce((sum, metric) => {
                      if (metric.id === 'productivity_score') return sum + parseFloat(metric.value.toString());
                      return sum;
                    }, 0);
                    return totalScore > 0 ? totalScore.toFixed(0) : '0';
                  })()}
                </div>
                <p className="text-sm text-blue-400">Gesamtproduktivität</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-300">Kurzziel (Woche)</span>
                  <Badge variant="outline" className="border-blue-500/30">85%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-300">Mittelfristziel (Monat)</span>
                  <Badge variant="outline" className="border-blue-500/30">75%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-300">Langzeitziel (Semester)</span>
                  <Badge variant="outline" className="border-blue-500/30">80%</Badge>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-blue-200">
                  <strong>Empfehlung:</strong> Fokussiere dich auf Konsistenz für optimale Langzeitergebnisse.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}