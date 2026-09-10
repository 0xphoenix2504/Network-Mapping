import React from 'react';
import { 
  Search, 
  X, 
  Eye, 
  Edit3, 
  Trash2, 
  Filter, 
  MapPin, 
  Server, 
  Cpu, 
  RefreshCw 
} from 'lucide-react';

export default function SearchTable({ 
  drops, 
  total, 
  searchQuery, 
  setSearchQuery, 
  filters, 
  setFilters, 
  filterOptions, 
  onTrace, 
  onEdit, 
  onDelete, 
  onRefresh,
  loading 
}) {
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilters({
      building: '',
      floor: '',
      rack_name: '',
      switch_name: '',
      status: '',
      vlan_id: ''
    });
  };

  const hasActiveFilters = searchQuery || Object.values(filters).some(Boolean);

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">
          <Search size={20} color="#38bdf8" />
          <span>دليل وبحث نقط الشبكة ({total} نقطة)</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {hasActiveFilters && (
            <button 
              className="btn btn-secondary btn-sm"
              onClick={handleClearFilters}
            >
              <X size={14} />
              <span>مسح الفلاتر</span>
            </button>
          )}
          <button 
            className="btn btn-secondary btn-sm"
            onClick={onRefresh}
            title="تحديث البيانات"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="search-controls">
        <div className="search-main-row">
          <div className="search-input-wrapper">
            <Search size={18} />
            <input 
              type="text"
              className="search-input"
              placeholder="ابحث برقم النقطة، الغرفة، الموظف، السويتش، البورت، الـ IP، أو الـ VLAN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="filter-row">
          <select 
            className="filter-select"
            value={filters.floor}
            onChange={(e) => handleFilterChange('floor', e.target.value)}
          >
            <option value="">🏢 كل الأدوار</option>
            {filterOptions.floors?.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>

          <select 
            className="filter-select"
            value={filters.rack_name}
            onChange={(e) => handleFilterChange('rack_name', e.target.value)}
          >
            <option value="">📍 كل الراكات</option>
            {filterOptions.racks?.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <select 
            className="filter-select"
            value={filters.switch_name}
            onChange={(e) => handleFilterChange('switch_name', e.target.value)}
          >
            <option value="">⚡ كل السويتشات</option>
            {filterOptions.switches?.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select 
            className="filter-select"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">🟢 كل الحالات</option>
            <option value="Active">Active (نشط)</option>
            <option value="Free">Free (متاح)</option>
            <option value="Reserved">Reserved (محجوز)</option>
            <option value="Damaged">Damaged (تالف)</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>رقم النقطة (Drop ID)</th>
              <th>الموقع والغرفة</th>
              <th>المستخدم / الجهاز</th>
              <th>الباتش بانل (Rack / Port)</th>
              <th>السويتش والمنفذ</th>
              <th>الـ VLAN</th>
              <th>الحالة</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {drops.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-dim)' }}>
                  {loading ? 'جاري تحميل البيانات...' : 'لم يتم العثور على أي نقط مطابقة لخيارات البحث'}
                </td>
              </tr>
            ) : (
              drops.map((drop) => (
                <tr key={drop.id}>
                  <td>
                    <span className="table-drop-id">{drop.drop_id}</span>
                  </td>
                  <td>
                    <div>{drop.floor}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {drop.room_office}
                    </div>
                  </td>
                  <td>
                    <div>{drop.user_device || '-'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      {drop.device_type || 'PC'}
                    </div>
                  </td>
                  <td>
                    <div className="mono" style={{ fontSize: '0.85rem' }}>
                      {drop.rack_name} / {drop.patch_panel}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#38bdf8' }}>
                      Port #{drop.patch_port}
                    </div>
                  </td>
                  <td>
                    <div className="mono" style={{ color: '#34d399', fontWeight: 600 }}>
                      {drop.switch_name}
                    </div>
                    <div className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {drop.switch_port} {drop.switch_ip ? `(${drop.switch_ip})` : ''}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-vlan">
                      VLAN {drop.vlan_id}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${drop.status.toLowerCase()}`}>
                      {drop.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => onTrace(drop)}
                        title="تتبع المسار الكامل"
                      >
                        <Eye size={14} />
                        <span>تتبع</span>
                      </button>

                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => onEdit(drop)}
                        title="تعديل النقطة"
                      >
                        <Edit3 size={14} />
                      </button>

                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => onDelete(drop)}
                        title="حذف النقطة"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
