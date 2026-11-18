import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { 
  Printer, 
  Download, 
  ShieldCheck, 
  Fingerprint, 
  FileCheck2, 
  CheckCircle2, 
  AlertTriangle,
  QrCode,
  ArrowLeft,
  Share2,
  Sparkles,
  FileDown
} from 'lucide-react';
import { useDetection } from '../context/DetectionContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge, VerdictBadge, DemoDataBadge } from '../components/common/Badge';

export const PdfReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentAnalysis } = useDetection();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  // Generate and download a real formatted PDF using jsPDF
  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Colors
      const primaryColor = [181, 138, 255]; // Lavender #B58AFF
      const darkBg = [23, 21, 28]; // Charcoal #17151C
      const textColor = [245, 240, 250];

      // Document Header
      doc.setFillColor(darkBg[0], darkBg[1], darkBg[2]);
      doc.rect(0, 0, 210, 42, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text('AEGISVISION AI — FORENSIC VERIFICATION AUDIT', 14, 18);

      doc.setFontSize(10);
      doc.setTextColor(181, 138, 255);
      doc.text('FINAL-YEAR B.TECH CAPSTONE THESIS EDITION (DEMO BENCHMARK DATA)', 14, 25);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(163, 154, 170);
      doc.text(`Issued: ${currentAnalysis.completedAt} UTC  |  Certificate ID: ${currentAnalysis.certificateId}`, 14, 32);

      // Media Specification
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(14, 48, 196, 48);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(20, 20, 20);
      doc.text('1. Ingested Media Specifications', 14, 56);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Filename: ${currentAnalysis.video.filename}`, 14, 64);
      doc.text(`Resolution: ${currentAnalysis.video.resolution} @ ${currentAnalysis.video.framerate} FPS`, 14, 71);
      doc.text(`Duration: ${currentAnalysis.video.duration}  |  Frames: ${currentAnalysis.totalFrames} frames  |  Filesize: ${currentAnalysis.video.filesize}`, 14, 78);
      
      doc.setFont('courier', 'normal');
      doc.setFontSize(8.5);
      doc.text(`SHA-256 Digest: ${currentAnalysis.video.sha256Hash}`, 14, 86);

      // Verdict Box
      doc.setFillColor(
        currentAnalysis.verdict === 'MANIPULATED' ? 254 : currentAnalysis.verdict === 'AUTHENTIC' ? 240 : 255,
        currentAnalysis.verdict === 'MANIPULATED' ? 242 : currentAnalysis.verdict === 'AUTHENTIC' ? 253 : 247,
        currentAnalysis.verdict === 'MANIPULATED' ? 242 : currentAnalysis.verdict === 'AUTHENTIC' ? 244 : 237
      );
      doc.roundedRect(14, 94, 182, 32, 3, 3, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(
        currentAnalysis.verdict === 'MANIPULATED' ? 200 : currentAnalysis.verdict === 'AUTHENTIC' ? 20 : 180,
        currentAnalysis.verdict === 'MANIPULATED' ? 20 : currentAnalysis.verdict === 'AUTHENTIC' ? 120 : 100,
        currentAnalysis.verdict === 'MANIPULATED' ? 40 : currentAnalysis.verdict === 'AUTHENTIC' ? 50 : 20
      );
      doc.text(`FINAL VERDICT: ${currentAnalysis.verdict} (${currentAnalysis.overallScore}% Deepfake Probability)`, 20, 104);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);
      const splitSummary = doc.splitTextToSize(currentAnalysis.executiveSummary, 170);
      doc.text(splitSummary, 20, 112);

      // Model Consensus Table
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(20, 20, 20);
      doc.text('2. Multi-Model Neural Consensus Table', 14, 138);

      let tableY = 146;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('Model Architecture', 14, tableY);
      doc.text('Focus Area', 74, tableY);
      doc.text('Weight', 145, tableY);
      doc.text('Score', 165, tableY);
      doc.text('Verdict', 182, tableY);

      doc.line(14, tableY + 2, 196, tableY + 2);
      tableY += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 30, 30);

      currentAnalysis.models.forEach((model) => {
        doc.text(model.name, 14, tableY);
        doc.text(model.focusArea.substring(0, 38) + '...', 74, tableY);
        doc.text(`${model.weight}%`, 145, tableY);
        doc.text(`${model.deepfakeProbability}%`, 165, tableY);
        doc.text(model.status, 182, tableY);
        tableY += 7;
      });

      // Keyframe Evidence Log
      tableY += 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(20, 20, 20);
      doc.text('3. Keyframe Forensic Anomaly Log', 14, tableY);
      tableY += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);

      currentAnalysis.evidenceFrames.slice(0, 4).forEach((frame) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`Frame #${frame.frameNumber} (${frame.timestamp}) — ${frame.anomalyType} [Score: ${frame.deepfakeProbability}%]`, 14, tableY);
        tableY += 4.5;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        doc.text(frame.description, 14, tableY);
        doc.setTextColor(30, 30, 30);
        tableY += 7;
      });

      // Digital Signature & Footnote
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 260, 196, 260);

      doc.setFont('courier', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 100, 100);
      doc.text(`Cryptographic Signature: ${currentAnalysis.signatureHash}`, 14, 266);
      doc.text('Certified by AegisVision AI media forensics framework • IEEE Capstone Standards', 14, 271);

      // Save the generated PDF
      doc.save(`AegisVision_Forensic_Report_${currentAnalysis.id}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const isDeepfake = currentAnalysis.verdict === 'MANIPULATED';
  const isAuthentic = currentAnalysis.verdict === 'AUTHENTIC';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Controls (Hidden on Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#363042] print:hidden">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/results')}
          >
            Back to Dossier
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#F5F0FA]">
                Cryptographic Forensic Certificate
              </h1>
              <DemoDataBadge />
            </div>
            <p className="text-xs text-[#A39AAA]">
              Ready for downloadable PDF export, thesis submission, or evidence filing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            icon={<Printer className="w-4 h-4" />}
            onClick={handlePrint}
          >
            Print
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={<FileDown className="w-4 h-4" />}
            isLoading={isGeneratingPdf}
            onClick={handleDownloadPdf}
          >
            Download PDF (.pdf)
          </Button>
        </div>
      </div>

      {/* Official Forensic Certificate Document (Formatted for Screen & A4 Print) */}
      <div 
        id="printable-report"
        className="bg-[#24212B] border border-[#363042] rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8 print:bg-white print:text-black print:p-6 print:border-none print:shadow-none print:rounded-none"
      >
        
        {/* Certificate Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-[#363042] print:border-gray-300">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#2A1B38] border border-[#B58AFF]/50 flex items-center justify-center text-[#B58AFF] shadow-lg print:border-gray-400 print:bg-gray-100 print:text-black">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-[#F5F0FA] print:text-black">
                  AEGIS<span className="text-[#B58AFF] print:text-purple-700">VISION</span> AI
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#3D2452] text-[#D6B8E8] print:bg-gray-200 print:text-gray-800">
                  OFFICIAL AUDIT
                </span>
              </div>
              <div className="text-xs text-[#A39AAA] print:text-gray-600 mt-0.5">
                Digital Media Forensic Verification System • Capstone Thesis Edition
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right font-mono text-xs text-[#A39AAA] print:text-gray-600 space-y-0.5">
            <div><strong className="text-[#F5F0FA] print:text-black">CERTIFICATE ID:</strong> {currentAnalysis.certificateId}</div>
            <div><strong className="text-[#F5F0FA] print:text-black">ISSUED:</strong> {currentAnalysis.completedAt} UTC</div>
            <div><strong className="text-[#F5F0FA] print:text-black">AUDIT ENSEMBLE:</strong> AegisCore v3.2 PyTorch</div>
          </div>
        </div>

        {/* Media Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-[#1E1B24] border border-[#363042] print:bg-gray-50 print:border-gray-300 text-xs">
          <div>
            <div className="text-[#A39AAA] print:text-gray-500 font-medium">Target Filename</div>
            <div className="font-mono font-bold text-[#F5F0FA] print:text-black mt-0.5 truncate" title={currentAnalysis.video.filename}>
              {currentAnalysis.video.filename}
            </div>
          </div>

          <div>
            <div className="text-[#A39AAA] print:text-gray-500 font-medium">Video Resolution</div>
            <div className="font-mono font-bold text-[#F5F0FA] print:text-black mt-0.5">
              {currentAnalysis.video.resolution} @ {currentAnalysis.video.framerate} FPS
            </div>
          </div>

          <div>
            <div className="text-[#A39AAA] print:text-gray-500 font-medium">Duration & Size</div>
            <div className="font-mono font-bold text-[#F5F0FA] print:text-black mt-0.5">
              {currentAnalysis.video.duration} • {currentAnalysis.video.filesize}
            </div>
          </div>

          <div>
            <div className="text-[#A39AAA] print:text-gray-500 font-medium">Frames Evaluated</div>
            <div className="font-mono font-bold text-[#F5F0FA] print:text-black mt-0.5">
              {currentAnalysis.totalFrames} frames
            </div>
          </div>
        </div>

        {/* Cryptographic SHA-256 Hash Digest */}
        <div className="p-4 rounded-xl bg-[#17151C] border border-[#363042] print:bg-white print:border-gray-300 font-mono text-xs">
          <div className="text-[#A39AAA] print:text-gray-500 font-semibold mb-1 flex items-center gap-1.5">
            <Fingerprint className="w-3.5 h-3.5 text-[#B58AFF] print:text-purple-700" />
            SHA-256 Cryptographic Media Digest (Immutable Ground-Truth Hash)
          </div>
          <div className="text-[#D6B8E8] print:text-gray-900 break-all select-all font-bold">
            {currentAnalysis.video.sha256Hash}
          </div>
        </div>

        {/* Forensic Verdict & Probability Box */}
        <div className={`p-6 rounded-2xl border ${
          isDeepfake 
            ? 'bg-[#FF5370]/10 border-[#FF5370]/50 print:bg-red-50 print:border-red-300' 
            : isAuthentic
            ? 'bg-[#2ED573]/10 border-[#2ED573]/50 print:bg-green-50 print:border-green-300'
            : 'bg-[#FFA502]/10 border-[#FFA502]/50 print:bg-yellow-50 print:border-yellow-300'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono uppercase font-bold text-[#A39AAA] print:text-gray-600">
                Final Ensemble Classification
              </div>
              <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 ${
                isDeepfake ? 'text-[#FF5370] print:text-red-700' : isAuthentic ? 'text-[#2ED573] print:text-green-700' : 'text-[#FFA502] print:text-yellow-700'
              }`}>
                {isDeepfake ? 'SYNTHETIC MANIPULATION DETECTED (DEEPFAKE)' : isAuthentic ? 'VERIFIED AUTHENTIC OPTICAL MEDIA' : 'INCONCLUSIVE COMPRESSED VIDEO'}
              </div>
            </div>

            <div className="text-left sm:text-right font-mono">
              <div className="text-xs text-[#A39AAA] print:text-gray-600">Deepfake Probability</div>
              <div className={`text-3xl font-black ${
                isDeepfake ? 'text-[#FF5370] print:text-red-700' : isAuthentic ? 'text-[#2ED573] print:text-green-700' : 'text-[#FFA502] print:text-yellow-700'
              }`}>
                {currentAnalysis.overallScore}%
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#F5F0FA] print:text-gray-800 leading-relaxed mt-4 pt-4 border-t border-[#363042]/50 print:border-gray-300">
            {currentAnalysis.executiveSummary}
          </p>
        </div>

        {/* Multi-Model Ensemble Findings Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#F5F0FA] print:text-black">
            Multi-Stream Neural Model Forensic Consensus
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-[#363042] print:border-gray-300 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-[#1E1B24] print:bg-gray-100 text-[#A39AAA] print:text-gray-700 border-b border-[#363042] print:border-gray-300 uppercase font-semibold">
                  <th className="py-2.5 px-3">Model Pipeline</th>
                  <th className="py-2.5 px-3">Architecture</th>
                  <th className="py-2.5 px-3">Analyzed Domain</th>
                  <th className="py-2.5 px-3">Weight</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3 text-right">Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#363042]/50 print:divide-gray-200 text-[#F5F0FA] print:text-black">
                {currentAnalysis.models.map((m) => (
                  <tr key={m.id} className="hover:bg-[#2C2836] print:hover:bg-transparent">
                    <td className="py-2.5 px-3 font-bold">{m.name}</td>
                    <td className="py-2.5 px-3 font-mono text-[#D6B8E8] print:text-gray-700">{m.architecture}</td>
                    <td className="py-2.5 px-3 text-[#A39AAA] print:text-gray-600">{m.focusArea}</td>
                    <td className="py-2.5 px-3 font-mono">{m.weight}%</td>
                    <td className="py-2.5 px-3 font-mono font-bold">
                      <span className={m.deepfakeProbability > 60 ? 'text-[#FF5370] print:text-red-700' : m.deepfakeProbability < 40 ? 'text-[#2ED573] print:text-green-700' : 'text-[#FFA502] print:text-yellow-700'}>
                        {m.deepfakeProbability}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-[11px]">
                      {m.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Flagged Keyframe Evidence Log */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#F5F0FA] print:text-black">
            Flagged Anomaly Keyframes (Temporal Evidence Log)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {currentAnalysis.evidenceFrames.slice(0, 4).map((frame) => (
              <div 
                key={frame.id} 
                className="p-3 rounded-xl bg-[#1E1B24] border border-[#363042] print:bg-gray-50 print:border-gray-300 space-y-1"
              >
                <div className="flex justify-between items-center font-mono">
                  <span className="font-bold text-[#F5F0FA] print:text-black">
                    Frame #{frame.frameNumber} ({frame.timestamp})
                  </span>
                  <span className={`font-bold ${
                    frame.deepfakeProbability > 60 ? 'text-[#FF5370] print:text-red-700' : frame.deepfakeProbability < 40 ? 'text-[#2ED573] print:text-green-700' : 'text-[#FFA502] print:text-yellow-700'
                  }`}>
                    {frame.deepfakeProbability}% Risk
                  </span>
                </div>
                <div className="text-[#D6B8E8] print:text-purple-800 font-semibold text-[11px]">
                  {frame.anomalyType}
                </div>
                <p className="text-[#A39AAA] print:text-gray-600 text-[11px] leading-snug">
                  {frame.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Certificate Verification Signature & Legal Notice */}
        <div className="pt-6 border-t border-[#363042] print:border-gray-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1 text-xs text-[#A39AAA] print:text-gray-600 max-w-md">
            <div className="font-bold text-[#F5F0FA] print:text-black uppercase tracking-wider">
              Verification Authority Signature
            </div>
            <div className="font-mono text-[11px] text-[#D6B8E8] print:text-gray-800 truncate">
              SIG: {currentAnalysis.signatureHash}
            </div>
            <p className="text-[10px] text-[#A39AAA] print:text-gray-500 leading-tight">
              Generated by AegisVision AI media forensic audit engine. Complies with IEEE AI forensics and final-year B.Tech capstone thesis standards.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-xl bg-[#17151C] border border-[#363042] print:border-gray-300 flex flex-col items-center justify-center text-[#B58AFF] print:text-black p-1">
              <QrCode className="w-8 h-8" />
              <span className="text-[8px] font-mono text-[#A39AAA] mt-0.5">VERIFIED</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
