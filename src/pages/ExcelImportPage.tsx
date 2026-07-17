import { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, CheckCircle, XCircle, Loader2, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabase';
import { fetchUnits } from '../api/data';

export default function ExcelImportPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: number; errors: string[] } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setLoading(true);
    setResult(null);

    try {
      const units = await fetchUnits();
      const unitMap = new Map(units.map((u) => [u.unit_name, u.id]));

      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

      let success = 0;
      const errors: string[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const unitName = row['الوحدة'] || row['unit'] || row['Unit'] || '';
        const unitId = unitMap.get(unitName);
        if (!unitId) { errors.push(`صف ${i + 2}: الوحدة "${unitName}" غير موجودة`); continue; }

        const childData: Record<string, unknown> = {
          unit_id: unitId,
          child_name: row['اسم الطفل'] || row['child_name'] || '',
          mother_name: row['اسم الأم'] || row['mother_name'] || null,
          birth_date: row['تاريخ الميلاد'] || row['birth_date'] || null,
          age: row['العمر'] || null,
          phone_number: row['رقم هاتف الطفل'] || row['phone_number'] || null,
          reporter_phone: row['رقم هاتف المُبلغ'] || row['reporter_phone'] || null,
          address: row['العنوان'] || row['address'] || null,
          dose: row['التطعيم المتخلف'] || row['dose'] || null,
          delayed_vaccine: row['التطعيم المتخلف'] || null,
          last_vaccine: row['آخر تطعيم'] || row['last_vaccine'] || null,
          registration_number: row['رقم القيد'] || row['registration_number'] || null,
          status: row['الحالة'] || row['status'] || 'لم يتم التطعيم',
          follow_up_notes: row['ملاحظات'] || row['notes'] || null,
        };

        const { error } = await supabase.from('delayed_children').insert([childData]);
        if (error) errors.push(`صف ${i + 2}: ${error.message}`);
        else success++;
      }

      setResult({ success, errors });
    } catch (error: any) {
      setResult({ success: 0, errors: [error.message || 'حدث خطأ أثناء قراءة الملف'] });
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) handleFile(file);
  };

  const downloadTemplate = () => {
    const template = [{
      'الوحدة': 'اسم الوحدة',
      'اسم الطفل': 'اسم الطفل',
      'اسم الأم': 'اسم الأم',
      'رقم القيد': '12345',
      'تاريخ الميلاد': '2023-01-01',
      'العمر': '2',
      'العنوان': 'العنوان',
      'رقم هاتف الطفل': '01000000000',
      'رقم هاتف المُبلغ': '01000000000',
      'التطعيم المتخلف': 'الجرعة الأولى',
      'آخر تطعيم': 'BCG',
      'الحالة': 'لم يتم التطعيم',
      'ملاحظات': '',
    }];
    const ws = XLSX.utils.json_to_sheet(template);
    ws['!cols'] = Array.from({ length: 13 }, () => ({ wch: 18 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'قالب الاستيراد');
    XLSX.writeFile(wb, 'قالب_استيراد_الأطفال.xlsx');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">رفع ملف Excel</h1>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${dragOver ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-emerald-400'}`}
      >
        <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
            <p className="text-gray-600 dark:text-gray-400">جاري المعالجة...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <UploadCloud className="w-12 h-12 text-emerald-600" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">اسحب ملف Excel هنا أو اضغط للاختيار</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">يدعم صيغ .xlsx و .xls</p>
          </div>
        )}
      </div>

      <button onClick={downloadTemplate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
        <Download className="w-5 h-5" />تحميل قالب فارغ
      </button>

      {result && (
        <div className="space-y-4">
          <div className={`p-4 rounded-xl ${result.success > 0 ? 'bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800'}`}>
            <div className="flex items-center gap-2">
              {result.success > 0 ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
              <span className="font-medium text-gray-900 dark:text-white">تم استيراد {result.success} طفل بنجاح</span>
            </div>
          </div>
          {result.errors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <h3 className="font-semibold text-red-800 dark:text-red-300 mb-2 flex items-center gap-2"><XCircle className="w-5 h-5" />أخطاء ({result.errors.length})</h3>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {result.errors.map((err, i) => (<p key={i} className="text-sm text-red-700 dark:text-red-400">{err}</p>))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
