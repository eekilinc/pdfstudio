import React from 'react';
import { 
  X, 
  Sparkles, 
  FileText, 
  Cpu, 
  ShieldCheck, 
  Keyboard, 
  CheckCircle2, 
  Layers,
  Zap,
  PenTool,
  ScanText,
  Scissors,
  Hash,
  GitCompare,
  Stamp,
  Lock,
  Minimize2,
  ExternalLink
} from 'lucide-react';

const GithubIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + Z', desc: 'Geri Al (Undo)' },
    { key: 'Ctrl + Y', desc: 'Yinele (Redo)' },
    { key: 'Ctrl + S', desc: 'PDF Olarak Kaydet & İndir' },
    { key: 'Ctrl + F', desc: 'Belge İçinde Hızlı Arama' },
    { key: 'V', desc: 'Seçim & Taşıma & Metin Kopyalama' },
    { key: 'H', desc: 'Kaydırma / Gezinme Aracı (Pan)' },
    { key: 'E', desc: 'Doğrudan Metin Düzenleme Aracı' },
    { key: 'P', desc: 'Canlı Çizim Kalemi' },
    { key: 'T', desc: 'Yeni Metin Kutusu Ekleme' },
    { key: 'Delete', desc: 'Seçili Nesneyi Sil' },
  ];

  const features = [
    { title: 'Doğrudan Metin Düzenleme', desc: 'PDF üzerindeki orijinal metinleri anında değiştirin, silin ve yeniden yazın.', icon: FileText, color: '#38bdf8' },
    { title: 'Tesseract OCR Motoru', desc: 'Taranmış ve resim formatındaki PDF belgelerini optik karakter tanıma ile düzenlenebilir yapın.', icon: ScanText, color: '#10b981' },
    { title: 'Sayfaları Böl & Ayıkla', desc: 'Belirli sayfa aralıklarını çıkarın veya her sayfayı tek tek bağımsız PDF yapın.', icon: Scissors, color: '#f43f5e' },
    { title: 'Sayfa Numaralandırma', desc: 'Tüm sayfalara tek tıkla otomatik başlık, altbilgi ve sayfa numarası basın.', icon: Hash, color: '#3b82f6' },
    { title: 'İki PDF Karşılaştırma', desc: 'İki farklı sözleşmeyi yan yana pencerelerde eşzamanlı kaydırarak inceleyin.', icon: GitCompare, color: '#10b981' },
    { title: 'Boyut Küçült & Optimize Et', desc: 'Yüksek kaliteli sıkıştırma profilleriyle PDF dosya boyutunu küçültün.', icon: Minimize2, color: '#f59e0b' },
    { title: 'Dijital İmza & Kaşe', desc: 'Çizerek, yazarak veya resim yükleyerek resmi sözleşme onaylama ve damgalama.', icon: Stamp, color: '#ec4899' },
    { title: 'Parola & Güvenlik Kilidi', desc: 'Belgelerinizi 128-bit AES şifreleme ve güçlü parolalarla koruma altına alın.', icon: Lock, color: '#a855f7' },
    { title: 'Canlı Çizim & Vurgulayıcı', desc: '60 FPS anlık önizleme ile yüksek hassasiyetli serbest çizim ve satır vurgulama.', icon: PenTool, color: '#f59e0b' },
    { title: 'Sayfa Yönetimi & Birleştirme', desc: 'Sayfaları döndürme, silme, çoğaltma, sıralama ve birden fazla PDF dosyasını tek dosyada birleştirme.', icon: Layers, color: '#8b5cf6' },
  ];

  const handleOpenGithub = async () => {
    const url = 'https://github.com/eekilinc/pdfstudio';
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('open_url', { url });
    } catch (_) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card animate-fade-in" style={{ width: '740px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-tertiary)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)',
            }}>
              <FileText size={20} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>PDF Studio Pro</span>
                <span style={{ fontSize: '10px', background: 'rgba(56, 189, 248, 0.2)', color: 'var(--accent-primary)', padding: '2px 6px', borderRadius: '6px' }}>v1.0.0</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Yüksek Performanslı Masaüstü PDF Düzenleme & Üretkenlik Paketi
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleOpenGithub}
              className="btn-ghost"
              data-tooltip="GitHub Kaynak Kodu & Proje"
              style={{ fontSize: '12px', padding: '6px 10px', gap: '6px', color: 'var(--text-primary)' }}
            >
              <GithubIcon size={16} />
              <span>GitHub</span>
              <ExternalLink size={12} style={{ opacity: 0.6 }} />
            </button>

            <button onClick={onClose} className="btn-icon" style={{ width: '28px', height: '28px' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Hero Banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(129, 140, 248, 0.08))',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}>
            <Sparkles size={26} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '12px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>PDF Studio Pro</strong>, %100 gizlilik odaklı mimarisiyle hiçbir veriyi sunuculara göndermeden tüm işlemleri yerel cihazınızda gerçekleştiren, modern, ultra hızlı ve kapsamlı bir masaüstü PDF aracıdır.
            </div>
          </div>

          {/* Key Features Grid */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={15} color="var(--accent-primary)" />
              <span>Kapsamlı Araçlar & Özellikler</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {features.map((f, i) => (
                <div 
                  key={i} 
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    <f.icon size={14} color={f.color} />
                    <span>{f.title}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    {f.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shortcuts Table */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Keyboard size={15} color="var(--accent-primary)" />
              <span>Klavye Kısayolları</span>
            </div>
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--border-color)' }}>
                {shortcuts.map((s, i) => (
                  <div 
                    key={i}
                    style={{
                      background: 'var(--bg-secondary)',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '11px',
                    }}
                  >
                    <span style={{ color: 'var(--text-secondary)' }}>{s.desc}</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                      {s.key}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tech Stack & Security Badges */}
          <div style={{
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: 'var(--text-muted)',
            flexWrap: 'wrap',
            gap: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Cpu size={14} color="var(--accent-primary)" />
              <span>Tauri 2.0 (Rust) + React 19 + TypeScript + PDF.js + Tesseract.js</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981' }}>
              <ShieldCheck size={14} />
              <span>%100 Yerel Çevrimdışı Güvenlik</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-tertiary)',
          fontSize: '12px',
        }}>
          <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={13} color="var(--accent-primary)" />
            <span>Telif Hakkı © 2026 PDF Studio Pro. Tüm hakları saklıdır.</span>
          </div>

          <button onClick={onClose} className="btn-primary" style={{ padding: '6px 18px', fontSize: '12px' }}>
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
