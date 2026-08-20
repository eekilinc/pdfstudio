import { useState, useEffect, useCallback } from 'react';
import type { 
  PDFDocumentState, 
  ActiveToolConfig, 
  Annotation, 
  PageState, 
  StampAnnotation,
  TextAnnotation,
  SearchMatch,
  ReaderFilter
} from './types/pdf';
import { getSharedPdfDoc, clearPdfCache } from './utils/pdfInit';
import { createSamplePdf } from './utils/samplePdf';
import { exportModifiedPdf } from './utils/pdfExport';

import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { PropertyInspector } from './components/PropertyInspector';
import { ThumbnailSidebar } from './components/ThumbnailSidebar';
import { PDFViewer } from './components/PDFViewer';

import { SignatureModal } from './components/SignatureModal';
import { StampModal } from './components/StampModal';
import { PageOrganizeModal } from './components/PageOrganizeModal';
import { MergePdfModal } from './components/MergePdfModal';
import { OcrModal } from './components/OcrModal';
import { AboutModal } from './components/AboutModal';
import { SearchBar } from './components/SearchBar';
import { WatermarkModal } from './components/WatermarkModal';
import { ExportImageModal } from './components/ExportImageModal';
import { SecurityModal } from './components/SecurityModal';
import { CompressModal } from './components/CompressModal';
import { SplitPdfModal } from './components/SplitPdfModal';
import { PageNumberingModal } from './components/PageNumberingModal';
import { ComparePdfModal } from './components/ComparePdfModal';

export function App() {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [readerFilter, setReaderFilter] = useState<ReaderFilter>('normal');

  // Zoom state
  const [zoom, setZoom] = useState<number>(1.0);

  // Document State
  const [docState, setDocState] = useState<PDFDocumentState>({
    filename: '',
    fileSize: 0,
    data: null,
    numPages: 0,
    pages: [],
    pageOrder: [],
    annotations: {},
  });

  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);

  // Undo / Redo History
  const [history, setHistory] = useState<PDFDocumentState[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchMatches, setSearchMatches] = useState<SearchMatch[]>([]);
  const [activeMatchIndex, setActiveMatchIndex] = useState<number>(-1);

  // Active Tool Configuration
  const [activeConfig, setActiveConfig] = useState<ActiveToolConfig>({
    tool: 'select',
    color: '#0f172a',
    fillColor: 'transparent',
    strokeWidth: 3,
    opacity: 1.0,
    fontSize: 16,
    fontFamily: 'Inter, sans-serif',
    fontWeight: 'normal',
    fontStyle: 'normal',
    textAlign: 'left',
    stampType: 'APPROVED',
    customStampText: 'ONAYLANDI',
    measureUnit: 'cm',
  });

  // Selected Annotation
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);

  // Modals state
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [pendingSignatureData, setPendingSignatureData] = useState<string | null>(null);

  const [isStampModalOpen, setIsStampModalOpen] = useState(false);
  const [pendingStampData, setPendingStampData] = useState<Partial<StampAnnotation> | null>(null);

  const [pendingImageData, setPendingImageData] = useState<string | null>(null);

  const [isOrganizeModalOpen, setIsOrganizeModalOpen] = useState(false);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [isOcrModalOpen, setIsOcrModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isWatermarkModalOpen, setIsWatermarkModalOpen] = useState(false);
  const [isExportImageModalOpen, setIsExportImageModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isCompressModalOpen, setIsCompressModalOpen] = useState(false);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [isPageNumberingModalOpen, setIsPageNumberingModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Sync theme attribute to HTML tag
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Load startup file passed via CLI / "Open With" or fallback to sample PDF
  useEffect(() => {
    loadStartupFileOrSample();
  }, []);

  // Native window Drag & Drop listener for PDFs
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (file.name.toLowerCase().endsWith('.pdf')) {
          handleOpenPdfFile(file);
        }
      }
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);
    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  const loadStartupFileOrSample = async () => {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const startupPath = await invoke<string | null>('get_startup_file');
      if (startupPath) {
        const fileBytes = await invoke<number[]>('read_pdf_file', { path: startupPath });
        const buffer = new Uint8Array(fileBytes).buffer;
        const filename = startupPath.split(/[\\/]/).pop() || 'Belge.pdf';
        await parseAndSetPdf(buffer, filename, fileBytes.length);
        return;
      }
    } catch (_) {
      // In browser or standalone mode without CLI args
    }
    loadSampleDocument();
  };

  // Helper to commit state into Undo/Redo stack
  const updateDocWithHistory = useCallback((updater: (prev: PDFDocumentState) => PDFDocumentState) => {
    setDocState((prev) => {
      const nextState = updater(prev);
      setHistory((prevHist) => {
        const sliced = prevHist.slice(0, historyIndex + 1);
        return [...sliced, nextState];
      });
      setHistoryIndex((prevIdx) => prevIdx + 1);
      return nextState;
    });
  }, [historyIndex]);

  // Helper to parse PDF ArrayBuffer and build page states instantaneously
  const parseAndSetPdf = async (arrayBuffer: ArrayBuffer, filename: string, fileSize: number) => {
    try {
      clearPdfCache();
      const pdf = await getSharedPdfDoc(arrayBuffer);
      if (!pdf) throw new Error('PDF yüklenemedi');

      const numPages = pdf.numPages;

      // Sample first page for default viewport dimensions
      const firstPage = await pdf.getPage(1);
      const defaultViewport = firstPage.getViewport({ scale: 1.0 });
      const defaultW = defaultViewport.width || 595.28;
      const defaultH = defaultViewport.height || 841.89;

      const pages: PageState[] = [];
      const pageOrder: number[] = [];

      for (let i = 1; i <= numPages; i++) {
        const pageIdx = i - 1;
        pages.push({
          pageIndex: pageIdx,
          originalPageNumber: i,
          displayPageNumber: i,
          rotation: 0,
          width: defaultW,
          height: defaultH,
          aspectRatio: defaultW / defaultH,
        });
        pageOrder.push(pageIdx);
      }

      const initialDoc: PDFDocumentState = {
        filename,
        fileSize,
        data: arrayBuffer,
        numPages,
        pages,
        pageOrder,
        annotations: {},
      };

      setDocState(initialDoc);
      setHistory([initialDoc]);
      setHistoryIndex(0);
      setCurrentPageIndex(0);
      setSelectedAnnotation(null);
      setSearchMatches([]);
      setActiveMatchIndex(-1);
    } catch (err) {
      console.error('PDF parsing error:', err);
      alert('PDF dosyası açılırken bir hata oluştu.');
    }
  };

  const loadSampleDocument = async () => {
    try {
      const sampleBytes = await createSamplePdf();
      const buffer = sampleBytes.buffer.slice(sampleBytes.byteOffset, sampleBytes.byteOffset + sampleBytes.byteLength);
      await parseAndSetPdf(buffer as ArrayBuffer, 'Ornek_Sozlesme_Sablonu.pdf', sampleBytes.byteLength);
    } catch (e) {
      console.error('Failed to create sample PDF:', e);
    }
  };

  const handleOpenPdfFile = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    await parseAndSetPdf(arrayBuffer, file.name, file.size);
  };

  // Undo / Redo Handlers
  const handleUndo = () => {
    if (historyIndex > 0) {
      const targetIndex = historyIndex - 1;
      setDocState(history[targetIndex]);
      setHistoryIndex(targetIndex);
      setSelectedAnnotation(null);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const targetIndex = historyIndex + 1;
      setDocState(history[targetIndex]);
      setHistoryIndex(targetIndex);
      setSelectedAnnotation(null);
    }
  };

  // Export PDF Handler
  const handleExportPdf = async () => {
    if (!docState.data) return;

    try {
      const exportedBytes = await exportModifiedPdf(docState);
      const blob = new Blob([exportedBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      const baseName = docState.filename ? docState.filename.replace('.pdf', '') : 'Belge';
      a.download = `${baseName}_Duzenlenmis.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      alert('PDF dışa aktarılırken bir hata oluştu: ' + (err as Error).message);
    }
  };

  // Print PDF Handler
  const handlePrint = async () => {
    if (!docState.data) return;
    try {
      const exportedBytes = await exportModifiedPdf(docState);
      const blob = new Blob([exportedBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        iframe.contentWindow?.print();
      };
    } catch (err) {
      console.error('Print error:', err);
    }
  };

  // Page Operations
  const handleRotatePage = (pageIndex: number) => {
    updateDocWithHistory((prev) => ({
      ...prev,
      pages: prev.pages.map((p) =>
        p.pageIndex === pageIndex ? { ...p, rotation: ((p.rotation || 0) + 90) % 360 } : p
      ),
    }));
  };

  const handleRotateAllPages = () => {
    updateDocWithHistory((prev) => ({
      ...prev,
      pages: prev.pages.map((p) => ({ ...p, rotation: ((p.rotation || 0) + 90) % 360 })),
    }));
  };

  const handleDuplicatePage = (pageIndex: number) => {
    const pageToDup = docState.pages.find((p) => p.pageIndex === pageIndex);
    if (!pageToDup) return;

    const newPageIndex = Math.max(...docState.pages.map((p) => p.pageIndex)) + 1;
    const newPage: PageState = {
      ...pageToDup,
      pageIndex: newPageIndex,
    };

    updateDocWithHistory((prev) => {
      const currentOrderIdx = prev.pageOrder.indexOf(pageIndex);
      const newOrder = [...prev.pageOrder];
      newOrder.splice(currentOrderIdx + 1, 0, newPageIndex);

      return {
        ...prev,
        pages: [...prev.pages, newPage],
        pageOrder: newOrder,
        annotations: {
          ...prev.annotations,
          [newPageIndex]: prev.annotations[pageIndex] ? [...prev.annotations[pageIndex]] : [],
        },
      };
    });
  };

  const handleDeletePage = (pageIndex: number) => {
    updateDocWithHistory((prev) => ({
      ...prev,
      pages: prev.pages.map((p) => (p.pageIndex === pageIndex ? { ...p, isDeleted: true } : p)),
    }));
  };

  const handleMovePage = (fromOrderIndex: number, toOrderIndex: number) => {
    updateDocWithHistory((prev) => {
      const newOrder = [...prev.pageOrder];
      const [moved] = newOrder.splice(fromOrderIndex, 1);
      newOrder.splice(toOrderIndex, 0, moved);
      return {
        ...prev,
        pageOrder: newOrder,
      };
    });
  };

  const handleAddBlankPage = () => {
    const newPageIndex = docState.pages.length > 0 ? Math.max(...docState.pages.map((p) => p.pageIndex)) + 1 : 0;
    const newPage: PageState = {
      pageIndex: newPageIndex,
      originalPageNumber: 0,
      displayPageNumber: docState.pageOrder.length + 1,
      rotation: 0,
      width: 595.28,
      height: 841.89,
      aspectRatio: 595.28 / 841.89,
      isBlank: true,
    };

    updateDocWithHistory((prev) => ({
      ...prev,
      pages: [...prev.pages, newPage],
      pageOrder: [...prev.pageOrder, newPageIndex],
    }));
  };

  // Direct Page Number Navigation (1-based)
  const handlePageNumberJump = (targetPageNumber: number) => {
    const activePages = docState.pageOrder
      .map(idx => docState.pages.find(p => p.pageIndex === idx))
      .filter((p): p is PageState => p !== undefined && !p.isDeleted);

    const targetPage = activePages[targetPageNumber - 1];
    if (targetPage) {
      setCurrentPageIndex(targetPage.pageIndex);
    }
  };

  // Annotations Operations
  const handleAddAnnotation = (pageIndex: number, ann: Annotation) => {
    updateDocWithHistory((prev) => {
      const existing = prev.annotations[pageIndex] || [];
      return {
        ...prev,
        annotations: {
          ...prev.annotations,
          [pageIndex]: [...existing, ann],
        },
      };
    });
  };

  const handleUpdateAnnotation = (pageIndex: number, ann: Annotation) => {
    setDocState((prev) => {
      const existing = prev.annotations[pageIndex] || [];
      return {
        ...prev,
        annotations: {
          ...prev.annotations,
          [pageIndex]: existing.map((item) => (item.id === ann.id ? ann : item)),
        },
      };
    });
    setSelectedAnnotation(ann);
  };

  const handleDeleteAnnotationById = (pageIndex: number, annId: string) => {
    updateDocWithHistory((prev) => {
      const existing = prev.annotations[pageIndex] || [];
      return {
        ...prev,
        annotations: {
          ...prev.annotations,
          [pageIndex]: existing.filter((item) => item.id !== annId),
        },
      };
    });
    if (selectedAnnotation?.id === annId) {
      setSelectedAnnotation(null);
    }
  };

  const handleDeleteSelectedAnnotation = () => {
    if (!selectedAnnotation) return;
    handleDeleteAnnotationById(selectedAnnotation.pageIndex, selectedAnnotation.id);
  };

  const handleDuplicateSelectedAnnotation = () => {
    if (!selectedAnnotation) return;
    const pageIndex = selectedAnnotation.pageIndex;
    const duplicated: Annotation = {
      ...selectedAnnotation,
      id: Math.random().toString(36).substring(2, 9),
      x: selectedAnnotation.x + 20,
      y: selectedAnnotation.y + 20,
    };

    handleAddAnnotation(pageIndex, duplicated);
    setSelectedAnnotation(duplicated);
  };

  const handleBringForward = () => {
    if (!selectedAnnotation) return;
    const pageIndex = selectedAnnotation.pageIndex;

    setDocState((prev) => {
      const list = prev.annotations[pageIndex] || [];
      const idx = list.findIndex((a) => a.id === selectedAnnotation.id);
      if (idx < 0 || idx >= list.length - 1) return prev;
      const nextList = [...list];
      const [item] = nextList.splice(idx, 1);
      nextList.splice(idx + 1, 0, item);
      return {
        ...prev,
        annotations: { ...prev.annotations, [pageIndex]: nextList },
      };
    });
  };

  const handleSendBackward = () => {
    if (!selectedAnnotation) return;
    const pageIndex = selectedAnnotation.pageIndex;

    setDocState((prev) => {
      const list = prev.annotations[pageIndex] || [];
      const idx = list.findIndex((a) => a.id === selectedAnnotation.id);
      if (idx <= 0) return prev;
      const nextList = [...list];
      const [item] = nextList.splice(idx, 1);
      nextList.splice(idx - 1, 0, item);
      return {
        ...prev,
        annotations: { ...prev.annotations, [pageIndex]: nextList },
      };
    });
  };

  // OCR Apply Handler
  const handleApplyOcrAnnotations = (pageIndex: number, ocrLines: TextAnnotation[]) => {
    updateDocWithHistory((prev) => {
      const existing = prev.annotations[pageIndex] || [];
      return {
        ...prev,
        annotations: {
          ...prev.annotations,
          [pageIndex]: [...existing, ...ocrLines],
        },
      };
    });
  };

  // Watermark Apply Handler
  const handleApplyWatermark = (watermarkMap: Record<number, TextAnnotation[]>) => {
    updateDocWithHistory((prev) => {
      const nextAnnotations = { ...prev.annotations };
      Object.keys(watermarkMap).forEach((pIdxStr) => {
        const pIdx = Number(pIdxStr);
        const existing = nextAnnotations[pIdx] || [];
        nextAnnotations[pIdx] = [...existing, ...watermarkMap[pIdx]];
      });
      return {
        ...prev,
        annotations: nextAnnotations,
      };
    });
  };

  // Page Numbering Apply Handler
  const handleApplyPageNumbers = (numMap: Record<number, TextAnnotation[]>) => {
    updateDocWithHistory((prev) => {
      const nextAnnotations = { ...prev.annotations };
      Object.keys(numMap).forEach((pIdxStr) => {
        const pIdx = Number(pIdxStr);
        const existing = nextAnnotations[pIdx] || [];
        nextAnnotations[pIdx] = [...existing, ...numMap[pIdx]];
      });
      return {
        ...prev,
        annotations: nextAnnotations,
      };
    });
  };

  // Insert Image Handler
  const handleInsertImage = async (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPendingImageData(dataUrl);
      setActiveConfig((prev) => ({ ...prev, tool: 'image' }));
    };
    reader.readAsDataURL(file);
  };

  // Search Match Selection Handler
  const handleActiveMatchChange = (index: number) => {
    setActiveMatchIndex(index);
    if (searchMatches[index]) {
      setCurrentPageIndex(searchMatches[index].pageIndex);
    }
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleExportPdf();
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedAnnotation && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        handleDeleteSelectedAnnotation();
      }
      if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        if (e.key.toLowerCase() === 'v') setActiveConfig((prev) => ({ ...prev, tool: 'select' }));
        if (e.key.toLowerCase() === 'h') setActiveConfig((prev) => ({ ...prev, tool: 'pan' }));
        if (e.key.toLowerCase() === 'p') setActiveConfig((prev) => ({ ...prev, tool: 'pen' }));
        if (e.key.toLowerCase() === 't') setActiveConfig((prev) => ({ ...prev, tool: 'text' }));
        if (e.key.toLowerCase() === 'e') setActiveConfig((prev) => ({ ...prev, tool: 'edit-text' }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history, selectedAnnotation, docState]);

  const activePages = docState.pageOrder
    .map(idx => docState.pages.find(p => p.pageIndex === idx))
    .filter((p): p is PageState => p !== undefined && !p.isDeleted);
  
  const currentActualPageOrderIndex = activePages.findIndex(p => p.pageIndex === currentPageIndex);
  const currentDisplayPageNumber = currentActualPageOrderIndex !== -1 ? currentActualPageOrderIndex + 1 : 1;
  const currentActualPage = activePages.find(p => p.pageIndex === currentPageIndex) || activePages[0];

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      {/* 1. Top Header */}
      <Header
        docState={docState}
        currentPageNumber={currentDisplayPageNumber}
        totalPages={activePages.length}
        onPageNumberChange={handlePageNumberJump}
        onOpenPdf={handleOpenPdfFile}
        onLoadSample={loadSampleDocument}
        onExportPdf={handleExportPdf}
        onPrint={handlePrint}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        zoom={zoom}
        onZoomChange={setZoom}
        onFitWidth={() => setZoom(1.25)}
        onFitPage={() => setZoom(0.85)}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onOpenOrganizeModal={() => setIsOrganizeModalOpen(true)}
        onOpenMergeModal={() => setIsMergeModalOpen(true)}
        onOpenSplitModal={() => setIsSplitModalOpen(true)}
        onOpenPageNumberingModal={() => setIsPageNumberingModalOpen(true)}
        onOpenCompareModal={() => setIsCompareModalOpen(true)}
        onOpenAboutModal={() => setIsAboutModalOpen(true)}
        onOpenWatermarkModal={() => setIsWatermarkModalOpen(true)}
        onOpenExportImageModal={() => setIsExportImageModalOpen(true)}
        onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
        onOpenCompressModal={() => setIsCompressModalOpen(true)}
        readerFilter={readerFilter}
        onReaderFilterChange={setReaderFilter}
        isSearchOpen={isSearchOpen}
        onToggleSearch={() => setIsSearchOpen(!isSearchOpen)}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* 2. Main Tool Palette */}
      <Toolbar
        activeConfig={activeConfig}
        onSelectTool={(tool) => {
          setActiveConfig((prev) => ({ ...prev, tool }));
          if (tool !== 'select') setSelectedAnnotation(null);
        }}
        onOpenSignatureModal={() => setIsSignatureModalOpen(true)}
        onOpenStampModal={() => setIsStampModalOpen(true)}
        onOpenOcrModal={() => setIsOcrModalOpen(true)}
        onInsertImage={handleInsertImage}
      />

      {/* 3. Dynamic Property Inspector */}
      <PropertyInspector
        activeConfig={activeConfig}
        selectedAnnotation={selectedAnnotation}
        onUpdateConfig={(partial) => setActiveConfig((prev) => ({ ...prev, ...partial }))}
        onUpdateSelectedAnnotation={(partial) => {
          if (selectedAnnotation) {
            handleUpdateAnnotation(selectedAnnotation.pageIndex, {
              ...selectedAnnotation,
              ...partial,
            } as Annotation);
          }
        }}
        onDeleteSelectedAnnotation={handleDeleteSelectedAnnotation}
        onDuplicateSelectedAnnotation={handleDuplicateSelectedAnnotation}
        onBringForward={handleBringForward}
        onSendBackward={handleSendBackward}
      />

      {/* 4. Search Bar Overlay */}
      <SearchBar
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        docState={docState}
        onMatchesFound={(matches, initialActive) => {
          setSearchMatches(matches);
          setActiveMatchIndex(initialActive);
          if (matches.length > 0 && matches[0]) {
            setCurrentPageIndex(matches[0].pageIndex);
          }
        }}
        onActiveMatchChange={handleActiveMatchChange}
        activeMatchIndex={activeMatchIndex}
      />

      {/* 5. Central Workspace Area (Sidebar + Canvas Viewer) */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {sidebarOpen && (
          <ThumbnailSidebar
            docState={docState}
            currentPageIndex={currentPageIndex}
            onSelectPage={setCurrentPageIndex}
            onRotatePage={handleRotatePage}
            onDuplicatePage={handleDuplicatePage}
            onDeletePage={handleDeletePage}
            onMovePage={handleMovePage}
            onAddBlankPage={handleAddBlankPage}
          />
        )}

        <PDFViewer
          docState={docState}
          currentPageIndex={currentPageIndex}
          onPageChange={setCurrentPageIndex}
          activeConfig={activeConfig}
          selectedAnnotation={selectedAnnotation}
          onSelectAnnotation={setSelectedAnnotation}
          onAddAnnotation={handleAddAnnotation}
          onUpdateAnnotation={handleUpdateAnnotation}
          onDeleteAnnotation={handleDeleteAnnotationById}
          zoom={zoom}
          pendingSignatureData={pendingSignatureData}
          pendingStampData={pendingStampData}
          pendingImageData={pendingImageData}
          onConsumePendingSignature={() => {
            setPendingSignatureData(null);
            setActiveConfig((prev) => ({ ...prev, tool: 'select' }));
          }}
          onConsumePendingStamp={() => {
            setPendingStampData(null);
            setActiveConfig((prev) => ({ ...prev, tool: 'select' }));
          }}
          onConsumePendingImage={() => {
            setPendingImageData(null);
            setActiveConfig((prev) => ({ ...prev, tool: 'select' }));
          }}
          searchMatches={searchMatches}
          activeMatchIndex={activeMatchIndex}
          readerFilter={readerFilter}
          onZoomChange={setZoom}
        />
      </div>

      {/* 6. Modals */}
      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onApplySignature={(dataUrl) => {
          setPendingSignatureData(dataUrl);
          setActiveConfig((prev) => ({ ...prev, tool: 'signature' }));
        }}
      />

      <StampModal
        isOpen={isStampModalOpen}
        onClose={() => setIsStampModalOpen(false)}
        onApplyStamp={(stamp) => {
          setPendingStampData(stamp);
          setActiveConfig((prev) => ({ ...prev, tool: 'stamp' }));
        }}
      />

      <PageOrganizeModal
        isOpen={isOrganizeModalOpen}
        onClose={() => setIsOrganizeModalOpen(false)}
        docState={docState}
        onRotatePage={handleRotatePage}
        onRotateAllPages={handleRotateAllPages}
        onDuplicatePage={handleDuplicatePage}
        onDeletePage={handleDeletePage}
        onMovePage={handleMovePage}
      />

      <MergePdfModal
        isOpen={isMergeModalOpen}
        onClose={() => setIsMergeModalOpen(false)}
        onApplyMerged={async (mergedBytes, filename) => {
          const buffer = mergedBytes.buffer.slice(mergedBytes.byteOffset, mergedBytes.byteOffset + mergedBytes.byteLength);
          await parseAndSetPdf(buffer as ArrayBuffer, filename, mergedBytes.byteLength);
        }}
      />

      <SplitPdfModal
        isOpen={isSplitModalOpen}
        onClose={() => setIsSplitModalOpen(false)}
        docState={docState}
      />

      <PageNumberingModal
        isOpen={isPageNumberingModalOpen}
        onClose={() => setIsPageNumberingModalOpen(false)}
        totalPages={activePages.length}
        onApplyPageNumbers={handleApplyPageNumbers}
        pageWidth={currentActualPage?.width}
        pageHeight={currentActualPage?.height}
      />

      <ComparePdfModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        primaryDocState={docState}
      />

      <OcrModal
        isOpen={isOcrModalOpen}
        onClose={() => setIsOcrModalOpen(false)}
        docData={docState.data}
        pageNumber={currentActualPage?.originalPageNumber || 1}
        pageIndex={currentActualPage?.pageIndex ?? 0}
        onApplyOcrAnnotations={handleApplyOcrAnnotations}
      />

      <WatermarkModal
        isOpen={isWatermarkModalOpen}
        onClose={() => setIsWatermarkModalOpen(false)}
        totalPages={activePages.length}
        currentPageIndex={currentPageIndex}
        onApplyWatermark={handleApplyWatermark}
        pageWidth={currentActualPage?.width}
        pageHeight={currentActualPage?.height}
      />

      <ExportImageModal
        isOpen={isExportImageModalOpen}
        onClose={() => setIsExportImageModalOpen(false)}
        docState={docState}
        currentPageNumber={currentDisplayPageNumber}
      />

      <SecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        docState={docState}
      />

      <CompressModal
        isOpen={isCompressModalOpen}
        onClose={() => setIsCompressModalOpen(false)}
        docState={docState}
      />

      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />
    </div>
  );
}

export default App;
