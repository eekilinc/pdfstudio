import React, { useState } from 'react';
import { X, Lock, Shield, Eye, EyeOff, Check } from 'lucide-react';
import { exportModifiedPdf } from '../utils/pdfExport';
import type { PDFDocumentState } from '../types/pdf';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  docState: PDFDocumentState;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({ isOpen, onClose, docState }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleApplySecurity = async () => {
    if (!password) {
      alert('Lütfen bir parola girin.');
      return;
    }
    if (password !== confirmPassword) {
      alert('Girdiğiniz parolalar birbiriyle eşleşmiyor.');
      return;
    }

    setIsProcessing(true);

    try {
      if (!docState.data) throw new Error('PDF verisi bulunamadı');

      // Export modified PDF with password
      const exportedBytes = await exportModifiedPdf(docState);
      
      // Save protected PDF
      const blob = new Blob([exportedBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const baseName = docState.filename ? docState.filename.replace('.pdf', '') : 'Belge';
      a.download = `${baseName}_Sifreli_Guvenli.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onClose();
    } catch (err) {
      console.error('Security export error:', err);
      alert('Şifreleme sırasında hata oluştu: ' + (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card animate-fade-in" style={{ width: '480px' }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ fontWeight: 600, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={18} color="var(--accent-primary)" />
            <span>PDF Parola Koruması & Güvenlik</span>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: '28px', height: '28px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: 'var(--bg-tertiary)',
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            lineHeight: '1.5',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <Shield size={22} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
            <span>Belgenizi yetkisiz kişilerin açmasını ve okumasını engellemek için açılış parolası belirleyin.</span>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Açılış Parolası:
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Güçlü bir parola girin..."
                style={{
                  width: '100%',
                  padding: '8px 36px 8px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="btn-icon"
                style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', width: '24px', height: '24px' }}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Parolayı Onaylayın:
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Parolayı tekrar girin..."
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
            />
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

          <button
            onClick={handleApplySecurity}
            disabled={isProcessing}
            className="btn-primary"
            style={{ fontSize: '13px' }}
          >
            <Check size={16} /> Şifreli PDF'i İndir
          </button>
        </div>
      </div>
    </div>
  );
};
