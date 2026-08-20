import React, { useState } from 'react';
import { X, Stamp, Check } from 'lucide-react';
import type { WatermarkConfig, TextAnnotation } from '../types/pdf';

interface WatermarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalPages: number;
  currentPageIndex: number;
  onApplyWatermark: (annotationsMap: Record<number, TextAnnotation[]>) => void;
  pageWidth?: number;
  pageHeight?: number;
}

const PRESET_WATERMARKS = [
  'GİZLİDİR',
  'TASLAK',
  'KOPYA EDİLEMEZ',
  'ÖZEL & GİZLİ',
  'ONAYLANDI',
  'ÖNİZLEME',
  'ŞİRKET İÇİ',
];

const PRESET_COLORS = ['#e11d48', '#0284c7', '#475569', '#d97706', '#16a34a', '#7c3aed'];

export const WatermarkModal: React.FC<WatermarkModalProps> = ({
  isOpen,
  onClose,
  totalPages,
  currentPageIndex,
  onApplyWatermark,
  pageWidth = 595.28,
  pageHeight = 841.89,
}) => {
  const [config, setConfig] = useState<WatermarkConfig>({
    text: 'GİZLİDİR',
    color: '#e11d48',
    opacity: 0.22,
    fontSize: 54,
    rotation: -35,
    allPages: true,
  });

  if (!isOpen) return null;

  const handleApply = () => {
    if (!config.text.trim()) return;

    const annotationsMap: Record<number, TextAnnotation[]> = {};
    const targetPages = config.allPages
      ? Array.from({ length: totalPages }, (_, i) => i)
      : [currentPageIndex];

    targetPages.forEach((pIdx) => {
      const centerX = Math.round(pageWidth / 2 - 140);
      const centerY = Math.round(pageHeight / 2 - 30);

      const watermarkAnn: TextAnnotation = {
        id: `wm-${pIdx}-${Math.random().toString(36).substring(2, 7)}`,
        pageIndex: pIdx,
        type: 'text',
        x: centerX,
        y: centerY,
        width: 320,
        height: 60,
        text: config.text,
        fontSize: config.fontSize,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
        color: config.color,
        opacity: config.opacity,
        rotation: config.rotation,
        textAlign: 'center',
      };

      annotationsMap[pIdx] = [watermarkAnn];
    });

    onApplyWatermark(annotationsMap);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card animate-fade-in" style={{ width: '560px' }}>
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
            <span>Filigran / Damga Ekle (Watermark)</span>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: '28px', height: '28px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Quick Presets */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
              Hazır Şablonlar:
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {PRESET_WATERMARKS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setConfig({ ...config, text: preset })}
                  className={`btn-ghost ${config.text === preset ? 'active' : ''}`}
                  style={{ fontSize: '11px', padding: '4px 10px', borderRadius: 'var(--radius-sm)' }}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Text Input */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Filigran Metni:
            </label>
            <input
              type="text"
              value={config.text}
              onChange={(e) => setConfig({ ...config, text: e.target.value })}
              placeholder="Örn: ŞİRKET İÇİ GİZLİ BELGE"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                fontWeight: 600,
                outline: 'none',
              }}
            />
          </div>

          {/* Sliders Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* Opacity */}
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Saydamlık (Opaklık):</span>
                <span>%{Math.round(config.opacity * 100)}</span>
              </label>
              <input
                type="range"
                min={0.05}
                max={0.8}
                step={0.05}
                value={config.opacity}
                onChange={(e) => setConfig({ ...config, opacity: Number(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
              />
            </div>

            {/* Font Size */}
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Yazı Boyutu:</span>
                <span>{config.fontSize} pt</span>
              </label>
              <input
                type="range"
                min={28}
                max={84}
                step={2}
                value={config.fontSize}
                onChange={(e) => setConfig({ ...config, fontSize: Number(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
              />
            </div>
          </div>

          {/* Color & Scope */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Renk:</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {PRESET_COLORS.map((c) => (
                  <div
                    key={c}
                    onClick={() => setConfig({ ...config, color: c })}
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: c,
                      cursor: 'pointer',
                      border: config.color === c ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                      transform: config.color === c ? 'scale(1.15)' : 'scale(1)',
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={config.allPages}
                  onChange={(e) => setConfig({ ...config, allPages: e.target.checked })}
                  style={{ accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                />
                <span>Tüm Sayfalara Uygula ({totalPages} Sayfa)</span>
              </label>
            </div>
          </div>

          {/* Live Preview Box */}
          <div style={{
            height: '110px',
            background: '#ffffff',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{
              fontSize: `${Math.round(config.fontSize * 0.6)}px`,
              fontWeight: 800,
              color: config.color,
              opacity: config.opacity,
              transform: `rotate(${config.rotation}deg)`,
              userSelect: 'none',
              letterSpacing: '2px',
              textAlign: 'center',
            }}>
              {config.text || 'FİLİGRAN'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-tertiary)',
        }}>
          <button onClick={onClose} className="btn-ghost" style={{ fontSize: '13px' }}>
            İptal
          </button>

          <button onClick={handleApply} className="btn-primary" style={{ fontSize: '13px' }}>
            <Check size={16} /> Filigranı Ekle
          </button>
        </div>
      </div>
    </div>
  );
};
