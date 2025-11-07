import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { WeeklyMeetingDetail, PassbookSection } from '../types';

type JsPdfAutoTable = jsPDF & { lastAutoTable?: { finalY: number } };
type JsPdfLink = jsPDF & { textWithLink: (text: string, x: number, y: number, options: { url: string }) => void };

interface MeetingReportData {
  meeting: WeeklyMeetingDetail;
  saccoName: string;
  saccoLogo?: string;
  sections: PassbookSection[];
  deductionBreakdown: {
    sectionName: string;
    amount: string;
  }[];
  cashRoundNumber?: number | string;
  memberContributions?: { name: string; amount: string; isRecipient?: boolean }[];
}

/**
 * Generate PDF report for a finalized meeting/week
 */
export const generateMeetingReport = async (data: MeetingReportData): Promise<jsPDF> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let currentY = 20;

  // Header with logo if available
  if (data.saccoLogo) {
    try {
      doc.addImage(data.saccoLogo, 'PNG', margin, currentY, 30, 30);
      currentY += 35;
    } catch (error) {
      console.warn('Could not add logo to report:', error);
    }
  }

  // Sacco Name (Title)
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(data.saccoName, pageWidth / 2, currentY, { align: 'center' });
  currentY += 10;

  // Report Title
  doc.setFontSize(16);
  doc.text('Weekly Meeting Report', pageWidth / 2, currentY, { align: 'center' });
  currentY += 15;

  // Meeting Information
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const titleLine =
    (data.cashRoundNumber ? `Cashround ${data.cashRoundNumber} - ` : '') +
    `Week ${data.meeting.week_number}, ${data.meeting.year}`;
  doc.text(titleLine, margin, currentY);
  currentY += 7;
  
  const meetingDate = new Date(data.meeting.meeting_date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(`Date: ${meetingDate}`, margin, currentY);
  currentY += 7;
  
  if (data.meeting.cash_round_recipient_name) {
    doc.text(`Recipient: ${data.meeting.cash_round_recipient_name}`, margin, currentY);
    currentY += 10;
  } else {
    currentY += 10;
  }

  // Summary Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Meeting Summary', margin, currentY);
  currentY += 8;

  // Summary Table
  const summaryRows: [string, string][] = [];
  if (data.memberContributions && data.memberContributions.length > 0) {
    data.memberContributions.forEach((mc) => {
      const name = mc.isRecipient ? `${mc.name} (recipient)` : mc.name;
      summaryRows.push([name, `UGX ${parseFloat(mc.amount || '0').toLocaleString()}`]);
    });
  }
  summaryRows.push(['Total Collected', `UGX ${parseFloat(data.meeting.total_collected).toLocaleString()}`]);

  autoTable(doc, {
    startY: currentY,
    head: [],
    body: summaryRows,
    theme: 'grid',
    styles: { fontSize: 11 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 80 },
      1: { halign: 'right', cellWidth: 'auto' },
    },
    margin: { left: margin, right: margin },
  });

  currentY = ((doc as JsPdfAutoTable).lastAutoTable?.finalY || currentY) + 10;

  // Financial Breakdown Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Financial Breakdown', margin, currentY);
  currentY += 8;

  // Deductions Breakdown
  const deductionsData: [string, string][] = [];
  
  if (data.deductionBreakdown && data.deductionBreakdown.length > 0) {
    data.deductionBreakdown.forEach((item) => {
      deductionsData.push([item.sectionName, `UGX ${parseFloat(item.amount).toLocaleString()}`]);
    });
  }

  const financialData = [
    ...deductionsData,
    ['', ''], // Separator
    ['Total Deductions', `UGX ${parseFloat(data.meeting.total_deductions).toLocaleString()}`],
    ['Amount to Recipient', `UGX ${parseFloat(data.meeting.amount_to_recipient).toLocaleString()}`],
    ['Amount to Bank', `UGX ${parseFloat(data.meeting.amount_to_bank).toLocaleString()}`],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['Description', 'Amount']],
    body: financialData,
    theme: 'striped',
    styles: { fontSize: 11 },
    headStyles: {
      fillColor: [67, 56, 202], // Indigo color
      textColor: 255,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { halign: 'right', cellWidth: 'auto' },
    },
    margin: { left: margin, right: margin },
    didParseCell: (data: unknown) => {
      const d = data as { section: string; row: { index: number }; cell: { styles: { fontStyle?: string; fillColor?: number[] } } };
      // Make total rows bold
      if (d.section === 'body' && d.row.index >= deductionsData.length + 1) {
        d.cell.styles.fontStyle = 'bold';
        if (d.row.index === deductionsData.length + 1) {
          // Separator row - make it empty
          d.cell.styles.fillColor = [240, 240, 240];
        }
      }
    },
  });

  currentY = (((doc as JsPdfAutoTable).lastAutoTable?.finalY) || currentY) + 15;

  // Footer
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100);
  const now = new Date();
  const formatted = now.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const footerPrefix = `Generated on ${formatted} from `;
  const linkText = 'Tamiti App';
  const fullWidth = doc.getTextWidth(footerPrefix + linkText);
  const startX = (pageWidth - fullWidth) / 2;
  const y = doc.internal.pageSize.getHeight() - 15;
  doc.text(footerPrefix, startX, y);
  (doc as JsPdfLink).textWithLink(linkText, startX + doc.getTextWidth(footerPrefix), y, { url: 'https://tamiti.com' });

  // Status badge
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(34, 197, 94); // Green
  doc.text('✓ FINALIZED', pageWidth - margin - 30, 20);

  return doc;
};

/**
 * Download the meeting report as PDF
 */
export const downloadMeetingReport = async (data: MeetingReportData): Promise<void> => {
  const doc = await generateMeetingReport(data);
  doc.save(`meeting-report-week-${data.meeting.week_number}-${data.meeting.year}.pdf`);
};

/**
 * Print the meeting report
 */
export const printMeetingReport = async (data: MeetingReportData): Promise<void> => {
  const doc = await generateMeetingReport(data);
  doc.autoPrint();
  window.open(doc.output('bloburl'), '_blank');
};

/**
 * Generate blob for sharing
 */
export const generateMeetingReportBlob = async (data: MeetingReportData): Promise<Blob> => {
  const doc = await generateMeetingReport(data);
  return doc.output('blob');
};

/**
 * Share meeting report via Web Share API or WhatsApp
 */
export const shareMeetingReport = async (
  data: MeetingReportData,
  phoneNumber?: string
): Promise<void> => {
  const blob = await generateMeetingReportBlob(data);
  const fileName = `meeting-report-week-${data.meeting.week_number}-${data.meeting.year}.pdf`;

  // Try Web Share API first
  if (navigator.share && navigator.canShare) {
    try {
      const file = new File([blob], fileName, { type: 'application/pdf' });
      const canShare = navigator.canShare({ files: [file] });

      if (canShare) {
        await navigator.share({
          title: `${data.cashRoundNumber ? `Cashround ${data.cashRoundNumber} - ` : ''}Week ${data.meeting.week_number} Meeting Report`,
          text: `${data.saccoName} - ${data.cashRoundNumber ? `Cashround ${data.cashRoundNumber} - ` : ''}Week ${data.meeting.week_number}, ${data.meeting.year}`,
          files: [file],
        });
        return;
      }
    } catch {
      console.log('Web Share API not fully supported, falling back to WhatsApp');
    }
  }

  // Fallback to WhatsApp Web
  if (phoneNumber) {
    const message = encodeURIComponent(
      `📊 ${data.saccoName} Meeting Report\n\n` +
        `${data.cashRoundNumber ? `Cashround ${data.cashRoundNumber} - ` : ''}Week ${data.meeting.week_number}, ${data.meeting.year}\n` +
        `Total Collected: UGX ${parseFloat(data.meeting.total_collected).toLocaleString()}\n` +
        `Recipient: ${data.meeting.cash_round_recipient_name || 'N/A'}\n\n` +
        `Report generated successfully. Please check your email or contact admin for the PDF.`
    );
    
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  } else {
    // No phone number, just download
    await downloadMeetingReport(data);
  }
};
