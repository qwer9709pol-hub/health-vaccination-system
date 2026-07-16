import { useState, useRef } from 'react';
import { FileSpreadsheet, Upload, AlertCircle, CheckCircle, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabase';
import { fetchUnits } from '../api/data';

export default function ExcelImportPage() {
  const [fileName, setFileName] = useState('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: number; errors: number; errorMessages: string[] } | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError('');
    setResult(null);
  };

  const handleImport = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      setError('من فضلك اختر ملف أولاً');
      return;
    }

    setImporting(true);
    setError('');
    setResult(null);

    try {
      const file = fileInputRef.current.files[0];
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json<any>(sheet);

      if (rows.length === 0) {
        setError('الملف فارغ');
        setImporting(false);
        return;
      }

      const units = await fetchUnits();
      const unitMap = new Map(units.map((u) => [u.unit_name, u.id]));

      let success = 0;
      let errors = 0;
      const errorMessages: string[] = [];

      for (const row of rows) {
        try {
          const unitName = row['الوحدة'] || row['unit'] || row['Unit'] || '';
          const unitId = unitMap.get(unitName);

          if (!unitId) {
            errors++;
            errorMessages.push(`الوحدة "${unitName}" غير موجودة`);
            continue;
          }

          const childData = {
            unit_id: unitId,
            child_name: row['اسم الطفل'] || row['child_name'] || '',
            mother_name: row['اسم الأم'] || row['mother_name'] || null,
            birth_date: row['تاريخ الميلاد'] || row['birth_date'] || null,
            age: row['العمر'] ? parseInt(row['العمر']) : null,
            phone_number: row['رقم هاتف الطفل'] || row['phone_number'] || null,
            reporter_phone: row['رقم هاتف المُبلغ'] || row['reporter_phone'] || null,
            address: row['العنوان'] || row['address'] || null,
            dose: row['التطعيم المتخلف'] || row['dose'] || null,
            last_vaccine: row['آخر تطعيم'] || row['last_vaccine'] || null,
            registration_number: row['رقم القيد'] || row['registration_number'] || null,
            status: row['الحالة'] || row['status'] || 'لم يتم التطعيم',
            follow_up_notes: row['ملاحظات المتابعة'] || row['follow_up_notes'] || null,
          };

          const { error: insertError } = await supabase
            .from('delayed_children')
            .insert(childData);

          if (insertError) {
            errors++;
            errorMessages.push(`خطأ في صف "${childData.child_name}": ${insertError.message}`);
          } else {
            success++;
          }
        } catch (err: any) {
          errors++;
          errorMessages.push(`خطأ: ${err.message}`);
        }
      }

      setResult({ success, errors, errorMessages });
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الاستيراد');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">رفع ملف Excel</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <FileSpreadsheet className="w-8 h-8 text-emerald-600" />
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">استيراد بيانات الأطفال</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">قم برفع ملف Excel يحتوي على بيانات الأطفال المتخلفين عن التطعيم</p>
          </div>
        </div>

        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-3 mx-auto"
          >
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-emerald-600" />
            </div>
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              {fileName || 'اختر ملف Excel'}
            </span>
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg">
              <CheckCircle className="w-5 h-5" />
              <span>تم استيراد {result.success} طفل بنجاح</span>
            </div>
            {result.errors > 0 && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <X className="w-5 h-5" />
                  <span>{result.errors} خطأ</span>
                </div>
                <ul className="text-sm space-y-1 mr-7">
                  {result.errorMessages.slice(0, 10).map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleImport}
          disabled={!fileName || importing}
          className="mt-6 w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {importing ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <><Upload className="w-5 h-5" /><span>استيراد</span></>
          )}
        </button>
      </div>
    </div>
  );
}
