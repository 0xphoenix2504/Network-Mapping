import React from 'react';
import { 
  Radio, 
  CheckCircle2, 
  CircleDashed, 
  Clock, 
  AlertTriangle,
  Server,
  Layers
} from 'lucide-react';

export default function StatsCards({ stats }) {
  if (!stats) return null;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-info">
          <div className="stat-label">إجمالي نقط الشبكة</div>
          <div className="stat-value">{stats.totalDrops}</div>
        </div>
        <div className="stat-icon total">
          <Radio size={24} />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-info">
          <div className="stat-label">النقط النشطة (Active)</div>
          <div className="stat-value" style={{ color: '#10b981' }}>{stats.active}</div>
        </div>
        <div className="stat-icon active">
          <CheckCircle2 size={24} />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-info">
          <div className="stat-label">نقط متاحة (Free Ports)</div>
          <div className="stat-value" style={{ color: '#94a3b8' }}>{stats.free}</div>
        </div>
        <div className="stat-icon free">
          <CircleDashed size={24} />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-info">
          <div className="stat-label">نقط محجوزة (Reserved)</div>
          <div className="stat-value" style={{ color: '#f59e0b' }}>{stats.reserved}</div>
        </div>
        <div className="stat-icon reserved">
          <Clock size={24} />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-info">
          <div className="stat-label">نقط تالفة (Damaged)</div>
          <div className="stat-value" style={{ color: '#ef4444' }}>{stats.damaged}</div>
        </div>
        <div className="stat-icon damaged">
          <AlertTriangle size={24} />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-info">
          <div className="stat-label">الراكات والسويتشات</div>
          <div className="stat-value" style={{ fontSize: '1.25rem' }}>
            {stats.racksCount} Racks / {stats.switchesCount} SW
          </div>
        </div>
        <div className="stat-icon total">
          <Server size={24} />
        </div>
      </div>
    </div>
  );
}
