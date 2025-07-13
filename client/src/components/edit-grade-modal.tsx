import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Edit } from "lucide-react";
import type { Grade, InsertGrade } from "@shared/schema";

interface EditGradeModalProps {
  grade: Grade;
  onClose: () => void;
}

export default function EditGradeModal({ grade, onClose }: EditGradeModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<InsertGrade>({
    subject: "",
    description: "",
    grade: 1,
    weight: 1,
  });

  useEffect(() => {
    setFormData({
      subject: grade.subject,
      description: grade.description || "",
      grade: grade.grade,
      weight: grade.weight,
    });
  }, [grade]);

  const updateGradeMutation = useMutation({
    mutationFn: async (data: InsertGrade) => {
      const response = await apiRequest("PUT", `/api/grades/${grade.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/grades"] });
      toast({
        title: "Note aktualisiert",
        description: "Die Note wurde erfolgreich aktualisiert.",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Fehler beim Aktualisieren",
        description: error.message || "Die Note konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie ein Fach an.",
        variant: "destructive",
      });
      return;
    }

    if (formData.grade < 1 || formData.grade > 6) {
      toast({
        title: "Fehler",
        description: "Note muss zwischen 1.0 und 6.0 liegen.",
        variant: "destructive",
      });
      return;
    }

    updateGradeMutation.mutate(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-black/90 border-cyan-500/30">
        <DialogHeader>
          <DialogTitle className="text-cyan-300">
            <Edit className="inline mr-2" size={20} />
            Note bearbeiten
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <Label htmlFor="editSubject" className="text-cyan-300">Fach</Label>
            <Input
              id="editSubject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
              className="bg-slate-800/50 border-cyan-500/30 text-cyan-100 placeholder-cyan-400"
            />
          </div>
          
          <div className="mb-3">
            <Label htmlFor="editDescription" className="text-cyan-300">Beschreibung</Label>
            <Input
              id="editDescription"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-slate-800/50 border-cyan-500/30 text-cyan-100 placeholder-cyan-400"
            />
          </div>
          
          <div className="mb-3">
            <Label htmlFor="editGrade" className="text-cyan-300">Note</Label>
            <Input
              id="editGrade"
              type="number"
              min="1"
              max="6"
              step="0.1"
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: parseFloat(e.target.value) })}
              className="bg-slate-800/50 border-cyan-500/30 text-cyan-100 placeholder-cyan-400"
              required
            />
          </div>
          
          <div className="mb-3">
            <Label htmlFor="editWeight" className="text-cyan-300">Gewichtung</Label>
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
          
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose} className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20">
              Abbrechen
            </Button>
            <Button type="submit" disabled={updateGradeMutation.isPending} className="bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30">
              {updateGradeMutation.isPending ? "Speichern..." : "Speichern"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
