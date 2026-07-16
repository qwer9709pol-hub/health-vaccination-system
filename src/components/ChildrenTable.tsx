import React from 'react';
import { Edit2, Check, X, Clock, Plane, HelpCircle, Heart, PhoneOff, ShieldCheck, ArrowRight, XCircle, Trash2 } from 'lucide-react';
import { DelayedChild, STATUS_CONFIG, ChildStatus } from '../types';

interface ChildrenTableProps {
  children: DelayedChild[];
  loading: boolean;
  showUnit?: boolean;
  onEdit: (child: DelayedChild) => void;
  onView?: (child: DelayedChild) => void;
  onDelete?: (child: DelayedChild) => void;
}

const statusIcons: Record<ChildStatus, React.ReactNode> = {
  'لم يتم التطعيم': <Clock className="w-3 h-3" />,
  'تم التطعيم فى وحدة بتاريخ': <Check className="w-3 h-3" />,
  'مسافر': <Plane className="w-3 h-3" />,
  'مسافر موثق': <ShieldCheck className="w-3 h-3" />,
  'مريض': <Heart className="w-3 h-3" />,
  'الهاتف خطأ': <PhoneOff className="w-3 h-3" />,
  'الهاتف غير متاح': <PhoneOff className="w-3 h-3" />,
  'الهاتف مغلق': <PhoneOff className="w-3 h-3" />,
  'رفض': <X className="w-3 h-3" />,
  'منزل مغلق': <Clock className="w-3 h-3" />,
  'تم التحويل الى اقرب وحدة': <ArrowRight className="w-3 h-3" />,
  'متوفى': <XCircle className="w-3 h-3" />,
};

export default function ChildrenTable({ children, loading, showUnit = false, onEdit, onView, onDelete }: ChildrenTableProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-8 flex items-center justify-center transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-8 flex items-center justify-center transition-colors duration-300">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>لا توجد بيانات</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden transition-colors duration-300">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
              {showUnit && <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">الوحدة</th>}
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">اسم الطفل</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">رقم القيد</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">تاريخ الميلاد</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">العمر</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">رقم هاتف الطفل</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">رقم هاتف المُبلغ</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">التطعيم المتخلف</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">الحالة / التفاصيل</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">تاريخ التطعيم</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">ملاحظات</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {children.map((child) => {
              const statusKey = (child.status || 'لم يتم التطعيم') as ChildStatus;
              const statusConfig = STATUS_CONFIG[statusKey] || STATUS_CONFIG['لم يتم التطعيم'];
              const statusIcon = statusIcons[statusKey] || <Clock className="w-3 h-3" />;
              let statusDetails = '';
              switch (statusKey) {
                case 'تم التطعيم فى وحدة بتاريخ': statusDetails = `${child.vaccination_place || ''} ${child.vaccination_date || ''}`; break;
                case 'مسافر': case 'مسافر موثق': statusDetails = `${child.travel_country || ''} ${child.travel_date || ''}`; break;
                case 'تم التحويل الى اقرب وحدة': statusDetails = child.transfer_destination || ''; break;
                case 'مريض': statusDetails = child.disease_name || ''; break;
                case 'رفض': statusDetails = child.refusal_reason || ''; break;
                case 'متوفى': statusDetails = child.death_date || ''; break;
                default: statusDetails = '';
              }
              const rowBgClass =
                statusKey === 'تم التطعيم فى وحدة بتاريخ' ? 'bg-green-50 dark:bg-green-900/20' :
                statusKey === 'متوفى' ? 'bg-gray-200 dark:bg-gray-700' :
                statusKey === 'مسافر موثق' ? 'bg-blue-50 dark:bg-blue-900/20' :
                statusKey === 'رفض' ? 'bg-red-50 dark:bg-red-900/20' :
                statusKey === 'مريض' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                statusKey === 'تم التحويل الى اقرب وحدة' ? 'bg-purple-50 dark:bg-purple-900/20' : '';

              return (
                <tr key={child.id} className={`transition-colors hover:brightness-95 dark:hover:brightness-110 ${rowBgClass}`}>
                  {showUnit && <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{child.unit?.unit_name || '-'}</td>}
                  <td className="px-4 py-3">
                    {onView ? (
                      <button onClick={() => onView(child)} className="text-emerald-700 dark:text-emerald-400 font-semibold hover:text-emerald-900 dark:hover:text-emerald-300 hover:underline text-right">{child.child_name}</button>
                    ) : (
                      <span className="text-gray-900 dark:text-white font-medium">{child.child_name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{child.registration_number || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{child.birth_date || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{child.age ? `${child.age} سنة` : '-'}</td>
                  <td className="px-4 py-3 text-sm" dir="ltr">
                    {child.phone_number ? (
                      <div className="flex items-center gap-2">
                        <a href={`tel:${child.phone_number}`} title="اتصال" className="text-blue-600 dark:text-blue-400 hover:text-blue-800">📞</a>
                        <a href={`https://wa.me/2${child.phone_number.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" title="واتساب" className="text-green-600 dark:text-green-400 hover:text-green-800">💬</a>
                        <span className="text-gray-900 dark:text-white">{child.phone_number}</span>
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm" dir="ltr">
                    {child.reporter_phone ? (
                      <div className="flex items-center gap-2">
                        <a href={`tel:${child.reporter_phone}`} title="اتصال" className="text-blue-600 dark:text-blue-400 hover:text-blue-800">📞</a>
                        <a href={`https://wa.me/2${child.reporter_phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" title="واتساب" className="text-green-600 dark:text-green-400 hover:text-green-800">💬</a>
                        <span className="text-gray-900 dark:text-white">{child.reporter_phone}</span>
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{child.dose || 'غير محدد'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium w-fit ${statusConfig.bgColor} ${statusConfig.color}`}>
                        {statusIcon}{statusConfig.label}
                      </span>
                      <div className="text-xs text-red-600 dark:text-red-400 leading-5 whitespace-pre-line">{statusDetails || 'لا توجد تفاصيل'}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{child.vaccination_date || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">{child.follow_up_notes || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => onEdit(child)} className="inline-flex items-center justify-center p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors" title="تعديل">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {onDelete && (
                        <button onClick={() => onDelete(child)} className="inline-flex items-center justify-center p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="حذف">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
