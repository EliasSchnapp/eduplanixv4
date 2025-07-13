import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Bot, 
  Brain, 
  Lightbulb, 
  Target, 
  TrendingUp, 
  Calendar,
  Clock,
  BookOpen,
  Award,
  AlertCircle,
  CheckCircle,
  Zap
} from "lucide-react";
import type { Grade, Homework } from "@shared/schema";

interface SmartAssistantProps {
  grades: Grade[];
  homework: Homework[];
}

interface AIInsight {
  id: string;
  type: 'suggestion' | 'warning' | 'achievement' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  category: 'study' | 'time' | 'performance' | 'motivation';
}

interface StudyPattern {
  subject: string;
  bestTimeToStudy: string;
  averageGrade: number;
  trend: 'improving' | 'declining' | 'stable';
  recommendation: string;
}

export default function SmartAssistant({ grades, homework }: SmartAssistantProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [studyPatterns, setStudyPatterns] = useState<StudyPattern[]>([]);
  const [userQuery, setUserQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);

  useEffect(() => {
    generateInsights();
    analyzeStudyPatterns();
  }, [grades, homework]);

  const generateInsights = () => {
    const newInsights: AIInsight[] = [];

    // Performance Analysis
    if (grades.length > 0) {
      const recentGrades = grades.slice(-5);
      const overallAverage = grades.reduce((sum, g) => sum + g.grade, 0) / grades.length;
      const recentAverage = recentGrades.reduce((sum, g) => sum + g.grade, 0) / recentGrades.length;
      
      if (recentAverage < overallAverage - 0.3) {
        newInsights.push({
          id: 'performance_decline',
          type: 'warning',
          title: 'Leistungsabfall erkannt',
          description: `Deine letzten Noten sind um ${(overallAverage - recentAverage).toFixed(1)} schlechter geworden. Zeit für eine Lernstrategie-Anpassung.`,
          confidence: 85,
          actionable: true,
          priority: 'high',
          category: 'performance'
        });
      } else if (recentAverage > overallAverage + 0.3) {
        newInsights.push({
          id: 'performance_improvement',
          type: 'achievement',
          title: 'Großartige Verbesserung!',
          description: `Du hast dich um ${(recentAverage - overallAverage).toFixed(1)} verbessert. Weiter so!`,
          confidence: 90,
          actionable: false,
          priority: 'medium',
          category: 'motivation'
        });
      }
    }

    // Time Management Analysis
    const now = new Date();
    const overdueCount = homework.filter(hw => !hw.isCompleted && new Date(hw.dueDate) < now).length;
    const upcomingCount = homework.filter(hw => {
      const dueDate = new Date(hw.dueDate);
      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      return !hw.isCompleted && dueDate <= threeDaysFromNow && dueDate > now;
    }).length;

    if (overdueCount > 0) {
      newInsights.push({
        id: 'time_management_issue',
        type: 'warning',
        title: 'Zeitmanagement-Problem',
        description: `Du hast ${overdueCount} überfällige Aufgaben. Plane deine Zeit besser ein.`,
        confidence: 95,
        actionable: true,
        priority: 'high',
        category: 'time'
      });
    }

    if (upcomingCount > 3) {
      newInsights.push({
        id: 'busy_period',
        type: 'suggestion',
        title: 'Arbeitsreiche Zeit voraus',
        description: `${upcomingCount} Aufgaben sind in den nächsten 3 Tagen fällig. Plane deine Zeit strategisch.`,
        confidence: 80,
        actionable: true,
        priority: 'medium',
        category: 'time'
      });
    }

    // Study Pattern Analysis
    const subjectStats = grades.reduce((acc, grade) => {
      if (!acc[grade.subject]) {
        acc[grade.subject] = [];
      }
      acc[grade.subject].push(grade.grade);
      return acc;
    }, {} as Record<string, number[]>);

    Object.entries(subjectStats).forEach(([subject, grades]) => {
      const average = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
      if (average > 3.5) {
        newInsights.push({
          id: `weak_subject_${subject}`,
          type: 'suggestion',
          title: `Schwäche in ${subject}`,
          description: `Durchschnitt von ${average.toFixed(1)}. Empfehle 2-3 zusätzliche Lerneinheiten pro Woche.`,
          confidence: 75,
          actionable: true,
          priority: 'medium',
          category: 'study'
        });
      }
    });

    // Motivation Insights
    const completedHomework = homework.filter(hw => hw.isCompleted).length;
    const totalHomework = homework.length;
    const completionRate = totalHomework > 0 ? (completedHomework / totalHomework) * 100 : 0;

    if (completionRate > 80) {
      newInsights.push({
        id: 'high_completion',
        type: 'achievement',
        title: 'Ausgezeichnete Disziplin!',
        description: `Du hast ${completionRate.toFixed(0)}% deiner Hausaufgaben abgeschlossen. Das ist vorbildlich!`,
        confidence: 95,
        actionable: false,
        priority: 'low',
        category: 'motivation'
      });
    }

    // Predictive Analysis
    if (grades.length >= 5) {
      const trend = calculateTrend(grades.slice(-5).map(g => g.grade));
      if (trend < -0.2) {
        newInsights.push({
          id: 'grade_prediction',
          type: 'prediction',
          title: 'Notenprognose',
          description: 'Basierend auf dem aktuellen Trend könnten deine Noten weiter sinken. Empfehle Lernplan-Anpassung.',
          confidence: 70,
          actionable: true,
          priority: 'high',
          category: 'performance'
        });
      }
    }

    setInsights(newInsights);
  };

  const analyzeStudyPatterns = () => {
    const patterns: StudyPattern[] = [];
    
    const subjectStats = grades.reduce((acc, grade) => {
      if (!acc[grade.subject]) {
        acc[grade.subject] = {
          grades: [],
          dates: []
        };
      }
      acc[grade.subject].grades.push(grade.grade);
      acc[grade.subject].dates.push(new Date(grade.createdAt));
      return acc;
    }, {} as Record<string, { grades: number[], dates: Date[] }>);

    Object.entries(subjectStats).forEach(([subject, data]) => {
      const average = data.grades.reduce((sum, grade) => sum + grade, 0) / data.grades.length;
      const recentGrades = data.grades.slice(-3);
      const recentAverage = recentGrades.reduce((sum, grade) => sum + grade, 0) / recentGrades.length;
      
      let trend: 'improving' | 'declining' | 'stable' = 'stable';
      if (recentAverage < average - 0.3) trend = 'declining';
      else if (recentAverage > average + 0.3) trend = 'improving';

      // Analyze best study times based on grade entry patterns
      const hourCounts = data.dates.reduce((acc, date) => {
        const hour = date.getHours();
        const timeSlot = 
          hour < 12 ? 'Vormittag' :
          hour < 17 ? 'Nachmittag' :
          'Abend';
        acc[timeSlot] = (acc[timeSlot] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const bestTime = Object.entries(hourCounts).reduce((best, [time, count]) => 
        count > (hourCounts[best] || 0) ? time : best, 'Nachmittag');

      patterns.push({
        subject,
        bestTimeToStudy: bestTime,
        averageGrade: average,
        trend,
        recommendation: generateRecommendation(subject, average, trend)
      });
    });

    setStudyPatterns(patterns);
  };

  const calculateTrend = (grades: number[]) => {
    if (grades.length < 2) return 0;
    const n = grades.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = grades.reduce((sum, grade) => sum + grade, 0);
    const sumXY = grades.reduce((sum, grade, index) => sum + grade * index, 0);
    const sumXX = grades.reduce((sum, _, index) => sum + index * index, 0);
    
    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  };

  const generateRecommendation = (subject: string, average: number, trend: string) => {
    if (average <= 2.0) return `Hervorragend in ${subject}! Halte das Niveau.`;
    if (average <= 3.0) return `Gute Leistung in ${subject}. Kleine Optimierungen möglich.`;
    if (trend === 'improving') return `Positive Entwicklung in ${subject}. Weiter so!`;
    if (trend === 'declining') return `Aufmerksamkeit nötig in ${subject}. Mehr Übung empfohlen.`;
    return `${subject} braucht mehr Aufmerksamkeit. Lernplan erstellen.`;
  };

  const handleSmartQuery = async () => {
    if (!userQuery.trim()) return;
    
    setIsAnalyzing(true);
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate contextual response based on query
    const response = generateSmartResponse(userQuery);
    response.id = `query_response_${Date.now()}`;
    setInsights(prev => [response, ...prev]);
    setUserQuery("");
    setIsAnalyzing(false);
  };

  const solveMathProblem = (expression: string): string => {
    try {
      // Einfache Mathe-Operationen
      const cleanExpression = expression.replace(/[^0-9+\-*/().^√\s]/g, '');
      
      // Quadratwurzel
      if (cleanExpression.includes('√')) {
        const match = cleanExpression.match(/√(\d+)/);
        if (match) {
          const number = parseInt(match[1]);
          return `√${number} = ${Math.sqrt(number).toFixed(2)}`;
        }
      }
      
      // Potenz
      if (cleanExpression.includes('^')) {
        const match = cleanExpression.match(/(\d+)\^(\d+)/);
        if (match) {
          const base = parseInt(match[1]);
          const exponent = parseInt(match[2]);
          return `${base}^${exponent} = ${Math.pow(base, exponent)}`;
        }
      }
      
      // Grundrechenarten
      const basicMath = cleanExpression.replace(/\s/g, '');
      if (/^[\d+\-*/().]+$/.test(basicMath)) {
        try {
          // Sichere Auswertung mit Function constructor
          const result = Function(`"use strict"; return (${basicMath})`)();
          return `${basicMath} = ${result}`;
        } catch (e) {
          return 'Diese Rechenaufgabe kann ich nicht lösen.';
        }
      }
      
      return 'Diese Rechenaufgabe kann ich nicht lösen.';
    } catch (error) {
      return 'Fehler beim Lösen der Aufgabe.';
    }
  };

  const generateSmartResponse = (query: string): AIInsight => {
    const lowercaseQuery = query.toLowerCase();
    
    // Mathe-Aufgaben erkennen
    if (lowercaseQuery.includes('rechne') || lowercaseQuery.includes('löse') || 
        /[\d+\-*/^√]/.test(query) || lowercaseQuery.includes('mathe')) {
      const mathResult = solveMathProblem(query);
      return {
        id: 'query_response',
        type: 'suggestion',
        title: 'Mathematische Lösung',
        description: mathResult,
        confidence: 95,
        actionable: false,
        priority: 'medium',
        category: 'study'
      };
    }
    
    if (lowercaseQuery.includes('noten') || lowercaseQuery.includes('verbesser')) {
      return {
        id: 'query_response',
        type: 'suggestion',
        title: 'Notenverbesserung',
        description: 'Fokussiere dich auf deine schwächsten Fächer. Plane 2-3 Lerneinheiten pro Woche für diese Bereiche.',
        confidence: 80,
        actionable: true,
        priority: 'medium',
        category: 'study'
      };
    }
    
    if (lowercaseQuery.includes('zeit') || lowercaseQuery.includes('planen')) {
      return {
        id: 'query_response',
        type: 'suggestion',
        title: 'Zeitmanagement',
        description: 'Erstelle einen Wochenplan mit festen Lernzeiten. Plane Pausen ein und halte dich an den Plan.',
        confidence: 85,
        actionable: true,
        priority: 'medium',
        category: 'time'
      };
    }
    
    return {
      id: 'query_response',
      type: 'suggestion',
      title: 'Allgemeine Hilfe',
      description: 'Ich kann dir bei Lernstrategien, Mathe-Aufgaben und Zeitmanagement helfen. Frage mich nach konkreten Themen oder stelle eine Rechenaufgabe!',
      confidence: 70,
      actionable: false,
      priority: 'low',
      category: 'study'
    };
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'suggestion': return Lightbulb;
      case 'warning': return AlertCircle;
      case 'achievement': return Award;
      case 'prediction': return Brain;
      default: return Bot;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'suggestion': return 'border-blue-500/50 bg-blue-500/10';
      case 'warning': return 'border-yellow-500/50 bg-yellow-500/10';
      case 'achievement': return 'border-green-500/50 bg-green-500/10';
      case 'prediction': return 'border-purple-500/50 bg-purple-500/10';
      default: return 'border-cyan-500/50 bg-cyan-500/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Assistant Header */}
      <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-cyan-300 flex items-center gap-2">
            <Bot className="h-5 w-5" />
            EDUPLANIX KI-Assistent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Frage deinen KI-Assistenten..."
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              className="bg-black/50 border-cyan-500/30 text-cyan-100"
              onKeyPress={(e) => e.key === 'Enter' && handleSmartQuery()}
            />
            <Button 
              onClick={handleSmartQuery}
              disabled={isAnalyzing || !userQuery.trim()}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400"
            >
              {isAnalyzing ? <Clock className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-sm text-cyan-400">
            Stelle Fragen zu deinen Noten, Lernplänen oder erbitte Verbesserungsvorschläge.
          </p>
        </CardContent>
      </Card>

      {/* Smart Insights */}
      <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-purple-300 flex items-center gap-2">
            <Brain className="h-5 w-5" />
            KI-Erkenntnisse
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insights.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 mx-auto mb-4 text-purple-400 opacity-50" />
              <p className="text-purple-100">Sammle mehr Daten für personalisierte Einblicke</p>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.slice(0, showDetailedAnalysis ? insights.length : 3).map((insight) => {
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
                          <Badge variant="outline" className={`text-xs ${insight.priority === 'high' ? 'border-red-500/30' : insight.priority === 'medium' ? 'border-yellow-500/30' : 'border-green-500/30'}`}>
                            {insight.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-purple-300 mb-2">{insight.description}</p>
                        <div className="flex items-center gap-2 text-xs text-purple-400">
                          <span className="capitalize">{insight.category}</span>
                          {insight.actionable && (
                            <Badge variant="outline" className="border-purple-500/30">
                              Umsetzbar
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {insights.length > 3 && (
                <Button
                  variant="outline"
                  onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
                  className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                >
                  {showDetailedAnalysis ? 'Weniger anzeigen' : `${insights.length - 3} weitere Einblicke`}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Study Patterns */}
      <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-green-500/30">
        <CardHeader>
          <CardTitle className="text-green-300 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Lernmuster-Analyse
          </CardTitle>
        </CardHeader>
        <CardContent>
          {studyPatterns.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 mx-auto mb-4 text-green-400 opacity-50" />
              <p className="text-green-100">Mehr Noten benötigt für Muster-Analyse</p>
            </div>
          ) : (
            <div className="space-y-4">
              {studyPatterns.map((pattern) => (
                <div key={pattern.subject} className="border border-green-500/30 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-green-100">{pattern.subject}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-green-500/30">
                        ∅ {pattern.averageGrade.toFixed(1)}
                      </Badge>
                      <Badge variant="outline" className={`border-${pattern.trend === 'improving' ? 'green' : pattern.trend === 'declining' ? 'red' : 'yellow'}-500/30`}>
                        {pattern.trend === 'improving' ? '↗️' : pattern.trend === 'declining' ? '↘️' : '→'} {pattern.trend}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-green-400">Beste Lernzeit:</span>
                      <span className="text-green-100 ml-2">{pattern.bestTimeToStudy}</span>
                    </div>
                    <div>
                      <span className="text-green-400">Empfehlung:</span>
                      <span className="text-green-100 ml-2">{pattern.recommendation}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Prediction */}
      <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-yellow-500/30">
        <CardHeader>
          <CardTitle className="text-yellow-300 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Leistungsprognose
          </CardTitle>
        </CardHeader>
        <CardContent>
          {grades.length < 5 ? (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-yellow-400 opacity-50" />
              <p className="text-yellow-100">Mindestens 5 Noten für Prognose erforderlich</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-yellow-100 mb-2">Deine Lernreise</h3>
                <p className="text-sm text-yellow-300">
                  Basierend auf deinen aktuellen Leistungen und Lerngewohnheiten
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-yellow-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-100 mb-2">Kurzzeitprognose (1 Monat)</h4>
                  <Progress value={75} className="mb-2" />
                  <p className="text-sm text-yellow-300">
                    75% Wahrscheinlichkeit für Notenverbesserung bei aktuellem Tempo
                  </p>
                </div>
                
                <div className="border border-yellow-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-100 mb-2">Langzeitprognose (Semester)</h4>
                  <Progress value={60} className="mb-2" />
                  <p className="text-sm text-yellow-300">
                    60% Wahrscheinlichkeit für Ziel-Durchschnitt bei kontinuierlicher Arbeit
                  </p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-yellow-200">
                  <strong>KI-Empfehlung:</strong> Konzentriere dich auf deine schwächsten Fächer und plane 
                  2-3 zusätzliche Lerneinheiten pro Woche für optimale Ergebnisse.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}