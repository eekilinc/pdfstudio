import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure PDF.js local bundled worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

// Global cached PDF instance to avoid re-parsing on each page / thumbnail
let cachedDocData: ArrayBuffer | null = null;
let cachedPdfDoc: any = null;

export async function getSharedPdfDoc(data: ArrayBuffer | null): Promise<any> {
  if (!data) return null;
  if (cachedDocData === data && cachedPdfDoc) {
    return cachedPdfDoc;
  }
  try {
    const loadingTask = pdfjsLib.getDocument({ 
      data: data.slice(0),
      disableFontFace: false,
      cMapPacked: true,
      enableXfa: true,
    });
    cachedPdfDoc = await loadingTask.promise;
    cachedDocData = data;
    return cachedPdfDoc;
  } catch (err) {
    console.error('Error loading shared PDF:', err);
    try {
      const fallbackTask = pdfjsLib.getDocument({ data: data.slice(0) });
      cachedPdfDoc = await fallbackTask.promise;
      cachedDocData = data;
      return cachedPdfDoc;
    } catch (fallbackErr) {
      console.error('Error loading shared PDF fallback:', fallbackErr);
      throw fallbackErr;
    }
  }
}

export function clearPdfCache() {
  cachedDocData = null;
  cachedPdfDoc = null;
}

export { pdfjsLib };
