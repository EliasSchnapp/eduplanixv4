import React from 'react';
import QuickActions from "@/components/quick-actions";
import ProductivityTracker from "@/components/productivity-tracker";
import DashboardStats from "@/components/dashboard-stats";
import type { Grade, Homework } from "@shared/schema";

interface OverviewTabProps {
  grades: Grade[];
  homework: Homework[];
  onAddGrade: () => void;
  onAddHomework: () => void;
  onAddEvent: () => void;
}

export default function OverviewTab({ 
  grades, 
  homework, 
  onAddGrade, 
  onAddHomework, 
  onAddEvent 
}: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <QuickActions 
        homework={homework}
        onAddGrade={onAddGrade}
        onAddHomework={onAddHomework}
        onAddEvent={onAddEvent}
      />
      
      {/* Productivity Tracker */}
      <ProductivityTracker grades={grades} homework={homework} />
    </div>
  );
}