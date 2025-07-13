import { useState } from "react";
import { useOfflineMutation } from "@/hooks/use-offline-mutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import type { InsertGrade } from "@shared/schema";

export default function GradeForm() {
  const [formData, setFormData] = useState<InsertGrade>({
    subject: "",
    description: "",
    grade: 1,
    weight: 1,
  });

  const createGradeMutation = useOfflineMutation("/api/grades", ["/api/grades"]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim()) {
      return;
    }

    if (formData.grade < 1 || formData.grade > 6) {
      return;
    }

    createGradeMutation.mutate(formData);
    
    // Reset form after successful submission
    setFormData({
      subject: "",
      description: "",
      grade: 1,
      weight: 1,
    });
  };

  return (
    <Card className="bg-black/90 border-cyan-500/30">
      <CardHeader>
        <CardTitle className="text-cyan-300">
          <Plus className="inline mr-2" size={20} />
          Neue Note hinzufügen
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
            <Label htmlFor="description" className="text-cyan-300">Beschreibung</Label>
            <Input
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="z.B. Klassenarbeit, Test"
              className="bg-slate-800/50 border-cyan-500/30 text-cyan-100 placeholder-cyan-400"
            />
          </div>
          
          <div className="mb-3">
            <Label htmlFor="grade" className="text-cyan-300">Note</Label>
            <Input
              id="grade"
              type="number"
              min="1"
              max="6"
              step="0.1"
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: parseFloat(e.target.value) })}
              placeholder="1.0 - 6.0"
              className="grade-input"
              required
            />
            <div className="form-text">Deutsche Notenskala: 1.0 (sehr gut) bis 6.0 (ungenügend)</div>
          </div>
          
          <div className="mb-3">
            <Label htmlFor="weight">Gewichtung</Label>
            <Select
              value={formData.weight.toString()}
              onValueChange={(value) => setFormData({ ...formData, weight: parseFloat(value) })}
            >
              <SelectTrigger className="bg-slate-800/50 border-cyan-500/30 text-cyan-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-cyan-500/30">
                <SelectItem value="0.5" className="text-cyan-300 hover:bg-cyan-500/20">Halb (0.5x)</SelectItem>
                <SelectItem value="1" className="text-cyan-300 hover:bg-cyan-500/20">Normal (1x)</SelectItem>
                <SelectItem value="2" className="text-cyan-300 hover:bg-cyan-500/20">Doppelt (2x)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button
            type="submit"
            className="w-100 bg-black/90 hover:bg-slate-800/50 text-cyan-300 border-cyan-500/30"
            disabled={createGradeMutation.isPending}
          >
            {createGradeMutation.isPending ? (
              "Hinzufügen..."
            ) : (
              <>
                <Plus className="inline mr-2" size={16} />
                Note hinzufügen
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
