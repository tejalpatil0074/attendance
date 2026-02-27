import React, { useState, useRef } from 'react';

// --- ICONS ---
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
);
const FileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
);
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
);
const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);
const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
);

// --- MAIN APPLICATION ---
export default function App() {
  // --- STATE ---
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [reportType, setReportType] = useState('daily'); // 'daily' | 'monthly'
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateSuccess, setGenerateSuccess] = useState(false);
  const [reportUrl, setReportUrl] = useState(null);
  const [reportFilename, setReportFilename] = useState('');
  const fileInputRef = useRef(null);

  // --- HANDLERS ---
  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    // Grab only the first file to ensure 1 file at a time
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileSelect = (e) => {
    // Grab only the first file
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (incomingFile) => {
    if (incomingFile && (incomingFile.name.endsWith('.csv') || incomingFile.name.endsWith('.xls') || incomingFile.name.endsWith('.xlsx'))) {
      setFile(incomingFile);
      setGenerateSuccess(false); // Reset download state when new file is uploaded
    } else if (incomingFile) {
      alert("Please upload a valid CSV or Excel file.");
    }
  };

  // --- API CALL & DOWNLOAD ---
  const handleGenerate = async () => {
    if (!file) {
      alert("Please upload a data file first.");
      return;
    }

    setIsGenerating(true);
    setGenerateSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('reportType', reportType);
      formData.append('targetDate', selectedDate);
      formData.append('targetMonth', selectedMonth);

      // IMPORTANT: Replace with your actual backend URL
      const response = await fetch('https://your-backend-api.com/generate-report', {
        method: 'POST',
        body: formData, 
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      // Generate the file URL for downloading
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setReportUrl(url);

      // Try to extract the filename from the backend response headers, fallback to a default
      let filename = `Attendance_Report_${reportType}.xlsx`;
      const disposition = response.headers.get('Content-Disposition');
      if (disposition && disposition.indexOf('attachment') !== -1) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
        if (matches != null && matches[1]) { 
          filename = matches[1].replace(/['"]/g, '');
        }
      }

      setReportFilename(filename);
      setGenerateSuccess(true); // Show success UI

    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to connect to the server or process the report. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-50 via-slate-50 to-white p-4 md:p-8 font-sans text-slate-800 selection:bg-sky-200 flex items-center justify-center">
      <div className="max-w-xl w-full mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="text-center mb-8">
          <img 
            src="/oneture-logo.jpg" 
            alt="Oneture Logo" 
            className="h-16 md:h-20 mx-auto mb-6 object-contain" 
            onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/300x80?text=ONETURE"; }} 
          />
          <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-sky-500 to-blue-900 bg-clip-text text-transparent pb-2">
            Attendance Insights
          </h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Upload timesheets and instantly download reports.</p>
        </div>

        <div className="space-y-6">
          
          {/* 1. File Upload Card */}
          <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/80 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-blue-100 text-blue-700 p-2 rounded-xl"><FileIcon /></div>
              <h2 className="text-lg font-bold text-slate-800">1. Data Source</h2>
            </div>
            
            <div 
              className={`relative overflow-hidden border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300
                ${isDragging ? 'border-blue-500 bg-blue-50/50 scale-[1.02]' : ''}
                ${file ? 'border-blue-400 bg-blue-50/30' : 'border-slate-300 bg-slate-50/50'}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
            >
              {/* Hidden file input restricted to single file */}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleFileSelect}
              />
              
              {file ? (
                <div className="flex flex-col items-center text-blue-800 animate-in zoom-in duration-300">
                  <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                    <FileIcon />
                  </div>
                  <span className="font-bold text-sm truncate w-full px-2 max-w-[200px]">{file.name}</span>
                  <span className="text-xs text-blue-600/80 mt-1 font-medium bg-blue-100/50 px-2 py-1 rounded-md">{(file.size / 1024).toFixed(1)} KB</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-slate-400">
                  <div className="bg-white p-3 rounded-full shadow-sm mb-3 text-slate-300">
                    <UploadIcon />
                  </div>
                  <span className="font-medium text-sm">No file selected</span>
                </div>
              )}
            </div>

            {/* Explicit Upload Button under the dropzone */}
            <div className="mt-5 flex justify-center">
              <button 
                onClick={() => fileInputRef.current.click()}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors border border-slate-200 flex items-center gap-2"
              >
                <UploadIcon />
                {file ? "Change File" : "Upload CSV"}
              </button>
            </div>
          </div>

          {/* 2. Report Configuration Card */}
          <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/80 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-sky-100 text-sky-600 p-2 rounded-xl"><CalendarIcon /></div>
              <h2 className="text-lg font-bold text-slate-800">2. Report Settings</h2>
            </div>
            
            {/* Type Selection */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Frequency</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => { setReportType('daily'); setGenerateSuccess(false); }}
                  className={`flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 transition-all duration-300 ${reportType === 'daily' ? 'border-transparent bg-gradient-to-br from-sky-500 to-blue-800 text-white shadow-lg shadow-blue-200 transform scale-[1.02]' : 'border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:bg-blue-50/30'}`}
                >
                  <CalendarIcon /> <span className="text-sm font-bold">Daily Report</span>
                </button>
                <button 
                  onClick={() => { setReportType('monthly'); setGenerateSuccess(false); }}
                  className={`flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 transition-all duration-300 ${reportType === 'monthly' ? 'border-transparent bg-gradient-to-br from-sky-500 to-blue-800 text-white shadow-lg shadow-blue-200 transform scale-[1.02]' : 'border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:bg-blue-50/30'}`}
                >
                  <CalendarIcon /> <span className="text-sm font-bold">Monthly Report</span>
                </button>
              </div>
            </div>

            {/* Dynamic Inputs */}
            <div className="pt-2">
              {reportType === 'daily' ? (
                <div className="group">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Target Date</label>
                  <input 
                    type="date" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-700 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={selectedDate}
                    onChange={(e) => { setSelectedDate(e.target.value); setGenerateSuccess(false); }}
                  />
                </div>
              ) : (
                <div className="group">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Target Month</label>
                  <input 
                    type="month" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-700 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={selectedMonth}
                    onChange={(e) => { setSelectedMonth(e.target.value); setGenerateSuccess(false); }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Button & Success State */}
          {!generateSuccess ? (
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !file}
              className={`w-full py-4 rounded-2xl font-bold text-white shadow-xl transition-all duration-300 flex justify-center items-center gap-2 overflow-hidden relative mt-4
                ${isGenerating || !file
                  ? 'bg-slate-300 text-slate-100 shadow-none cursor-not-allowed' 
                  : 'bg-gradient-to-r from-sky-500 to-blue-800 hover:from-sky-400 hover:to-blue-700 hover:shadow-blue-300 hover:-translate-y-0.5'}`}
            >
              {isGenerating && (
                <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_1.5s_infinite] -skew-x-12 translate-x-[-100%]" 
                      style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }}></div>
              )}
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Processing Document...
                </>
              ) : "Generate Report ✨"}
            </button>
          ) : (
            <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-700 shadow-sm">
                <CheckCircleIcon />
                <div>
                  <p className="font-bold text-sm">Successfully generated report!</p>
                  <p className="text-xs opacity-80 text-emerald-600">Your file is ready to download.</p>
                </div>
              </div>
              
              <a 
                href={reportUrl}
                download={reportFilename}
                className="w-full py-4 rounded-2xl font-bold text-white shadow-xl transition-all duration-300 flex justify-center items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 hover:shadow-emerald-200 hover:-translate-y-0.5"
              >
                <DownloadIcon /> Download Report
              </a>

              <button 
                onClick={() => setGenerateSuccess(false)}
                className="w-full py-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
              >
                Generate Another Report
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
