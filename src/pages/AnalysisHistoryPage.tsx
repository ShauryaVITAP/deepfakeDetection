import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  Search, 
  Filter, 
  FileVideo, 
  ShieldCheck, 
  ShieldAlert, 
  ArrowUpRight, 
  FileText,
  Inbox
} from 'lucide-react';
import { useDetection } from '../context/DetectionContext';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge, VerdictBadge, DemoDataBadge } from '../components/common/Badge';

export const AnalysisHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { history, loadAnalysisById } = useDetection();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVerdict, setFilterVerdict] = useState<string>('ALL');

  const filteredHistory = history.filter((item) => {
    const matchesSearch = 
      item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesVerdict = 
      filterVerdict === 'ALL' || item.verdict === filterVerdict;

    return matchesSearch && matchesVerdict;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#363042]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="plum">Forensic Repository</Badge>
            <DemoDataBadge />
            <span className="text-xs text-[#A39AAA] font-mono">{history.length} records</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F0FA] tracking-tight">
            Analysis Archive & Audit Log
          </h1>
          <p className="text-xs sm:text-sm text-[#A39AAA]">
            Cryptographically logged verification records of all processed video evidence dossiers.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<FileVideo className="w-4 h-4" />}
          onClick={() => navigate('/upload')}
        >
          Scan New Video
        </Button>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#24212B] p-4 rounded-2xl border border-[#363042]">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#A39AAA] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by filename or scan ID (e.g. SCAN-2026)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#17151C] border border-[#363042] rounded-xl pl-10 pr-4 py-2 text-xs text-[#F5F0FA] placeholder-[#A39AAA] focus:outline-none focus:border-[#B58AFF]"
          />
        </div>

        {/* Verdict Filters */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {['ALL', 'MANIPULATED', 'AUTHENTIC', 'INCONCLUSIVE'].map((v) => (
            <button
              key={v}
              onClick={() => setFilterVerdict(v)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all whitespace-nowrap ${
                filterVerdict === v
                  ? 'bg-[#2A1B38] text-[#B58AFF] border border-[#B58AFF]/50'
                  : 'bg-[#17151C] text-[#A39AAA] border border-[#363042] hover:text-[#F5F0FA]'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* History Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#363042] bg-[#1E1B24] text-[#A39AAA] uppercase font-semibold">
                <th className="py-3.5 px-5">Scan ID</th>
                <th className="py-3.5 px-5">Video Filename</th>
                <th className="py-3.5 px-5">Uploaded</th>
                <th className="py-3.5 px-5">Resolution / Size</th>
                <th className="py-3.5 px-5">Analyzed Frames</th>
                <th className="py-3.5 px-5">Deepfake Prob</th>
                <th className="py-3.5 px-5">Verdict</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#363042]/50 text-[#F5F0FA]">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-[#A39AAA]">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#1E1B24] border border-[#363042] flex items-center justify-center text-[#A39AAA]">
                        <Inbox className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-semibold text-[#F5F0FA]">No records found</span>
                      <p className="text-xs text-[#A39AAA] max-w-sm">
                        No previous forensic evaluations matched your search query or verdict filter.
                      </p>
                      <button 
                        onClick={() => { setSearchTerm(''); setFilterVerdict('ALL'); }}
                        className="text-xs text-[#B58AFF] hover:underline font-semibold cursor-pointer"
                      >
                        Reset filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-[#2C2836] transition-colors">
                    <td className="py-4 px-5 font-mono text-[#B58AFF] font-semibold">
                      {item.id}
                    </td>
                    <td className="py-4 px-5 font-bold max-w-xs truncate" title={item.filename}>
                      {item.filename}
                    </td>
                    <td className="py-4 px-5 font-mono text-[#A39AAA]">
                      {item.uploadedAt}
                    </td>
                    <td className="py-4 px-5 text-[#A39AAA] font-mono">
                      {item.resolution} • {item.fileSize}
                    </td>
                    <td className="py-4 px-5 font-mono text-[#D6B8E8]">
                      {item.analyzedFrames} frames
                    </td>
                    <td className="py-4 px-5 font-mono font-bold">
                      <span className={item.verdict === 'MANIPULATED' ? 'text-[#FF5370]' : item.verdict === 'AUTHENTIC' ? 'text-[#2ED573]' : 'text-[#FFA502]'}>
                        {item.deepfakeProbability}%
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <VerdictBadge verdict={item.verdict} size="sm" />
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            loadAnalysisById(item.id);
                            navigate('/results');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#2A1B38] text-[#D6B8E8] hover:bg-[#3D2452] border border-[#B58AFF]/30 font-semibold cursor-pointer transition-all"
                        >
                          Dossier
                        </button>
                        <button
                          onClick={() => {
                            loadAnalysisById(item.id);
                            navigate('/reports');
                          }}
                          className="p-1.5 rounded-lg bg-[#1E1B24] text-[#A39AAA] hover:text-[#F5F0FA] border border-[#363042] cursor-pointer"
                          title="View PDF Report"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
};
