import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Bell, 
  BellRing, 
  X, 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  Calendar,
  Target,
  TrendingUp
} from "lucide-react";
import type { Homework } from "@shared/schema";

interface NotificationSystemProps {
  homework: Homework[];
}

interface Notification {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  dismissed: boolean;
}

export default function NotificationSystem({ homework }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const generateNotifications = () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const newNotifications: Notification[] = [];

      // Overdue homework
      const overdueHomework = homework.filter(hw => 
        !hw.isCompleted && new Date(hw.dueDate) < today
      );
      
      if (overdueHomework.length > 0) {
        newNotifications.push({
          id: 'overdue',
          type: 'error',
          title: 'Überfällige Hausaufgaben',
          message: `${overdueHomework.length} Hausaufgabe(n) sind überfällig`,
          timestamp: now,
          dismissed: false
        });
      }

      // Due today
      const todayHomework = homework.filter(hw => {
        const dueDate = new Date(hw.dueDate);
        return !hw.isCompleted && 
               dueDate.toDateString() === today.toDateString();
      });
      
      if (todayHomework.length > 0) {
        newNotifications.push({
          id: 'today',
          type: 'warning',
          title: 'Heute fällig',
          message: `${todayHomework.length} Hausaufgabe(n) sind heute fällig`,
          timestamp: now,
          dismissed: false
        });
      }

      // Due tomorrow
      const tomorrowHomework = homework.filter(hw => {
        const dueDate = new Date(hw.dueDate);
        return !hw.isCompleted && 
               dueDate.toDateString() === tomorrow.toDateString();
      });
      
      if (tomorrowHomework.length > 0) {
        newNotifications.push({
          id: 'tomorrow',
          type: 'info',
          title: 'Morgen fällig',
          message: `${tomorrowHomework.length} Hausaufgabe(n) sind morgen fällig`,
          timestamp: now,
          dismissed: false
        });
      }

      // High priority pending
      const highPriorityPending = homework.filter(hw => 
        !hw.isCompleted && hw.priority === 'high'
      );
      
      if (highPriorityPending.length > 0) {
        newNotifications.push({
          id: 'high-priority',
          type: 'warning',
          title: 'Hohe Priorität',
          message: `${highPriorityPending.length} wichtige Hausaufgabe(n) ausstehend`,
          timestamp: now,
          dismissed: false
        });
      }

      // Completion milestone
      const completedCount = homework.filter(hw => hw.isCompleted).length;
      if (completedCount > 0 && completedCount % 10 === 0) {
        newNotifications.push({
          id: 'milestone',
          type: 'info',
          title: 'Meilenstein erreicht!',
          message: `${completedCount} Hausaufgaben abgeschlossen - großartig!`,
          timestamp: now,
          dismissed: false
        });
      }

      setNotifications(newNotifications);
    };

    generateNotifications();
  }, [homework]);

  const dismissNotification = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, dismissed: true } : notif
      )
    );
  };

  const activeNotifications = notifications.filter(notif => !notif.dismissed);
  const visibleNotifications = showAll ? activeNotifications : activeNotifications.slice(0, 3);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'error': return AlertTriangle;
      case 'warning': return Clock;
      case 'info': return CheckCircle;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'error': return 'border-red-500/50 bg-red-500/10';
      case 'warning': return 'border-yellow-500/50 bg-yellow-500/10';
      case 'info': return 'border-blue-500/50 bg-blue-500/10';
      default: return 'border-cyan-500/50 bg-cyan-500/10';
    }
  };

  const getTextColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-300';
      case 'warning': return 'text-yellow-300';
      case 'info': return 'text-blue-300';
      default: return 'text-cyan-300';
    }
  };

  if (activeNotifications.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-green-500/30 mb-6">
        <CardHeader className="pb-3 text-[#000000]">
          <CardTitle className="text-green-300 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Alles erledigt!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-100 text-sm">
            Keine Benachrichtigungen - Sie sind auf dem neuesten Stand!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 mb-6">
      <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-cyan-500/30">
        <CardHeader className="pb-3 text-[#000000]">
          <CardTitle className="text-cyan-300 flex items-center gap-2">
            <BellRing className="h-5 w-5" />
            Benachrichtigungen
            <Badge variant="outline" className="border-cyan-500/30">
              {activeNotifications.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {visibleNotifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.type);
              return (
                <Alert 
                  key={notification.id} 
                  className={`${getNotificationColor(notification.type)} border`}
                >
                  <IconComponent className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <div>
                      <div className={`font-semibold ${getTextColor(notification.type)}`}>
                        {notification.title}
                      </div>
                      <div className="text-sm text-gray-300">
                        {notification.message}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissNotification(notification.id)}
                      className="h-6 w-6 p-0 hover:bg-white/10"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </AlertDescription>
                </Alert>
              );
            })}
            
            {activeNotifications.length > 3 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAll(!showAll)}
                className="w-full border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
              >
                {showAll ? 'Weniger anzeigen' : `${activeNotifications.length - 3} weitere anzeigen`}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}