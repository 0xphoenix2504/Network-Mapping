import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, 
  UploadCloud, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Trash2, 
  Sparkles,
  Info
} from 'lucide-react';

export default function ExcelManager({ onDataChange }) {
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/import/excel', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.success) {
        setFeedback({
          type: 'success',
          message: data.message || `تم استيراد ${data.importedCount} نقطة بنجاح!`
        });
        onDataChange();
      } else {
        setFeedback({
          type: 'error',
          message: data.message || 'حدث خطأ أثناء استيراد الملف'
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: `خطأ في الاتصال بالخادم: ${err.message}`
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleResetDb = async () => {
    if (!window.confirm('⚠️ تحذير: هل أنت متأكد من مسح جميع نقط الشبكة من قاعدة البيانات؟')) {
      return;
    }

    try {
      const res = await fetch('/api/reset-db', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: 'تم مسح قاعدة البيانات بنجاح.' });
        onDataChange();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleSeedDemo = async () => {
    try {
      const res = await fetch('/api/seed-sample', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: 'تم تعبئة البيانات التجريبية بنجاح!' });
        onDataChange();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">
          <FileSpreadsheet size={20} color="#38bdf8" />
          <span>إدارة واستيراد شيتات الإكسيل (Excel Sync & Tools)</span>
        </div>
      </div>

      {feedback && (
        <div style={{
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: feedback.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${feedback.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          color: feedback.type === 'success' ? '#34d399' : '#f87171'
        }}>
          {feedback.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Drag and Drop Zone */}
      <div 
        className={`dropzone ${uploading ? 'active' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); }}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files?.[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
          }
        }}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept=".xlsx,.xls,.csv"
          onChange={(e) => {
            if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
          }}
        />

        <div className="dropzone-icon">
          <UploadCloud size={30} />
        </div>

        <h4 style={{ fontSize: '1.05rem', color: '#f8fafc', marginBottom: '0.35rem' }}>
          {uploading ? 'جاري رفع ومعالجة ملف الإكسيل...' : 'اسحب وأفلت شيت الإكسيل هنا أو اضغط للاختيار'}
        </h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          يدعم ملفات (.xlsx, .xls, .csv) ويقوم بالتحديث والتزامن التلقائي حسب الـ Drop ID
        </p>
      </div>

      {/* Action Buttons Row */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '1rem', 
        marginTop: '1.5rem' 
      }}>
        <a 
          href="/api/export/template" 
          download
          className="btn btn-secondary"
          style={{ padding: '0.85rem' }}
        >
          <Download size={18} color="#38bdf8" />
          <span>تحميل قالب الإكسيل المعتمد</span>
        </a>

        <a 
          href="/api/export/excel" 
          download
          className="btn btn-secondary"
          style={{ padding: '0.85rem' }}
        >
          <FileSpreadsheet size={18} color="#34d399" />
          <span>تصدير كل النقط الحالية إلى Excel</span>
        </a>

        <button 
          className="btn btn-secondary"
          onClick={handleSeedDemo}
          style={{ padding: '0.85rem' }}
        >
          <Sparkles size={18} color="#fbbf24" />
          <span>تعبئة بيانات تجريبية (Demo)</span>
        </button>

        <button 
          className="btn btn-danger"
          onClick={handleResetDb}
          style={{ padding: '0.85rem' }}
        >
          <Trash2 size={18} />
          <span>تفريغ قاعدة البيانات</span>
        </button>
      </div>

      {/* Instructions Card */}
      <div style={{ 
        marginTop: '2rem', 
        padding: '1.25rem', 
        background: '#0c121b', 
        border: '1px solid #1e293b', 
        borderRadius: '8px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#38bdf8' }}>
          <Info size={18} />
          <h4 style={{ fontSize: '0.95rem' }}>إرشادات تنسيق شيت الإكسيل:</h4>
        </div>
        <ul style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.8', paddingRight: '1.25rem' }}>
          <li>يتعرف النظام تلقائياً على أسماء الأعمدة سواء كانت بالعربي (مثل: رقم النقطة، اسم الراك، بورت السويتش) أو بالإنجليزي (مثل: Drop_ID, Rack_Name, Switch_Port).</li>
          <li>الأعمدة الإجبارية: <code>Drop_ID</code>, <code>Floor</code>, <code>Room_Office</code>, <code>Rack_Name</code>, <code>Patch_Panel</code>, <code>Patch_Port</code>, <code>Switch_Name</code>, <code>Switch_Port</code>.</li>
          <li>إذا كان رقم النقطة (Drop ID) مسجلاً مسبقاً، سيقوم النظام بتحديث بياناته بدلاً من التكرار.</li>
        </ul>
      </div>
    </div>
  );
}
