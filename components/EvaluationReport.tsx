import React from 'react';
import { EvaluationResult } from '../types';
import { CheckCircle, XCircle, Award, Brain, MessageSquare, Briefcase } from 'lucide-react';

interface Props {
  data: EvaluationResult;
  onRestart: () => void;
}

export const EvaluationReport: React.FC<Props> = ({ data, onRestart }) => {
  const scoreColor = data.score >= 80 ? 'text-green-600' : data.score >= 50 ? 'text-yellow-600' : 'text-red-600';
  const scoreBg = data.score >= 80 ? 'bg-green-100' : data.score >= 50 ? 'bg-yellow-100' : 'bg-red-100';

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in zoom-in duration-500">
      
      {/* Header Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-slate-900">Interview Evaluation Report</h2>
        <p className="text-slate-500">Candidate: <span className="font-semibold text-slate-800">{data.candidateName}</span> | Role: <span className="font-semibold text-slate-800">{data.role}</span></p>
      </div>

      {/* Main Score Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold border-8 ${scoreBg} ${scoreColor} border-opacity-50`}>
            {data.score}
          </div>
          <div>
            <div className="text-sm uppercase tracking-wide text-slate-400 font-semibold mb-1">Recommendation</div>
            <div className={`text-2xl font-bold ${data.hiringRecommendation === 'No Hire' ? 'text-red-600' : 'text-green-600'}`}>
              {data.hiringRecommendation}
            </div>
            <p className="text-slate-500 text-sm mt-1">Based on requirement coverage and technical checks.</p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <Briefcase size={20} className="text-primary-600"/> Executive Summary
        </h3>
        <p className="text-slate-600 leading-relaxed">
          {data.summary}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
           <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <CheckCircle size={20} className="text-green-500"/> Strengths
          </h3>
          <ul className="space-y-3">
            {data.strengths.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-600">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0"></div>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
           <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <XCircle size={20} className="text-red-500"/> Areas for Improvement
          </h3>
          <ul className="space-y-3">
            {data.weaknesses.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-600">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0"></div>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Technical */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Brain size={20} className="text-purple-600"/> Technical Assessment
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed">{data.technicalAssessment}</p>
        </div>

        {/* Communication */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <MessageSquare size={20} className="text-orange-600"/> Communication Skills
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed">{data.communicationSkills}</p>
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <button onClick={onRestart} className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium">
          Back to Job Board
        </button>
      </div>

    </div>
  );
};
