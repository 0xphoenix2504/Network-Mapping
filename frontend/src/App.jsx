import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import StatsCards from './components/StatsCards';
import SearchTable from './components/SearchTable';
import PortGrid from './components/PortGrid';
import AnalyticsView from './components/AnalyticsView';
import ExcelManager from './components/ExcelManager';
import TraceModal from './components/TraceModal';
import DropModal from './components/DropModal';

import { 
  Search, 
  Layers, 
  BarChart3, 
  FileSpreadsheet 
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('search');
  const [drops, setDrops] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [statsData, setStatsData] = useState(null);
  const [racksData, setRacksData] = useState({});

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    building: '',
    floor: '',
    rack_name: '',
    switch_name: '',
    status: '',
    vlan_id: ''
  });

  const [selectedTraceDrop, setSelectedTraceDrop] = useState(null);
  const [selectedEditDrop, setSelectedEditDrop] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch Drops with search and filters
  const fetchDrops = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (filters.building) params.append('building', filters.building);
      if (filters.floor) params.append('floor', filters.floor);
      if (filters.rack_name) params.append('rack_name', filters.rack_name);
      if (filters.switch_name) params.append('switch_name', filters.switch_name);
      if (filters.status) params.append('status', filters.status);
      if (filters.vlan_id) params.append('vlan_id', filters.vlan_id);
      params.append('limit', '500');

      const res = await fetch(`/api/drops?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setDrops(json.data);
        setTotal(json.total);
      }
    } catch (err) {
      console.error('Error loading drops:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters]);

  // Fetch Stats & Capacity
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const json = await res.json();
      if (json.success) {
        setStatsData(json);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Fetch Racks & Port Matrix
  const fetchRacks = async () => {
    try {
      const res = await fetch('/api/racks');
      const json = await res.json();
      if (json.success) {
        setRacksData(json.data);
      }
    } catch (err) {
      console.error('Error fetching racks:', err);
    }
  };

  const refreshAll = () => {
    fetchDrops();
    fetchStats();
    fetchRacks();
  };

  useEffect(() => {
    fetchDrops();
  }, [fetchDrops]);

  useEffect(() => {
    fetchStats();
    fetchRacks();
  }, []);

  const handleDeleteDrop = async (drop) => {
    if (!window.confirm(`هل أنت متأكد من حذف النقطة "${drop.drop_id}"؟`)) {
      return;
    }

    try {
      const res = await fetch(`/api/drops/${drop.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        refreshAll();
      }
    } catch (err) {
      alert(`خطأ أثناء الحذف: ${err.message}`);
    }
  };

  const handleSeedDemoData = async () => {
    try {
      const res = await fetch('/api/seed-sample', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        refreshAll();
        alert('تمت تعبئة بيانات تجريبية واقعية بنجاح!');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar 
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onSeedData={handleSeedDemoData}
        stats={statsData?.stats}
      />

      {/* Top Metric Cards */}
      <StatsCards stats={statsData?.stats} />

      {/* Tabs Navigation */}
      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          <Search size={18} />
          <span>دليل وبحث النقط</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'matrix' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('matrix');
            fetchRacks();
          }}
        >
          <Layers size={18} />
          <span>مصفوفة البورتات والراك</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('analytics');
            fetchStats();
          }}
        >
          <BarChart3 size={18} />
          <span>سعة السويتشات والـ VLAN</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'excel' ? 'active' : ''}`}
          onClick={() => setActiveTab('excel')}
        >
          <FileSpreadsheet size={18} />
          <span>إدارة ومزامنة الإكسيل</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <main>
        {activeTab === 'search' && (
          <SearchTable 
            drops={drops}
            total={total}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filters={filters}
            setFilters={setFilters}
            filterOptions={statsData?.filters || {}}
            onTrace={(drop) => setSelectedTraceDrop(drop)}
            onEdit={(drop) => setSelectedEditDrop(drop)}
            onDelete={handleDeleteDrop}
            onRefresh={fetchDrops}
            loading={loading}
          />
        )}

        {activeTab === 'matrix' && (
          <PortGrid 
            racksData={racksData}
            onSelectDrop={(drop) => setSelectedTraceDrop(drop)}
            loading={loading}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView statsData={statsData} />
        )}

        {activeTab === 'excel' && (
          <ExcelManager onDataChange={refreshAll} />
        )}
      </main>

      {/* Visual End-to-End Trace Modal */}
      {selectedTraceDrop && (
        <TraceModal 
          drop={selectedTraceDrop}
          onClose={() => setSelectedTraceDrop(null)}
          onEdit={(drop) => setSelectedEditDrop(drop)}
        />
      )}

      {/* Add / Edit Drop Modal */}
      {(isAddModalOpen || selectedEditDrop) && (
        <DropModal 
          drop={selectedEditDrop}
          onClose={() => {
            setIsAddModalOpen(false);
            setSelectedEditDrop(null);
          }}
          onSave={refreshAll}
        />
      )}
    </div>
  );
}
