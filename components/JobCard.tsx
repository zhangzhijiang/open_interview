import React from 'react';
import { Job } from '../types';
import { Briefcase, MapPin, Building2, ChevronRight } from 'lucide-react';

interface JobCardProps {
  job: Job;
  onSelect: (job: Job) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onSelect }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow cursor-pointer group" onClick={() => onSelect(job)}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{job.title}</h3>
          <div className="flex items-center gap-2 mt-1 text-slate-500 text-sm">
            <Building2 size={14} />
            <span>{job.company}</span>
          </div>
        </div>
        <span className="bg-primary-50 text-primary-700 text-xs font-medium px-2.5 py-1 rounded-full border border-primary-100">
          {job.type}
        </span>
      </div>
      
      <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
        <div className="flex items-center gap-1">
          <MapPin size={14} />
          {job.location}
        </div>
      </div>
      
      <div className="mt-4">
        <p className="text-slate-600 text-sm line-clamp-2">{job.description}</p>
      </div>

      <div className="mt-5 flex items-center text-primary-600 text-sm font-medium">
        View Details <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};
