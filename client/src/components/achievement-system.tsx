import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Star, 
  Target, 
  Zap, 
  Award, 
  Crown,
  Gem,
  Medal,
  CheckCircle,
  TrendingUp
} from "lucide-react";
import type { Grade, Homework } from "@shared/schema";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  condition: (grades: Grade[], homework: Homework[]) => boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface AchievementSystemProps {
  grades: Grade[];
  homework: Homework[];
}

export default function AchievementSystem({ grades, homework }: AchievementSystemProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);

  const achievementDefinitions: Achievement[] = [
    {
      id: 'first_grade',
      title: 'Erste Schritte',
      description: 'Deine erste Note eingegeben',
      icon: Star,
      condition: (grades) => grades.length >= 1,
      rarity: 'common',
      points: 10,
      unlocked: false
    },
    {
      id: 'grade_collector',
      title: 'Notensammler',
      description: '10 Noten erreicht',
      icon: Trophy,
      condition: (grades) => grades.length >= 10,
      rarity: 'common',
      points: 25,
      unlocked: false
    },
    {
      id: 'excellent_student',
      title: 'Ausgezeichneter Schüler',
      description: 'Durchschnitt von 1,5 oder besser',
      icon: Award,
      condition: (grades) => {
        if (grades.length === 0) return false;
        const average = grades.reduce((sum, g) => sum + g.grade, 0) / grades.length;
        return average <= 1.5;
      },
      rarity: 'epic',
      points: 100,
      unlocked: false
    },
    {
      id: 'homework_master',
      title: 'Hausaufgaben-Meister',
      description: '20 Hausaufgaben abgeschlossen',
      icon: CheckCircle,
      condition: (_, homework) => homework.filter(hw => hw.isCompleted).length >= 20,
      rarity: 'rare',
      points: 50,
      unlocked: false
    },
    {
      id: 'perfect_score',
      title: 'Perfekte Leistung',
      description: 'Eine 1,0 erreicht',
      icon: Crown,
      condition: (grades) => grades.some(g => g.grade === 1.0),
      rarity: 'legendary',
      points: 200,
      unlocked: false
    },
    {
      id: 'streak_master',
      title: 'Streak-Meister',
      description: '7 Tage hintereinander produktiv',
      icon: Zap,
      condition: (_, homework) => {
        const today = new Date();
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          return date;
        });
        return last7Days.every(date => 
          homework.some(hw => {
            const hwDate = new Date(hw.dueDate);
            return hwDate.toDateString() === date.toDateString() && hw.isCompleted;
          })
        );
      },
      rarity: 'epic',
      points: 150,
      unlocked: false
    },
    {
      id: 'improvement_champion',
      title: 'Verbesserungs-Champion',
      description: 'Durchschnitt um 0,5 verbessert',
      icon: TrendingUp,
      condition: (grades) => {
        if (grades.length < 5) return false;
        const firstHalf = grades.slice(0, Math.floor(grades.length / 2));
        const secondHalf = grades.slice(Math.floor(grades.length / 2));
        const firstAvg = firstHalf.reduce((sum, g) => sum + g.grade, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, g) => sum + g.grade, 0) / secondHalf.length;
        return firstAvg - secondAvg >= 0.5;
      },
      rarity: 'rare',
      points: 75,
      unlocked: false
    },
    {
      id: 'dedication_legend',
      title: 'Hingabe-Legende',
      description: '50 Noten eingegeben',
      icon: Gem,
      condition: (grades) => grades.length >= 50,
      rarity: 'legendary',
      points: 250,
      unlocked: false
    }
  ];

  useEffect(() => {
    const updatedAchievements = achievementDefinitions.map(achievement => {
      const isUnlocked = achievement.condition(grades, homework);
      const wasUnlocked = achievements.find(a => a.id === achievement.id)?.unlocked || false;
      
      // If newly unlocked, add to celebration queue
      if (isUnlocked && !wasUnlocked) {
        setNewAchievements(prev => [...prev, { ...achievement, unlocked: true }]);
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }
      
      return { ...achievement, unlocked: isUnlocked };
    });
    
    setAchievements(updatedAchievements);
  }, [grades, homework]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getTotalPoints = () => {
    return achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0);
  };

  const getUnlockedCount = () => {
    return achievements.filter(a => a.unlocked).length;
  };

  return (
    <div className="space-y-4">
      {/* Celebration Modal */}
      {showCelebration && newAchievements.length > 0 && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-6 rounded-lg text-center max-w-md mx-4">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-white" />
            <h2 className="text-xl font-bold text-white mb-2">Erfolg freigeschaltet!</h2>
            <p className="text-white/90 mb-4">
              {newAchievements[newAchievements.length - 1].title}
            </p>
            <Button
              onClick={() => {
                setShowCelebration(false);
                setNewAchievements([]);
              }}
              className="bg-white text-orange-500 hover:bg-gray-100"
            >
              Großartig!
            </Button>
          </div>
        </div>
      )}

      {/* Achievement Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-yellow-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-yellow-300 flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Gesamtpunkte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-100">
              {getTotalPoints()}
            </div>
            <p className="text-xs text-yellow-400">
              Erfolge freigeschaltet
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-purple-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-300 flex items-center gap-2">
              <Medal className="h-4 w-4" />
              Erfolge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-100">
              {getUnlockedCount()}/{achievements.length}
            </div>
            <p className="text-xs text-purple-400">
              Freigeschaltet
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-green-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-300 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Fortschritt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-100">
              {Math.round((getUnlockedCount() / achievements.length) * 100)}%
            </div>
            <p className="text-xs text-green-400">
              Abgeschlossen
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Achievement List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((achievement) => {
          const IconComponent = achievement.icon;
          return (
            <Card 
              key={achievement.id} 
              className={`bg-gradient-to-br from-black/90 to-slate-900/90 border-cyan-500/30 ${
                achievement.unlocked ? 'ring-2 ring-cyan-400/50' : 'opacity-60'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-cyan-300 flex items-center gap-2">
                    <IconComponent className={`h-4 w-4 ${achievement.unlocked ? 'text-yellow-400' : 'text-gray-400'}`} />
                    {achievement.title}
                  </CardTitle>
                  <Badge 
                    variant="outline" 
                    className={`${getRarityColor(achievement.rarity)} text-white border-0`}
                  >
                    {achievement.rarity}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-cyan-400 mb-2">
                  {achievement.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-cyan-300">
                    {achievement.points} Punkte
                  </span>
                  {achievement.unlocked && (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}