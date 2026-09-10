import React from 'react';
import { 
  X, 
  ArrowDown, 
  MapPin, 
  Server, 
  Cpu, 
  Cable, 
  Copy, 
  Check, 
  Edit3, 
  Monitor, 
  Phone, 
  Printer, 
  Wifi, 
  Camera, 
  HardDrive 
} from 'lucide-react';

export default function TraceModal({ drop, onClose, onEdit }) {
  const [copied, setCopied] = React.useState(false);

  if (!drop) return null;

  const getDeviceIcon = (type) => {
    switch ((type || '').toLowerCase()) {
      case 'ip phone': return <Phone size={18} />;
      case 'printer': return <Printer size={18} />;
      case 'access point': return <Wifi size={18} />;
      case 'cctv': return <Camera size={18} />;
      case 'server': return <HardDrive size={18} />;
      default: return <Monitor size={18} />;
    }
  };

  const handleCopySummary = () => {
    const summary = `[Network Drop Trace]
Drop ID: ${drop.drop_id}
Location: ${drop.building ? drop.building + ' - ' : ''}${drop.floor} - ${drop.room_office}
User/Device: ${drop.user_device || 'N/A'} (${drop.device_type || 'PC'})
Patch Panel: ${drop.rack_name} / ${drop.patch_panel} / Port ${drop.patch_port}
Switch Port: ${drop.switch_name} [${drop.switch_port}] (IP: ${drop.switch_ip || 'N/A'})
VLAN: ${drop.vlan_id} ${drop.vlan_name ? `(${drop.vlan_name})` : ''}
Status: ${drop.status}`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="table-drop-id" style={{ fontSize: '1.25rem' }}>{drop.drop_id}</span>
            <span className={`badge badge-${drop.status.toLowerCase()}`}>
              {drop.status}
            </span>
          </div>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={onClose}
            style={{ padding: '0.4rem', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', marginBottom: '0.25rem' }}>
              المسار الكامل للنقطة (End-to-End Cable Trace)
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              تتبع المسار الفعلي من نقطة الحائط وصولاً إلى السويتش والـ VLAN
            </p>
          </div>

          <div className="trace-flow">
            {/* 1. Wall Outlet */}
            <div className="trace-node" style={{ borderColor: 'rgba(56, 189, 248, 0.4)' }}>
              <div className="trace-node-header">
                <div className="trace-node-title">
                  <MapPin size={16} />
                  <span>1. نقطة الحائط والمستخدم (Wall Jack Outlet)</span>
                </div>
                <div className="badge badge-vlan" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {getDeviceIcon(drop.device_type)}
                  <span>{drop.device_type || 'PC'}</span>
                </div>
              </div>
              <div className="trace-node-value mono">
                {drop.drop_id}
              </div>
              <div className="trace-node-details">
                <span>🏢 {drop.building ? `${drop.building} - ` : ''}{drop.floor}</span>
                <span>🚪 {drop.room_office}</span>
                {drop.user_device && <span>👤 {drop.user_device}</span>}
              </div>
            </div>

            {/* Connector */}
            <div className="trace-connector">
              <ArrowDown size={22} />
            </div>

            {/* 2. Patch Panel in Rack */}
            <div className="trace-node" style={{ borderColor: 'rgba(14, 165, 233, 0.4)' }}>
              <div className="trace-node-header">
                <div className="trace-node-title">
                  <Server size={16} />
                  <span>2. الباتش بانل في الراك (Patch Panel)</span>
                </div>
                <span className="mono" style={{ color: '#38bdf8', fontSize: '0.85rem' }}>
                  Port #{drop.patch_port}
                </span>
              </div>
              <div className="trace-node-value">
                {drop.rack_name} <span style={{ color: 'var(--text-dim)' }}>/</span> {drop.patch_panel} <span style={{ color: 'var(--text-dim)' }}>/</span> منفذ {drop.patch_port}
              </div>
              <div className="trace-node-details">
                <span>📍 موقع الراك: {drop.rack_name}</span>
                <span>🎛️ البانل: {drop.patch_panel}</span>
              </div>
            </div>

            {/* Connector (Patch Cord) */}
            <div className="trace-connector">
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.4rem', 
                background: '#1e293b', 
                padding: '0.2rem 0.6rem', 
                borderRadius: '6px',
                fontSize: '0.75rem',
                color: '#94a3b8'
              }}>
                <Cable size={14} />
                <span>Patch Cord: {drop.notes || 'UTP RJ45'}</span>
              </div>
            </div>

            {/* 3. Network Switch */}
            <div className="trace-node" style={{ borderColor: 'rgba(16, 185, 129, 0.4)' }}>
              <div className="trace-node-header">
                <div className="trace-node-title" style={{ color: '#34d399' }}>
                  <Cpu size={16} />
                  <span>3. سويتش الشبكة والـ VLAN (Switch & Port)</span>
                </div>
                <span className="badge badge-vlan">
                  VLAN {drop.vlan_id} {drop.vlan_name ? `(${drop.vlan_name})` : ''}
                </span>
              </div>
              <div className="trace-node-value mono" style={{ color: '#34d399' }}>
                {drop.switch_name} <span style={{ color: 'var(--text-dim)' }}>&rarr;</span> {drop.switch_port}
              </div>
              <div className="trace-node-details">
                {drop.switch_ip && <span>🌐 Switch IP: <strong className="mono">{drop.switch_ip}</strong></span>}
                <span>⚡ Interface: <strong className="mono">{drop.switch_port}</strong></span>
                <span>🏷️ VLAN Name: {drop.vlan_name || 'Default'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="btn btn-secondary"
            onClick={handleCopySummary}
          >
            {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
            <span>{copied ? 'تم النسخ!' : 'نسخ ملخص المسار'}</span>
          </button>

          <button 
            className="btn btn-primary"
            onClick={() => {
              onClose();
              onEdit(drop);
            }}
          >
            <Edit3 size={16} />
            <span>تعديل النقطة / الباتش</span>
          </button>
        </div>
      </div>
    </div>
  );
}
