import React from 'react';

export default function PdfViewer({file, height = 800}) {
  return (
    <div style={{width: '100%', marginBottom: '1rem'}}>
      <object
        data={file}
        type="application/pdf"
        width="100%"
        height={height}
        style={{display: 'block', minHeight: `${height}px`, border: '1px solid #ccc'}}
      >
        <iframe
          src={file}
          width="100%"
          height={height}
          style={{border: 'none', minHeight: `${height}px`}}
          title="PDF viewer"
        />
        <p>
          Votre navigateur ne peut pas afficher le PDF.{' '}
          <a href={file} target="_blank" rel="noopener noreferrer">
            Ouvrir le PDF
          </a>
        </p>
      </object>
    </div>
  );
}
