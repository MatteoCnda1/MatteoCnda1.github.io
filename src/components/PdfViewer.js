import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

export default function PdfViewer({file, height}) {
  return (
    <BrowserOnly
      fallback={
        <div style={{padding: '2rem', textAlign: 'center', color: 'var(--ifm-color-emphasis-600)'}}>
          Chargement du visualisateur PDF…
        </div>
      }>
      {() => {
        const PdfViewerClient = require('./PdfViewerClient').default;
        return <PdfViewerClient file={file} height={height} />;
      }}
    </BrowserOnly>
  );
}
