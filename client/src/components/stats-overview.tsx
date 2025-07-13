import { useMemo } from "react";
import { TrendingUp, Book, Trophy, ClipboardList } from "lucide-react";
import type { Grade } from "@shared/schema";

interface StatsOverviewProps {
  grades: Grade[];
}

export default function StatsOverview({ grades }: StatsOverviewProps) {
  const stats = useMemo(() => {
    if (grades.length === 0) {
      return {
        overallAverage: 0,
        subjectCount: 0,
        bestGrade: 0,
        totalEntries: 0,
      };
    }

    // Calculate weighted average
    const totalWeightedGrades = grades.reduce((sum, grade) => sum + (grade.grade * grade.weight), 0);
    const totalWeights = grades.reduce((sum, grade) => sum + grade.weight, 0);
    const overallAverage = totalWeights > 0 ? totalWeightedGrades / totalWeights : 0;

    // Get unique subjects
    const subjects = new Set(grades.map(grade => grade.subject));
    const subjectCount = subjects.size;

    // Get best grade
    const bestGrade = Math.min(...grades.map(grade => grade.grade));

    return {
      overallAverage: Math.round(overallAverage * 10) / 10,
      subjectCount,
      bestGrade,
      totalEntries: grades.length,
    };
  }, [grades]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      <div className="stats-card p-3 text-center bg-black/90 border border-cyan-500/30 rounded-lg">
        <TrendingUp className="mx-auto mb-2 text-cyan-300" size={24} />
        <h6 className="text-cyan-300 text-sm">Gesamtdurchschnitt</h6>
        <div className="grade-average text-cyan-300 text-lg font-bold">
          {stats.overallAverage > 0 ? stats.overallAverage : "—"}
        </div>
      </div>
      <div className="stats-card p-3 text-center bg-black/90 border border-cyan-500/30 rounded-lg">
        <Book className="mx-auto mb-2 text-cyan-300" size={24} />
        <h6 className="text-cyan-300 text-sm">Fächer</h6>
        <div className="text-lg font-bold text-cyan-300">{stats.subjectCount}</div>
      </div>
      <div className="stats-card p-3 text-center bg-black/90 border border-cyan-500/30 rounded-lg">
        <Trophy className="mx-auto mb-2 text-cyan-300" size={24} />
        <h6 className="text-cyan-300 text-sm">Beste Note</h6>
        <div className="text-lg font-bold text-cyan-300">
          {stats.bestGrade > 0 ? stats.bestGrade : "—"}
        </div>
      </div>
      <div className="stats-card p-3 text-center bg-black/90 border border-cyan-500/30 rounded-lg">
        <ClipboardList className="mx-auto mb-2 text-cyan-300" size={24} />
        <h6 className="text-cyan-300 text-sm">Einträge</h6>
        <div className="text-lg font-bold text-cyan-300">{stats.totalEntries}</div>
      </div>
    </div>
  );
}
