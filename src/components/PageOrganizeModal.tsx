import { RotateCw, Trash2, Copy, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import type { PDFDocumentState, PageState } from '../types/pdf';

interface PageOrganizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  docState: PDFDocumentState;
  onRotatePage: (pageIndex: number) => void;
  onRotateAllPages: () => void;
  onDuplicatePage: (pageIndex: number) => void;
  onDeletePage: (pageIndex: number) => void;
  onMovePage: (fromIndex: number, toIndex: number) => void;
}

export const PageOrganizeModal: React.FC<PageOrganizeModalProps> = ({
  isOpen,
  onClose,
  docState,
  onRotatePage,
  onRotateAllPages,
  onDuplicatePage,
  onDeletePage,
  onMovePage,
}) => {
  if (!isOpen) return null;

  const activePages = docState.pageOrder
    .map(idx => docState.pages.find(p => p.pageIndex === idx))
    .filter((p): p is PageState => p !== undefined && !p.isDeleted);

  return (
    <div className="modal-backdrop">
      <div className="modal-card animate-fade-in" style={{ width: '80vw', maxWidth: '1000px', height: '80vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '16px' }}>Sayfa Düzenleyici & Sıralayıcı</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Toplam {activePages.length} sayfa. Sayfaları döndürebilir, çoğaltabilir, sıralayabilir ve silebilirsiniz.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={onRotateAllPages}
              className="btn-ghost"
              style={{ fontSize: '12px' }}
            >
              <RotateCw size={14} /> Tüm Sayfaları Döndür
            </button>

            <button onClick={onClose} className="btn-primary" style={{ fontSize: '12px' }}>
              <Check size={14} /> Tamamla
            </button>
          </div>
        </div>

        {/* Grid Body */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '20px',
          background: 'var(--bg-workspace)',
        }}>
          {activePages.map((page, orderIndex) => (
            <div
              key={`${page.pageIndex}-${orderIndex}`}
              style={{
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.15s ease',
              }}
            >
              {/* Page Number & Navigation */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--accent-primary)',
                  background: 'rgba(56, 189, 248, 0.12)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                }}>
                  Sayfa {orderIndex + 1}
                </span>

                <div style={{ display: 'flex', gap: '2px' }}>
                  {orderIndex > 0 && (
                    <button
                      onClick={() => onMovePage(orderIndex, orderIndex - 1)}
                      className="btn-icon"
                      data-tooltip="Sola Taşı"
                      style={{ width: '22px', height: '22px' }}
                    >
                      <ArrowLeft size={13} />
                    </button>
                  )}
                  {orderIndex < activePages.length - 1 && (
                    <button
                      onClick={() => onMovePage(orderIndex, orderIndex + 1)}
                      className="btn-icon"
                      data-tooltip="Sağa Taşı"
                      style={{ width: '22px', height: '22px' }}
                    >
                      <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Preview Container */}
              <div style={{
                width: '100%',
                aspectRatio: `${page.width || 595} / ${page.height || 842}`,
                background: '#ffffff',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `rotate(${page.rotation || 0}deg)`,
                transition: 'transform 0.2s ease',
              }}>
                <span style={{ color: '#64748b', fontSize: '13px', fontWeight: 600 }}>
                  P. {page.originalPageNumber}
                </span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%', justifyContent: 'center' }}>
                <button
                  onClick={() => onRotatePage(page.pageIndex)}
                  className="btn-icon"
                  data-tooltip="90° Döndür"
                >
                  <RotateCw size={14} />
                </button>

                <button
                  onClick={() => onDuplicatePage(page.pageIndex)}
                  className="btn-icon"
                  data-tooltip="Sayfayı Çoğalt"
                >
                  <Copy size={14} />
                </button>

                {activePages.length > 1 && (
                  <button
                    onClick={() => onDeletePage(page.pageIndex)}
                    className="btn-icon"
                    data-tooltip="Sayfayı Sil"
                    style={{ color: 'var(--danger)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
