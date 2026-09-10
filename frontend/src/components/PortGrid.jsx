import React, { useState } from 'react';
import { 
  Server, 
  Cpu, 
  Layers, 
  Activity, 
  Info, 
  CheckCircle2, 
  CircleDashed, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';

export default function PortGrid({ racksData, onSelectDrop, loading }) {
  const rackKeys = Object.keys(racksData || {});
  const [selectedRack, setSelectedRack] = useState(rackKeys[0] || '');

  React.useEffect(() => {
    if (!selectedRack && rackKeys.length > 0) {
      setSelectedRack(rackKeys[0]);
    }
  }, [rackKeys, selectedRack]);

  if (loading) {
    return (
      <div className="panel" style={{ textAlign: 'center', padding: '3rem' }}>
        جاري تحميل مصفوفة البورتات...
      </div>
    );
  }

  if (rackKeys.length === 0) {
    return (
      <div className="panel" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
        لا توجد راكات مسجلة في قاعدة البيانات حالياً.
      </div>
    );
  }

  const currentRack = racksData[selectedRack] || { patchPanels: {}, switches: {} };

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">
          <Layers size={20} color="#38bdf8" />
          <span>مصفوفة البورتات المرئية (Interactive Port Matrix)</span>
        </div>

        {/* Rack Selector */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>اختر الراك:</span>
          <select 
            className="filter-select"
            value={selectedRack}
            onChange={(e) => setSelectedRack(e.target.value)}
            style={{ fontWeight: 700, borderColor: '#38bdf8' }}
          >
            {rackKeys.map(rack => (
              <option key={rack} value={rack}>📍 {rack}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Legend Guide */}
      <div style={{ 
        display: 'flex', 
        gap: '1.5rem', 
        marginBottom: '1.5rem', 
        padding: '0.75rem 1rem', 
        background: '#0d131c', 
        borderRadius: '8px',
        fontSize: '0.82rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span className="port-led active" />
          <span>Active (نشط ومربوط)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span className="port-led free" />
          <span>Free (بورت متاح)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span className="port-led reserved" />
          <span>Reserved (محجوز)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span className="port-led damaged" />
          <span>Damaged (تالف / عطل)</span>
        </div>
      </div>

      <div className="port-grid-container">
        {/* 1. Patch Panels Section */}
        <div>
          <h3 style={{ fontSize: '1rem', color: '#38bdf8', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Server size={18} />
            <span>لوحات التوزيع في الراك (Patch Panels)</span>
          </h3>

          {Object.entries(currentRack.patchPanels || {}).map(([panelName, panel]) => (
            <div key={panelName} className="device-panel">
              <div className="device-header">
                <div>
                  <span style={{ color: 'white' }}>Patch Panel: {panelName}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>
                    ({panel.totalPorts} Ports)
                  </span>
                </div>
              </div>

              <div className="ports-matrix">
                {Array.from({ length: panel.totalPorts }, (_, i) => i + 1).map(portNum => {
                  const drop = panel.ports[portNum];
                  const statusClass = drop ? (drop.status || 'Active').toLowerCase() : 'free';
                  
                  return (
                    <div 
                      key={portNum}
                      className="port-box"
                      onClick={() => drop && onSelectDrop(drop)}
                      title={drop ? `Drop: ${drop.drop_id}\nRoom: ${drop.room_office}\nSwitch: ${drop.switch_name} (${drop.switch_port})\nStatus: ${drop.status}` : `Port ${portNum} (Free)`}
                    >
                      <span className="port-num">#{portNum}</span>
                      <span className={`port-led ${statusClass}`} />
                      <span className="port-tag">
                        {drop ? drop.drop_id.split('-').slice(-1)[0] : 'FREE'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 2. Switches Section */}
        <div>
          <h3 style={{ fontSize: '1rem', color: '#34d399', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Cpu size={18} />
            <span>سويتشات الشبكة المربوطة (Network Switches)</span>
          </h3>

          {Object.entries(currentRack.switches || {}).map(([switchName, sw]) => (
            <div key={switchName} className="device-panel" style={{ borderColor: 'rgba(52, 211, 153, 0.3)' }}>
              <div className="device-header">
                <div>
                  <span style={{ color: '#34d399' }}>Switch: {switchName}</span>
                  {sw.ip && (
                    <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '0.75rem' }}>
                      IP: {sw.ip}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                  {Object.keys(sw.ports || {}).length} Mapped Ports
                </div>
              </div>

              <div className="ports-matrix">
                {Object.entries(sw.ports || {}).map(([portKey, drop]) => {
                  const statusClass = (drop.status || 'Active').toLowerCase();
                  return (
                    <div 
                      key={portKey}
                      className="port-box"
                      onClick={() => onSelectDrop(drop)}
                      title={`Switch Port: ${portKey}\nDrop: ${drop.drop_id}\nPatch: ${drop.patch_panel} Port #${drop.patch_port}\nVLAN: ${drop.vlan_id}`}
                      style={{ borderColor: 'rgba(52, 211, 153, 0.25)' }}
                    >
                      <span className="port-num" style={{ color: '#34d399' }}>{portKey.replace(/^(Gi|Fa|Te|Eth)/, '')}</span>
                      <span className={`port-led ${statusClass}`} />
                      <span className="port-tag">
                        VLAN {drop.vlan_id}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
