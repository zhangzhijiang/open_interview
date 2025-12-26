import React, { useState } from 'react';
import { Job } from '../types';
import { Plus, Save } from 'lucide-react';

interface Props {
  onPostJob: (job: Job) => void;
  onCancel: () => void;
}

export const EmployerDashboard: React.FC<Props> = ({ onPostJob, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Job>>({
    title: '',
    company: '',
    location: '',
    description: '',
    requirements: [''],
    quizContext: '',
    type: 'Full-time'
  });

  const handleChange = (f: string, v: string) => {
    setFormData(prev => ({ ...prev, [f]: v }));
  };

  const handleReqChange = (idx: number, v: string) => {
    const newReqs = [...(formData.requirements || [])];
    newReqs[idx] = v;
    setFormData(prev => ({ ...prev, requirements: newReqs }));
  };

  const addReq = () => {
    setFormData(prev => ({ ...prev, requirements: [...(prev.requirements || []), ''] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.company) return;
    
    const newJob: Job = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.title!,
      company: formData.company!,
      location: formData.location || 'Remote',
      type: formData.type as any || 'Full-time',
      description: formData.description || '',
      requirements: formData.requirements?.filter(r => r.trim() !== '') || [],
      quizContext: formData.quizContext
    };
    onPostJob(newJob);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-slate-200">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Post a New Job</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
            <input required type="text" className="w-full p-2 border rounded-lg" value={formData.title} onChange={e => handleChange('title', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
            <input required type="text" className="w-full p-2 border rounded-lg" value={formData.company} onChange={e => handleChange('company', e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
            <input type="text" className="w-full p-2 border rounded-lg" value={formData.location} onChange={e => handleChange('location', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
            <select className="w-full p-2 border rounded-lg" value={formData.type} onChange={e => handleChange('type', e.target.value)}>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea rows={4} className="w-full p-2 border rounded-lg" value={formData.description} onChange={e => handleChange('description', e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Key Requirements</label>
          {formData.requirements?.map((req, i) => (
            <div key={i} className="mb-2">
              <input type="text" placeholder="e.g., 5+ years React" className="w-full p-2 border rounded-lg" value={req} onChange={e => handleReqChange(i, e.target.value)} />
            </div>
          ))}
          <button type="button" onClick={addReq} className="text-sm text-primary-600 font-medium flex items-center gap-1">
            <Plus size={16} /> Add Requirement
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">AI Interview Instructions (Hidden from Applicant)</label>
          <p className="text-xs text-slate-500 mb-2">Tell the AI what specifically to test or quiz the candidate on.</p>
          <textarea 
            rows={3} 
            className="w-full p-2 border rounded-lg bg-slate-50" 
            placeholder="e.g., Ask them to design a scalable notification system. Ask about their experience with conflict resolution."
            value={formData.quizContext} 
            onChange={e => handleChange('quizContext', e.target.value)} 
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-slate-600 hover:text-slate-800">Cancel</button>
          <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2">
            <Save size={18} /> Publish Job
          </button>
        </div>
      </form>
    </div>
  );
};
