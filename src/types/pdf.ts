export type ToolType = 
  | 'select'
  | 'pan'
  | 'edit-text'
  | 'pen'
  | 'highlighter'
  | 'text'
  | 'rect'
  | 'circle'
  | 'line'
  | 'arrow'
  | 'stamp'
  | 'signature'
  | 'image'
  | 'measure'
  | 'checkbox'
  | 'redact'
  | 'eraser';

export type AnnotationType = 
  | 'pen'
  | 'highlighter'
  | 'text'
  | 'rect'
  | 'circle'
  | 'line'
  | 'arrow'
  | 'stamp'
  | 'signature'
  | 'image'
  | 'measure'
  | 'checkbox'
  | 'redact';

export interface Point {
  x: number;
  y: number;
}

export interface BaseAnnotation {
  id: string;
  pageIndex: number;
  type: AnnotationType;
  x: number; // PDF points coordinate (0 to page width)
  y: number; // PDF points coordinate (0 to page height)
  width: number;
  height: number;
  color: string;
  fillColor?: string;
  strokeWidth?: number;
  opacity?: number;
  rotation?: number; // in degrees
  zIndex?: number;
}

export interface DrawingAnnotation extends BaseAnnotation {
  type: 'pen' | 'highlighter';
  points: Point[];
}

export interface TextAnnotation extends BaseAnnotation {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right';
  backgroundColor?: string;
}

export interface ShapeAnnotation extends BaseAnnotation {
  type: 'rect' | 'circle' | 'line' | 'arrow';
  endX?: number;
  endY?: number;
}

export interface SignatureAnnotation extends BaseAnnotation {
  type: 'signature';
  imageData: string; // Base64 data URL
}

export interface ImageAnnotation extends BaseAnnotation {
  type: 'image';
  imageData: string; // Base64 data URL
}

export interface MeasurementAnnotation extends BaseAnnotation {
  type: 'measure';
  endX: number;
  endY: number;
  distancePt: number;
  distanceFormatted: string;
  unit: 'cm' | 'mm' | 'in' | 'pt';
  scaleRatio?: number; // e.g. 1 pt = 1 unit
}

export interface CheckboxAnnotation extends BaseAnnotation {
  type: 'checkbox';
  checked: boolean;
  label?: string;
}

export interface StampAnnotation extends BaseAnnotation {
  type: 'stamp';
  stampType: 'APPROVED' | 'CONFIDENTIAL' | 'REJECTED' | 'DRAFT' | 'FINAL' | 'COMPLETED' | 'CUSTOM';
  customText?: string;
  subtitle?: string;
  date?: string;
}

export interface RedactionAnnotation extends BaseAnnotation {
  type: 'redact';
  isApplied?: boolean;
}

export type Annotation = 
  | DrawingAnnotation
  | TextAnnotation
  | ShapeAnnotation
  | SignatureAnnotation
  | ImageAnnotation
  | MeasurementAnnotation
  | CheckboxAnnotation
  | StampAnnotation
  | RedactionAnnotation;

export interface PageState {
  pageIndex: number; // 0-based original index
  originalPageNumber: number; // 1-based (0 if blank page)
  displayPageNumber: number; // 1-based current sequence
  rotation: number; // 0, 90, 180, 270
  width: number; // PDF points
  height: number; // PDF points
  aspectRatio: number;
  isDeleted?: boolean;
  isBlank?: boolean;
}

export interface PDFDocumentState {
  filename: string;
  fileSize: number;
  data: ArrayBuffer | null;
  numPages: number;
  pages: PageState[];
  pageOrder: number[]; // Array of page indices
  annotations: Record<number, Annotation[]>; // key is pageIndex
}

export interface ActiveToolConfig {
  tool: ToolType;
  color: string;
  fillColor: string;
  strokeWidth: number;
  opacity: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right';
  stampType: 'APPROVED' | 'CONFIDENTIAL' | 'REJECTED' | 'DRAFT' | 'FINAL' | 'COMPLETED' | 'CUSTOM';
  customStampText: string;
  measureUnit?: 'cm' | 'mm' | 'in' | 'pt';
}

export interface ExtractedPdfTextItem {
  id: string;
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
}

export interface SearchMatch {
  matchIndex: number;
  pageIndex: number;
  pageNumber: number;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WatermarkConfig {
  text: string;
  color: string;
  opacity: number;
  fontSize: number;
  rotation: number;
  allPages: boolean;
}

export interface PageNumberingConfig {
  format: 'page_total' | 'simple' | 'dash' | 'page_only' | 'page_of_total';
  position: 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right' | 'top-left';
  startPage: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  prefix?: string;
  suffix?: string;
}

export interface PdfOutlineItem {
  title: string;
  pageNumber: number;
  pageIndex: number;
  children?: PdfOutlineItem[];
}

export type ReaderFilter = 'normal' | 'sepia' | 'dark' | 'contrast';
