import React, {useState, useCallback, useRef, useEffect} from 'react';
import {Document, Page, pdfjs} from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import styles from './PdfViewer.module.css';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const ZOOM_STEP = 0.15;
const MIN_SCALE = 0.5;
const MAX_SCALE = 2.5;
const MAX_PAGE_WIDTH = 900;

export default function PdfViewerClient({file, height = 800}) {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [scale, setScale] = useState(1);
  const [containerWidth, setContainerWidth] = useState(undefined);
  const [loadError, setLoadError] = useState(false);
  const viewportRef = useRef(null);
  const pageRefs = useRef({});

  useEffect(() => {
    const el = viewportRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const update = () => setContainerWidth(el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const onDocumentLoadSuccess = useCallback(({numPages: total}) => {
    setNumPages(total);
    setCurrentPage(1);
    setPageInput('1');
    setLoadError(false);
    pageRefs.current = {};
  }, []);

  // Track which page is currently in view while scrolling.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !numPages || typeof IntersectionObserver === 'undefined') return undefined;
    const ratios = new Map();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          ratios.set(Number(entry.target.dataset.pageNumber), entry.intersectionRatio);
        });
        let bestPage = null;
        let bestRatio = 0;
        ratios.forEach((ratio, page) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestPage = page;
          }
        });
        if (bestPage) {
          setCurrentPage(bestPage);
          setPageInput(String(bestPage));
        }
      },
      {root: viewport, threshold: [0.1, 0.25, 0.5, 0.75, 1]},
    );
    Object.values(pageRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [numPages, containerWidth, scale]);

  const scrollToPage = useCallback(
    (n) => {
      const max = numPages || 1;
      const target = Math.min(Math.max(n, 1), max);
      const el = pageRefs.current[target];
      if (el) el.scrollIntoView({block: 'start', behavior: 'smooth'});
      setPageInput(String(target));
    },
    [numPages],
  );

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') scrollToPage(currentPage - 1);
      if (e.key === 'ArrowRight') scrollToPage(currentPage + 1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentPage, scrollToPage]);

  const submitPageInput = (e) => {
    e.preventDefault();
    const n = parseInt(pageInput, 10);
    if (!Number.isNaN(n)) scrollToPage(n);
    else setPageInput(String(currentPage));
  };

  const zoomOut = () => setScale((s) => Math.max(MIN_SCALE, +(s - ZOOM_STEP).toFixed(2)));
  const zoomIn = () => setScale((s) => Math.min(MAX_SCALE, +(s + ZOOM_STEP).toFixed(2)));

  const pageWidth = containerWidth
    ? Math.min(containerWidth - 32, MAX_PAGE_WIDTH) * scale
    : undefined;

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <div className={styles.group}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => scrollToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Page précédente"
            title="Page précédente">
            ‹
          </button>
          <form className={styles.pageForm} onSubmit={submitPageInput}>
            <input
              type="text"
              inputMode="numeric"
              className={styles.pageInput}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={submitPageInput}
              aria-label="Numéro de page"
            />
            <span className={styles.pageTotal}>/ {numPages ?? '—'}</span>
          </form>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => scrollToPage(currentPage + 1)}
            disabled={!numPages || currentPage >= numPages}
            aria-label="Page suivante"
            title="Page suivante">
            ›
          </button>
        </div>

        <div className={styles.group}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={zoomOut}
            disabled={scale <= MIN_SCALE}
            aria-label="Zoom arrière"
            title="Zoom arrière">
            −
          </button>
          <span className={styles.zoomIndicator}>{Math.round(scale * 100)}%</span>
          <button
            type="button"
            className={styles.iconButton}
            onClick={zoomIn}
            disabled={scale >= MAX_SCALE}
            aria-label="Zoom avant"
            title="Zoom avant">
            +
          </button>
        </div>

        <div className={styles.group}>
          <a
            className={styles.iconButton}
            href={file}
            download
            aria-label="Télécharger le PDF"
            title="Télécharger">
            ⤓
          </a>
          <a
            className={styles.iconButton}
            href={file}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Ouvrir dans un nouvel onglet"
            title="Ouvrir dans un nouvel onglet">
            ⤢
          </a>
        </div>
      </div>

      <div className={styles.viewport} style={{maxHeight: height}} ref={viewportRef}>
        {loadError ? (
          <div className={styles.fallback}>
            <p>Impossible d&apos;afficher ce PDF ici.</p>
            <a href={file} target="_blank" rel="noopener noreferrer">
              Ouvrir le PDF dans un nouvel onglet
            </a>
          </div>
        ) : (
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={() => setLoadError(true)}
            loading={<div className={styles.loading}>Chargement du PDF…</div>}
            className={styles.document}>
            {numPages &&
              Array.from({length: numPages}, (_, i) => i + 1).map((n) => (
                <div
                  key={n}
                  data-page-number={n}
                  ref={(el) => {
                    if (el) pageRefs.current[n] = el;
                    else delete pageRefs.current[n];
                  }}
                  className={styles.pageWrapper}>
                  <Page
                    pageNumber={n}
                    width={pageWidth}
                    className={styles.page}
                    loading={<div className={styles.loading}>Chargement de la page {n}…</div>}
                  />
                </div>
              ))}
          </Document>
        )}
      </div>
    </div>
  );
}
