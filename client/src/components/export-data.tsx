import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Calendar, GraduationCap, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Grade, Homework, Event } from "@shared/schema";

interface ExportDataProps {
  grades: Grade[];
  homework: Homework[];
  events: Event[];
}

export default function ExportData({ grades, homework, events }: ExportDataProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('de-DE');
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('de-DE');
  };

  const exportToCSV = (data: any[], filename: string, headers: string[]) => {
    const csvContent = [
      headers.join(','),
      ...data.map(item => 
        headers.map(header => {
          const value = item[header.toLowerCase().replace(/\s+/g, '')];
          // Handle dates and special characters
          if (value instanceof Date) {
            return `"${formatDateTime(value)}"`;
          }
          if (typeof value === 'string') {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return `"${value || ''}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportGrades = async () => {
    setIsExporting(true);
    try {
      const gradesData = grades.map(grade => ({
        fach: grade.subject,
        beschreibung: grade.description || '',
        note: grade.grade,
        gewichtung: grade.weight,
        datum: formatDate(grade.createdAt),
      }));

      const headers = ['Fach', 'Beschreibung', 'Note', 'Gewichtung', 'Datum'];
      exportToCSV(gradesData, 'noten-export', headers);
      
      toast({
        title: "Export erfolgreich",
        description: "Noten wurden als CSV-Datei exportiert.",
      });
    } catch (error) {
      toast({
        title: "Export fehlgeschlagen",
        description: "Fehler beim Exportieren der Noten.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportHomework = async () => {
    setIsExporting(true);
    try {
      const homeworkData = homework.map(hw => ({
        fach: hw.subject,
        titel: hw.title,
        beschreibung: hw.description || '',
        fälligkeitsdatum: formatDate(hw.dueDate),
        priorität: hw.priority,
        abgeschlossen: hw.isCompleted ? 'Ja' : 'Nein',
        erstellt: formatDate(hw.createdAt),
      }));

      const headers = ['Fach', 'Titel', 'Beschreibung', 'Fälligkeitsdatum', 'Priorität', 'Abgeschlossen', 'Erstellt'];
      exportToCSV(homeworkData, 'hausaufgaben-export', headers);
      
      toast({
        title: "Export erfolgreich",
        description: "Hausaufgaben wurden als CSV-Datei exportiert.",
      });
    } catch (error) {
      toast({
        title: "Export fehlgeschlagen",
        description: "Fehler beim Exportieren der Hausaufgaben.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportEvents = async () => {
    setIsExporting(true);
    try {
      const eventsData = events.map(event => ({
        titel: event.title,
        beschreibung: event.description || '',
        startdatum: formatDateTime(event.startDate),
        enddatum: formatDateTime(event.endDate),
        typ: event.type,
        farbe: event.color,
        erstellt: formatDate(event.createdAt),
      }));

      const headers = ['Titel', 'Beschreibung', 'Startdatum', 'Enddatum', 'Typ', 'Farbe', 'Erstellt'];
      exportToCSV(eventsData, 'termine-export', headers);
      
      toast({
        title: "Export erfolgreich",
        description: "Termine wurden als CSV-Datei exportiert.",
      });
    } catch (error) {
      toast({
        title: "Export fehlgeschlagen",
        description: "Fehler beim Exportieren der Termine.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportAll = async () => {
    setIsExporting(true);
    try {
      // Export summary data
      const summaryData = [
        {
          kategorie: 'Noten',
          anzahl: grades.length,
          durchschnitt: grades.length > 0 ? (grades.reduce((sum, g) => sum + g.grade, 0) / grades.length).toFixed(2) : 'N/A',
          beste: grades.length > 0 ? Math.max(...grades.map(g => g.grade)).toString() : 'N/A',
          schlechteste: grades.length > 0 ? Math.min(...grades.map(g => g.grade)).toString() : 'N/A',
        },
        {
          kategorie: 'Hausaufgaben',
          anzahl: homework.length,
          abgeschlossen: homework.filter(hw => hw.isCompleted).length,
          offen: homework.filter(hw => !hw.isCompleted).length,
          überfällig: homework.filter(hw => !hw.isCompleted && new Date(hw.dueDate) < new Date()).length,
        },
        {
          kategorie: 'Termine',
          anzahl: events.length,
          kommende: events.filter(e => new Date(e.startDate) > new Date()).length,
          vergangene: events.filter(e => new Date(e.startDate) < new Date()).length,
        },
      ];

      const headers = ['Kategorie', 'Anzahl', 'Details'];
      const csvContent = [
        headers.join(','),
        ...summaryData.map(item => 
          [item.kategorie, item.anzahl, JSON.stringify(item).replace(/"/g, '""')].join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'eduplanix-komplett-export.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export erfolgreich",
        description: "Alle Daten wurden als CSV-Datei exportiert.",
      });
    } catch (error) {
      toast({
        title: "Export fehlgeschlagen",
        description: "Fehler beim Exportieren aller Daten.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick Export Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={exportGrades}
          disabled={isExporting || grades.length === 0}
          className="bg-black/90 text-green-300 border-green-500/30 hover:bg-green-500/20"
        >
          <GraduationCap className="mr-2 h-4 w-4" />
          Noten
          <Badge variant="secondary" className="ml-2">
            {grades.length}
          </Badge>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={exportHomework}
          disabled={isExporting || homework.length === 0}
          className="bg-black/90 text-blue-300 border-blue-500/30 hover:bg-blue-500/20"
        >
          <BookOpen className="mr-2 h-4 w-4" />
          Hausaufgaben
          <Badge variant="secondary" className="ml-2">
            {homework.length}
          </Badge>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={exportEvents}
          disabled={isExporting || events.length === 0}
          className="bg-black/90 text-purple-300 border-purple-500/30 hover:bg-purple-500/20"
        >
          <Calendar className="mr-2 h-4 w-4" />
          Termine
          <Badge variant="secondary" className="ml-2">
            {events.length}
          </Badge>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={exportAll}
          disabled={isExporting}
          className="bg-black/90 text-orange-300 border-orange-500/30 hover:bg-orange-500/20"
        >
          <Download className="mr-2 h-4 w-4" />
          Alle Daten
        </Button>
      </div>

      {/* Export Status */}
      {isExporting && (
        <Card className="bg-black/50 border-cyan-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-cyan-300">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-300"></div>
              <span className="text-sm">Export wird vorbereitet...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Info */}
      <Card className="bg-black/50 border-cyan-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-cyan-300 flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4" />
            Export-Informationen
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-sm text-cyan-400 space-y-1">
            <p>• Alle Exporte erfolgen im CSV-Format</p>
            <p>• Daten werden in deutscher Sprache exportiert</p>
            <p>• Datumswerte sind im deutschen Format (TT.MM.JJJJ)</p>
            <p>• CSV-Dateien können in Excel oder anderen Programmen geöffnet werden</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}