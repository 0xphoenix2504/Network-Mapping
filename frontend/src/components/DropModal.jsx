import React, { useState, useEffect } from 'react';
import { X, Save, PlusCircle, Edit3 } from 'lucide-react';

export default function DropModal({ drop, onClose, onSave }) {
  const isEditing = Boolean(drop && drop.id);

  const [formData, setFormData] = useState({
    drop_id: '',
    building: '',
    floor: 'Floor 1',
    room_office: '',
    user_device: '',
    rack_name: 'Rack-01',
    patch_panel: 'PP-A',
    patch_port: 1,
    switch_name: 'SW-Core-01',
    switch_ip: '',
    switch_port: 'Gi1/0/1',
    vlan_id: 10,
    vlan_name: 'Data_Users',
    status: 'Active',
    device_type: 'PC',
    notes: ''
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (drop) {
      setFormData({
        drop_id: drop.drop_id || '',
        building: drop.building || '',
        floor: drop.floor || 'Floor 1',
        room_office: drop.room_office || '',
        user_device: drop.user_device || '',
        rack_name: drop.rack_name || 'Rack-01',
        patch_panel: drop.patch_panel || 'PP-A',
        patch_port: drop.patch_port || 1,
        switch_name: drop.switch_name || 'SW-Core-01',
        switch_ip: drop.switch_ip || '',
        switch_port: drop.switch_port || 'Gi1/0/1',
        vlan_id: drop.vlan_id || 10,
        vlan_name: drop.vlan_name || 'Data_Users',
        status: drop.status || 'Active',
        device_type: drop.device_type || 'PC',
        notes: drop.notes || ''
      });
    }
  }, [drop]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'patch_port' || name === 'vlan_id' ? (Number(value) || value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.drop_id || !formData.floor || !formData.room_office || !formData.rack_name || !formData.patch_panel || !formData.patch_port || !formData.switch_name || !formData.switch_port) {
      setError('يرجى ملء جميع الحقول الإجبارية المطلوبة');
      return;
    }

    setSubmitting(true);

    try {
      const url = isEditing ? `/api/drops/${drop.id}` : '/api/drops';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        onSave();
        onClose();
      } else {
        setError(data.message || 'حدث خطأ أثناء حفظ البيانات');
      }
    } catch (err) {
      setError(`فشل الاتصال: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isEditing ? <Edit3 size={20} color="#38bdf8" /> : <PlusCircle size={20} color="#38bdf8" />}
            <span style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              {isEditing ? `تعديل النقطة (${formData.drop_id})` : 'إضافة نقطة شبكة جديدة'}
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

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                marginBottom: '1rem',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                fontSize: '0.88rem'
              }}>
                {error}
              </div>
            )}

            {/* Section 1: Drop & Location */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.9rem', color: '#38bdf8', marginBottom: '0.6rem' }}>
                📍 1. بيانات النقطة والموقع
              </h4>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">رقم النقطة (Drop ID) *</label>
                  <input 
                    type="text" 
                    name="drop_id"
                    className="form-input mono"
                    placeholder="e.g. FL01-R102-D1"
                    value={formData.drop_id}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">الدور (Floor) *</label>
                  <input 
                    type="text" 
                    name="floor"
                    className="form-input"
                    placeholder="e.g. Floor 1"
                    value={formData.floor}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">الغرفة / المكتب (Room/Office) *</label>
                  <input 
                    type="text" 
                    name="room_office"
                    className="form-input"
                    placeholder="e.g. IT Department - Desk 3"
                    value={formData.room_office}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">المبنى (Building)</label>
                  <input 
                    type="text" 
                    name="building"
                    className="form-input"
                    placeholder="e.g. HQ Building"
                    value={formData.building}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">اسم المستخدم / الجهاز</label>
                  <input 
                    type="text" 
                    name="user_device"
                    className="form-input"
                    placeholder="e.g. Ahmed Ali (PC)"
                    value={formData.user_device}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">نوع الجهاز (Device Type)</label>
                  <select 
                    name="device_type"
                    className="form-select"
                    value={formData.device_type}
                    onChange={handleChange}
                  >
                    <option value="PC">PC / Workstation</option>
                    <option value="IP Phone">IP Phone</option>
                    <option value="Printer">Network Printer</option>
                    <option value="Access Point">Access Point (AP)</option>
                    <option value="CCTV">CCTV Camera</option>
                    <option value="Server">Server</option>
                    <option value="Other">Other Device</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Patch Panel */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.9rem', color: '#38bdf8', marginBottom: '0.6rem' }}>
                🎛️ 2. ربط الباتش بانل (Patch Panel)
              </h4>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">اسم الراك (Rack Name) *</label>
                  <input 
                    type="text" 
                    name="rack_name"
                    className="form-input"
                    placeholder="e.g. Rack-01"
                    value={formData.rack_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">الباتش بانل (Patch Panel) *</label>
                  <input 
                    type="text" 
                    name="patch_panel"
                    className="form-input"
                    placeholder="e.g. PP-A"
                    value={formData.patch_panel}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">رقم المنفذ (Patch Port) *</label>
                  <input 
                    type="number" 
                    name="patch_port"
                    className="form-input mono"
                    min="1"
                    max="96"
                    value={formData.patch_port}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Switch Connection */}
            <div>
              <h4 style={{ fontSize: '0.9rem', color: '#34d399', marginBottom: '0.6rem' }}>
                ⚡ 3. ربط سويتش الشبكة والـ VLAN
              </h4>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">اسم السويتش (Switch Name) *</label>
                  <input 
                    type="text" 
                    name="switch_name"
                    className="form-input"
                    placeholder="e.g. SW-Core-01"
                    value={formData.switch_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">آي بي السويتش (Switch IP)</label>
                  <input 
                    type="text" 
                    name="switch_ip"
                    className="form-input mono"
                    placeholder="e.g. 192.168.10.2"
                    value={formData.switch_ip}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">منفذ السويتش (Switch Port) *</label>
                  <input 
                    type="text" 
                    name="switch_port"
                    className="form-input mono"
                    placeholder="e.g. Gi1/0/14"
                    value={formData.switch_port}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">رقم الـ VLAN (VLAN ID)</label>
                  <input 
                    type="number" 
                    name="vlan_id"
                    className="form-input mono"
                    min="1"
                    max="4094"
                    value={formData.vlan_id}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">اسم الـ VLAN (VLAN Name)</label>
                  <input 
                    type="text" 
                    name="vlan_name"
                    className="form-input"
                    placeholder="e.g. Data_Users"
                    value={formData.vlan_name}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">حالة النقطة (Status) *</label>
                  <select 
                    name="status"
                    className="form-select"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Active">Active (نشط ومربوط)</option>
                    <option value="Free">Free (متاح وغير مربوط)</option>
                    <option value="Reserved">Reserved (محجوز)</option>
                    <option value="Damaged">Damaged (تالف / عطل)</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '0.75rem' }}>
                <label className="form-label">ملاحظات إضافية (Notes / Patch Cord details)</label>
                <input 
                  type="text" 
                  name="notes"
                  className="form-input"
                  placeholder="e.g. Cat6 Yellow 1.5m, PoE+ Enabled"
                  value={formData.notes}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={submitting}
            >
              إلغاء
            </button>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={submitting}
            >
              <Save size={16} />
              <span>{submitting ? 'جاري الحفظ...' : (isEditing ? 'تحديث النقطة' : 'حفظ النقطة')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
