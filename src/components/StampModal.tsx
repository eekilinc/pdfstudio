import React, { useState } from 'react';
import { X, Stamp, Check } from 'lucide-react';
import type { StampAnnotation } from '../types/pdf';

interface StampModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyStamp: (stampData: Partial<StampAnnotation>) => void;
}

const PRESET_STAMPS = [
  { type: 'APPROVED', text: 'ONAYLANDI', color: '#16a34a', sub: new Date().toLocaleDateString('tr-TR') },
  { type: 'CONFIDENTIAL', text: 'GİZLİ & ÖZEL', color: '#dc2626', sub: 'YETKİSİZ ÇOĞALTILAMAZ' },
  { type: 'REJECTED', text: 'REDDEDİLDİ', color: '#e11d48', sub: new Date().toLocaleDateString('tr-TR') },
  { type: 'DRAFT', text: 'TASLAK BELGE', color: '#d97706', sub: 'GEÇERSİZDİR' },
  { type: 'FINAL', text: 'SON VERSİYON', color: '#2563eb', sub: 'RESMİ KOPYA' },
  { type: 'COMPLETED', text: 'TAMAMLANDI', color: '#059669', sub: 'İŞLEM GÖRDÜ' },
];

export const StampModal: React.FC<StampModalProps> = ({
  isOpen,
  onClose,
  onApplyStamp,
}) => {
  const [customText, setCustomText] = useState('ÖZEL DAMGA');
  const [customSub, setCustomSub] = useState(new Date().toLocaleDateString('tr-TR'));
  const [customColor, setCustomColor] = useState('#2563eb');

  if (!isOpen) return null;

  const handleSelect = (stamp: typeof PRESET_STAMPS[0]) => {
    onApplyStamp({
      type: 'stamp',
      stampType: stamp.type as any,
      customText: stamp.text,
      subtitle: stamp.sub,
      color: stamp.color,
      width: 170,
      height: 65,
    });
    onClose();
  };

  const handleCustomApply = () => {
    onApplyStamp({
      type: 'stamp',
      stampType: 'CUSTOM',
      customText: customText || 'DAMGA',
      subtitle: customSub,
      color: customColor,
      width: 170,
      height: 65,
    });
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card animate-fade-in" style={{ width: '520px' }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ fontWeight: 600, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Stamp size={18} color="var(--accent-primary)" />
            <span>Kaşe & Damga Seçin</span>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: '28px', height: '28px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Hazır damgalardan birini seçin veya özel bir metin girin:
          </div>

          {/* Grid of Preset Stamps */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {PRESET_STAMPS.map((stamp) => (
              <div
                key={stamp.type}
                onClick={() => handleSelect(stamp)}
                style={{
                  border: `2px solid ${stamp.color}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                  e.currentTarget.style.boxShadow = `0 4px 14px ${stamp.color}33`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <div style={{
                  fontWeight: 800,
                  fontSize: '14px',
                  color: stamp.color,
                  letterSpacing: '1px',
                  border: `1.5px solid ${stamp.color}`,
                  padding: '2px 8px',
                  borderRadius: '3px',
                }}>
                  {stamp.text}
                </div>
                <div style={{ fontSize: '10px', color: stamp.color, fontWeight: 500, opacity: 0.85 }}>
                  {stamp.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Custom Stamp Section */}
          <div style={{
            borderTop: '1px solid var(--border-color)',
            paddingTop: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Özel Damga Oluştur</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Damga Başlığı"
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />

              <input
                type="text"
                value={customSub}
                onChange={(e) => setCustomSub(e.target.value)}
                placeholder="Alt Yazı / Tarih"
                style={{
                  width: '120px',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />

              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  cursor: 'pointer',
                  background: 'transparent',
                }}
              />

              <button
                onClick={handleCustomApply}
                className="btn-primary"
                style={{ fontSize: '12px', padding: '0 12px' }}
              >
                <Check size={14} /> Ekle
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
