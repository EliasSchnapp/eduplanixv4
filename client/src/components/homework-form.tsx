import { useState } from "react";
import { useOfflineMutation } from "@/hooks/use-offline-mutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BookOpen, Plus, CalendarIcon } from "lucide-react";
import type { InsertHomework } from "@shared/schema";

export default function HomeworkForm() {
  const [formData, setFormData] = useState<InsertHomework>({
    subject: "",
    title: "",
    description: "",
    dueDate: new Date(),
    priority: "medium",
  });

  const [showCalendar, setShowCalendar] = useState(false);

  const createHomeworkMutation = useOfflineMutation("/api/homework", ["/api/homework"]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.title.trim()) {
      return;
    }

    createHomeworkMutation.mutate({
      ...formData,
      dueDate: formData.dueDate.toISOString(),
    } as any);
    
    // Reset form after successful submission
    setFormData({
      subject: "",
      title: "",
      description: "",
      dueDate: new Date(),
      priority: "medium",
    });
  };

  const formatDateForInput = (date: Date) => {
    if (!date || isNaN(date.getTime())) {
      return '';
    }
    return date.toISOString().slice(0, 16);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, dueDate: new Date(e.target.value) });
  };

  return (
    <Card className="bg-black/90 border-cyan-500/30">
      <CardHeader>
        <CardTitle className="text-cyan-300">
          <BookOpen className="inline mr-2" size={20} />
          Neue Hausaufgabe
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <Label htmlFor="subject" className="text-cyan-300">Fach</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="z.B. Mathematik"
              required
              className="bg-slate-800/50 border-cyan-500/30 text-cyan-100 placeholder-cyan-400"
            />
          </div>
          
          <div className="mb-3">
            <Label htmlFor="title" className="text-cyan-300">Titel</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="z.B. Übungen Seite 42"
              required
              className="bg-slate-800/50 border-cyan-500/30 text-cyan-100 placeholder-cyan-400"
            />
          </div>
          
          <div className="mb-3">
            <Label htmlFor="description" className="text-cyan-300">Beschreibung</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Weitere Details zur Hausaufgabe..."
              rows={3}
              className="bg-slate-800/50 border-cyan-500/30 text-cyan-100 placeholder-cyan-400"
            />
          </div>
          
          <div className="mb-3">
            <Label htmlFor="dueDate" className="text-cyan-300">Abgabetermin</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-slate-800/50 border-cyan-500/30 text-cyan-100 hover:bg-slate-700/50"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dueDate ? formData.dueDate.toLocaleDateString('de-DE') : 'Datum wählen'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-black/90 border-cyan-500/30">
                <Calendar
                  mode="single"
                  selected={formData.dueDate}
                  onSelect={(date) => date && setFormData({ ...formData, dueDate: date })}
                  className="bg-black/90 text-cyan-300"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="mb-3">
            <Label htmlFor="priority" className="text-cyan-300">Priorität</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData({ ...formData, priority: value as "low" | "medium" | "high" })}
            >
              <SelectTrigger className="bg-slate-800/50 border-cyan-500/30 text-cyan-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-cyan-500/30">
                <SelectItem value="low" className="text-cyan-300 hover:bg-cyan-500/20">Niedrig</SelectItem>
                <SelectItem value="medium" className="text-cyan-300 hover:bg-cyan-500/20">Normal</SelectItem>
                <SelectItem value="high" className="text-cyan-300 hover:bg-cyan-500/20">Hoch</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button
            type="submit"
            className="w-full bg-black/90 hover:bg-slate-800/50 text-cyan-300 border-cyan-500/30"
            disabled={createHomeworkMutation.isPending}
          >
            {createHomeworkMutation.isPending ? (
              "Hinzufügen..."
            ) : (
              <>
                <Plus className="inline mr-2" size={16} />
                Hausaufgabe hinzufügen
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}