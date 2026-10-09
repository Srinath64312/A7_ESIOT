import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useMotorData } from '../hooks/useMotorData';
import { motorService } from '../services/motorService';
import MotorCard from '../components/MotorCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

export default function Motors() {
  const { motors, loading, error, refetch } = useMotorData();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', model: '', location: '' });
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      await motorService.create(formData);
      setIsAddModalOpen(false);
      setFormData({ name: '', model: '', location: '' });
      refetch();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} onRetry={refetch} />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Motor Fleet</h2>
        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={20} /> Add Motor
        </button>
      </div>

      {motors.length === 0 ? (
        <EmptyState title="No Motors" message="No motors found in the system. Add one to get started." />
      ) : (
        <div className="grid-3">
          {motors.map(motor => <MotorCard key={motor.id} motor={motor} />)}
        </div>
      )}

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Motor">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Motor Name</label>
            <input required className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Conveyor Belt Motor 1" />
          </div>
          <div className="form-group">
            <label className="form-label">Model</label>
            <input required className="form-control" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} placeholder="e.g. Siemens 100HP" />
          </div>
          <div className="form-group">
            <label className="form-label">Location</label>
            <input required className="form-control" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. Plant A - Zone 1" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitLoading} style={{ marginTop: '1rem', justifyContent: 'center' }}>
            {submitLoading ? 'Adding...' : 'Add Motor'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
