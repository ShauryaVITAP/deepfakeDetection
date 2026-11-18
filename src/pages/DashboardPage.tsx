import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  ShieldCheck, 
  HelpCircle, 
  FileVideo, 
  Activity, 
  Cpu, 
  Clock, 
  ArrowUpRight, 
  UploadCloud, 
  BarChart2,
  TrendingUp,
  Layers,
  Filter
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { useDetection } from '../context/DetectionContext';
import { Card, CardHeader } from '../components/common/Card';
import { StatCard } from '../components/common/StatCard';
import { Button } from '../components/common/Button';
import { Badge, VerdictBadge, DemoDataBadge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { SYSTEM_STATS } from '../data/mockData';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentAnalysis, history, loadAnalysisById, setSampleCase } = useDetection();
  const [filterVerdict, setFilterVerdict] = useState<string>('ALL');

  const monthlyVolumeData = [
    { month: 'Jun', total: 140, fake: 82, authentic: 48, inconcl: 10 },
    { month: 'Jul', total: 195, fake: 118, authentic: 62, inconcl: 15 },
    { month: 'Aug', total: 240, fake: 152, authentic: 74, inconcl: 14 },
    { month: 'Sep', total: 280, fake: 175, authentic: 88, inconcl: 17 },
    { month: 'Oct', total: 310, fake: 198, authentic: 96, inconcl: 16 },
    { month: 'Nov', total: 263, fake: 169, authentic: 74, inconcl: 20 },
  ];

  const metricsData = [
    { name: 'Spatial Coherence', score: currentAnalysis.metrics.spatialCoherence },
    { name: 'Temporal Consistency', score: currentAnalysis.metrics.temporalConsistency },
    { name: 'A/V Lip-Sync', score: currentAnalysis.metrics.audioVisualSync },
    { name: 'Frequency Normalcy', score: 100 - currentAnalysis.metrics.frequencyDomainAnomaly },
    { name: 'Blink Dynamics', score: currentAnalysis.metrics.eyeBlinkDynamics },
    { name: 'Lighting Uniformity', score: currentAnalysis.metrics.lightingConsistency },
  ];

  const filteredHistory = history.filter((item) => {
    if (filterVerdict === 'ALL') return true;
    return item.verdict === filterVerdict;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner: Page Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#363042]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F0FA] tracking-tight">
              Forensic Intelligence Dashboard
            </h1>
            <Badge variant="plum">Real-Time Telemetry</Badge>
            <DemoDataBadge />
          </div>
          <p className="text-xs sm:text-sm text-[#A39AAA] mt-1">
            Ensemble AI diagnostic metrics, continuous model verification status, and recent scan logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={<FileVideo className="w-4 h-4" />}
            onClick={() => navigate('/history')}
          >
            Scan Archive
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<UploadCloud className="w-4 h-4" />}
            onClick={() => navigate('/upload')}
          >
            New Video Analysis
          </Button>
        </div>
      </div>

      {/* 4 Stat Cards: Total, Manipulated, Authentic, Inconclusive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Total Videos Analyzed"
          value={SYSTEM_STATS.totalVideos}
          change="+18 today"
          changeType="positive"
          icon={<FileVideo className="w-5 h-5 text-[#B58AFF]" />}
          description="Across FF++, Celeb-DF, and user uploads"
        />

        <StatCard
          label="Manipulated Videos"
          value={SYSTEM_STATS.manipulatedVideos}
          change={`${Math.round((SYSTEM_STATS.manipulatedVideos / SYSTEM_STATS.totalVideos) * 100)}% rate`}
          changeType="negative"
          icon={<ShieldAlert className="w-5 h-5 text-[#FF5370]" />}
          description="High-confidence synthetic face swaps"
        />

        <StatCard
          label="Authentic Videos"
          value={SYSTEM_STATS.authenticVideos}
          change={`${Math.round((SYSTEM_STATS.authenticVideos / SYSTEM_STATS.totalVideos) * 100)}% rate`}
          changeType="positive"
          icon={<ShieldCheck className="w-5 h-5 text-[#2ED573]" />}
          description="Consistent PRNU and biometric signals"
        />

        <StatCard
          label="Inconclusive Results"
          value={SYSTEM_STATS.inconclusiveVideos}
          change={`${Math.round((SYSTEM_STATS.inconclusiveVideos / SYSTEM_STATS.totalVideos) * 100)}% rate`}
          changeType="neutral"
          icon={<HelpCircle className="w-5 h-5 text-[#FFA502]" />}
          description="High compression / degraded resolution"
        />
      </div>

      {/* Active Scan Focus Card */}
      <Card className="relative overflow-hidden border-[#B58AFF]/40 shadow-[0_4px_25px_rgba(42,27,56,0.5)]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#522F6E]/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-[#363042]">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-[#B58AFF] bg-[#2A1B38] px-2.5 py-1 rounded-lg border border-[#B58AFF]/30">
                ACTIVE CASE: {currentAnalysis.id}
              </span>
              <VerdictBadge verdict={currentAnalysis.verdict} />
              <Badge variant="plum">{currentAnalysis.riskLevel} Risk</Badge>
              <DemoDataBadge />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#F5F0FA]">
              {currentAnalysis.video.filename}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#A39AAA] font-mono">
              <span>Duration: {currentAnalysis.video.duration}</span>
              <span>•</span>
              <span>Resolution: {currentAnalysis.video.resolution}</span>
              <span>•</span>
              <span>Frames: {currentAnalysis.totalFrames}</span>
              <span>•</span>
              <span>SHA-256: {currentAnalysis.video.sha256Hash.substring(0, 16)}...</span>
            </div>
          </div>

          {/* Quick Case Switcher for demo */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-[#A39AAA]">Switch Evaluation Case:</div>
              <div className="text-xs text-[#D6B8E8] font-mono font-semibold">
                Current: {currentAnalysis.verdict}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setSampleCase('manipulated')}
                className={`flex-1 sm:flex-initial px-3 py-2 rounded-xl text-xs font-semibold border cursor-pointer transition-all ${
                  currentAnalysis.verdict === 'MANIPULATED'
                    ? 'bg-[#FF5370]/20 border-[#FF5370] text-[#FF5370]'
                    : 'bg-[#1E1B24] border-[#363042] text-[#A39AAA] hover:text-[#F5F0FA]'
                }`}
              >
                Manipulated
              </button>
              <button
                onClick={() => setSampleCase('authentic')}
                className={`flex-1 sm:flex-initial px-3 py-2 rounded-xl text-xs font-semibold border cursor-pointer transition-all ${
                  currentAnalysis.verdict === 'AUTHENTIC'
                    ? 'bg-[#2ED573]/20 border-[#2ED573] text-[#2ED573]'
                    : 'bg-[#1E1B24] border-[#363042] text-[#A39AAA] hover:text-[#F5F0FA]'
                }`}
              >
                Authentic
              </button>
              <button
                onClick={() => setSampleCase('inconclusive')}
                className={`flex-1 sm:flex-initial px-3 py-2 rounded-xl text-xs font-semibold border cursor-pointer transition-all ${
                  currentAnalysis.verdict === 'INCONCLUSIVE'
                    ? 'bg-[#FFA502]/20 border-[#FFA502] text-[#FFA502]'
                    : 'bg-[#1E1B24] border-[#363042] text-[#A39AAA] hover:text-[#F5F0FA]'
                }`}
              >
                Inconclusive
              </button>
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={<ArrowUpRight className="w-4 h-4" />}
              iconPosition="right"
              onClick={() => navigate('/results')}
            >
              Full Dossier
            </Button>
          </div>
        </div>

        {/* Quick Diagnostic Grid inside Active Scan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="space-y-2">
            <div className="text-xs text-[#A39AAA] font-semibold">Deepfake Probability Score</div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-extrabold font-mono ${
                currentAnalysis.verdict === 'MANIPULATED' 
                  ? 'text-[#FF5370]' 
                  : currentAnalysis.verdict === 'AUTHENTIC'
                  ? 'text-[#2ED573]'
                  : 'text-[#FFA502]'
              }`}>
                {currentAnalysis.overallScore}%
              </span>
              <span className="text-xs text-[#A39AAA]">
                ({currentAnalysis.authenticityScore}% Authentic)
              </span>
            </div>
            <ProgressBar
              value={currentAnalysis.overallScore}
              showPercentage={false}
              color={currentAnalysis.verdict === 'MANIPULATED' ? 'danger' : currentAnalysis.verdict === 'AUTHENTIC' ? 'safe' : 'warning'}
              size="sm"
            />
          </div>

          <div className="space-y-2">
            <div className="text-xs text-[#A39AAA] font-semibold">Flagged Forensic Frames</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-[#F5F0FA]">
                {currentAnalysis.flaggedFramesCount}
              </span>
              <span className="text-xs text-[#A39AAA]">
                of {currentAnalysis.totalFrames} frames ({Math.round((currentAnalysis.flaggedFramesCount / currentAnalysis.totalFrames) * 100)}%)
              </span>
            </div>
            <ProgressBar
              value={Math.round((currentAnalysis.flaggedFramesCount / currentAnalysis.totalFrames) * 100)}
              showPercentage={false}
              color={currentAnalysis.flaggedFramesCount > 50 ? 'danger' : 'safe'}
              size="sm"
            />
          </div>

          <div className="space-y-2">
            <div className="text-xs text-[#A39AAA] font-semibold">Ensemble Model Confidence</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-[#B58AFF]">
                {currentAnalysis.confidence}%
              </span>
              <span className="text-xs text-[#A39AAA]">Calibrated Softmax</span>
            </div>
            <ProgressBar
              value={currentAnalysis.confidence}
              showPercentage={false}
              color="primary"
              size="sm"
            />
          </div>
        </div>
      </Card>

      {/* Two-Column Middle Section: Temporal Anomaly Timeline & Monthly Ingestion Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left (7 cols): Temporal Risk Timeline Chart */}
        <div className="lg:col-span-7">
          <Card className="h-full">
            <CardHeader
              title="Temporal Frame Risk Distribution"
              subtitle="Deepfake probability progression across video timestamps"
              icon={<Activity className="w-5 h-5 text-[#B58AFF]" />}
              action={
                <Badge variant={currentAnalysis.verdict === 'MANIPULATED' ? 'manipulated' : currentAnalysis.verdict === 'AUTHENTIC' ? 'authentic' : 'inconclusive'} size="sm">
                  {currentAnalysis.verdict}
                </Badge>
              }
            />

            <div className="h-64 sm:h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentAnalysis.timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={currentAnalysis.verdict === 'MANIPULATED' ? "#FF5370" : currentAnalysis.verdict === 'AUTHENTIC' ? "#2ED573" : "#FFA502"} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={currentAnalysis.verdict === 'MANIPULATED' ? "#FF5370" : currentAnalysis.verdict === 'AUTHENTIC' ? "#2ED573" : "#FFA502"} stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#363042" vertical={false} />
                  <XAxis 
                    dataKey="timeFormatted" 
                    stroke="#A39AAA" 
                    tick={{ fill: '#A39AAA', fontSize: 11 }} 
                    axisLine={{ stroke: '#363042' }}
                  />
                  <YAxis 
                    stroke="#A39AAA" 
                    domain={[0, 100]} 
                    tick={{ fill: '#A39AAA', fontSize: 11 }} 
                    axisLine={{ stroke: '#363042' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#24212B',
                      borderColor: '#363042',
                      borderRadius: '12px',
                      color: '#F5F0FA',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: '#D6B8E8', fontWeight: 'bold' }}
                    formatter={(val: number) => [`${val}% Deepfake Probability`, 'Risk Score']}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke={currentAnalysis.verdict === 'MANIPULATED' ? "#FF5370" : currentAnalysis.verdict === 'AUTHENTIC' ? "#2ED573" : "#FFA502"}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#scoreGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#363042] text-xs text-[#A39AAA]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5370]" />
                <span>Threshold Anomaly &gt; 70%</span>
              </div>
              <button
                onClick={() => navigate('/evidence')}
                className="text-[#B58AFF] hover:text-[#D6B8E8] font-semibold flex items-center gap-1 cursor-pointer"
              >
                Inspect Flagged Frames ({currentAnalysis.flaggedFramesCount}) &rarr;
              </button>
            </div>
          </Card>
        </div>

        {/* Right (5 cols): Monthly Ingestion Volume BarChart */}
        <div className="lg:col-span-5">
          <Card className="h-full flex flex-col justify-between">
            <div>
              <CardHeader
                title="Historical Ingestion Trends"
                subtitle="Monthly video scan volumes and classification breakdown"
                icon={<BarChart2 className="w-5 h-5 text-[#B58AFF]" />}
              />

              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyVolumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#363042" vertical={false} />
                    <XAxis dataKey="month" stroke="#A39AAA" tick={{ fill: '#A39AAA', fontSize: 11 }} />
                    <YAxis stroke="#A39AAA" tick={{ fill: '#A39AAA', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#24212B',
                        borderColor: '#363042',
                        borderRadius: '12px',
                        color: '#F5F0FA',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="fake" name="Manipulated" fill="#FF5370" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="authentic" name="Authentic" fill="#2ED573" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="inconcl" name="Inconclusive" fill="#FFA502" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pt-4 border-t border-[#363042] flex justify-between text-xs text-[#A39AAA]">
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-[#FF5370]" /> Fake</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-[#2ED573]" /> Real</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-[#FFA502]" /> Inconclusive</div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Analyses with Filter Bar */}
      <Card>
        <CardHeader
          title="Recent Media Verification Log"
          subtitle="Audit history of previously analyzed video streams"
          icon={<Clock className="w-5 h-5 text-[#B58AFF]" />}
          action={
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-[#1E1B24] p-1 rounded-xl border border-[#363042] text-xs">
                {['ALL', 'MANIPULATED', 'AUTHENTIC', 'INCONCLUSIVE'].map((v) => (
                  <button
                    key={v}
                    onClick={() => setFilterVerdict(v)}
                    className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer transition-all ${
                      filterVerdict === v
                        ? 'bg-[#2A1B38] text-[#B58AFF] border border-[#B58AFF]/40'
                        : 'text-[#A39AAA] hover:text-[#F5F0FA]'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>

              <button
                onClick={() => navigate('/history')}
                className="text-xs text-[#B58AFF] hover:text-[#D6B8E8] font-semibold cursor-pointer hidden sm:block ml-2"
              >
                Full Archive &rarr;
              </button>
            </div>
          }
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#363042] text-[#A39AAA] uppercase font-semibold">
                <th className="py-3 px-4">Scan ID</th>
                <th className="py-3 px-4">Filename</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Frames</th>
                <th className="py-3 px-4">Deepfake Prob</th>
                <th className="py-3 px-4">Verdict</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#363042]/50 text-[#F5F0FA]">
              {filteredHistory.map((item) => (
                <tr key={item.id} className="hover:bg-[#2C2836] transition-colors">
                  <td className="py-3 px-4 font-mono text-[#B58AFF]">{item.id}</td>
                  <td className="py-3 px-4 font-semibold">{item.filename}</td>
                  <td className="py-3 px-4 text-[#A39AAA] font-mono">{item.uploadedAt}</td>
                  <td className="py-3 px-4 text-[#A39AAA] font-mono">{item.analyzedFrames}</td>
                  <td className="py-3 px-4 font-mono font-bold">
                    <span className={item.verdict === 'MANIPULATED' ? 'text-[#FF5370]' : item.verdict === 'AUTHENTIC' ? 'text-[#2ED573]' : 'text-[#FFA502]'}>
                      {item.deepfakeProbability}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <VerdictBadge verdict={item.verdict} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        loadAnalysisById(item.id);
                        navigate('/results');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#2A1B38] text-[#D6B8E8] hover:bg-[#3D2452] border border-[#B58AFF]/30 font-semibold cursor-pointer transition-all"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
