import React from 'react';
import { jsPDF } from 'jspdf';

const GoGreenCertificateDownload: React.FC<{ recipientName: string; date: string }> = ({ recipientName, date }) => {
  const handleDownload = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'A4' });
    const W = doc.internal.pageSize.getWidth();   // ~842
    const H = doc.internal.pageSize.getHeight();  // ~595

    // ─── Background ─────────────────────────────────────────────────
    // Full page soft mint background
    doc.setFillColor(240, 253, 244);
    doc.rect(0, 0, W, H, 'F');

    // ─── Decorative outer border (double-line effect) ───────────────
    const m = 24; // margin
    doc.setDrawColor(34, 139, 34);
    doc.setLineWidth(3);
    doc.rect(m, m, W - 2 * m, H - 2 * m);
    doc.setLineWidth(1);
    doc.rect(m + 8, m + 8, W - 2 * (m + 8), H - 2 * (m + 8));

    // ─── Inner decorative line ──────────────────────────────────────
    doc.setDrawColor(76, 175, 80);
    doc.setLineWidth(0.5);
    doc.rect(m + 14, m + 14, W - 2 * (m + 14), H - 2 * (m + 14));

    // ─── Corner leaf decorations (drawn with lines) ─────────────────
    const drawLeafCorner = (cx: number, cy: number, flipX: number, flipY: number) => {
      doc.setDrawColor(34, 139, 34);
      doc.setLineWidth(1.5);
      // Main vine curve
      const len = 40;
      doc.line(cx, cy, cx + len * flipX, cy + (len * 0.6) * flipY);
      doc.line(cx, cy, cx + (len * 0.6) * flipX, cy + len * flipY);
      // Small leaf shapes (small lines at angles)
      const sl = 12;
      doc.line(cx + 15 * flipX, cy + 9 * flipY, cx + (15 + sl) * flipX, cy + (9 - 4) * flipY);
      doc.line(cx + 9 * flipX, cy + 15 * flipY, cx + (9 - 4) * flipX, cy + (15 + sl) * flipY);
    };
    drawLeafCorner(m + 18, m + 18, 1, 1);
    drawLeafCorner(W - m - 18, m + 18, -1, 1);
    drawLeafCorner(m + 18, H - m - 18, 1, -1);
    drawLeafCorner(W - m - 18, H - m - 18, -1, -1);

    // ─── Top Green Banner ───────────────────────────────────────────
    doc.setFillColor(34, 139, 34);
    doc.rect(m + 14, m + 14, W - 2 * (m + 14), 8, 'F');

    // ─── WombTo18 Branding ──────────────────────────────────────────
    // W18 logo circle
    const logoX = W / 2;
    const logoY = 80;
    doc.setFillColor(34, 139, 34);
    doc.circle(logoX, logoY, 22, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('W18', logoX, logoY + 5, { align: 'center' });

    // ─── Leaf icon (🌿) drawn as text  ──────────────────────────────
    doc.setFontSize(28);
    doc.setTextColor(34, 139, 34);
    // Left leaf
    doc.text('\u2618', logoX - 38, logoY + 4, { align: 'center' }); // shamrock
    // Right leaf
    doc.text('\u2618', logoX + 38, logoY + 4, { align: 'center' });

    // ─── Certificate Title ──────────────────────────────────────────
    doc.setFont('times', 'normal');
    doc.setFontSize(16);
    doc.setTextColor(76, 175, 80);
    doc.text('WombTo18', W / 2, 118, { align: 'center' });

    doc.setFont('times', 'bold');
    doc.setFontSize(36);
    doc.setTextColor(27, 94, 32);
    doc.text('Go Green Participation', W / 2, 155, { align: 'center' });

    doc.setFont('times', 'bolditalic');
    doc.setFontSize(40);
    doc.setTextColor(34, 139, 34);
    doc.text('Certificate', W / 2, 195, { align: 'center' });

    // ─── Decorative divider ─────────────────────────────────────────
    const divY = 212;
    doc.setDrawColor(76, 175, 80);
    doc.setLineWidth(1);
    doc.line(W / 2 - 140, divY, W / 2 - 20, divY);
    doc.line(W / 2 + 20, divY, W / 2 + 140, divY);
    // Center diamond
    doc.setFillColor(76, 175, 80);
    const dSize = 5;
    doc.line(W / 2 - dSize, divY, W / 2, divY - dSize);
    doc.line(W / 2, divY - dSize, W / 2 + dSize, divY);
    doc.line(W / 2 + dSize, divY, W / 2, divY + dSize);
    doc.line(W / 2, divY + dSize, W / 2 - dSize, divY);

    // ─── "Presented to" ─────────────────────────────────────────────
    doc.setFont('times', 'italic');
    doc.setFontSize(16);
    doc.setTextColor(100, 116, 139);
    doc.text('This certificate is proudly presented to', W / 2, 245, { align: 'center' });

    // ─── Recipient Name (large, elegant) ────────────────────────────
    doc.setFont('times', 'bolditalic');
    doc.setFontSize(44);
    doc.setTextColor(27, 94, 32);
    doc.text(recipientName, W / 2, 295, { align: 'center' });

    // Underline beneath name
    const nameWidth = doc.getTextWidth(recipientName);
    doc.setDrawColor(76, 175, 80);
    doc.setLineWidth(1.5);
    doc.line(W / 2 - nameWidth / 2 - 10, 305, W / 2 + nameWidth / 2 + 10, 305);

    // ─── Body Text ──────────────────────────────────────────────────
    doc.setFont('times', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(55, 65, 81);

    const bodyLines = [
      'In recognition of their participation in the WombTo18 Go Green Initiative,',
      'demonstrating a commitment to environmental well-being, sustainable living,',
      'and contributing to a greener and healthier future for our planet.',
    ];
    doc.text(bodyLines, W / 2, 340, { align: 'center', lineHeightFactor: 1.6 });

    // ─── Commitment Section ─────────────────────────────────────────
    doc.setFont('times', 'italic');
    doc.setFontSize(12);
    doc.setTextColor(76, 175, 80);
    const commitLines = [
      'Pledging to reduce, reuse, and recycle \u2022 Supporting local and sustainable practices',
      'Taking responsibility for environmental actions \u2022 Inspiring others to go green',
    ];
    doc.text(commitLines, W / 2, 410, { align: 'center', lineHeightFactor: 1.6 });

    // ─── Signature Section ──────────────────────────────────────────
    const sigY = 470;
    doc.setDrawColor(34, 139, 34);
    doc.setLineWidth(0.8);

    // Left signature
    doc.line(120, sigY, 300, sigY);
    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(27, 94, 32);
    doc.text('WombTo18 Team', 210, sigY + 18, { align: 'center' });
    doc.setFont('times', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Authorized Signatory', 210, sigY + 32, { align: 'center' });

    // Right signature
    doc.line(W - 300, sigY, W - 120, sigY);
    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(27, 94, 32);
    doc.text('Green Initiative', W - 210, sigY + 18, { align: 'center' });
    doc.setFont('times', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Program Coordinator', W - 210, sigY + 32, { align: 'center' });

    // Center date
    doc.setFont('times', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(55, 65, 81);
    doc.text(`Date: ${date}`, W / 2, sigY + 18, { align: 'center' });

    // Certificate ID
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    const certId = `WTO18-GG-${Date.now().toString(36).toUpperCase()}`;
    doc.text(`Certificate ID: ${certId}`, W / 2, sigY + 38, { align: 'center' });

    // ─── Bottom Green Banner ────────────────────────────────────────
    doc.setFillColor(34, 139, 34);
    doc.rect(m + 14, H - m - 22, W - 2 * (m + 14), 8, 'F');

    // ─── Footer ─────────────────────────────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('WombTo18 \u2022 Nurturing children from womb to 18 \u2022 www.wombto18.com', W / 2, H - m - 30, { align: 'center' });

    doc.save(`GoGreen_Certificate_${recipientName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
      <button
        className="btn-success"
        style={{
          padding: '14px 36px',
          fontSize: '1.05em',
          fontWeight: 600,
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          color: '#fff',
          border: 'none',
          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
          cursor: 'pointer',
          transition: 'all 0.25s ease',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          letterSpacing: '0.3px',
        }}
        onClick={handleDownload}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.35)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
          e.currentTarget.style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.25)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Download Go Green Certificate
      </button>
    </div>
  );
};

export default GoGreenCertificateDownload;
