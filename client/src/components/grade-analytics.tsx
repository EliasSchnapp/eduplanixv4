import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Award,
  BookOpen,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon
} from "lucide-react";
import type { Grade } from "@shared/schema";

interface GradeAnalyticsProps {
  grades: Grade[];
}

export default function GradeAnalytics({ grades }: GradeAnalyticsProps) {
  if (grades.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-cyan-300 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Noten-Analytik
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-cyan-100 text-center py-8">
            Keine Noten vorhanden für die Analyse
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate analytics
  const subjectStats = grades.reduce((acc, grade) => {
    if (!acc[grade.subject]) {
      acc[grade.subject] = {
        subject: grade.subject,
        grades: [],
        total: 0,
        count: 0,
        best: 6,
        worst: 0
      };
    }
    acc[grade.subject].grades.push(grade.grade);
    acc[grade.subject].total += grade.grade;
    acc[grade.subject].count += 1;
    acc[grade.subject].best = Math.min(acc[grade.subject].best, grade.grade);
    acc[grade.subject].worst = Math.max(acc[grade.subject].worst, grade.grade);
    return acc;
  }, {} as Record<string, any>);

  const subjectData = Object.values(subjectStats).map((stat: any) => ({
    subject: stat.subject,
    average: Number((stat.total / stat.count).toFixed(2)),
    count: stat.count,
    best: stat.best,
    worst: stat.worst
  }));

  // Grade distribution
  const gradeDistribution = [1, 2, 3, 4, 5, 6].map(grade => ({
    grade: grade.toString(),
    count: grades.filter(g => Math.floor(g.grade) === grade).length
  }));

  // Trend analysis (last 10 grades)
  const recentGrades = grades.slice(-10).map((grade, index) => ({
    index: index + 1,
    grade: grade.grade,
    subject: grade.subject,
    date: new Date(grade.createdAt).toLocaleDateString('de-DE')
  }));

  // Calculate overall stats
  const overallAverage = grades.reduce((sum, g) => sum + g.grade, 0) / grades.length;
  const bestGrade = Math.min(...grades.map(g => g.grade));
  const worstGrade = Math.max(...grades.map(g => g.grade));
  const improvementTrend = recentGrades.length > 5 ? 
    recentGrades.slice(-5).reduce((sum, g) => sum + g.grade, 0) / 5 - 
    recentGrades.slice(0, 5).reduce((sum, g) => sum + g.grade, 0) / 5 : 0;

  const COLORS = ['#67e8f9', '#a78bfa', '#34d399', '#fbbf24', '#f87171', '#fb7185'];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-cyan-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-cyan-300 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Durchschnitt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-100">
              {overallAverage.toFixed(2)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {improvementTrend < 0 ? (
                <>
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-green-400">Verbesserung</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-4 w-4 text-red-400" />
                  <span className="text-sm text-red-400">Verschlechterung</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-green-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-300 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Beste Note
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-100">
              {bestGrade.toFixed(1)}
            </div>
            <div className="text-sm text-green-400">
              Ausgezeichnet!
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-yellow-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-yellow-300 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Fächer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-100">
              {Object.keys(subjectStats).length}
            </div>
            <div className="text-sm text-yellow-400">
              Verschiedene Fächer
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-purple-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-300 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Noten insgesamt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-100">
              {grades.length}
            </div>
            <div className="text-sm text-purple-400">
              Eingetragene Noten
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Performance */}
        <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-cyan-300 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Leistung nach Fach
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="subject" 
                  stroke="#67e8f9"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="#67e8f9"
                  fontSize={12}
                  domain={[1, 6]}
                  reversed
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    border: '1px solid #67e8f9',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="average" fill="#67e8f9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Grade Distribution */}
        <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-purple-300 flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Noten-Verteilung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ grade, count }) => count > 0 ? `${grade}: ${count}` : ''}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Trend Analysis */}
      <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-green-500/30">
        <CardHeader>
          <CardTitle className="text-green-300 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Leistungstrend (letzte 10 Noten)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={recentGrades}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="index" stroke="#34d399" fontSize={12} />
              <YAxis stroke="#34d399" fontSize={12} domain={[1, 6]} reversed />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  border: '1px solid #34d399',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="grade" 
                stroke="#34d399" 
                strokeWidth={3}
                dot={{ fill: '#34d399', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Subject Details */}
      <Card className="bg-gradient-to-br from-black/90 to-slate-900/90 border-yellow-500/30">
        <CardHeader>
          <CardTitle className="text-yellow-300 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Fach-Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subjectData.map((subject) => (
              <div key={subject.subject} className="border border-yellow-500/30 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-yellow-100">{subject.subject}</h3>
                  <Badge variant="outline" className="border-yellow-500/30">
                    {subject.count} Noten
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-yellow-400">Durchschnitt:</span>
                    <span className="text-yellow-100 font-semibold ml-2">{subject.average}</span>
                  </div>
                  <div>
                    <span className="text-yellow-400">Beste:</span>
                    <span className="text-green-400 font-semibold ml-2">{subject.best}</span>
                  </div>
                  <div>
                    <span className="text-yellow-400">Schlechteste:</span>
                    <span className="text-red-400 font-semibold ml-2">{subject.worst}</span>
                  </div>
                </div>
                <div className="mt-2">
                  <Progress 
                    value={Math.max(0, (6 - subject.average) / 5 * 100)} 
                    className="h-2"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}