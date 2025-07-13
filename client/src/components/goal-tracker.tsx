import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Target, 
  Plus, 
  Trophy, 
  Calendar,
  CheckCircle,
  X,
  Edit,
  Star,
  TrendingUp,
  Clock,
  Flag
} from "lucide-react";
import type { Grade, Homework } from "@shared/schema";

interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'academic' | 'personal' | 'skill' | 'habit';
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'paused' | 'failed';
  milestones: Milestone[];
  createdAt: Date;
  completedAt?: Date;
}

interface Milestone {
  id: string;
  title: string;
  targetValue: number;
  completed: boolean;
  completedAt?: Date;
}

interface GoalTrackerProps {
  grades: Grade[];
  homework: Homework[];
}

export default function GoalTracker({ grades, homework }: GoalTrackerProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'academic' as const,
    targetValue: 0,
    unit: '',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    priority: 'medium' as const
  });

  // Pre-defined goal templates
  const goalTemplates = [
    {
      title: 'Notendurchschnitt verbessern',
      description: 'Ziel-Notendurchschnitt erreichen',
      category: 'academic' as const,
      targetValue: 2.0,
      unit: 'Durchschnitt',
      priority: 'high' as const
    },
    {
      title: 'Hausaufgaben-Streak',
      description: 'Consecutive days completing homework',
      category: 'habit' as const,
      targetValue: 30,
      unit: 'Tage',
      priority: 'medium' as const
    },
    {
      title: 'Lernstunden pro Woche',
      description: 'Wöchentliche Lernzeit erhöhen',
      category: 'habit' as const,
      targetValue: 20,
      unit: 'Stunden',
      priority: 'medium' as const
    },
    {
      title: 'Fach-Expertise',
      description: 'Spezialisierung in einem Fach',
      category: 'skill' as const,
      targetValue: 1.5,
      unit: 'Durchschnitt',
      priority: 'high' as const
    }
  ];

  // Auto-generate goals based on performance
  useEffect(() => {
    generateSmartGoals();
  }, [grades, homework]);

  const generateSmartGoals = () => {
    const autoGoals: Goal[] = [];
    
    // Goal based on current grade average
    if (grades.length > 0) {
      const currentAverage = grades.reduce((sum, g) => sum + g.grade, 0) / grades.length;
      const targetAverage = Math.max(1.0, currentAverage - 0.5);
      
      autoGoals.push({
        id: 'auto_grade_improvement',
        title: 'Notendurchschnitt verbessern',
        description: `Von ${currentAverage.toFixed(1)} auf ${targetAverage.toFixed(1)} verbessern`,
        category: 'academic',
        targetValue: targetAverage,
        currentValue: currentAverage,
        unit: 'Durchschnitt',
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        priority: 'high',
        status: 'active',
        milestones: [
          {
            id: 'm1',
            title: '25% Verbesserung',
            targetValue: currentAverage - (currentAverage - targetAverage) * 0.25,
            completed: false
          },
          {
            id: 'm2',
            title: '50% Verbesserung',
            targetValue: currentAverage - (currentAverage - targetAverage) * 0.5,
            completed: false
          },
          {
            id: 'm3',
            title: '75% Verbesserung',
            targetValue: currentAverage - (currentAverage - targetAverage) * 0.75,
            completed: false
          }
        ],
        createdAt: new Date()
      });
    }

    // Goal based on homework completion
    const completedHomework = homework.filter(hw => hw.isCompleted).length;
    const totalHomework = homework.length;
    const completionRate = totalHomework > 0 ? (completedHomework / totalHomework) * 100 : 0;
    
    if (completionRate < 90) {
      autoGoals.push({
        id: 'auto_homework_completion',
        title: 'Hausaufgaben-Completion Rate',
        description: `Von ${completionRate.toFixed(0)}% auf 95% steigern`,
        category: 'habit',
        targetValue: 95,
        currentValue: completionRate,
        unit: 'Prozent',
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        priority: 'medium',
        status: 'active',
        milestones: [
          {
            id: 'm1',
            title: '80% erreicht',
            targetValue: 80,
            completed: completionRate >= 80
          },
          {
            id: 'm2',
            title: '90% erreicht',
            targetValue: 90,
            completed: completionRate >= 90
          }
        ],
        createdAt: new Date()
      });
    }

    // Only add auto-goals if no goals exist yet
    if (goals.length === 0) {
      setGoals(autoGoals);
    }
  };

  const createGoal = () => {
    if (!newGoal.title.trim()) return;

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      category: newGoal.category,
      targetValue: newGoal.targetValue,
      currentValue: 0,
      unit: newGoal.unit,
      deadline: newGoal.deadline,
      priority: newGoal.priority,
      status: 'active',
      milestones: [],
      createdAt: new Date()
    };

    setGoals(prev => [...prev, goal]);
    setNewGoal({
      title: '',
      description: '',
      category: 'academic',
      targetValue: 0,
      unit: '',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      priority: 'medium'
    });
    setShowCreateGoal(false);
  };

  const updateGoalProgress = (goalId: string, newValue: number) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        const updatedGoal = { ...goal, currentValue: newValue };
        
        // Check if goal is completed
        if (goal.category === 'academic' && newValue <= goal.targetValue) {
          updatedGoal.status = 'completed';
          updatedGoal.completedAt = new Date();
        } else if (goal.category !== 'academic' && newValue >= goal.targetValue) {
          updatedGoal.status = 'completed';
          updatedGoal.completedAt = new Date();
        }
        
        // Update milestones
        updatedGoal.milestones = goal.milestones.map(milestone => ({
          ...milestone,
          completed: goal.category === 'academic' 
            ? newValue <= milestone.targetValue
            : newValue >= milestone.targetValue,
          completedAt: milestone.completed ? new Date() : undefined
        }));
        
        return updatedGoal;
      }
      return goal;
    }));
  };

  const deleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
  };

  const getProgressPercentage = (goal: Goal) => {
    if (goal.category === 'academic') {
      // For academic goals, lower is better (grades)
      const progress = Math.max(0, (goal.currentValue - goal.targetValue) / (goal.currentValue || 1));
      return Math.min(100, Math.max(0, (1 - progress) * 100));
    } else {
      // For other goals, higher is better
      return Math.min(100, (goal.currentValue / goal.targetValue) * 100);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic': return 'border-blue-500/50 bg-blue-500/10';
      case 'personal': return 'border-green-500/50 bg-green-500/10';
      case 'skill': return 'border-purple-500/50 bg-purple-500/10';
      case 'habit': return 'border-yellow-500/50 bg-yellow-500/10';
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'paused': return Clock;
      case 'failed': return X;
      default: return Target;
    }
  };

  const useGoalTemplate = (template: typeof goalTemplates[0]) => {
    setNewGoal({
      ...newGoal,
      ...template,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-cyan-300">Ziel-Tracker</h2>
          <p className="text-cyan-400">Verfolge deine akademischen und persönlichen Ziele</p>
        </div>
        <Button 
          onClick={() => setShowCreateGoal(true)}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400"
        >
          <Plus className="h-4 w-4 mr-2" />
          Neues Ziel
        </Button>
      </div>

      {/* Goal Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-green-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-300 flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Abgeschlossen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-100">
              {goals.filter(g => g.status === 'completed').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-blue-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-300 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Aktiv
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-100">
              {goals.filter(g => g.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-purple-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-purple-300 flex items-center gap-2">
              <Star className="h-4 w-4" />
              Erfolgsrate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-100">
              {goals.length > 0 ? Math.round((goals.filter(g => g.status === 'completed').length / goals.length) * 100) : 0}%
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-yellow-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-yellow-300 flex items-center gap-2">
              <Flag className="h-4 w-4" />
              Hohe Priorität
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-100">
              {goals.filter(g => g.priority === 'high' && g.status === 'active').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Goal Form */}
      {showCreateGoal && (
        <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-cyan-300">Neues Ziel erstellen</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Goal Templates */}
            <div className="mb-6">
              <Label className="text-cyan-300 mb-2 block">Vorlagen</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {goalTemplates.map((template, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => useGoalTemplate(template)}
                    className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 h-auto p-2"
                  >
                    <div className="text-center">
                      <div className="text-xs font-semibold">{template.title}</div>
                      <div className="text-xs opacity-60">{template.unit}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="goal-title" className="text-cyan-300">Titel</Label>
                <Input
                  id="goal-title"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="z.B. Notendurchschnitt verbessern"
                  className="bg-black/50 border-cyan-500/30 text-cyan-100"
                />
              </div>
              
              <div>
                <Label htmlFor="goal-category" className="text-cyan-300">Kategorie</Label>
                <Select value={newGoal.category} onValueChange={(value: 'academic' | 'personal' | 'skill' | 'habit') => setNewGoal(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="bg-black/50 border-cyan-500/30 text-cyan-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Akademisch</SelectItem>
                    <SelectItem value="personal">Persönlich</SelectItem>
                    <SelectItem value="skill">Fähigkeiten</SelectItem>
                    <SelectItem value="habit">Gewohnheiten</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="goal-target" className="text-cyan-300">Zielwert</Label>
                <Input
                  id="goal-target"
                  type="number"
                  value={newGoal.targetValue}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, targetValue: parseFloat(e.target.value) || 0 }))}
                  className="bg-black/50 border-cyan-500/30 text-cyan-100"
                />
              </div>
              
              <div>
                <Label htmlFor="goal-unit" className="text-cyan-300">Einheit</Label>
                <Input
                  id="goal-unit"
                  value={newGoal.unit}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, unit: e.target.value }))}
                  placeholder="z.B. Stunden, Punkte, Durchschnitt"
                  className="bg-black/50 border-cyan-500/30 text-cyan-100"
                />
              </div>
              
              <div>
                <Label htmlFor="goal-deadline" className="text-cyan-300">Deadline</Label>
                <Input
                  id="goal-deadline"
                  type="date"
                  value={newGoal.deadline.toISOString().split('T')[0]}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, deadline: new Date(e.target.value) }))}
                  className="bg-black/50 border-cyan-500/30 text-cyan-100"
                />
              </div>
              
              <div>
                <Label htmlFor="goal-priority" className="text-cyan-300">Priorität</Label>
                <Select value={newGoal.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setNewGoal(prev => ({ ...prev, priority: value }))}>
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
            </div>
            
            <div className="mt-4">
              <Label htmlFor="goal-description" className="text-cyan-300">Beschreibung</Label>
              <Textarea
                id="goal-description"
                value={newGoal.description}
                onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Beschreibe dein Ziel..."
                className="bg-black/50 border-cyan-500/30 text-cyan-100"
              />
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button onClick={createGoal} className="bg-gradient-to-r from-cyan-500 to-blue-500">
                Ziel erstellen
              </Button>
              <Button variant="outline" onClick={() => setShowCreateGoal(false)} className="border-cyan-500/30">
                Abbrechen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        {goals.length === 0 ? (
          <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-cyan-500/30">
            <CardContent className="text-center py-12">
              <Target className="h-16 w-16 mx-auto mb-4 text-cyan-400 opacity-50" />
              <h3 className="text-lg font-semibold text-cyan-100 mb-2">Noch keine Ziele definiert</h3>
              <p className="text-cyan-400 mb-4">Erstelle dein erstes Ziel und beginne deinen Erfolgsweg!</p>
              <Button 
                onClick={() => setShowCreateGoal(true)}
                className="bg-gradient-to-r from-cyan-500 to-blue-500"
              >
                Erstes Ziel erstellen
              </Button>
            </CardContent>
          </Card>
        ) : (
          goals.map(goal => {
            const StatusIcon = getStatusIcon(goal.status);
            const progressPercentage = getProgressPercentage(goal);
            
            return (
              <Card key={goal.id} className={`bg-gradient-to-br from-black/90 to-slate-900/90 border ${getCategoryColor(goal.category)}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <StatusIcon className={`h-5 w-5 ${goal.status === 'completed' ? 'text-green-400' : 'text-cyan-400'}`} />
                        <CardTitle className="text-cyan-300">{goal.title}</CardTitle>
                        <Badge variant="outline" className={getPriorityColor(goal.priority)}>
                          {goal.priority}
                        </Badge>
                        <Badge variant="outline" className="border-cyan-500/30 capitalize">
                          {goal.category}
                        </Badge>
                      </div>
                      <p className="text-cyan-400 text-sm">{goal.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingGoal(goal)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteGoal(goal.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-cyan-300">Fortschritt</span>
                        <span className="text-sm text-cyan-100">
                          {goal.currentValue.toFixed(1)} / {goal.targetValue} {goal.unit}
                        </span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                      <div className="text-xs text-cyan-400 mt-1">
                        {progressPercentage.toFixed(0)}% abgeschlossen
                      </div>
                    </div>

                    {/* Update Progress */}
                    {goal.status === 'active' && (
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Neuer Wert"
                          step="0.1"
                          className="bg-black/50 border-cyan-500/30 text-cyan-100 flex-1"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const value = parseFloat((e.target as HTMLInputElement).value);
                              if (!isNaN(value)) {
                                updateGoalProgress(goal.id, value);
                                (e.target as HTMLInputElement).value = '';
                              }
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={(e) => {
                            const input = (e.target as HTMLElement).parentElement?.querySelector('input');
                            if (input) {
                              const value = parseFloat(input.value);
                              if (!isNaN(value)) {
                                updateGoalProgress(goal.id, value);
                                input.value = '';
                              }
                            }
                          }}
                          className="bg-gradient-to-r from-green-500 to-teal-500"
                        >
                          Update
                        </Button>
                      </div>
                    )}

                    {/* Milestones */}
                    {goal.milestones.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-cyan-300 mb-2">Meilensteine</h4>
                        <div className="space-y-1">
                          {goal.milestones.map(milestone => (
                            <div key={milestone.id} className="flex items-center gap-2 text-sm">
                              <CheckCircle className={`h-4 w-4 ${milestone.completed ? 'text-green-400' : 'text-gray-400'}`} />
                              <span className={milestone.completed ? 'text-green-300 line-through' : 'text-cyan-300'}>
                                {milestone.title}
                              </span>
                              <span className="text-cyan-400">
                                ({milestone.targetValue} {goal.unit})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Deadline */}
                    <div className="flex items-center gap-2 text-sm text-cyan-400">
                      <Calendar className="h-4 w-4" />
                      Deadline: {goal.deadline.toLocaleDateString('de-DE')}
                      {goal.status === 'completed' && goal.completedAt && (
                        <span className="text-green-400">
                          (Abgeschlossen: {goal.completedAt.toLocaleDateString('de-DE')})
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}