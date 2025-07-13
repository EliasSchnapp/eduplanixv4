import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Target, 
  Plus, 
  Play, 
  Pause, 
  Check, 
  Edit,
  Trash2,
  Star,
  Brain,
  Timer,
  Trophy,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Zap
} from 'lucide-react';
import type { Homework, Grade } from '@shared/schema';

interface StudySession {
  id: string;
  subject: string;
  topic: string;
  duration: number; // in minutes
  priority: 'low' | 'medium' | 'high';
  scheduledDate: Date;
  completed: boolean;
  notes: string;
  createdAt: Date;
  actualDuration?: number;
  completedAt?: Date;
  difficulty: 'easy' | 'medium' | 'hard';
  sessionType: 'review' | 'practice' | 'homework' | 'exam_prep';
}

interface StudyPlan {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  sessions: StudySession[];
  progress: number;
  createdAt: Date;
  category: 'exam' | 'assignment' | 'general' | 'improvement';
  estimatedHours: number;
  actualHours: number;
}

interface StudyPlannerProps {
  homework: Homework[];
  grades: Grade[];
}

export default function StudyPlanner({ homework, grades }: StudyPlannerProps) {
  const { toast } = useToast();
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [currentSessions, setCurrentSessions] = useState<StudySession[]>([]);
  const [activeView, setActiveView] = useState<'plans' | 'sessions' | 'create' | 'analytics'>('plans');
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<StudyPlan | null>(null);
  const [activeTimer, setActiveTimer] = useState<{ sessionId: string; startTime: Date } | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Smart Plan Generator
  const generateSmartPlan = () => {
    const urgentHomework = homework.filter(hw => {
      const dueDate = new Date(hw.dueDate);
      const today = new Date();
      const timeDiff = dueDate.getTime() - today.getTime();
      const daysUntilDue = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return daysUntilDue <= 7 && !hw.isCompleted;
    });

    const weakSubjects = grades.reduce((acc, grade) => {
      if (grade.grade < 3.0) {
        acc[grade.subject] = (acc[grade.subject] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const sessions: StudySession[] = [];
    let sessionId = 1;

    // Create sessions for urgent homework
    urgentHomework.forEach(hw => {
      const dueDate = new Date(hw.dueDate);
      const today = new Date();
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      
      const session: StudySession = {
        id: `session-${sessionId++}`,
        subject: hw.subject,
        topic: hw.title,
        duration: hw.priority === 'high' ? 120 : hw.priority === 'medium' ? 90 : 60,
        priority: hw.priority as 'low' | 'medium' | 'high',
        scheduledDate: new Date(today.getTime() + (daysUntilDue - 1) * 24 * 60 * 60 * 1000),
        completed: false,
        notes: `Hausaufgabe: ${hw.description || 'Keine Beschreibung'}`,
        createdAt: new Date(),
        difficulty: hw.priority === 'high' ? 'hard' : 'medium',
        sessionType: 'homework'
      };
      sessions.push(session);
    });

    // Create improvement sessions for weak subjects
    Object.entries(weakSubjects).forEach(([subject, count]) => {
      const session: StudySession = {
        id: `session-${sessionId++}`,
        subject,
        topic: `Verbesserung in ${subject}`,
        duration: 90,
        priority: count > 2 ? 'high' : 'medium',
        scheduledDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
        completed: false,
        notes: `Basierend auf ${count} schwachen Noten`,
        createdAt: new Date(),
        difficulty: 'medium',
        sessionType: 'improvement'
      };
      sessions.push(session);
    });

    const plan: StudyPlan = {
      id: `plan-${Date.now()}`,
      title: 'KI-Generierter Lernplan',
      description: `Automatisch erstellt basierend auf ${urgentHomework.length} dringenden Hausaufgaben und ${Object.keys(weakSubjects).length} Verbesserungsbereichen`,
      targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      sessions,
      progress: 0,
      createdAt: new Date(),
      category: 'general',
      estimatedHours: sessions.reduce((sum, s) => sum + s.duration, 0) / 60,
      actualHours: 0
    };

    setStudyPlans(prev => [...prev, plan]);
    toast({
      title: "Intelligenter Lernplan erstellt!",
      description: `${sessions.length} Lernsessions basierend auf deinen Daten generiert.`,
    });
  };

  // Session Timer Functions
  const startTimer = (sessionId: string) => {
    setActiveTimer({ sessionId, startTime: new Date() });
    setTimerSeconds(0);
    const interval = setInterval(() => {
      setTimerSeconds(prev => prev + 1);
    }, 1000);
    return interval;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const completedSessionsCount = currentSessions.filter(s => s.completed).length;
  const totalSessionsCount = currentSessions.length;
  const completionRate = totalSessionsCount > 0 ? (completedSessionsCount / totalSessionsCount) * 100 : 0;

  const todaySessions = currentSessions.filter(session => {
    const today = new Date();
    const sessionDate = new Date(session.scheduledDate);
    return sessionDate.toDateString() === today.toDateString();
  });

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-400" />;
      default: return null;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'hard': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'easy': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'homework': return <BookOpen className="h-4 w-4" />;
      case 'exam_prep': return <Target className="h-4 w-4" />;
      case 'review': return <Brain className="h-4 w-4" />;
      case 'practice': return <Zap className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <Button 
            variant={activeView === 'plans' ? 'default' : 'outline'}
            onClick={() => setActiveView('plans')}
            className={activeView === 'plans' ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'border-cyan-500/30 text-cyan-300'}
          >
            <Target className="h-4 w-4 mr-2" />
            Lernpläne
          </Button>
          <Button 
            variant={activeView === 'sessions' ? 'default' : 'outline'}
            onClick={() => setActiveView('sessions')}
            className={activeView === 'sessions' ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'border-cyan-500/30 text-cyan-300'}
          >
            <Clock className="h-4 w-4 mr-2" />
            Sessions
          </Button>
          <Button 
            variant={activeView === 'analytics' ? 'default' : 'outline'}
            onClick={() => setActiveView('analytics')}
            className={activeView === 'analytics' ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'border-cyan-500/30 text-cyan-300'}
          >
            <Trophy className="h-4 w-4 mr-2" />
            Statistiken
          </Button>
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={generateSmartPlan}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Brain className="h-4 w-4 mr-2" />
            KI-Plan generieren
          </Button>
          <Button
            onClick={() => setShowCreatePlan(true)}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Neuer Plan
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-cyan-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Aktive Pläne</p>
                <p className="text-2xl font-bold text-cyan-300">{studyPlans.length}</p>
              </div>
              <Target className="h-8 w-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Heutige Sessions</p>
                <p className="text-2xl font-bold text-green-300">{todaySessions.length}</p>
              </div>
              <Clock className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Abschlussrate</p>
                <p className="text-2xl font-bold text-purple-300">{Math.round(completionRate)}%</p>
              </div>
              <Trophy className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-orange-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Aktive Timer</p>
                <p className="text-2xl font-bold text-orange-300">
                  {activeTimer ? formatTime(timerSeconds) : '00:00:00'}
                </p>
              </div>
              <Timer className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {activeView === 'plans' && (
        <div className="space-y-4">
          {studyPlans.length === 0 ? (
            <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-cyan-500/30">
              <CardContent className="p-8 text-center">
                <Brain className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-cyan-300 mb-2">Noch keine Lernpläne</h3>
                <p className="text-gray-400 mb-4">Erstelle deinen ersten Lernplan oder lasse einen von der KI generieren!</p>
                <Button
                  onClick={generateSmartPlan}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  KI-Plan generieren
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {studyPlans.map(plan => (
                <Card key={plan.id} className="bg-gradient-to-br from-black/90 to-slate-900/90 border-cyan-500/30">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-cyan-300">{plan.title}</CardTitle>
                        <p className="text-sm text-gray-400 mt-1">{plan.description}</p>
                      </div>
                      <Badge variant="outline" className="border-cyan-500/30 text-cyan-300">
                        {plan.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <div className="text-sm text-gray-400">
                            <Calendar className="h-4 w-4 inline mr-1" />
                            Ziel: {new Date(plan.targetDate).toLocaleDateString('de-DE')}
                          </div>
                          <div className="text-sm text-gray-400">
                            <Clock className="h-4 w-4 inline mr-1" />
                            {plan.estimatedHours}h geplant
                          </div>
                        </div>
                        <div className="text-sm text-cyan-300">
                          {plan.sessions.filter(s => s.completed).length}/{plan.sessions.length} abgeschlossen
                        </div>
                      </div>
                      
                      <Progress value={plan.progress} className="h-2" />
                      
                      <div className="flex justify-between items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPlan(plan);
                            setCurrentSessions(plan.sessions);
                            setActiveView('sessions');
                          }}
                          className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
                        >
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Sessions anzeigen
                        </Button>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" className="text-cyan-300 hover:bg-cyan-500/10">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-400 hover:bg-red-500/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeView === 'sessions' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-cyan-300">
              {selectedPlan ? selectedPlan.title : 'Alle Sessions'}
            </h2>
            <Button
              onClick={() => setShowCreateSession(true)}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Neue Session
            </Button>
          </div>

          {currentSessions.length === 0 ? (
            <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-cyan-500/30">
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-cyan-300 mb-2">Keine Sessions vorhanden</h3>
                <p className="text-gray-400">Erstelle deine erste Lernsession!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {currentSessions.map(session => (
                <Card key={session.id} className="bg-gradient-to-br from-black/90 to-slate-900/90 border-cyan-500/30">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getSessionTypeIcon(session.sessionType)}
                          <h3 className="font-medium text-cyan-300">{session.topic}</h3>
                          <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-300">
                            {session.subject}
                          </Badge>
                          <Badge className={`text-xs ${getDifficultyColor(session.difficulty)}`}>
                            {session.difficulty}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <div className="flex items-center">
                            {getPriorityIcon(session.priority)}
                            <span className="ml-1 capitalize">{session.priority}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {session.duration} min
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(session.scheduledDate).toLocaleDateString('de-DE')}
                          </div>
                        </div>
                        
                        {session.notes && (
                          <p className="text-sm text-gray-300 mt-2">{session.notes}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {session.completed ? (
                          <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Abgeschlossen
                          </Badge>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startTimer(session.id)}
                              className="text-cyan-300 hover:bg-cyan-500/10"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCurrentSessions(prev => 
                                  prev.map(s => s.id === session.id ? { ...s, completed: true, completedAt: new Date() } : s)
                                );
                                toast({
                                  title: "Session abgeschlossen!",
                                  description: `${session.topic} wurde erfolgreich abgeschlossen.`,
                                });
                              }}
                              className="text-green-400 hover:bg-green-500/10"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeView === 'analytics' && (
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-cyan-300">Lernstatistiken</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-300 mb-2">
                    {Math.round(completionRate)}%
                  </div>
                  <div className="text-sm text-gray-400">Abschlussrate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-300 mb-2">
                    {currentSessions.reduce((sum, s) => sum + (s.actualDuration || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-400">Minuten gelernt</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-300 mb-2">
                    {currentSessions.filter(s => s.completed).length}
                  </div>
                  <div className="text-sm text-gray-400">Sessions abgeschlossen</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}