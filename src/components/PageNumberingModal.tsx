import React, { useState } from 'react';
import { X, Hash, Check } from 'lucide-react';
import type { TextAnnotation, PageNumberingConfig } from '../types/pdf';

interface PageNumberingModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalPages: number;
  onApplyPageNumbers: (annotationsMap: Record<number, TextAnnotation[]>) => void;
  pageWidth?: number;
  pageHeight?: number;
}

export const PageNumberingModal: React.FC<PageNumberingModalProps> = ({
  isOpen,
  onClose,
  totalPages,
  onApplyPageNumbers,
  pageWidth = 595.28,
  pageHeight = 841.89,
}) => {
  const [config, setConfig] = useState<PageNumberingConfig>({
    format: 'page_total',
    position: 'bottom-center',
    startPage: 1,
    fontSize: 10,
    color: '#64748b',
    fontFamily: 'Inter, sans-serif',
  });

  const [skipFirstPage, setSkipFirstPage] = useState(false);

  if (!isOpen) return null;

  const formatText = (pageNum: number, total: number, format: PageNumberingConfig['format']) => {
    switch (format) {
      case 'page_total': return `Sayfa ${pageNum} / ${total}`;
      case 'simple': return `${pageNum}`;
      case 'dash': return `- ${pageNum} -`;
      case 'page_only': return `Sayfa ${pageNum}`;
      case 'page_of_total': return `Page ${pageNum} of ${total}`;
      default: return `${pageNum}`;
    }
  };

  const handleApply = () => {
    const annotationsMap: Record<number, TextAnnotation[]> = {};
    const margin = 28;

    for (let i = 0; i < totalPages; i++) {
      const pageNum = i + 1;
      if (skipFirstPage && pageNum === 1) continue;

      const effectivePageNum = skipFirstPage ? pageNum - 1 : pageNum;
      const effectiveTotal = skipFirstPage ? totalPages - 1 : totalPages;
      const text = formatText(effectivePageNum, effectiveTotal, config.format);

      let x = margin;
      let y = pageHeight - margin - 15;
      let textAlign: 'left' | 'center' | 'right' = 'center';

      switch (config.position) {
        case 'bottom-left':
          x = margin;
          y = pageHeight - margin - 15;
          textAlign = 'left';
          break;
        case 'bottom-center':
          x = pageWidth / 2 - 80;
          y = pageHeight - margin - 15;
          textAlign = 'center';
          break;
        case 'bottom-right':
          x = pageWidth - margin - 160;
          y = pageHeight - margin - 15;
          textAlign = 'right';
          break;
        case 'top-left':
          x = margin;
          y = margin;
          textAlign = 'left';
          break;
        case 'top-center':
          x = pageWidth / 2 - 80;
          y = margin;
          textAlign = 'center';
          break;
        case 'top-right':
          x = pageWidth - margin - 160;
          y = margin;
          textAlign = 'right';
          break;
      }

      const numAnn: TextAnnotation = {
        id: `num-${i}-${Math.random().toString(36).substring(2, 7)}`,
        pageIndex: i,
        type: 'text',
        x: Math.round(x),
        y: Math.round(y),
        width: 160,
        height: 20,
        text: text,
        fontSize: config.fontSize,
        fontFamily: config.fontFamily,
        color: config.color,
        textAlign: textAlign,
      };

      annotationsMap[i] = [numAnn];
    }

    onApplyPageNumbers(annotationsMap);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card animate-fade-in" style={{ width: '500px' }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ fontWeight: 600, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Hash size={18} color="var(--accent-primary)" />
            <span>Otomatik Sayfa Numaralandırma & Altbilgi</span>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: '28px', height: '28px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Format Selection */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Numaralandırma Formatı:
            </label>
            <select
              value={config.format}
              onChange={(e) => setConfig({ ...config, format: e.target.value as any })}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                outline: 'none',
              }}
            >
              <option value="page_total">Sayfa 1 / {totalPages} (Önerilen Standart)</option>
              <option value="simple">1, 2, 3... (Sade Numara)</option>
              <option value="dash">- 1 -, - 2 - (Tireli)</option>
              <option value="page_only">Sayfa 1, Sayfa 2</option>
              <option value="page_of_total">Page 1 of {totalPages} (İngilizce)</option>
            </select>
          </div>

          {/* Position Selection */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Sayfadaki Konumu:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
              {[
                { id: 'top-left', label: 'Sol Üst' },
                { id: 'top-center', label: 'Orta Üst' },
                { id: 'top-right', label: 'Sağ Üst' },
                { id: 'bottom-left', label: 'Sol Alt' },
                { id: 'bottom-center', label: 'Orta Alt (Klasik)' },
                { id: 'bottom-right', label: 'Sağ Alt' },
              ].map((pos) => (
                <button
                  key={pos.id}
                  onClick={() => setConfig({ ...config, position: pos.id as any })}
                  className={`btn-ghost ${config.position === pos.id ? 'active' : ''}`}
                  style={{ fontSize: '11px', padding: '6px', justifyContent: 'center' }}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font & Skip Options */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Yazı Boyutu: {config.fontSize} pt
              </label>
              <input
                type="range"
                min={8}
                max={16}
                value={config.fontSize}
                onChange={(e) => setConfig({ ...config, fontSize: Number(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={skipFirstPage}
                  onChange={(e) => setSkipFirstPage(e.target.checked)}
                  style={{ accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                />
                <span>İlk Sayfayı (Kapak) Atla</span>
              </label>
            </div>
          </div>

          {/* Preview Box */}
          <div style={{
            padding: '12px',
            background: '#ffffff',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: config.color,
            fontSize: `${config.fontSize}px`,
            fontFamily: config.fontFamily,
            fontWeight: 500,
          }}>
            Önizleme: {formatText(skipFirstPage ? 1 : 1, skipFirstPage ? totalPages - 1 : totalPages, config.format)}
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
            <Check size={16} /> Sayfa Numaralarını Ekle
          </button>
        </div>
      </div>
    </div>
  );
};
