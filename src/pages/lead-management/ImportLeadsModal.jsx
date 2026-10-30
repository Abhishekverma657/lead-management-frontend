import React, { useState } from 'react';
import { UploadCloud, X, Download, AlertCircle, FileSpreadsheet, CheckCircle2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { importLeads } from '../../api/leadApi';
import * as xlsx from 'xlsx';

export default function ImportLeadsModal({ isOpen, onClose, onImportSuccess }) {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            setFile(droppedFile);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDownloadSample = () => {
        const sampleData = [
            {
                "First Name": "Rahul",
                "Last Name": "Kumar",
                "Mobile Number": "9876543210",
                "Email": "rahul.kumar@gmail.com",
                "Course": "IIT-JEE",
                "Class": "11th",
                "Parent Name": "Ramesh Kumar",
                "Parent Mobile": "9876543211",
                "City": "Lucknow",
                "Address": "Hazratganj",
                "Source": "Walk-in",
                "Status": "New",
                "Stage": "Discovery"
            },
            {
                "First Name": "Priya",
                "Last Name": "Sharma",
                "Mobile Number": "9123456780",
                "Email": "priya.sharma@gmail.com",
                "Course": "NEET",
                "Class": "12th",
                "Parent Name": "Sunita Sharma",
                "Parent Mobile": "9123456789",
                "City": "Kanpur",
                "Address": "Civil Lines",
                "Source": "Google Form",
                "Status": "New",
                "Stage": "Discovery"
            }
        ];

        const ws = xlsx.utils.json_to_sheet(sampleData);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, "Sample Leads");
        xlsx.writeFile(wb, "LeadConnect_Sample_Leads_Template.xlsx");
        toast.success("Sample template downloaded!");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            toast.error("Please select a file to upload");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await importLeads(formData);
            if (res.success) {
                toast.success(res.message || "Leads imported successfully!", { duration: 5000 });
                onImportSuccess();
                onClose();
                setFile(null);
            } else {
                toast.error(res.message || "Failed to import leads");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to upload file");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            {/* Modal Dialog */}
            <div 
                className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl ring-1 ring-black/5 animate-in zoom-in-95 slide-in-from-bottom-2 duration-200 overflow-hidden flex flex-col max-h-[92vh]"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4.5 border-b border-gray-100 bg-gradient-to-r from-orange-50/60 via-white to-orange-50/20 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
                            <FileSpreadsheet size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Import Leads from Excel</h2>
                            <p className="text-xs text-gray-500">Bulk upload student records via .XLSX / .CSV</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-700 rounded-xl transition-all border border-transparent hover:border-gray-200 cursor-pointer"
                        disabled={loading}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-4.5 flex-1 custom-scrollbar">
                    
                    {/* Instructions Card */}
                    <div className="bg-orange-50/70 border border-orange-200/70 rounded-2xl p-4 flex gap-3 text-xs text-orange-900">
                        <AlertCircle className="text-[#FF5B22] shrink-0 mt-0.5" size={16} />
                        <div className="space-y-1">
                            <p className="font-bold text-gray-900">Important Excel Requirements:</p>
                            <ul className="list-disc pl-3.5 space-y-0.5 text-gray-600 text-[11px]">
                                <li>Required columns: <strong>First Name</strong> and <strong>Mobile Number</strong>.</li>
                                <li>System auto-formats numbers to <strong>LC-100X</strong> sequence.</li>
                                <li>Supports .xlsx, .xls, and .csv formats.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Download Sample Button */}
                    <button 
                        type="button" 
                        onClick={handleDownloadSample}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                    >
                        <Download size={14} className="text-[#FF5B22]" />
                        Download Clean Excel Sample Template
                    </button>

                    {/* File Dropzone */}
                    <div 
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                            file 
                                ? 'border-emerald-400 bg-emerald-50/40' 
                                : isDragOver
                                    ? 'border-[#FF5B22] bg-orange-50/50 scale-[1.01]'
                                    : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/20'
                        }`}
                    >
                        {file ? (
                            <div className="flex flex-col items-center justify-center py-2">
                                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-2 shadow-xs">
                                    <CheckCircle2 size={24} />
                                </div>
                                <p className="text-xs font-bold text-gray-900 truncate max-w-xs">{file.name}</p>
                                <p className="text-[11px] text-gray-400 mt-0.5">{(file.size / 1024).toFixed(1)} KB • Ready to parse</p>
                                <button 
                                    onClick={() => setFile(null)} 
                                    className="mt-3 text-xs text-red-500 hover:text-red-700 font-semibold hover:underline cursor-pointer"
                                >
                                    Choose different file
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-3">
                                <div className="w-12 h-12 bg-orange-100 text-[#FF5B22] rounded-2xl flex items-center justify-center mb-3 shadow-xs">
                                    <UploadCloud size={24} />
                                </div>
                                <p className="text-xs font-bold text-gray-800">Drag & drop your Excel file here</p>
                                <p className="text-[11px] text-gray-400 mt-0.5 mb-3">or browse from your computer</p>
                                
                                <input 
                                    type="file" 
                                    accept=".xlsx, .xls, .csv" 
                                    className="hidden" 
                                    id="excel-file-upload" 
                                    onChange={handleFileChange}
                                />
                                <label 
                                    htmlFor="excel-file-upload" 
                                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-2xs hover:border-gray-300 cursor-pointer transition-all"
                                >
                                    Browse Excel File
                                </label>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sticky Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/90 backdrop-blur-xs flex justify-end gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!file || loading}
                        className="px-6 py-2.5 bg-gradient-to-r from-[#FF5B22] to-amber-600 hover:from-[#EA580C] hover:to-amber-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-orange-500/20 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 cursor-pointer"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Parsing & Importing...
                            </>
                        ) : (
                            <>
                                <Sparkles size={15} />
                                Start Import
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
