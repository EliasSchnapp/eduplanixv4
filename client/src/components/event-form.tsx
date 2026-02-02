import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Calendar, Plus, X, CalendarDays } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertEventSchema, type InsertEvent } from "@shared/schema";

interface EventFormProps {
  selectedDate?: Date;
  onClose?: () => void;
  isModal?: boolean;
}

export default function EventForm({ selectedDate, onClose, isModal = false }: EventFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startDate, setStartDate] = useState<Date>(selectedDate || new Date());
  const [endDate, setEndDate] = useState<Date>(selectedDate || new Date());
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("10:00");

  const form = useForm<any>({
    resolver: zodResolver(insertEventSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "appointment",
      color: "#67e8f9",
      startDate: (selectedDate || new Date()).toISOString(),
      endDate: (selectedDate || new Date()).toISOString(),
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/events", data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Fehler beim Erstellen des Termins");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Termin erstellt",
        description: "Der Termin wurde erfolgreich erstellt.",
      });
      form.reset();
      if (onClose) onClose();
    },
    onError: (error: any) => {
      console.error("Event creation error:", error);
      toast({
        title: "Fehler beim Erstellen",
        description: error.message || "Ein Fehler ist aufgetreten.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Combine date and time for start and end dates
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      const finalStartDate = new Date(startDate);
      finalStartDate.setHours(startHour, startMinute, 0, 0);
      
      const finalEndDate = new Date(endDate);
      finalEndDate.setHours(endHour, endMinute, 0, 0);
      
      const eventData = {
        title: data.title,
        description: data.description || "",
        type: data.type,
        color: data.color,
        startDate: finalStartDate.toISOString(),
        endDate: finalEndDate.toISOString(),
      };

      await createEventMutation.mutateAsync(eventData);
    } catch (error) {
      toast({
        title: "Fehler beim Senden",
        description: "Bitte prüfen Sie Ihre Eingaben.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const eventTypes = [
    { value: "appointment", label: "Termin" },
    { value: "meeting", label: "Besprechung" },
    { value: "event", label: "Veranstaltung" },
    { value: "reminder", label: "Erinnerung" },
  ];

  const eventColors = [
    { value: "#67e8f9", label: "Cyan" },
    { value: "#a78bfa", label: "Lila" },
    { value: "#34d399", label: "Grün" },
    { value: "#fbbf24", label: "Gelb" },
    { value: "#f87171", label: "Rot" },
    { value: "#60a5fa", label: "Blau" },
  ];

  return (
    <Card className="bg-black/90 border-cyan-500/30">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-cyan-300 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Neuer Termin
          </CardTitle>
          {isModal && onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-cyan-300">
              Titel *
            </Label>
            <Input
              id="title"
              placeholder="Termin-Titel eingeben..."
              {...form.register("title")}
              className="bg-black/50 border-cyan-500/30 text-cyan-100 placeholder-cyan-500/50"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-400">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-cyan-300">
              Beschreibung
            </Label>
            <Textarea
              id="description"
              placeholder="Zusätzliche Details zum Termin..."
              rows={3}
              {...form.register("description")}
              className="bg-black/50 border-cyan-500/30 text-cyan-100 placeholder-cyan-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-cyan-300">
                Startdatum *
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-black/50 border-cyan-500/30 text-cyan-100 hover:bg-cyan-500/20"
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP", { locale: de }) : "Datum auswählen"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-black/90 border-cyan-500/30">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      if (date) {
                        setStartDate(date);
                        form.setValue("startDate", date.toISOString());
                      }
                    }}
                    initialFocus
                    className="bg-black/90 text-cyan-100"
                  />
                </PopoverContent>
              </Popover>
              <div className="space-y-1">
                <Label className="text-cyan-300 text-sm">
                  Startzeit
                </Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="bg-black/50 border-cyan-500/30 text-cyan-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-cyan-300">
                Enddatum *
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-black/50 border-cyan-500/30 text-cyan-100 hover:bg-cyan-500/20"
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP", { locale: de }) : "Datum auswählen"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-black/90 border-cyan-500/30">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      if (date) {
                        setEndDate(date);
                        form.setValue("endDate", date.toISOString());
                      }
                    }}
                    initialFocus
                    className="bg-black/90 text-cyan-100"
                  />
                </PopoverContent>
              </Popover>
              <div className="space-y-1">
                <Label className="text-cyan-300 text-sm">
                  Endzeit
                </Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="bg-black/50 border-cyan-500/30 text-cyan-100"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-cyan-300">
                Typ *
              </Label>
              <Select
                onValueChange={(value) => form.setValue("type", value)}
                defaultValue={form.getValues("type")}
              >
                <SelectTrigger className="bg-black/50 border-cyan-500/30 text-cyan-100 hover:bg-cyan-500/20">
                  <SelectValue placeholder="Typ auswählen" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-cyan-500/30 backdrop-blur-sm">
                  {eventTypes.map((type) => (
                    <SelectItem 
                      key={type.value} 
                      value={type.value} 
                      className="text-cyan-100 hover:bg-cyan-500/30 focus:bg-cyan-500/30 cursor-pointer"
                    >
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color" className="text-cyan-300">
                Farbe
              </Label>
              <Select
                onValueChange={(value) => form.setValue("color", value)}
                defaultValue={form.getValues("color")}
              >
                <SelectTrigger className="bg-black/50 border-cyan-500/30 text-cyan-100 hover:bg-cyan-500/20">
                  <SelectValue placeholder="Farbe auswählen" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-cyan-500/30 backdrop-blur-sm">
                  {eventColors.map((color) => (
                    <SelectItem 
                      key={color.value} 
                      value={color.value} 
                      className="text-cyan-100 hover:bg-cyan-500/30 focus:bg-cyan-500/30 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: color.value }}
                        />
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || createEventMutation.isPending}
              className="bg-black text-cyan-300 hover:bg-cyan-500/20 hover:text-cyan-100 border border-cyan-500/30"
            >
              {isSubmitting || createEventMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-300 mr-2"></div>
                  Wird erstellt...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Termin erstellen
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
