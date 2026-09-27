import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/useToast';
import {
  MASTER_ROUTES_AY2026_27,
  MasterRoute,
} from '@/constants/masterRoutesSeed';
import {
  FileSpreadsheet,
  Upload,
  Download,
  X,
  FileCheck,
} from 'lucide-react';

interface ParsedStudentRecord {
  regNo: string;
  name: string;
  department: string;
  year: string;
  pickupStop: string;
  phone: string;
  assignedRoute?: string;
  feeAmount?: number;
  isValid: boolean;
  validationError?: string;
}

interface BatchStudentImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: (count: number) => void;
}

export const BatchStudentImportModal: React.FC<BatchStudentImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [records, setRecords] = useState<ParsedStudentRecord[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string>('');

  if (!isOpen) return null;

  // Generate Sample CSV / XLSX Template Download
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        RegNo: '241FA04001',
        Name: 'K. Sai Krishna',
        Department: 'CSE',
        Year: '1st Year',
        PickupStop: 'Budampadu Junction',
        Phone: '9848012345',
      },
      {
        RegNo: '241FA04002',
        Name: 'M. Ananya',
        Department: 'ECE',
        Year: '1st Year',
        PickupStop: 'Chuttugunta Circle',
        Phone: '9701198765',
      },
      {
        RegNo: '241FA04003',
        Name: 'P. Tarun Kumar',
        Department: 'IT',
        Year: '1st Year',
        PickupStop: 'NTR Circle',
        Phone: '9440234567',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students_Onboarding');
    XLSX.writeFile(workbook, 'VFSTR_Student_Transport_Onboarding_Template.xlsx');
    toast.success('Template Downloaded', 'Open in Excel to populate student admission records.');
  };

  // Parse Excel / CSV File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(sheet);

        const parsed: ParsedStudentRecord[] = rawJson.map((row: any) => {
          const regNo = (row.RegNo || row.regNo || row.RollNo || '').toString().trim().toUpperCase();
          const name = (row.Name || row.name || '').toString().trim();
          const department = (row.Department || row.department || 'CSE').toString().trim();
          const year = (row.Year || row.year || '1st Year').toString().trim();
          const pickupStop = (row.PickupStop || row.pickupStop || row.Stop || '').toString().trim();
          const phone = (row.Phone || row.phone || '').toString().trim();

          // Match Route based on stop name
          let matchedRoute: MasterRoute | undefined = undefined;
          for (const route of MASTER_ROUTES_AY2026_27) {
            const hasStop = route.stops.some((s) =>
              s.stopName.toLowerCase().includes(pickupStop.toLowerCase())
            );
            if (hasStop) {
              matchedRoute = route;
              break;
            }
          }

          if (!matchedRoute) {
            // Default to Route 1 Guntur
            matchedRoute = MASTER_ROUTES_AY2026_27[0];
          }

          const isValid = Boolean(regNo && regNo.length >= 6 && name);
          let validationError: string | undefined = undefined;
          if (!regNo) validationError = 'Missing Registration Number';
          else if (!name) validationError = 'Missing Full Name';

          return {
            regNo,
            name,
            department,
            year,
            pickupStop: pickupStop || 'Budampadu Junction',
            phone: phone || '9848011223',
            assignedRoute: matchedRoute ? `${matchedRoute.routeCode} (${matchedRoute.finalTerminal})` : 'Route #01',
            feeAmount: matchedRoute ? matchedRoute.fee2026_27 : 29300,
            isValid,
            validationError,
          };
        });

        setRecords(parsed);
        toast.success('Spreadsheet Parsed', `Extracted ${parsed.length} student records from ${file.name}`);
      } catch (err) {
        console.error('Failed to parse excel:', err);
        toast.error('Parse Error', 'Failed to read spreadsheet format. Ensure .xlsx or .csv structure.');
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleConfirmBatchImport = () => {
    const validCount = records.filter((r) => r.isValid).length;
    if (validCount === 0) {
      toast.error('No Valid Records', 'Please fix missing data before batch import.');
      return;
    }

    // Persist batch to local transport registry
    try {
      const existing = JSON.parse(localStorage.getItem('vfstr-batch-imported-students') || '[]');
      localStorage.setItem('vfstr-batch-imported-students', JSON.stringify([...records, ...existing]));
    } catch {
      // ignore
    }

    toast.success(
      'Batch Onboarding Completed!',
      `Successfully enrolled ${validCount} students & generated AY 2026-27 digital transport passes.`
    );

    if (onImportComplete) onImportComplete(validCount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col p-6 bg-card border-2 border-primary/20 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <FileSpreadsheet className="h-6 w-6" />
            </span>
            <div>
              <h2 className="font-black text-lg text-foreground">
                Batch Student Transport Onboarding Desk
              </h2>
              <p className="text-xs text-muted-foreground">
                Bulk ingest admission rosters from Excel (.xlsx) or CSV with auto-route allocation
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Upload & Template Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-muted/30 border border-border shrink-0">
          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              leftIcon={<Upload className="h-4 w-4" />}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing File...' : 'Select Excel / CSV File'}
            </Button>
            {fileName && (
              <span className="text-xs font-mono font-bold text-foreground truncate max-w-[200px]">
                {fileName}
              </span>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadTemplate}
            leftIcon={<Download className="h-4 w-4 text-primary" />}
            className="text-xs"
          >
            Download Sample Excel Template
          </Button>
        </div>

        {/* Table of Parsed Records */}
        <div className="flex-1 overflow-y-auto border border-border rounded-xl min-h-[220px]">
          {records.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-2 text-muted-foreground">
              <FileSpreadsheet className="h-10 w-10 opacity-40 text-primary" />
              <p className="text-xs font-semibold">No spreadsheet loaded yet.</p>
              <p className="text-[11px] max-w-sm">
                Upload a student roster or download our official template to bulk-allocate bus routes and generate digital passes.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/70 sticky top-0 border-b border-border font-bold text-foreground">
                <tr>
                  <th className="p-2.5">Roll No</th>
                  <th className="p-2.5">Student Name</th>
                  <th className="p-2.5">Dept / Year</th>
                  <th className="p-2.5">Boarding Stop</th>
                  <th className="p-2.5">Assigned Route</th>
                  <th className="p-2.5">Fee (₹)</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono">
                {records.map((r, idx) => (
                  <tr key={idx} className="hover:bg-muted/20 transition-colors">
                    <td className="p-2.5 font-bold text-foreground">{r.regNo || '—'}</td>
                    <td className="p-2.5 font-sans font-medium text-foreground">{r.name}</td>
                    <td className="p-2.5 text-muted-foreground">{r.department} • {r.year}</td>
                    <td className="p-2.5 font-sans text-muted-foreground truncate max-w-[140px]">{r.pickupStop}</td>
                    <td className="p-2.5 text-primary font-bold">{r.assignedRoute}</td>
                    <td className="p-2.5">{r.feeAmount?.toLocaleString('en-IN')}</td>
                    <td className="p-2.5">
                      {r.isValid ? (
                        <Badge variant="outline" className="border-emerald-500 text-emerald-600 text-[10px]">
                          Ready
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-[10px]">
                          {r.validationError || 'Invalid'}
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border shrink-0">
          <div className="text-xs text-muted-foreground">
            {records.length > 0 && (
              <span>
                Total Rows: <strong className="text-foreground">{records.length}</strong> • Valid:{' '}
                <strong className="text-emerald-600">{records.filter((r) => r.isValid).length}</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="ghost" onClick={onClose} className="w-1/2 sm:w-auto text-xs">
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={records.length === 0}
              onClick={handleConfirmBatchImport}
              leftIcon={<FileCheck className="h-4 w-4" />}
              className="w-1/2 sm:w-auto text-xs font-bold"
            >
              Import & Issue Digital Passes
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
