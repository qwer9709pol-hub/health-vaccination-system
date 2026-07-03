import { X } from 'lucide-react';
import { DelayedChild } from '../types';

interface ChildProfileModalProps {
  child: DelayedChild | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChildProfileModal({
  child,
  isOpen,
  onClose,
}: ChildProfileModalProps) {
  if (!isOpen || !child) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex justify-center items-center p-4">
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto transition-colors duration-300"
        dir="rtl"
      >
        <div className="flex items-center justify-between border-b dark:border-gray-700 p-5">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">بطاقة بيانات الطفل</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-5">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">👶 البيانات الأساسية</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-500 dark:text-gray-400">اسم الطفل</span>
                <p className="font-semibold text-gray-900 dark:text-white">{child.child_name}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">رقم القيد</span>
                <p className="font-semibold text-gray-900 dark:text-white">{child.registration_number || '-'}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">تاريخ الميلاد</span>
                <p className="font-semibold text-gray-900 dark:text-white">{child.birth_date || '-'}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">العنوان</span>
                <p className="font-semibold text-gray-900 dark:text-white">{child.address || '-'}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">رقم هاتف الطفل</span>
                <p className="font-semibold text-gray-900 dark:text-white">{child.phone_number || '-'}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">رقم هاتف المُبلغ</span>
                <p className="font-semibold text-gray-900 dark:text-white">{child.reporter_phone || '-'}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">التطعيم المتخلف</span>
                <p className="font-semibold text-gray-900 dark:text-white">{child.dose || '-'}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">الحالة الحالية</span>
                <p className="font-semibold text-gray-900 dark:text-white">{child.status}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-xl p-5">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">📋 تفاصيل الحالة</h3>

            {child.status === 'تم التطعيم فى وحدة بتاريخ' && (
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p><strong>مكان التطعيم:</strong> {child.vaccination_place || '-'}</p>
                <p><strong>تاريخ التطعيم:</strong> {child.vaccination_date || '-'}</p>
              </div>
            )}

            {(child.status === 'مسافر' || child.status === 'مسافر موثق') && (
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p><strong>دولة السفر:</strong> {child.travel_country || '-'}</p>
                <p><strong>تاريخ السفر:</strong> {child.travel_date || '-'}</p>
              </div>
            )}

            {child.status === 'مريض' && (
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p><strong>اسم المرض:</strong> {child.disease_name || '-'}</p>
              </div>
            )}

            {child.status === 'رفض' && (
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p><strong>سبب الرفض:</strong> {child.refusal_reason || '-'}</p>
              </div>
            )}

            {child.status === 'تم التحويل الى اقرب وحدة' && (
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p><strong>جهة التحويل:</strong> {child.transfer_destination || '-'}</p>
              </div>
            )}

            {child.status === 'متوفى' && (
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p><strong>تاريخ الوفاة:</strong> {child.death_date || '-'}</p>
              </div>
            )}

            {child.follow_up_notes && (
              <div className="mt-4 border-t dark:border-gray-600 pt-4">
                <p className="font-semibold text-gray-900 dark:text-white">ملاحظات المتابعة</p>
                <p className="text-gray-700 dark:text-gray-300 mt-2">{child.follow_up_notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
