import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Flame,
  Plus
} from "lucide-react";
import EventForm from "./event-form";
import type { Homework, Event } from "@shared/schema";

interface CalendarViewProps {
  homework: Homework[];
  onDateSelect?: (date: Date) => void;
}

export default function CalendarView({ homework, onDateSelect }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);

  const { data: events = [] } = useQuery({
    queryKey: ["/api/events"],
    queryFn: async () => {
      const response = await fetch("/api/events");
      if (!response.ok) throw new Error("Failed to fetch events");
      return response.json();
    },
  });

  const monthNames = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember"
  ];

  const weekDays = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getHomeworkForDate = (date: Date) => {
    const dateString = date.toDateString();
    return homework.filter(hw => {
      const hwDate = new Date(hw.dueDate);
      return hwDate.toDateString() === dateString;
    });
  };

  const getEventsForDate = (date: Date) => {
    const dateString = date.toDateString();
    return events.filter((event: Event) => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === dateString;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isOverdue = (date: Date) => {
    const today = new Date();
    return date < today;
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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <Flame size={12} />;
      case "medium":
        return <AlertCircle size={12} />;
      case "low":
        return <Clock size={12} />;
      default:
        return null;
    }
  };

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      days.push(date);
    }

    return days;
  }, [currentDate]);

  const upcomingHomework = useMemo(() => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    return homework
      .filter(hw => {
        const hwDate = new Date(hw.dueDate);
        return hwDate >= today && hwDate <= nextWeek && !hw.isCompleted;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
  }, [homework]);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  };

  const [showEventDetails, setShowEventDetails] = useState(false);

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    const dayHomework = getHomeworkForDate(date);
    const dayEvents = getEventsForDate(date);
    
    // If there are events/homework for this day, show details first
    if (dayHomework.length > 0 || dayEvents.length > 0) {
      setShowEventDetails(true);
    } else {
      setShowEventForm(true);
    }
    
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  return (
    <>
      <div className="row">
        <div className="col-lg-8 mb-4">
          <Card className="bg-black/90 border-cyan-500/30">
            <CardHeader>
              <CardTitle className="d-flex justify-content-between align-items-center text-cyan-300">
                <div className="d-flex align-items-center">
                  <CalendarIcon className="me-2" size={20} />
                  Kalender
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                    <ChevronLeft size={16} />
                  </Button>
                  <span className="px-3 font-medium">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="calendar-grid">
                <div className="row">
                  {weekDays.map((day) => (
                    <div key={day} className="col calendar-weekday">
                      <div className="text-center font-medium text-cyan-300 p-2">
                        {day}
                      </div>
                    </div>
                  ))}
                </div>
                {Array.from({ length: Math.ceil(calendarDays.length / 7) }).map((_, weekIndex) => (
                  <div key={weekIndex} className="row">
                    {calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((date, dayIndex) => {
                      if (!date) {
                        return (
                          <div key={dayIndex} className="col calendar-day">
                            <div className="calendar-date empty"></div>
                          </div>
                        );
                      }

                      const dayHomework = getHomeworkForDate(date);
                      const dayEvents = getEventsForDate(date);
                      const isCurrentDay = isToday(date);

                      return (
                        <div key={dayIndex} className="col calendar-day">
                          <div 
                            className={`calendar-date bg-slate-800/50 border-cyan-500/30 text-cyan-300 ${isCurrentDay ? 'today' : ''}`}
                            onClick={() => handleDayClick(date)}
                          >
                            <div className="calendar-date-number">
                              {date.getDate()}
                            </div>
                            <div className="calendar-homework">
                              {dayHomework.slice(0, 2).map((hw) => (
                                <div
                                  key={hw.id}
                                  className={`calendar-homework-item ${hw.isCompleted ? 'completed' : ''} ${
                                    isOverdue(new Date(hw.dueDate)) && !hw.isCompleted ? 'overdue' : ''
                                  }`}
                                  title={`${hw.subject}: ${hw.title}`}
                                >
                                  <div className="d-flex align-items-center gap-1">
                                    {hw.isCompleted && <CheckCircle size={10} />}
                                    {getPriorityIcon(hw.priority)}
                                    <span className="homework-title-short">
                                      {hw.title.length > 8 ? hw.title.substring(0, 8) + '...' : hw.title}
                                    </span>
                                  </div>
                                </div>
                              ))}
                              {dayEvents.slice(0, 2).map((event: Event) => (
                                <div
                                  key={event.id}
                                  className="calendar-event-item"
                                  style={{ backgroundColor: event.color }}
                                  title={`${event.title} - ${formatTime(event.startDate)}`}
                                >
                                  <div className="d-flex align-items-center gap-1">
                                    <CalendarIcon size={10} />
                                    <span className="event-title-short">
                                      {event.title.length > 8 ? event.title.substring(0, 8) + '...' : event.title}
                                    </span>
                                  </div>
                                </div>
                              ))}
                              {(dayHomework.length + dayEvents.length) > 2 && (
                                <div className="calendar-homework-more">
                                  +{(dayHomework.length + dayEvents.length) - 2} weitere
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-lg-4">
          <Card className="bg-black/90 border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-cyan-300">
                <BookOpen className="inline mr-2" size={20} />
                Anstehende Hausaufgaben
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingHomework.length === 0 ? (
                <div className="text-center py-4 text-cyan-300">
                  Keine anstehenden Hausaufgaben in den nächsten 7 Tagen
                </div>
              ) : (
                <div className="upcoming-homework">
                  {upcomingHomework.map((hw) => (
                    <div key={hw.id} className="upcoming-homework-item p-3 mb-3 border rounded bg-slate-800/50 border-cyan-500/30">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h6 className="mb-1 text-cyan-300">{hw.title}</h6>
                          <div className="text-cyan-300 small">
                            <strong>{hw.subject}</strong>
                          </div>
                          <div className="d-flex align-items-center mt-2">
                            <CalendarIcon size={14} className="me-1 text-cyan-300" />
                            <span className="small text-cyan-300">
                              {formatDate(new Date(hw.dueDate))} - {formatTime(new Date(hw.dueDate))}
                            </span>
                          </div>
                        </div>
                        <Badge variant={getPriorityColor(hw.priority)} className="badge-small">
                          {getPriorityIcon(hw.priority)}
                          <span className="ml-1">
                            {hw.priority === "high" ? "Hoch" : 
                             hw.priority === "medium" ? "Normal" : "Niedrig"}
                          </span>
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Modal EventForm for creating events on specific dates */}
      {showEventForm && selectedDate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <EventForm 
              selectedDate={selectedDate} 
              onClose={() => setShowEventForm(false)}
              isModal={true}
            />
          </div>
        </div>
      )}
      
      {/* Event Details Modal */}
      {showEventDetails && selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-black/90 to-slate-900/90 border border-cyan-500/30 rounded-lg p-6 max-w-md w-full mx-4 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-cyan-300 font-semibold text-lg">
                {formatDate(selectedDate)}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEventDetails(false)}
                className="text-cyan-300 hover:bg-cyan-500/10"
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              {getHomeworkForDate(selectedDate).length > 0 && (
                <div>
                  <h4 className="text-cyan-300 font-medium mb-2">Hausaufgaben</h4>
                  <div className="space-y-2">
                    {getHomeworkForDate(selectedDate).map((hw) => (
                      <div key={hw.id} className="p-2 bg-slate-800/50 rounded border border-cyan-500/20">
                        <div className="flex items-center gap-2">
                          {getPriorityIcon(hw.priority)}
                          <span className="text-white font-medium">{hw.title}</span>
                          {hw.isCompleted && <CheckCircle size={14} className="text-green-400" />}
                        </div>
                        <p className="text-sm text-gray-300">{hw.subject}</p>
                        <p className="text-xs text-gray-400">{formatTime(new Date(hw.dueDate))}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {getEventsForDate(selectedDate).length > 0 && (
                <div>
                  <h4 className="text-cyan-300 font-medium mb-2">Termine</h4>
                  <div className="space-y-2">
                    {getEventsForDate(selectedDate).map((event: Event) => (
                      <div key={event.id} className="p-2 bg-slate-800/50 rounded border border-cyan-500/20">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: event.color }}
                          />
                          <span className="text-white font-medium">{event.title}</span>
                        </div>
                        {event.description && (
                          <p className="text-sm text-gray-300">{event.description}</p>
                        )}
                        <p className="text-xs text-gray-400">
                          {formatTime(event.startDate)} - {formatTime(event.endDate)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="pt-4 border-t border-cyan-500/20">
                <Button
                  onClick={() => {
                    setShowEventDetails(false);
                    setShowEventForm(true);
                  }}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                >
                  Neuen Termin hinzufügen
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}