import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Clock, Target, BookOpen, CheckCircle, Plus, X, Edit } from "lucide-react";
import type { Homework, Grade } from "@shared/schema";

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
}

interface StudyPlan {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  sessions: StudySession[];
  progress: number;
  createdAt: Date;
}

interface StudyPlannerProps {
  homework: Homework[];
  grades: Grade[];
}

export default function StudyPlanner({ homework, grades }: StudyPlannerProps) {
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPlan, setSelectedPlan] = useState<StudyPlan | null>(null);
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showCreateSession, setShowCreateSession] = useState(false);

  // Form states
  const [newPlan, setNewPlan] = useState({
    title: '',
    description: '',
    targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default to 1 week from now
  });

  const [newSession, setNewSession] = useState({
    subject: '',
    topic: '',
    duration: 60,
    priority: 'medium' as const,
    scheduledDate: new Date(),
    notes: ''
  });

  // Generate study recommendations based on grades and homework
  const generateRecommendations = () => {
    const recommendations: Array<{
      subject: string;
      reason: string;
      priority: 'low' | 'medium' | 'high';
      suggestedDuration: number;
    }> = [];

    // Analyze grades for weak subjects
    const subjectGrades = grades.reduce((acc, grade) => {
      if (!acc[grade.subject]) {
        acc[grade.subject] = [];
      }
      acc[grade.subject].push(grade.grade);
      return acc;
    }, {} as Record<string, number[]>);

    Object.entries(subjectGrades).forEach(([subject, grades]) => {
      const average = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
      if (average > 3.0) {
        recommendations.push({
          subject,
          reason: `Durchschnitt von ${average.toFixed(1)} - Verbesserung möglich`,
          priority: average > 4.0 ? 'high' : 'medium',
          suggestedDuration: average > 4.0 ? 90 : 60
        });
      }
    });

    // Analyze overdue homework
    const now = new Date();
    const overdueHomework = homework.filter(hw => 
      !hw.isCompleted && new Date(hw.dueDate) < now
    );

    overdueHomework.forEach(hw => {
      recommendations.push({
        subject: hw.subject,
        reason: `Überfällige Hausaufgabe: ${hw.title}`,
        priority: 'high',
        suggestedDuration: 45
      });
    });

    // Analyze upcoming high-priority homework
    const upcomingHomework = homework.filter(hw => {
      const dueDate = new Date(hw.dueDate);
      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      return !hw.isCompleted && dueDate <= threeDaysFromNow && dueDate > now && hw.priority === 'high';
    });

    upcomingHomework.forEach(hw => {
      recommendations.push({
        subject: hw.subject,
        reason: `Wichtige Hausaufgabe fällig: ${hw.title}`,
        priority: 'high',
        suggestedDuration: 60
      });
    });

    return recommendations;
  };

  const createStudyPlan = () => {
    if (!newPlan.title.trim()) return;

    const plan: StudyPlan = {
      id: Date.now().toString(),
      title: newPlan.title,
      description: newPlan.description,
      targetDate: newPlan.targetDate,
      sessions: [],
      progress: 0,
      createdAt: new Date()
    };

    setStudyPlans(prev => [...prev, plan]);
    setNewPlan({ title: '', description: '', targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
    setShowCreatePlan(false);
  };

  const addSessionToPlan = (planId: string) => {
    if (!newSession.subject.trim() || !newSession.topic.trim()) return;

    const session: StudySession = {
      id: Date.now().toString(),
      subject: newSession.subject,
      topic: newSession.topic,
      duration: newSession.duration,
      priority: newSession.priority,
      scheduledDate: newSession.scheduledDate,
      completed: false,
      notes: newSession.notes,
      createdAt: new Date()
    };

    setStudyPlans(prev => prev.map(plan => 
      plan.id === planId 
        ? { ...plan, sessions: [...plan.sessions, session] }
        : plan
    ));

    setNewSession({
      subject: '',
      topic: '',
      duration: 60,
      priority: 'medium',
      scheduledDate: new Date(),
      notes: ''
    });
    setShowCreateSession(false);
  };

  const toggleSessionCompletion = (planId: string, sessionId: string) => {
    setStudyPlans(prev => prev.map(plan => 
      plan.id === planId 
        ? {
            ...plan,
            sessions: plan.sessions.map(session =>
              session.id === sessionId 
                ? { ...session, completed: !session.completed }
                : session
            )
          }
        : plan
    ));
  };

  const calculatePlanProgress = (plan: StudyPlan) => {
    if (plan.sessions.length === 0) return 0;
    const completedSessions = plan.sessions.filter(s => s.completed).length;
    return (completedSessions / plan.sessions.length) * 100;
  };

  const getTodaysSessions = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return studyPlans.flatMap(plan => 
      plan.sessions.filter(session => {
        const sessionDate = new Date(session.scheduledDate);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === today.getTime();
      }).map(session => ({ ...session, planTitle: plan.title }))
    );
  };

  const recommendations = generateRecommendations();
  const todaysSessions = getTodaysSessions();

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-black/50 border border-cyan-500/30">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="plans">Lernpläne</TabsTrigger>
          <TabsTrigger value="today">Heute</TabsTrigger>
          <TabsTrigger value="recommendations">Empfehlungen</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-cyan-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-cyan-300 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Aktive Pläne
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-cyan-100">
                  {studyPlans.length}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-purple-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-purple-300 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Heutige Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-100">
                  {todaysSessions.length}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-green-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-green-300 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Empfehlungen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-100">
                  {recommendations.length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Plans */}
          <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-cyan-300">Aktuelle Lernpläne</CardTitle>
            </CardHeader>
            <CardContent>
              {studyPlans.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-cyan-100 mb-4">Noch keine Lernpläne erstellt</p>
                  <Button 
                    onClick={() => setShowCreatePlan(true)}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400"
                  >
                    Ersten Lernplan erstellen
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {studyPlans.slice(0, 3).map(plan => (
                    <div key={plan.id} className="border border-cyan-500/30 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-cyan-100">{plan.title}</h3>
                        <Badge variant="outline" className="border-cyan-500/30">
                          {plan.sessions.length} Sessions
                        </Badge>
                      </div>
                      <p className="text-sm text-cyan-400 mb-2">{plan.description}</p>
                      <div className="flex items-center gap-4 text-sm text-cyan-300">
                        <span>Fortschritt: {calculatePlanProgress(plan).toFixed(0)}%</span>
                        <span>Ziel: {plan.targetDate.toLocaleDateString('de-DE')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-cyan-300">Lernpläne</h2>
            <Button 
              onClick={() => setShowCreatePlan(true)}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400"
            >
              <Plus className="h-4 w-4 mr-2" />
              Neuer Plan
            </Button>
          </div>

          {/* Create Plan Form */}
          {showCreatePlan && (
            <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-cyan-300">Neuen Lernplan erstellen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="plan-title" className="text-cyan-300">Titel</Label>
                    <Input
                      id="plan-title"
                      value={newPlan.title}
                      onChange={(e) => setNewPlan(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="z.B. Mathe-Prüfung Vorbereitung"
                      className="bg-black/50 border-cyan-500/30 text-cyan-100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="plan-description" className="text-cyan-300">Beschreibung</Label>
                    <Textarea
                      id="plan-description"
                      value={newPlan.description}
                      onChange={(e) => setNewPlan(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Beschreibe deine Lernziele..."
                      className="bg-black/50 border-cyan-500/30 text-cyan-100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="plan-target-date" className="text-cyan-300">Zieldatum</Label>
                    <Input
                      id="plan-target-date"
                      type="date"
                      value={newPlan.targetDate.toISOString().split('T')[0]}
                      onChange={(e) => setNewPlan(prev => ({ ...prev, targetDate: new Date(e.target.value) }))}
                      className="bg-black/50 border-cyan-500/30 text-cyan-100"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={createStudyPlan} className="bg-gradient-to-r from-cyan-500 to-blue-500">
                      Plan erstellen
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreatePlan(false)} className="border-cyan-500/30">
                      Abbrechen
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Plans List */}
          <div className="space-y-4">
            {studyPlans.map(plan => (
              <Card key={plan.id} className="bg-gradient-to-br from-black/90 to-slate-900/90 border-cyan-500/30">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-cyan-300">{plan.title}</CardTitle>
                      <p className="text-cyan-400 mt-1">{plan.description}</p>
                    </div>
                    <Badge variant="outline" className="border-cyan-500/30">
                      {calculatePlanProgress(plan).toFixed(0)}% abgeschlossen
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-cyan-300">Zieldatum: {plan.targetDate.toLocaleDateString('de-DE')}</span>
                      <Button 
                        onClick={() => {
                          setSelectedPlan(plan);
                          setShowCreateSession(true);
                        }}
                        size="sm"
                        className="bg-gradient-to-r from-purple-500 to-pink-500"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Session hinzufügen
                      </Button>
                    </div>
                    
                    {/* Sessions */}
                    <div className="space-y-2">
                      {plan.sessions.map(session => (
                        <div key={session.id} className="flex items-center justify-between p-3 border border-cyan-500/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleSessionCompletion(plan.id, session.id)}
                              className={`h-6 w-6 p-0 ${session.completed ? 'text-green-400' : 'text-cyan-400'}`}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <div>
                              <div className={`font-medium ${session.completed ? 'text-green-300 line-through' : 'text-cyan-100'}`}>
                                {session.subject} - {session.topic}
                              </div>
                              <div className="text-sm text-cyan-400">
                                {session.duration} Min • {session.scheduledDate.toLocaleDateString('de-DE')}
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline" className={`border-${session.priority === 'high' ? 'red' : session.priority === 'medium' ? 'yellow' : 'green'}-500/30`}>
                            {session.priority}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="today" className="space-y-4">
          <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-cyan-300 flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Heutige Lernsessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todaysSessions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-cyan-100">Keine Sessions für heute geplant</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todaysSessions.map(session => (
                    <div key={session.id} className="border border-cyan-500/30 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-cyan-100">{session.subject} - {session.topic}</h3>
                          <p className="text-sm text-cyan-400">Plan: {session.planTitle}</p>
                        </div>
                        <Badge variant="outline" className="border-cyan-500/30">
                          {session.duration} Min
                        </Badge>
                      </div>
                      {session.notes && (
                        <p className="text-sm text-cyan-300 mb-2">{session.notes}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`border-${session.priority === 'high' ? 'red' : session.priority === 'medium' ? 'yellow' : 'green'}-500/30`}>
                          {session.priority}
                        </Badge>
                        {session.completed && (
                          <Badge variant="outline" className="border-green-500/30 text-green-300">
                            Abgeschlossen
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-green-500/30">
            <CardHeader>
              <CardTitle className="text-green-300">Lernempfehlungen</CardTitle>
            </CardHeader>
            <CardContent>
              {recommendations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-green-100">Keine Empfehlungen verfügbar</p>
                  <p className="text-green-400 text-sm mt-2">Füge mehr Noten und Hausaufgaben hinzu für personalisierte Empfehlungen</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="border border-green-500/30 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-green-100">{rec.subject}</h3>
                          <p className="text-sm text-green-400">{rec.reason}</p>
                        </div>
                        <Badge variant="outline" className={`border-${rec.priority === 'high' ? 'red' : rec.priority === 'medium' ? 'yellow' : 'green'}-500/30`}>
                          {rec.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-green-500/30">
                          {rec.suggestedDuration} Min empfohlen
                        </Badge>
                        <Button 
                          size="sm"
                          onClick={() => {
                            setNewSession(prev => ({
                              ...prev,
                              subject: rec.subject,
                              duration: rec.suggestedDuration,
                              priority: rec.priority
                            }));
                            setShowCreateSession(true);
                          }}
                          className="bg-gradient-to-r from-green-500 to-teal-500"
                        >
                          Session planen
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Session Modal */}
      {showCreateSession && (
        <Card className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-black/90 to-slate-900/90 border-cyan-500/30 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-cyan-300">Session hinzufügen</h3>
              <Button variant="ghost" onClick={() => setShowCreateSession(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-cyan-300">Fach</Label>
                <Input
                  value={newSession.subject}
                  onChange={(e) => setNewSession(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="z.B. Mathematik"
                  className="bg-black/50 border-cyan-500/30 text-cyan-100"
                />
              </div>
              
              <div>
                <Label className="text-cyan-300">Thema</Label>
                <Input
                  value={newSession.topic}
                  onChange={(e) => setNewSession(prev => ({ ...prev, topic: e.target.value }))}
                  placeholder="z.B. Quadratische Gleichungen"
                  className="bg-black/50 border-cyan-500/30 text-cyan-100"
                />
              </div>
              
              <div>
                <Label className="text-cyan-300">Dauer (Minuten)</Label>
                <Input
                  type="number"
                  value={newSession.duration}
                  onChange={(e) => setNewSession(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                  className="bg-black/50 border-cyan-500/30 text-cyan-100"
                />
              </div>
              
              <div>
                <Label className="text-cyan-300">Priorität</Label>
                <Select value={newSession.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setNewSession(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger className="bg-black/50 border-cyan-500/30 text-cyan-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Niedrig</SelectItem>
                    <SelectItem value="medium">Mittel</SelectItem>
                    <SelectItem value="high">Hoch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-cyan-300">Geplanter Termin</Label>
                <Input
                  type="datetime-local"
                  value={newSession.scheduledDate.toISOString().slice(0, 16)}
                  onChange={(e) => setNewSession(prev => ({ ...prev, scheduledDate: new Date(e.target.value) }))}
                  className="bg-black/50 border-cyan-500/30 text-cyan-100"
                />
              </div>
              
              <div>
                <Label className="text-cyan-300">Notizen (optional)</Label>
                <Textarea
                  value={newSession.notes}
                  onChange={(e) => setNewSession(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Zusätzliche Notizen..."
                  className="bg-black/50 border-cyan-500/30 text-cyan-100"
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    if (selectedPlan) {
                      addSessionToPlan(selectedPlan.id);
                    }
                  }}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 flex-1"
                >
                  Session hinzufügen
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateSession(false)}
                  className="border-cyan-500/30"
                >
                  Abbrechen
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}