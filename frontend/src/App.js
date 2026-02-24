import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { fetchRisks, createRisk, updateRisk, deleteRisk } from './api/risksApi';

const LEVEL_LABELS = { high: 'สูง', medium: 'กลาง', low: 'ต่ำ' };
const STATUS_LABELS = { open: 'เปิด', in_progress: 'กำลังแก้ไข', resolved: 'แก้ไขแล้ว' };

function RiskModal({ risk, onClose, onSave }) {
  const isEdit = Boolean(risk?.id);
  const [form, setForm] = useState({
    title: risk?.title || '',
    description: risk?.description || '',
    level: risk?.level || 'medium',
    location: risk?.location || '',
    assignee: risk?.assignee || '',
    status: risk?.status || 'open',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? 'แก้ไขความเสี่ยง' : 'เพิ่มความเสี่ยงใหม่'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>หัวข้อความเสี่ยง *</label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="เช่น พื้นลื่นในโกดัง" required />
          </div>

          <div className="form-group">
            <label>รายละเอียด</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="อธิบายความเสี่ยงและผลกระทบ..." />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>ระดับความเสี่ยง *</label>
              <select name="level" value={form.level} onChange={handleChange}>
                <option value="high">สูง (High)</option>
                <option value="medium">กลาง (Medium)</option>
                <option value="low">ต่ำ (Low)</option>
              </select>
            </div>

            {isEdit && (
              <div className="form-group">
                <label>สถานะ</label>
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="open">เปิด</option>
                  <option value="in_progress">กำลังแก้ไข</option>
                  <option value="resolved">แก้ไขแล้ว</option>
                </select>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>สถานที่เกิดเหตุ</label>
            <input name="location" value={form.location} onChange={handleChange} placeholder="เช่น โกดัง A, ชั้น 2" />
          </div>

          <div className="form-group">
            <label>ผู้รับผิดชอบแก้ไข *</label>
            <input name="assignee" value={form.assignee} onChange={handleChange} placeholder="ชื่อผู้รับผิดชอบ" required />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>ยกเลิก</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'กำลังบันทึก...' : isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มความเสี่ยง'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function App() {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState(null);

  const loadRisks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const filters = {};
      if (filterLevel) filters.level = filterLevel;
      if (filterStatus) filters.status = filterStatus;
      if (search) filters.assignee = search;
      const data = await fetchRisks(filters);
      setRisks(data);
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลได้ กรุณาตรวจสอบการเชื่อมต่อ API');
    } finally {
      setLoading(false);
    }
  }, [filterLevel, filterStatus, search]);

  useEffect(() => {
    loadRisks();
  }, [loadRisks]);

  const handleCreate = async (form) => {
    await createRisk(form);
    loadRisks();
  };

  const handleUpdate = async (form) => {
    await updateRisk(editingRisk.id, form);
    loadRisks();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('ยืนยันการลบความเสี่ยงนี้?')) return;
    try {
      await deleteRisk(id);
      loadRisks();
    } catch {
      alert('ไม่สามารถลบได้');
    }
  };

  const handleQuickStatus = async (risk, newStatus) => {
    try {
      await updateRisk(risk.id, { status: newStatus });
      loadRisks();
    } catch {
      alert('ไม่สามารถอัปเดตสถานะได้');
    }
  };

  const stats = {
    total: risks.length,
    high: risks.filter((r) => r.level === 'high').length,
    medium: risks.filter((r) => r.level === 'medium').length,
    low: risks.filter((r) => r.level === 'low').length,
    open: risks.filter((r) => r.status === 'open').length,
    resolved: risks.filter((r) => r.status === 'resolved').length,
  };

  const filteredRisks = risks.filter((r) =>
    !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.assignee.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app">
      <header className="app-header">
        <span className="header-icon">🛡️</span>
        <div>
          <h1>Safety Patrol</h1>
          <div className="subtitle">ระบบจัดการความเสี่ยงด้านความปลอดภัย</div>
        </div>
      </header>

      <main className="main-content">
        {error && <div className="error-message">{error}</div>}

        <div className="stats-row">
          <div className="stat-card total">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">ความเสี่ยงทั้งหมด</div>
          </div>
          <div className="stat-card high">
            <div className="stat-number">{stats.high}</div>
            <div className="stat-label">ระดับสูง</div>
          </div>
          <div className="stat-card medium">
            <div className="stat-number">{stats.medium}</div>
            <div className="stat-label">ระดับกลาง</div>
          </div>
          <div className="stat-card low">
            <div className="stat-number">{stats.low}</div>
            <div className="stat-label">ระดับต่ำ</div>
          </div>
          <div className="stat-card open">
            <div className="stat-number">{stats.open}</div>
            <div className="stat-label">รอดำเนินการ</div>
          </div>
          <div className="stat-card resolved">
            <div className="stat-number">{stats.resolved}</div>
            <div className="stat-label">แก้ไขแล้ว</div>
          </div>
        </div>

        <div className="toolbar">
          <div className="toolbar-filters">
            <input
              className="search-input"
              placeholder="ค้นหาหัวข้อ / ผู้รับผิดชอบ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="filter-select" value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)}>
              <option value="">ทุกระดับ</option>
              <option value="high">สูง</option>
              <option value="medium">กลาง</option>
              <option value="low">ต่ำ</option>
            </select>
            <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">ทุกสถานะ</option>
              <option value="open">เปิด</option>
              <option value="in_progress">กำลังแก้ไข</option>
              <option value="resolved">แก้ไขแล้ว</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={() => { setEditingRisk(null); setModalOpen(true); }}>
            + เพิ่มความเสี่ยง
          </button>
        </div>

        <div className="risk-table-wrapper">
          {loading ? (
            <div className="loading">กำลังโหลดข้อมูล...</div>
          ) : filteredRisks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <div>ไม่พบรายการความเสี่ยง</div>
            </div>
          ) : (
            <table className="risk-table">
              <thead>
                <tr>
                  <th>หัวข้อความเสี่ยง</th>
                  <th>ระดับ</th>
                  <th>สถานที่</th>
                  <th>ผู้รับผิดชอบ</th>
                  <th>สถานะ</th>
                  <th>วันที่บันทึก</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredRisks.map((risk) => (
                  <tr key={risk.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{risk.title}</div>
                      {risk.description && (
                        <div style={{ fontSize: '0.8rem', color: '#888', marginTop: 2 }}>{risk.description}</div>
                      )}
                    </td>
                    <td>
                      <span className={`level-badge level-${risk.level}`}>{LEVEL_LABELS[risk.level]}</span>
                    </td>
                    <td>{risk.location || '-'}</td>
                    <td>{risk.assignee}</td>
                    <td>
                      <span className={`status-badge status-${risk.status}`}>{STATUS_LABELS[risk.status]}</span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#888' }}>
                      {new Date(risk.createdAt).toLocaleDateString('th-TH')}
                    </td>
                    <td>
                      <div className="action-buttons">
                        {risk.status === 'open' && (
                          <button className="btn btn-secondary btn-sm" onClick={() => handleQuickStatus(risk, 'in_progress')}>
                            รับเรื่อง
                          </button>
                        )}
                        {risk.status === 'in_progress' && (
                          <button className="btn btn-secondary btn-sm" onClick={() => handleQuickStatus(risk, 'resolved')}>
                            แก้ไขแล้ว
                          </button>
                        )}
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => { setEditingRisk(risk); setModalOpen(true); }}
                        >
                          แก้ไข
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(risk.id)}>
                          ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {modalOpen && (
        <RiskModal
          risk={editingRisk}
          onClose={() => setModalOpen(false)}
          onSave={editingRisk ? handleUpdate : handleCreate}
        />
      )}
    </div>
  );
}

export default App;
