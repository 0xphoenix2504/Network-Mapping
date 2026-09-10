import React from 'react';
import { 
  Network, 
  PlusCircle, 
  Download, 
  FileSpreadsheet, 
  Sparkles,
  Server
} from 'lucide-react';

export default function Navbar({ onOpenAddModal, onSeedData, stats }) {
  return (
    <header className="navbar">
      <div className="nav-brand">
        <div className="logo-icon">
          <Network size={26} />
        </div>
        <div>
          <div className="nav-title">NetTrace Platform</div>
          <div className="nav-subtitle">إدارة وتتبع نقط الشبكة، الباتش بانل، والسويتشات</div>
        </div>
      </div>

      <div className="nav-actions">
        <div className="badge badge-active" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
          <Server size={14} />
          <span>Localhost Active ({stats ? `${stats.totalDrops} نقطة` : '...'})</span>
        </div>

        <button 
          className="btn btn-secondary btn-sm"
          onClick={onSeedData}
          title="تعبئة بيانات شبكة تجريبية واقعية"
        >
          <Sparkles size={16} />
          <span>بيانات تجريبية</span>
        </button>

        <a 
          href="/api/export/template" 
          download
          className="btn btn-secondary btn-sm"
          title="تحميل قالب الإكسيل المعتمد"
        >
          <Download size={16} />
          <span>قالب Excel</span>
        </a>

        <a 
          href="/api/export/excel" 
          download
          className="btn btn-secondary btn-sm"
          title="تصدير جميع النقط الحالية إلى ملف Excel"
        >
          <FileSpreadsheet size={16} />
          <span>تصدير Excel</span>
        </a>

        <button 
          className="btn btn-primary"
          onClick={onOpenAddModal}
        >
          <PlusCircle size={18} />
          <span>إضافة نقطة جديدة</span>
        </button>
      </div>
    </header>
  );
}
