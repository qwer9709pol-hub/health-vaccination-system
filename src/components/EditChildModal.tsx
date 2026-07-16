import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Calendar } from 'lucide-react';
import { DelayedChild, STATUS_OPTIONS, STATUS_CONFIG, ChildStatus } from '../types';

interface EditChildModalProps {
  child: DelayedChild | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<DelayedChild>) => Promise<void>;
}

export default function EditChildModal({ child, isOpen, onClose, onSave }: EditChildModalProps) {
  const [status, setStatus] = useState<ChildStatus>('لم يتم التطعيم');
  const [notes, setNotes] = useState('');
  const [vaccinationDate, setVaccinationDate] = useState('');
  const [vaccinationPlace, setVaccinationPlace] = useState('');
  const [travelCountry, setTravelCountry] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [diseaseName, setDiseaseName] = useState('');
  const [transferDestination, setTransferDestination] = useState('');
  const [refusalReason, setRefusalReason] = useState('');
  const [deathDate, setDeathDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (child) {
      setStatus((child.status as ChildStatus) || 'لم يتم التطعيم');
      setNotes(child.follow_up_notes || '');
      setTransferDestination(child.transfer_destination || '');
      setDiseaseName(child.disease_name || '');
      setRefusalReason(child.refusal_reason || '');
      setDeathDate(child.death_date || '');
      setVaccinationDate(child.vaccination_date || new Date().toISOString().split('T')[0]);
      setVaccinationPlace(child.vaccination_place || '');
      setTravelCountry(child.travel_country || '');
      setTravelDate(child.travel_date || '');
    }
  }, [child]);

  const handleStatusChange = (newStatus: ChildStatus) => {
    setStatus(newStatus);
    if (newStatus === 'تم التطعيم فى وحدة بتاريخ' && !vaccinationDate) {
      setVaccinationDate(new Date().toISOString().split('T')[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!child) return;
    setLoading(true); setError('');

    if (status === 'تم التطعيم فى وحدة بتاريخ') {
      if (!vaccinationPlace.trim()) { setError('من فضلك أدخل مكان التطعيم'); setLoading(false); return; }
      if (!vaccinationDate) { setError('من فضلك أدخل تاريخ التطعيم'); setLoading(false); return; }
    }
    if ((status === 'مسافر' || status === 'مسافر موثق') && !travelCountry.trim()) { setError('من فضلك أدخل دولة السفر'); setLoading(false); return; }
    if (status === 'مريض' && !diseaseName.trim()) { setError('من فضلك أدخل اسم المرض'); setLoading(false); return; }

    try {
      const updates: Partial<DelayedChild> = { status, follow_up_notes: notes };
      if (status === 'تم التطعيم فى وحدة بتاريخ') {
        (updates as any).vaccination_place = vaccinationPlace;
        updates.vaccination_date = vaccinationDate;
      }
      if (status === 'مسافر' || status === 'مسافر موثق') {
        (updates as any).travel_country = travelCountry;
        (updates as any).travel_date = travelDate;
      }
      if (status === 'مريض') (updates as any).disease_name = diseaseName;
      if (status === 'تم التحويل الى اقرب وحدة') (updates as any).transfer_destination = transferDestination;
      if (status === 'رفض') (updates as any).refusal_reason = refusalReason;
      if (status === 'متوفى') (updates as any).death_date = deathDate;

      await onSave(child.id, updates);
      onClose();
    } catch (err) { setError('حدث خطأ أثناء الحفظ'); }
    finally { setLoading(false); }
  };

  if (!isOpen || !child) return null;
  const statusConfig = STATUS_CONFIG[status];

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transition-colors duration-300" dir="rtl">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-xl font-bold text-white">تعديل بيانات المتابعة</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors"><X className="w-6 h-6 text-white" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
              <AlertCircle className="w-5 h-5" /><span>{error}</span>
            </div>
          )}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-300"><span className="font-medium text-gray-700 dark:text-gray-200">اسم الطفل:</span> {child.child_name}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300"><span className="font-medium text-gray-700 dark:text-gray-200">رقم القيد:</span> {child.registration_number || '-'}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300"><span className="font-medium text-gray-700 dark:text-gray-200">رقم الهاتف:</span> {child.phone_number || '-'}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300"><span className="font-medium text-gray-700 dark:text-gray-200">التطعيم المتخلف:</span> {child.dose || 'غير محدد'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">الحالة</label>
            <select value={status} onChange={(e) => handleStatusChange(e.target.value as ChildStatus)}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none appearance-none cursor-pointer ${statusConfig.bgColor} ${statusConfig.color} border-transparent font-medium`}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">{STATUS_CONFIG[s].label}</option>
              ))}
            </select>
          </div>
          {status === 'تم التطعيم فى وحدة بتاريخ' && (
            <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 space-y-3">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-emerald-800 dark:text-emerald-300 mb-2"><Calendar className="w-4 h-4" />تاريخ التطعيم</label>
                <input type="date" value={vaccinationDate} onChange={(e) => setVaccinationDate(e.target.value)}
                  className="w-full px-4 py-3 border border-emerald-300 dark:border-emerald-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-emerald-800 dark:text-emerald-300 mb-2">مكان التطعيم</label>
                <input type="text" value={vaccinationPlace} onChange={(e) => setVaccinationPlace(e.target.value)}
                  className="w-full px-4 py-3 border border-emerald-300 dark:border-emerald-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 dark:text-white" placeholder="اسم الوحدة" />
              </div>
            </div>
          )}
          {(status === 'مسافر' || status === 'مسافر موثق') && (
            <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">دولة السفر</label>
                <input type="text" value={travelCountry} onChange={(e) => setTravelCountry(e.target.value)}
                  className="w-full px-4 py-3 border border-amber-300 dark:border-amber-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-300 mb-2"><Calendar className="w-4 h-4" />تاريخ السفر</label>
                <input type="date" value={travelDate} onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full px-4 py-3 border border-amber-300 dark:border-amber-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 dark:text-white" />
              </div>
            </div>
          )}
          {status === 'مريض' && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <label className="block text-sm font-medium text-red-800 dark:text-red-300 mb-2">اسم المرض</label>
              <input type="text" value={diseaseName} onChange={(e) => setDiseaseName(e.target.value)}
                className="w-full px-4 py-3 border border-red-300 dark:border-red-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 dark:text-white" placeholder="اكتب اسم المرض" />
            </div>
          )}
          {status === 'تم التحويل الى اقرب وحدة' && (
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <label className="block text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">اسم الوحدة المحول إليها</label>
              <input type="text" value={transferDestination} onChange={(e) => setTransferDestination(e.target.value)}
                className="w-full px-4 py-3 border border-blue-300 dark:border-blue-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 dark:text-white" placeholder="اسم الوحدة" />
            </div>
          )}
          {status === 'رفض' && (
            <div className="bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <label className="block text-sm font-medium text-orange-800 dark:text-orange-300 mb-2">سبب الرفض</label>
              <textarea value={refusalReason} onChange={(e) => setRefusalReason(e.target.value)} rows={3}
                className="w-full px-4 py-3 border border-orange-300 dark:border-orange-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 dark:text-white" placeholder="اكتب سبب الرفض..." />
            </div>
          )}
          {status === 'متوفى' && (
            <div className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">تاريخ الوفاة</label>
              <input type="date" value={deathDate} onChange={(e) => setDeathDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 dark:text-white" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">ملاحظات المتابعة</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none bg-white dark:bg-gray-700 dark:text-white" placeholder="أضف ملاحظات المتابعة هنا..." />
          </div>
          <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 pt-4 pb-2 flex gap-3">
            <button type="submit" disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 shadow-lg">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save className="w-5 h-5" /><span>حفظ التغييرات</span></>}
            </button>
            <button type="button" onClick={onClose}
              className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}
