import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  List, 
  Edit, 
  Trash2, 
  SortAsc, 
  SortDesc, 
  Calendar 
} from "lucide-react";
import EditGradeModal from "./edit-grade-modal";
import type { Grade } from "@shared/schema";

interface GradeListProps {
  grades: Grade[];
}

type SortField = "subject" | "grade" | "date";
type SortDirection = "asc" | "desc";

export default function GradeList({ grades }: GradeListProps) {
  const { toast } = useToast();
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);

  const deleteGradeMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/grades/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/grades"] });
      toast({
        title: "Note gelöscht",
        description: "Die Note wurde erfolgreich gelöscht.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler beim Löschen",
        description: error.message || "Die Note konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    },
  });

  const sortedGrades = useMemo(() => {
    const sorted = [...grades].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "subject":
          aValue = a.subject.toLowerCase();
          bValue = b.subject.toLowerCase();
          break;
        case "grade":
          aValue = a.grade;
          bValue = b.grade;
          break;
        case "date":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return sorted;
  }, [grades, sortField, sortDirection]);

  const subjectAverages = useMemo(() => {
    const subjects = new Map<string, { grades: Grade[]; average: number; count: number }>();
    
    grades.forEach(grade => {
      if (!subjects.has(grade.subject)) {
        subjects.set(grade.subject, { grades: [], average: 0, count: 0 });
      }
      subjects.get(grade.subject)!.grades.push(grade);
    });

    subjects.forEach((data, subject) => {
      const totalWeighted = data.grades.reduce((sum, grade) => sum + (grade.grade * grade.weight), 0);
      const totalWeights = data.grades.reduce((sum, grade) => sum + grade.weight, 0);
      data.average = Math.round((totalWeighted / totalWeights) * 10) / 10;
      data.count = data.grades.length;
    });

    return Array.from(subjects.entries()).map(([subject, data]) => ({
      subject,
      average: data.average,
      count: data.count,
    }));
  }, [grades]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleDelete = (grade: Grade) => {
    if (window.confirm("Möchten Sie diese Note wirklich löschen?")) {
      deleteGradeMutation.mutate(grade.id);
    }
  };

  const getGradeBadgeVariant = (grade: number) => {
    if (grade <= 2.0) return "default"; // Success green
    if (grade <= 3.0) return "secondary"; // Warning yellow
    if (grade <= 4.0) return "destructive"; // Danger red
    return "outline"; // Dark
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  };

  return (
    <>
      <Card className="bg-black/90 border-cyan-500/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-cyan-300 flex items-center gap-2">
            <List size={20} />
            Meine Noten
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort("subject")}
              className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 h-8 w-8 p-0"
            >
              <SortAsc size={14} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort("grade")}
              className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 h-8 w-8 p-0"
            >
              <SortDesc size={14} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort("date")}
              className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 h-8 w-8 p-0"
            >
              <Calendar size={14} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <div className="table-responsive">
              <table className="table table-hover mb-0 bg-black/90 border-cyan-500/30">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="text-cyan-300">Fach</th>
                    <th className="text-cyan-300">Beschreibung</th>
                    <th className="text-cyan-300">Note</th>
                    <th className="text-cyan-300">Gewichtung</th>
                    <th className="text-cyan-300">Datum</th>
                    <th className="text-cyan-300">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedGrades.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-cyan-300">
                        Noch keine Noten eingetragen
                      </td>
                    </tr>
                  ) : (
                    sortedGrades.map((grade) => (
                      <tr key={grade.id} className="bg-black/50">
                        <td className="text-cyan-100"><strong>{grade.subject}</strong></td>
                        <td className="text-cyan-100">{grade.description || "—"}</td>
                        <td>
                          <Badge variant={getGradeBadgeVariant(grade.grade)} className="grade-badge">
                            {grade.grade}
                          </Badge>
                        </td>
                        <td className="text-cyan-100">{grade.weight}x</td>
                        <td className="text-cyan-300">{formatDate(grade.createdAt)}</td>
                        <td>
                          <Button
                            variant="outline"
                            size="sm"
                            className="me-1 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20"
                            onClick={() => setEditingGrade(grade)}
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(grade)}
                            disabled={deleteGradeMutation.isPending}
                            className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="block md:hidden">
            {sortedGrades.length === 0 ? (
              <div className="text-center py-8 text-cyan-300">
                Noch keine Noten eingetragen
              </div>
            ) : (
              <div className="space-y-3 p-4">
                {sortedGrades.map((grade) => (
                  <div key={grade.id} className="bg-slate-800/50 rounded-lg p-3 border border-cyan-500/20">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-cyan-100 font-semibold text-sm">{grade.subject}</h4>
                        <p className="text-cyan-300 text-xs">{grade.description || "—"}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant={getGradeBadgeVariant(grade.grade)} className="grade-badge text-xs">
                          {grade.grade}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-cyan-300">
                        {grade.weight}x • {formatDate(grade.createdAt)}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 h-6 w-6 p-0"
                          onClick={() => setEditingGrade(grade)}
                        >
                          <Edit size={10} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(grade)}
                          disabled={deleteGradeMutation.isPending}
                          className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 h-6 w-6 p-0"
                        >
                          <Trash2 size={10} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Subject Averages */}
      {subjectAverages.length > 0 && (
        <Card className="mt-4 bg-black/90 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-cyan-300 flex items-center gap-2">
              <List size={20} />
              Durchschnitt pro Fach
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {subjectAverages.map((subject) => (
                <div key={subject.subject} className="flex justify-between items-center p-3 bg-slate-800/50 rounded border border-cyan-500/30">
                  <div>
                    <strong className="text-cyan-100">{subject.subject}</strong>
                    <small className="text-cyan-300 block">{subject.count} Noten</small>
                  </div>
                  <Badge variant="secondary" className="grade-badge bg-cyan-500/20 text-cyan-300">
                    {subject.average}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {editingGrade && (
        <EditGradeModal
          grade={editingGrade}
          onClose={() => setEditingGrade(null)}
        />
      )}
    </>
  );
}
