import React from 'react';
import { 
  BarChart3, 
  Cpu, 
  Layers, 
  PieChart, 
  HardDrive, 
  ShieldCheck, 
  Server 
} from 'lucide-react';

export default function AnalyticsView({ statsData }) {
  if (!statsData) return null;

  const { stats, vlanSummary = [], deviceSummary = [], switchCapacity = [] } = statsData;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Switch Capacity Cards */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <Cpu size={20} color="#34d399" />
            <span>سعة واستخدام سويتشات الشبكة (Switch Port Capacity)</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {switchCapacity.map((sw) => {
            const standardPorts = sw.mapped_ports > 24 ? 48 : 24;
            const utilization = Math.round((sw.active_ports / standardPorts) * 100);

            return (
              <div 
                key={sw.switch_name} 
                style={{
                  background: '#0d131c',
                  border: '1px solid #1e293b',
                  borderRadius: '10px',
                  padding: '1.25rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, color: '#34d399', fontSize: '1.05rem' }}>{sw.switch_name}</span>
                  <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sw.switch_ip || 'No IP'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  <span>البورتات النشطة: <strong style={{ color: 'white' }}>{sw.active_ports}</strong> / {standardPorts}</span>
                  <span style={{ fontWeight: 700, color: utilization > 80 ? '#f87171' : '#38bdf8' }}>{utilization}% مستخدم</span>
                </div>

                {/* Progress Bar */}
                <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                  <div 
                    style={{
                      width: `${Math.min(utilization, 100)}%`,
                      height: '100%',
                      background: utilization > 85 ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 'linear-gradient(90deg, #0284c7, #10b981)',
                      borderRadius: '4px',
                      transition: 'width 0.4s ease'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. VLAN & Device Distribution Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {/* VLANs */}
        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <div className="panel-title">
              <Layers size={20} color="#38bdf8" />
              <span>توزيع شبكات الـ VLAN</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {vlanSummary.map(v => (
              <div 
                key={v.vlan_id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.6rem 0.85rem',
                  background: '#0d131c',
                  border: '1px solid #1e293b',
                  borderRadius: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span className="badge badge-vlan">VLAN {v.vlan_id}</span>
                  <span style={{ fontSize: '0.88rem', color: '#e2e8f0' }}>{v.vlan_name || 'General'}</span>
                </div>
                <span className="mono" style={{ fontWeight: 700, color: '#38bdf8' }}>
                  {v.count} نقطة
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Devices */}
        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <div className="panel-title">
              <BarChart3 size={20} color="#fbbf24" />
              <span>توزيع الأجهزة المتصلة (Device Types)</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {deviceSummary.map(d => (
              <div 
                key={d.device_type}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.6rem 0.85rem',
                  background: '#0d131c',
                  border: '1px solid #1e293b',
                  borderRadius: '6px'
                }}
              >
                <span style={{ fontSize: '0.88rem', color: '#e2e8f0' }}>{d.device_type}</span>
                <span className="mono" style={{ fontWeight: 700, color: '#fbbf24' }}>
                  {d.count} جهاز
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
