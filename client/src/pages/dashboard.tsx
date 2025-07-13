import { useEffect, useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, User, LogOut, BookOpen, TrendingUp, Users, Calendar, Download, Target, Bot, BarChart3, Trophy, Brain, ClipboardList } from "lucide-react";
import logoPath from "@assets/Design ohne Titel (1)_1752353023318.png";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsOverview from "@/components/stats-overview";
import GradeForm from "@/components/grade-form";
import GradeList from "@/components/grade-list";
import UserManagement from "@/components/user-management";
import HomeworkForm from "@/components/homework-form";
import HomeworkList from "@/components/homework-list";
import CalendarView from "@/components/calendar-view";
import EventForm from "@/components/event-form";
import DashboardStats from "@/components/dashboard-stats";
import SearchBar from "@/components/search-bar";
import ExportData from "@/components/export-data";
import NotificationSystem from "@/components/notification-system";
import QuickActions from "@/components/quick-actions";
import ProductivityTracker from "@/components/productivity-tracker";
import AnimatedBackground from "@/components/animated-background";
import AchievementSystem from "@/components/achievement-system";
import GradeAnalytics from "@/components/grade-analytics";
import StudyPlanner from "@/components/study-planner-new";
import SmartAssistant from "@/components/smart-assistant";
import GoalTracker from "@/components/goal-tracker";
import AdvancedDashboard from "@/components/advanced-dashboard";
import OverviewTab from "@/components/overview-tab";
import OfflineIndicator from "@/components/offline-indicator";
import type { Grade, Homework, Event } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["/api/me"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: grades = [], isLoading: isGradesLoading } = useQuery<Grade[]>({
    queryKey: ["/api/grades"],
    staleTime: 5 * 60 * 1000,
  });

  const { data: homework = [], isLoading: isHomeworkLoading } = useQuery<Homework[]>({
    queryKey: ["/api/homework"],
    staleTime: 5 * 60 * 1000,
  });

  const { data: events = [], isLoading: isEventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
    staleTime: 5 * 60 * 1000,
  });

  // Search functionality
  const [searchQuery, setSearchQuery] = useState("");
  
  // Calendar functionality
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);

  // Memoize filtered data to prevent infinite renders
  const filteredGrades = useMemo(() => {
    if (!searchQuery) {
      return grades;
    }
    const query = searchQuery.toLowerCase();
    return grades.filter(grade => 
      grade.subject.toLowerCase().includes(query) ||
      (grade.description && grade.description.toLowerCase().includes(query))
    );
  }, [searchQuery, grades]);

  const filteredHomework = useMemo(() => {
    if (!searchQuery) {
      return homework;
    }
    const query = searchQuery.toLowerCase();
    return homework.filter(hw => 
      hw.subject.toLowerCase().includes(query) ||
      hw.title.toLowerCase().includes(query) ||
      (hw.description && hw.description.toLowerCase().includes(query))
    );
  }, [searchQuery, homework]);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout", {});
    },
    onSuccess: () => {
      // Invalidate all queries to clear cached data
      queryClient.invalidateQueries();
      queryClient.clear();
      // Small delay to ensure logout is processed
      setTimeout(() => {
        setLocation("/login");
      }, 100);
      toast({
        title: "Erfolgreich abgemeldet",
        description: "Sie wurden erfolgreich abgemeldet.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler beim Abmelden",
        description: error.message || "Ein Fehler ist aufgetreten.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!isUserLoading && !user) {
      setLocation("/login");
    }
  }, [user, isUserLoading, setLocation]);

  const isAdmin = user?.user?.username === "EliasSchnapp" || user?.user?.role === "admin";

  if (isUserLoading || isGradesLoading || isHomeworkLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-cyan-400 mb-3" role="status">
            <span className="visually-hidden">Lädt...</span>
          </div>
          <p className="text-cyan-300">Lade Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      <AnimatedBackground />
      <div className="bg-black/70 backdrop-blur-sm shadow-lg border-b border-cyan-500/20">
        <div className="container-fluid px-2 py-2">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <div>
                <h1 className="h5 mb-0 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent fw-bold">
                  EDUPLANIX
                </h1>
              </div>
            </div>
            <div className="d-flex align-items-center gap-1">
              {/* Mobile Tab Navigation in Header - Ultra Kompakt */}
              <div className="lg:hidden">
                <div className="flex gap-0.5">
                  <Button
                    variant={activeTab === "overview" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab("overview")}
                    className={`h-6 w-6 p-0 text-xs ${activeTab === "overview" ? "bg-cyan-500/30 text-cyan-100" : "bg-black/50 text-cyan-300 border-cyan-500/50 hover:bg-cyan-500/20"}`}
                  >
                    <BarChart3 size={8} />
                  </Button>
                  <Button
                    variant={activeTab === "grades" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab("grades")}
                    className={`h-6 w-6 p-0 text-xs ${activeTab === "grades" ? "bg-cyan-500/30 text-cyan-100" : "bg-black/50 text-cyan-300 border-cyan-500/50 hover:bg-cyan-500/20"}`}
                  >
                    <TrendingUp size={8} />
                  </Button>
                  <Button
                    variant={activeTab === "homework" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab("homework")}
                    className={`h-6 w-6 p-0 text-xs ${activeTab === "homework" ? "bg-cyan-500/30 text-cyan-100" : "bg-black/50 text-cyan-300 border-cyan-500/50 hover:bg-cyan-500/20"}`}
                  >
                    <ClipboardList size={8} />
                  </Button>
                  <Button
                    variant={activeTab === "calendar" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab("calendar")}
                    className={`h-6 w-6 p-0 text-xs ${activeTab === "calendar" ? "bg-cyan-500/30 text-cyan-100" : "bg-black/50 text-cyan-300 border-cyan-500/50 hover:bg-cyan-500/20"}`}
                  >
                    <Calendar size={8} />
                  </Button>
                  <Button
                    variant={activeTab === "assistant" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab("assistant")}
                    className={`h-6 w-6 p-0 text-xs ${activeTab === "assistant" ? "bg-cyan-500/30 text-cyan-100" : "bg-black/50 text-cyan-300 border-cyan-500/50 hover:bg-cyan-500/20"}`}
                  >
                    <Brain size={8} />
                  </Button>
                </div>
              </div>

              <OfflineIndicator />
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 hover:text-cyan-100 border-2 border-cyan-500/50 hover:border-cyan-400 h-6 px-2"
              >
                <LogOut size={12} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        {/* Notification System - Only on Overview Tab */}
        {activeTab === "overview" && (
          <div className="mt-6 mb-6">
            <NotificationSystem homework={homework} />
          </div>
        )}
        
        {/* Dashboard Statistics - Only on Overview Tab */}
        {activeTab === "overview" && (
          <DashboardStats grades={grades} homework={homework} />
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

          {/* Desktop Tab Navigation */}
          <TabsList className={`hidden lg:grid w-full ${isAdmin ? 'grid-cols-12' : 'grid-cols-11'} bg-black/50 border border-cyan-500/30`}>
            <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-cyan-500/30 data-[state=active]:text-cyan-100 text-cyan-300">
              <BarChart3 size={16} />
              Übersicht
            </TabsTrigger>
            <TabsTrigger value="grades" className="flex items-center gap-2 data-[state=active]:bg-cyan-500/30 data-[state=active]:text-cyan-100 text-cyan-300">
              <TrendingUp size={16} />
              Noten
            </TabsTrigger>
            <TabsTrigger value="homework" className="flex items-center gap-2 data-[state=active]:bg-cyan-500/30 data-[state=active]:text-cyan-100 text-cyan-300">
              <ClipboardList size={16} />
              Hausaufgaben
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2 data-[state=active]:bg-cyan-500/30 data-[state=active]:text-cyan-100 text-cyan-300">
              <Calendar size={16} />
              Kalender
            </TabsTrigger>
            <TabsTrigger value="planner" className="flex items-center gap-2 data-[state=active]:bg-cyan-500/30 data-[state=active]:text-cyan-100 text-cyan-300">
              <Target size={16} />
              Planer
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-cyan-500/30 data-[state=active]:text-cyan-100 text-cyan-300">
              <TrendingUp size={16} />
              Analytik
            </TabsTrigger>
            <TabsTrigger value="assistant" className="flex items-center gap-2 data-[state=active]:bg-cyan-500/30 data-[state=active]:text-cyan-100 text-cyan-300">
              <Brain size={16} />
              KI-Assistent
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2 data-[state=active]:bg-cyan-500/30 data-[state=active]:text-cyan-100 text-cyan-300">
              <Trophy size={16} />
              Ziele
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2 data-[state=active]:bg-cyan-500/30 data-[state=active]:text-cyan-100 text-cyan-300">
              <BarChart3 size={16} />
              Erweitert
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2 data-[state=active]:bg-cyan-500/30 data-[state=active]:text-cyan-100 text-cyan-300">
              <GraduationCap size={16} />
              Erfolge
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2 data-[state=active]:bg-cyan-500/30 data-[state=active]:text-cyan-100 text-cyan-300">
              <Download size={16} />
              Export
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="users" className="flex items-center gap-2 data-[state=active]:bg-cyan-500/30 data-[state=active]:text-cyan-100 text-cyan-300">
                <Users size={16} />
                Benutzer
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <OverviewTab 
              grades={grades}
              homework={homework}
              onAddGrade={() => setActiveTab("grades")}
              onAddHomework={() => setActiveTab("homework")}
              onAddEvent={() => setActiveTab("calendar")}
            />
          </TabsContent>

          <TabsContent value="grades" className="space-y-6">
            <div className="mb-4">
              <SearchBar 
                onSearch={setSearchQuery} 
                placeholder="Noten und Fächer durchsuchen..." 
              />
            </div>
            
            {/* Mobile Layout - Stats First */}
            <div className="block md:hidden">
              <div className="mb-5">
                <StatsOverview grades={grades} />
              </div>
              <div className="mb-5">
                <GradeList grades={filteredGrades} />
              </div>
              <div className="mb-5">
                <GradeForm />
              </div>
            </div>

            {/* Desktop Layout - Form First */}
            <div className="hidden md:block">
              <div className="row">
                <div className="col-md-4 mb-5">
                  <GradeForm />
                </div>
                <div className="col-md-8 mb-5">
                  <StatsOverview grades={grades} />
                </div>
              </div>

              <div className="row">
                <div className="col-12">
                  <GradeList grades={filteredGrades} />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="homework" className="space-y-6">
            <div className="mb-4">
              <SearchBar 
                onSearch={setSearchQuery} 
                placeholder="Hausaufgaben durchsuchen..." 
              />
            </div>
            
            {/* Mobile Layout - List First */}
            <div className="block md:hidden">
              <div className="mb-5">
                <HomeworkList homework={filteredHomework} />
              </div>
              <div className="mb-5">
                <HomeworkForm />
              </div>
            </div>

            {/* Desktop Layout - Form First */}
            <div className="hidden md:block">
              <div className="row">
                <div className="col-md-4 mb-5">
                  <HomeworkForm />
                </div>
                <div className="col-md-8 mb-5">
                  <HomeworkList homework={filteredHomework} />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <CalendarView 
              homework={homework} 
              onDateSelect={setSelectedCalendarDate}
            />
          </TabsContent>

          <TabsContent value="planner" className="space-y-6">
            <StudyPlanner homework={homework} grades={grades} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <GradeAnalytics grades={grades} />
          </TabsContent>

          <TabsContent value="assistant" className="space-y-6">
            <SmartAssistant grades={grades} homework={homework} />
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <GoalTracker grades={grades} homework={homework} />
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <AdvancedDashboard grades={grades} homework={homework} />
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <AchievementSystem grades={grades} homework={homework} />
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <div className="row">
              <div className="col-12">
                <ExportData grades={grades} homework={homework} events={events} />
              </div>
            </div>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="users" className="space-y-6">
              <div className="row">
                <div className="col-12">
                  <UserManagement />
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
