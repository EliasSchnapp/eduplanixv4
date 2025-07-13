import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ClipboardList, 
  Edit, 
  Trash2, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Flame
} from "lucide-react";
import type { Homework } from "@shared/schema";

interface HomeworkListProps {
  homework: Homework[];
}

export default function HomeworkList({ homework }: HomeworkListProps) {
  const { toast } = useToast();
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  const deleteHomeworkMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/homework/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/homework"] });
      toast({
        title: "Hausaufgabe gelöscht",
        description: "Die Hausaufgabe wurde erfolgreich gelöscht.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler beim Löschen",
        description: error.message || "Die Hausaufgabe konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    },
  });

  const toggleHomeworkMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PATCH", `/api/homework/${id}/toggle`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/homework"] });
      toast({
        title: "Status aktualisiert",
        description: "Der Status der Hausaufgabe wurde geändert.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler beim Aktualisieren",
        description: error.message || "Der Status konnte nicht geändert werden.",
        variant: "destructive",
      });
    },
  });

  const filteredHomework = useMemo(() => {
    let filtered = homework;
    
    if (filter === "pending") {
      filtered = homework.filter(h => !h.isCompleted);
    } else if (filter === "completed") {
      filtered = homework.filter(h => h.isCompleted);
    }
    
    return filtered.sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [homework, filter]);

  const handleDelete = (homeworkItem: Homework) => {
    if (window.confirm("Möchten Sie diese Hausaufgabe wirklich löschen?")) {
      deleteHomeworkMutation.mutate(homeworkItem.id);
    }
  };

  const handleToggleComplete = (homeworkItem: Homework) => {
    toggleHomeworkMutation.mutate(homeworkItem.id);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <Flame className="inline" size={16} />;
      case "medium":
        return <AlertCircle className="inline" size={16} />;
      case "low":
        return <Clock className="inline" size={16} />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  const isOverdue = (dueDate: Date) => {
    return new Date() > new Date(dueDate);
  };

  return (
    <Card className="bg-black/90 border-cyan-500/30">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-cyan-300">
            <ClipboardList className="inline mr-2" size={20} />
            Hausaufgaben
          </CardTitle>
        </div>
        <div className="flex gap-4 mt-4">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className={filter === "all" ? "bg-gradient-to-r from-cyan-500 to-blue-500" : "border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"}
          >
            Alle ({homework.length})
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("pending")}
            className={filter === "pending" ? "bg-gradient-to-r from-cyan-500 to-blue-500" : "border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"}
          >
            Offen ({homework.filter(h => !h.isCompleted).length})
          </Button>
          <Button
            variant={filter === "completed" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("completed")}
            className={filter === "completed" ? "bg-gradient-to-r from-cyan-500 to-blue-500" : "border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"}
          >
            Erledigt ({homework.filter(h => h.isCompleted).length})
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="homework-list">
          {filteredHomework.length === 0 ? (
            <div className="text-center py-4 text-cyan-300 p-4">
              {filter === "all" ? "Keine Hausaufgaben vorhanden" : 
               filter === "pending" ? "Keine offenen Hausaufgaben" : 
               "Keine erledigten Hausaufgaben"}
            </div>
          ) : (
            filteredHomework.map((homeworkItem) => (
              <div 
                key={homeworkItem.id} 
                className={`homework-item p-4 d-flex align-items-center mb-3 bg-slate-800/50 border-cyan-500/30 rounded-lg ${
                  homeworkItem.isCompleted ? 'completed' : ''
                } ${isOverdue(homeworkItem.dueDate) && !homeworkItem.isCompleted ? 'overdue' : ''}`}
              >
                <div className="me-3">
                  <Checkbox
                    checked={homeworkItem.isCompleted}
                    onCheckedChange={() => handleToggleComplete(homeworkItem)}
                  />
                </div>
                
                <div className="flex-grow-1">
                  <div className="flex justify-between items-start w-full">
                    <div className="flex-grow-1">
                      <h6 className={`mb-1 text-cyan-300 ${homeworkItem.isCompleted ? 'text-decoration-line-through' : ''}`}>
                        {homeworkItem.title}
                      </h6>
                      <div className="text-cyan-300 small">
                        <strong>{homeworkItem.subject}</strong>
                        {homeworkItem.description && (
                          <span className="mx-2">•</span>
                        )}
                        {homeworkItem.description}
                      </div>
                      <div className="flex items-center mt-2">
                        <Calendar className="inline mr-1" size={14} />
                        <span className={`text-sm ${
                          isOverdue(homeworkItem.dueDate) && !homeworkItem.isCompleted ? 'text-red-400' : 'text-cyan-300'
                        }`}>
                          {formatDate(homeworkItem.dueDate)}
                        </span>
                        <span className="mx-2">•</span>
                        <Badge variant={getPriorityColor(homeworkItem.priority)} className="text-xs">
                          {getPriorityIcon(homeworkItem.priority)}
                          <span className="ml-1">
                            {homeworkItem.priority === "high" ? "Hoch" : 
                             homeworkItem.priority === "medium" ? "Normal" : "Niedrig"}
                          </span>
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="ml-auto pl-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                        onClick={() => handleDelete(homeworkItem)}
                        disabled={deleteHomeworkMutation.isPending}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}