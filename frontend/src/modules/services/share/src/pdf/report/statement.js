import loadImage from '../utils/loadImage';
import defaultPdf from '../utils/defaultPdf';
import { Img } from '../../helper/image';

const createUpperDescription = (doc, title, subtitle) => {
  doc.setFontSize(9);
  doc.setFontStyle('bold');
  doc.text('' + title.text, doc.internal.pageSize.width - 115, title.y);

  doc.setFontSize(9);
  doc.setFontStyle('normal');
  doc.text('' + subtitle.text, doc.internal.pageSize.width - 115, subtitle.y);
};

/**
 *
 * @param {Object} invoiceData
 * @param {String} fileName
 */
export default async function (payload, fileName) {
  if (!payload) return false;

  const doc = await defaultPdf('ch', 'landscape');

  //  const logoPath = `${Img}/images/treedots.png`;
  const logoPath = 'https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/treedots.png';
  const img = await loadImage(logoPath);
  const items = payload.items;

  doc.setFontSize(20);
  doc.text('Balance due in SGD, Singapore Dollar', 15, 65);

  doc.autoTable({
    columns: [
      { header: 'Date', dataKey: 'date' },
      { header: 'Activity', dataKey: 'invoice' },
      { header: 'Reference', dataKey: 'reference' },
      { header: 'Due Date', dataKey: 'duedate' },
      { header: 'Invoice Amount', dataKey: 'amount' },
      { header: 'Payments', dataKey: 'paid' },
      { header: 'Balance SGD', dataKey: 'balance' }
    ],
    body: items,
    startY: 70,
    theme: 'grid',
    styles: {
      lineColor: 100,
      font: 'ch'
    },
    headStyles: { fillColor: false, textColor: 0, lineWidth: 0.1, halign: 'center' },
    columnStyles: {
      0: { cellWidth: 30, halign: 'center' },
      1: { cellWidth: 90, halign: 'center' },
      2: { cellWidth: 35, halign: 'center' },
      3: { cellWidth: 30, halign: 'center' },
      4: { cellWidth: 25, halign: 'right' },
      5: { cellWidth: 25, halign: 'right' },
      6: { cellWidth: 25, halign: 'right' }
    },
    didDrawPage: ({ pageNumber }) => {
      /** Only render address information on page 1 */
      if (pageNumber === 1) {
        doc.addImage(img, 'JPEG', 15, 10, 20, 20);

        doc.setFontSize(24);
        doc.text('STATEMENT', 15, 40);

        const lineHeight = doc.getLineHeightFactor();

        doc.setFontSize(10);
        doc.setLineHeightFactor(1.3);
        doc.setFontStyle('normal');

        let yPos = 45;

        doc.setFont('ch');

        let splittedCustName = doc.splitTextToSize(payload.buyer_name, 70);
        doc.text(splittedCustName, 17, yPos, { maxWidth: 70 });
        yPos += 4 * splittedCustName.length * lineHeight;

        let splittedPicName = doc.splitTextToSize(`Attention: ${payload.attention}`, 70);
        doc.text(`Attention: ${payload.attention}`, 17, yPos, { maxWidth: 70 });
        yPos += 4 * splittedPicName.length * lineHeight;

        let splittedAddr = doc.splitTextToSize(payload.address, 150);
        doc.text(payload.address, 17, yPos, { maxWidth: 150 });
        yPos += 5 * splittedAddr.length * lineHeight;

        doc.setFont('helvetica');

        doc.setFontSize(9);
        doc.setLineHeightFactor(1.3);
        doc.text(
          [
            'Treedots Enterprise (Private Limited)',
            'Attention: Jia Cai Lau',
            'Bishan Street 12 Block 122, #09-47',
            '570122',
            'Singapore'
          ],
          doc.internal.pageSize.width - 70,
          20
        );

        createUpperDescription(
          doc,
          { text: 'Statement Date', y: 20 },
          { text: payload.statement_date || '-', y: 24 }
        );
        createUpperDescription(
          doc,
          { text: 'Account Number', y: 30 },
          { text: payload.account_number || '-', y: 34 }
        );
        createUpperDescription(doc, { text: 'GST', y: 40 }, { text: '201724120K', y: 44 });
      }
    }
  });
  let lastY = doc.autoTable.previous.finalY;

  if (doc.autoTable.previous.finalY > 150) {
    /**
     * Where did i get 250 ? It's trial and error
     * So, what does this do actually ?
     * Basically, it creates new page if order item's table is reaching the end of page.
     */
    doc.addPage();
    lastY = 70; // Set to top of page
  }

  if (doc.autoTable.previous.finalY > 215) {
    /** Again. Where did i get 225 ? well, it's trial and error of course */
    doc.addPage();
  }

  const bottomCompanyInfoX = 15;
  const bottomCompanyInfoY = doc.internal.pageSize.height - 55;

  /** summary start */
  const summaryEndX = doc.internal.pageSize.width - bottomCompanyInfoX;
  doc.setFontSize(9);
  doc.setFontStyle('bold');
  doc.text('Customer', 180, bottomCompanyInfoY + 8);
  doc.text('Overdue', 180, bottomCompanyInfoY + 15);

  doc.text('Current', 210, bottomCompanyInfoY + 15);

  doc.text('Total SGD Due', 255, bottomCompanyInfoY + 15);

  doc.text('Amount Enclosed', 180, bottomCompanyInfoY + 33);

  doc.setFontStyle('normal');
  doc.text(payload.buyer_name, 210, bottomCompanyInfoY + 8);
  doc.text(payload.total_overdue, 180, bottomCompanyInfoY + 20);
  doc.text(payload.total_current, 210, bottomCompanyInfoY + 20);
  doc.text(payload.total_balance, 255, bottomCompanyInfoY + 20);

  doc.text('Enter the amount you are paying above', 210, bottomCompanyInfoY + 40);

  doc.setDrawColor(174, 168, 167); /** grey */
  doc.setLineWidth(0.5);
  doc.line(180, bottomCompanyInfoY + 10, summaryEndX, bottomCompanyInfoY + 10);
  doc.line(180, bottomCompanyInfoY + 25, summaryEndX, bottomCompanyInfoY + 25);
  doc.setDrawColor(0, 0, 0); /** black */
  doc.line(210, bottomCompanyInfoY + 35, summaryEndX, bottomCompanyInfoY + 35); /** black */

  /** summary end */
  doc.setDrawColor(0, 0, 0); /** black */
  doc.setLineDash([3, 3]);
  doc.setLineWidth(0.5);
  doc.line(bottomCompanyInfoX - 3, bottomCompanyInfoY, summaryEndX, bottomCompanyInfoY);

  doc.setFontSize(20);
  doc.text('PAYMENT ADVICE', bottomCompanyInfoX, bottomCompanyInfoY + 10);

  doc.setFontSize(9);
  doc.setLineHeightFactor(1.3);
  doc.text(
    [
      'Treedots Enterprise (Private Limited)',
      'Attention: Jia Cai Lau',
      'Bishan Street 12 Block 122, #09-47',
      '570122',
      'Singapore'
    ],
    bottomCompanyInfoX + 5,
    bottomCompanyInfoY + 15
  );

  doc.setFontSize(7);
  doc.setFontStyle('bold');
  doc.text(
    'Company Registration No: 201724120K. Registered Office: Bishan Street 12 Block 122 #09-47, 570122, Singapore',
    bottomCompanyInfoX,
    bottomCompanyInfoY + 50
  );

  //doc.save(`sample.pdf`);
  let base64 = await doc.output('datauristring');
  return base64;
}
