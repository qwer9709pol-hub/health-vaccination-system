import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X, Download, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { STATUS_OPTIONS } from '../types';
import * as XLSX from 'xlsx';

interface UploadResult {
  totalRows: number;
  newRecords: number;
  updatedRecords: number;
  invalidRows: number;
  timeTakenMs: number;
  errors: string[];
}

export default function ExcelImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = (selectedFile: File) => {
    if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
      setFile(selectedFile);
      setResult(null);
    } else {
      setResult({
        totalRows: 0,
        newRecords: 0,
        updatedRecords: 0,
        invalidRows: 0,
        timeTakenMs: 0,
        errors: ['صيغة الملف غير صحيحة. يجب أن يكون ملف Excel (.xlsx أو .xls)'],
      });
    }
  };

  const processExcel = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const totalRows = jsonData.length;
      const startTime = performance.now();

      if (totalRows === 0) {
        setResult({
          totalRows: 0,
          newRecords: 0,
          updatedRecords: 0,
          invalidRows: 0,
          timeTakenMs: 0,
          errors: ['الملف فارغ'],
        });
        setUploading(false);
        return;
      }

      if (totalRows > 10000) {
        setResult({
          totalRows,
          newRecords: 0,
          updatedRecords: 0,
          invalidRows: 0,
          timeTakenMs: 0,
          errors: ['عدد الصفوف يتجاوز الحد الأقصى (10,000 صف)'],
        });
        setUploading(false);
        return;
      }

      // جلب الوحدات مع طباعة الأخطاء لتجنب مشاكل الـ RLS وحالة البيانات
      const { data: units, error: unitsError } = await supabase
        .from('units')
        .select('id, unit_code, unit_name');

      console.log("unitsError:", unitsError);
      console.log("units data:", units);

      // إنشاء خرائط للبحث بكود الوحدة وأيضاً باسم الوحدة لضمان الدقة الكاملة
      const unitByCode = new Map<number, { id: string; name: string; code: number | null }>();
      const unitByName = new Map<string, { id: string; name: string; code: number | null }>();

      (units || []).forEach((u) => {
        const cleanedName = String(u.unit_name || '').trim();
        const unitInfo = { id: u.id, name: cleanedName, code: u.unit_code ? Number(u.unit_code) : null };
        
        if (u.unit_code != null) {
          unitByCode.set(Number(u.unit_code), unitInfo);
        }
        if (cleanedName) {
          unitByName.set(cleanedName, unitInfo);
        }
      });

      const { data: existingChildren, error: childrenFetchError } = await supabase
        .from('delayed_children')
        .select('id, registration_number');

      if (childrenFetchError) {
        console.error("Error fetching existing children:", childrenFetchError);
      }

      const existingByReg = new Map<string, string>();
      (existingChildren || []).forEach((c) => {
        if (c.registration_number) existingByReg.set(String(c.registration_number).trim(), c.id);
      });

      const regCountInFile = new Map<string, number>();
      for (let i = 0; i < totalRows; i++) {
        const row = jsonData[i] as Record<string, any>;
        const reg = String(row['registration_number'] ?? row['رقم التسجيل'] ?? row['رقم القيد'] ?? row['القيد'] ?? '').trim();
        if (reg) regCountInFile.set(reg, (regCountInFile.get(reg) || 0) + 1);
      }

      let newRecords = 0;
      let updatedRecords = 0;
      let invalidRows = 0;
      const errors: string[] = [];

      const toInsert: any[] = [];
      const toUpdate: any[] = [];
// عدد الأطفال الجدد لكل وحدة
const unitNotifications = new Map<string, number>();
      const digitsOnly = (v: string) => v.replace(/\D/g, '');
      const nowIso = new Date().toISOString();

      for (let i = 0; i < totalRows; i++) {
        const row = jsonData[i] as Record<string, any>;
        const rowNum = i + 2;
        const rowErrors: string[] = [];

        try {
          const registrationNumber = String(row['registration_number'] ?? row['رقم التسجيل'] ?? row['رقم القيد'] ?? row['القيد'] ?? '').trim();
          const unitCodeRaw = row['كود الوحدة'] ?? row['كود الوحده'] ?? row['unit_code'] ?? '';
          const unitNameRaw = String(row['الوحدة'] ?? row['الوحده'] ?? row['اسم الوحدة'] ?? row['address'] ?? '').trim();
          
          const childName = String(
            row['اسم الطفل'] ?? row['child_name'] ?? row['اسم الطفل بالكامل'] ?? row['الاسم'] ?? ''
          ).trim();
          const birthDate = row['تاريخ الميلاد'] ?? row['birth_date'] ?? null;
          const reporterPhone = String(
            row['reporter_phone'] ?? row['هاتف المبلغ'] ?? row['رقم المبلغ'] ?? row['التليفون البلغ'] ?? ''
          ).trim();
          const phone = String(
            row['رقم الهاتف'] ?? row['phone_number'] ?? row['الهاتف'] ?? row['رقم التلفون'] ?? ''
          ).trim();
          const address = String(row['address'] ?? row['العنوان'] ?? '').trim();
          const dose = String(row['dose'] ?? row['الجرعة'] ?? row['التطعيم'] ?? '').trim();
          let status = String(row['الحالة'] ?? row['status'] ?? 'لم يتم التطعيم').trim();

          // Validate status against allowed values
          if (!STATUS_OPTIONS.includes(status as any)) {
            status = 'لم يتم التطعيم';
          }

          if (!registrationNumber) {
            rowErrors.push('رقم التسجيل أو القيد مفقود');
          } else if ((regCountInFile.get(registrationNumber) || 0) > 1) {
            rowErrors.push('رقم القيد مكرر داخل ملف الـ Excel نفسه');
          }
          if (!childName) {
            rowErrors.push('اسم الطفل مفقود');
          }

          let unitId: string | undefined;
          let unitCodeNum: number | null = null;
          
          // 🛠️ الحل الجذري والذكي للربط: البحث أولاً باسم الوحدة النصي لمنع أخطاء الأكواد العشوائية
          let matchedUnit = unitByName.get(unitNameRaw);

          // إذا لم يجد بالاسم، يحاول البحث بالكود كإجراء احتياطي بديل
          if (!matchedUnit && unitCodeRaw !== '' && unitCodeRaw != null) {
            unitCodeNum = Number(unitCodeRaw);
            if (!Number.isNaN(unitCodeNum)) {
              matchedUnit = unitByCode.get(unitCodeNum);
            }
          }

          if (matchedUnit) {
            unitId = matchedUnit.id; // الـ UUID الحقيقي السليم من قاعدة البيانات
            unitCodeNum = matchedUnit.code; // تحديث الكود ليتطابق مع قاعدة البيانات الحقيقية
          } else {
            if (!unitNameRaw && !unitCodeRaw) {
              rowErrors.push('بيانات الوحدة الصحية مفقودة بالكامل في هذا الصف');
            } else {
              rowErrors.push(`لم يتم العثور على وحدة صحية مطابقة للاسم "${unitNameRaw || 'فارغ'}" أو الكود "${unitCodeRaw || 'فارغ'}"`);
            }
          }

          // معالجة الصفر الساقط وتنسيق التليفونات تلقائياً لـ 11 رقم
          let phoneClean = phone ? digitsOnly(phone) : '';
          if (phoneClean) {
            if (phoneClean.length === 10) phoneClean = '0' + phoneClean;
            if (phoneClean.length !== 11) {
              rowErrors.push(`رقم الهاتف غير صحيح، يجب أن يتكون من 11 رقم (${phone})`);
            }
          }

          let repPhoneClean = reporterPhone ? digitsOnly(reporterPhone) : '';
          if (repPhoneClean) {
            if (repPhoneClean.length === 10) repPhoneClean = '0' + repPhoneClean;
            if (repPhoneClean.length !== 11) {
              rowErrors.push(`هاتف المبلغ غير صحيح، يجب أن يتكون من 11 رقم (${reporterPhone})`);
            }
          }

          let birthDateFormatted: string | null = null;
          if (birthDate) {
            birthDateFormatted = formatDate(birthDate);
            if (!birthDateFormatted) {
              rowErrors.push('تاريخ الميلاد المدخل غير صالح التنسيق');
            }
          }

          if (rowErrors.length > 0) {
            invalidRows++;
            errors.push(`الصف رقم ${rowNum}: ${rowErrors.join('، ')}`);
            continue;
          }

          const childData = {
            registration_number: registrationNumber,
            unit_id: unitId, // الـ UUID الصحيح المضمون والمستخرج بناءً على اسم الوحدة
            unit_code: unitCodeNum,
            child_name: childName,
            birth_date: birthDateFormatted,
            reporter_phone: repPhoneClean || null,
            phone_number: phoneClean || null,
            address: address || unitNameRaw || null, 
            dose: dose || null,
            status: status || 'لم يتم التطعيم',
            updated_at: nowIso,
          };

          const existingId = existingByReg.get(registrationNumber);
          if (existingId) {
toInsert.push({ ...childData, created_at: nowIso });

newRecords++;

if (unitId) {
  unitNotifications.set(
    unitId,
    (unitNotifications.get(unitId) || 0) + 1
  );
}
          } else {
            toInsert.push({ ...childData, created_at: nowIso });
            newRecords++;
          }
        } catch (err) {
          invalidRows++;
          errors.push(`الصف رقم ${rowNum}: خطأ أثناء تحليل السطر داخلياً`);
        }
      }

      if (toInsert.length > 0) {
        const { error } = await supabase.from('delayed_children').insert(toInsert);
        if (error) {
          console.error("Supabase Insertion Error:", error);
          errors.push(`خطأ في إضافة السجلات الجديدة: ${error.message}`);
        }
      }

      if (toUpdate.length > 0) {
        const { error } = await supabase
          .from('delayed_children')
          .upsert(toUpdate, { onConflict: 'id' });
        if (error) {
          console.error("Supabase Update Error:", error);
          errors.push(`خطأ في تحديث السجلات الحالية: ${error.message}`);
        }
      }

      const timeTakenMs = Math.round(performance.now() - startTime);
      setResult({
        totalRows,
        newRecords,
        updatedRecords,
        invalidRows,
        timeTakenMs,
        errors,
      });
    } catch (error) {
      setResult({
        totalRows: 0,
        newRecords: 0,
        updatedRecords: 0,
        invalidRows: 0,
        timeTakenMs: 0,
        errors: ['حدث خطأ كلي أثناء معالجة وقراءة الملف المرفوع.'],
      });
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateValue: any): string | null => {
    if (!dateValue) return null;
    let date: Date | null = null;
    if (typeof dateValue === 'number') {
      date = new Date((dateValue - 25569) * 86400 * 1000);
    } else if (typeof dateValue === 'string') {
      const parsed = new Date(dateValue.trim().replace(/-/g, '/'));
      if (!isNaN(parsed.getTime())) date = parsed;
    } else if (dateValue instanceof Date) {
      date = dateValue;
    }
    if (!date || isNaN(date.getTime())) return null;
    return date.toISOString().split('T')[0];
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        'كود الوحدة': 1,
        'الوحدة': 'ميت غمر',
        'رقم القيد': '101',
        'اسم الطفل': 'محمد أحمد محمد',
        'تاريخ الميلاد': '2024-01-15',
        'رقم الهاتف': '01012345678',
        'التليفون البلغ': '01211111111',
        'العنوان': 'الدقهلية - ميت غمر',
        'الجرعة': 'الجرعة الأولى',
        'الحالة': 'لم يتم التطعيم',
      },
    ];

    // Create a separate sheet with allowed statuses
    const statusData = STATUS_OPTIONS.map((s) => ({ 'الحالات المسموحة': s }));

    const ws = XLSX.utils.json_to_sheet(templateData);
    const statusWs = XLSX.utils.json_to_sheet(statusData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'القالب');
    XLSX.utils.book_append_sheet(wb, statusWs, 'الحالات');
    XLSX.writeFile(wb, 'قالب_رفع_البيانات.xlsx');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">رفع ملف Excel</h1>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Download className="w-5 h-5" />
          تحميل القالب
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragActive
              ? 'border-emerald-500 bg-emerald-50'
              : file
              ? 'border-emerald-300 bg-emerald-50'
              : 'border-gray-300 hover:border-emerald-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {file ? (
            <div className="flex items-center justify-center gap-4">
              <FileSpreadsheet className="w-12 h-12 text-emerald-600" />
              <div className="text-right">
                <p className="font-semibold text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} كيلوبايت</p>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  setResult(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">اسحب الملف هنا أو اضغط للاختيار</p>
              <p className="text-sm text-gray-400">يدعم ملفات .xlsx و .xls (حتى 10,000 صف)</p>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-block mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg cursor-pointer hover:bg-emerald-700 transition-colors"
              >
                اختر ملف
              </label>
            </>
          )}
        </div>

        {file && (
          <button
            onClick={processExcel}
            disabled={uploading}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>جاري معالجة البيانات وفحص الـ UUID...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>رفع ومعالجة الملف</span>
              </>
            )}
          </button>
        )}
      </div>

      {result && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">نتيجة الرفع</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <FileSpreadsheet className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-700">{result.totalRows}</p>
              <p className="text-sm text-gray-600">إجمالي الصفوف</p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4 text-center">
              <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-emerald-700">{result.newRecords}</p>
              <p className="text-sm text-gray-600">سجلات جديدة</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <FileSpreadsheet className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-700">{result.updatedRecords}</p>
              <p className="text-sm text-gray-600">تم تحديثها</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-700">{result.invalidRows}</p>
              <p className="text-sm text-red-600">صفوف غير صالحة</p>
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center flex items-center justify-center gap-4">
            <Clock className="w-6 h-6 text-purple-600" />
            <p className="text-sm text-purple-600 font-medium">الوقت المستغرق: {(result.timeTakenMs / 1000).toFixed(2)} ثانية</p>
          </div>

          {result.errors.length > 0 && (
            <div className="bg-red-50 rounded-lg p-4 mt-4">
              <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                الأخطاء المرصودة أثناء الرفع ({result.errors.length})
              </h3>
              <ul className="space-y-1 text-sm text-red-700 max-h-40 overflow-y-auto">
                {result.errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}