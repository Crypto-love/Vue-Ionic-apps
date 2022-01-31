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
  if (!fileName) return false;

  const doc = await defaultPdf('ch', 'potrait');

  //  const logoPath = `${Img}/images/treedots.png`;
  const logoPath = 'https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/treedots.png';
  const img = await loadImage(logoPath);
  const grandTotal = payload.order_items
    .map((v) => v.total_price + v.tax)
    .reduce((total, v) => total + v, 0)
    .toFixed(2);

  const items = payload.order_items.map((v, i) => {
    let weight = v.weight;
    if (v.uom === 'G') {
      weight /= 1000;
    }

    return {
      description: v.description,
      weight: `${weight} KG`,
      quantity: v.qty,
      unit_price: `${v.unit_price.toFixed(2)} / ${v.uom}`,
      price: v.total_price.toFixed(2),
      tax: v.tax.toFixed(2),
      amount: (v.total_price + v.tax).toFixed(2)
    };
  });

  doc.autoTable({
    columns: [
      { header: 'Description', dataKey: 'description' },
      { header: 'Weight', dataKey: 'weight' },
      { header: 'Qty', dataKey: 'quantity' },
      { header: 'Unit Price', dataKey: 'unit_price' },
      { header: 'Price', dataKey: 'price' },
      { header: 'Tax', dataKey: 'tax' },
      { header: 'Amount SGD', dataKey: 'amount' }
    ],
    body: items,
    startY: 130,
    theme: 'grid',
    styles: {
      lineColor: 50
    },
    headStyles: { fillColor: false, textColor: 0, lineWidth: 0.1 },
    columnStyles: {
      description: { cellWidth: 80, font: 'ch' },
      amount: { cellWidth: 20, halign: 'right' }
    },
    didDrawPage: ({ pageNumber }) => {
      /** Only render address information on page 1 */
      if (pageNumber === 1) {
        doc.addImage(img, 'JPEG', 15, 10, 20, 20);

        doc.setFontSize(24);
        doc.text('TAX INVOICE', 15, 50);

        const lineHeight = doc.getLineHeightFactor();

        doc.setFontSize(10);
        doc.setLineHeightFactor(1.3);
        doc.setFontStyle('bold');
        doc.text('BILL TO:', 17, 58);
        doc.setFontStyle('normal');

        let yPos = 63;

        doc.setFont('ch');

        let splittedCustName = doc.splitTextToSize(payload.buyer_name, 70);
        doc.text(splittedCustName, 17, yPos, { maxWidth: 70 });
        yPos += 4 * splittedCustName.length * lineHeight;

        let splittedPicName = doc.splitTextToSize(`Attention: ${payload.attention}`, 70);
        doc.text(`Attention: ${payload.attention}`, 17, yPos, { maxWidth: 70 });
        yPos += 4 * splittedPicName.length * lineHeight;

        let splittedAddr = doc.splitTextToSize(payload.billing_address, 70);
        doc.text(payload.billing_address, 17, yPos, { maxWidth: 70 });
        yPos += 5 * splittedAddr.length * lineHeight;

        doc.setFontStyle('bold');
        doc.setFont('helvetica');
        doc.text('DELIVER TO:', 17, yPos);
        yPos += 5 * lineHeight;

        doc.setFont('ch');
        doc.setFontStyle('normal');
        splittedCustName = doc.splitTextToSize(payload.buyer_name, 70);
        doc.text(splittedCustName, 17, yPos, { maxWidth: 70 });
        yPos += 4 * splittedCustName.length * lineHeight;

        splittedPicName = doc.splitTextToSize(`Attention: ${payload.attention}`, 70);
        doc.text(`Attention: ${payload.attention}`, 17, yPos, { maxWidth: 70 });
        yPos += 4 * splittedPicName.length * lineHeight;

        splittedAddr = doc.splitTextToSize(payload.delivery_address, 70);
        doc.text(payload.delivery_address, 17, yPos, { maxWidth: 70 });
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
          40
        );

        createUpperDescription(
          doc,
          { text: 'Invoice Date', y: 40 },
          { text: payload.invoice_date || '-', y: 44 }
        );
        createUpperDescription(
          doc,
          { text: 'Account Number', y: 50 },
          { text: payload.account_number || '-', y: 54 }
        );
        createUpperDescription(
          doc,
          { text: 'Invoice Number', y: 60 },
          { text: payload.invoice_number || '-', y: 64 }
        );

        createUpperDescription(doc, { text: 'Po Number', y: 70 }, { text: payload.po_number, y: 74 });
        createUpperDescription(doc, { text: 'GST', y: 80 }, { text: '201724120K', y: 84 });
      }
    }
  });

  let lastY = doc.autoTable.previous.finalY;

  if (doc.autoTable.previous.finalY > 250) {
    /**
     * Where did i get 250 ? It's trial and error
     * So, what does this do actually ?
     * Basically, it creates new page if order item's table is reaching the end of page.
     */
    doc.addPage();
    lastY = 20; // Set to top of page
  }

  doc.autoTable({
    margin: {
      top: lastY + 10,
      left: doc.internal.pageSize.width - 100
    },
    theme: 'plain',
    body: [
      ['Total SGD', grandTotal],
      ['Due Date', `${payload.due_date}\n${payload.cod === 1 ? 'CASH ON DELIVERY' : ''}`]
    ],
    styles: {
      lineColor: 50,
      font: 'ch'
    },
    columnStyles: { 0: { halign: 'right' }, 1: { halign: 'right' } }
  });

  if (doc.autoTable.previous.finalY > 215) {
    /** Again. Where did i get 225 ? well, it's trial and error of course */
    doc.addPage();
  }

  const rectWidth = (doc.internal.pageSize.width - 30) / 2;
  const rectHeight = 50;

  const rect1XPos = 15;
  const rect1YPos = doc.internal.pageSize.height - 65; // Key variable
  const rect1Width = rectWidth - 3.75;
  doc.rect(rect1XPos, rect1YPos, rect1Width, rectHeight);

  const rect2XPos = doc.internal.pageSize.width / 2 + 3.75;
  const rect2YPos = rect1YPos;
  const rect2Width = rectWidth - 3.75;
  doc.rect(rect2XPos, rect2YPos, rect2Width, rectHeight);

  const bottomCompanyInfoX = 15;
  const bottomCompanyInfoY = rect1YPos - 4;

  doc.setFontSize(7);
  doc.setFontStyle('normal');
  doc.text(
    'Company Registration No: 201724120K. Registered Office: Bishan Street 12 Block 122 #09-47, 570122, Singapore',
    bottomCompanyInfoX,
    bottomCompanyInfoY
  );

  const rect1InfoX = rect1XPos + 2;
  let rect1InfoY = rect1YPos + 4;
  doc.setFontSize(8);
  doc.text(
    'For cheque payment, please cross the cheque and make it payable to “TREEDOTS ENTERPRISE (PRIVATE LIMITED)”. Kindly indicate your name andinvoice number(s) on the back of the cheque.',
    rect1InfoX,
    rect1InfoY,
    {
      maxWidth: rect1Width - 5
    }
  );

  rect1InfoY += 18;

  doc.text(
    'For bank transfer, please kindly make payment to DBS CURRENT 074-902992-7.',
    rect1InfoX,
    rect1InfoY,
    {
      maxWidth: rect1Width - 5
    }
  );

  rect1InfoY += 10;

  doc.text(
    'Please contact Nicholas at +65 3138 5464 or NICHOLAS@THETREEDOTS.COM for all payment related matters.',
    rect1InfoX,
    rect1InfoY,
    {
      maxWidth: rect1Width - 5
    }
  );

  let rect2InfoY = rect2YPos + 5;
  doc.setFontSize(12);
  doc.setFontStyle('bold');
  doc.text('FOR OFFICIAL USE', rect2XPos + rect2Width / 2, rect2InfoY, {
    align: 'center',
    maxWidth: rect2Width - 5
  });

  let rect2InfoX = rect2XPos + 2;
  rect2InfoY += 8;
  doc.setFontSize(10);
  doc.text('Customer Name:', rect2InfoX, rect2InfoY, {
    maxWidth: rect2Width - 5
  });

  rect2InfoY += 6;
  doc.text('Customer Phone:', rect2InfoX, rect2InfoY, {
    maxWidth: rect2Width - 5
  });

  rect2InfoY += 6;
  doc.text('Customer Signature:', rect2InfoX, rect2InfoY, {
    maxWidth: rect2Width - 5
  });

  rect2InfoY += 6;
  doc.text('Instruction:', rect2InfoX, rect2InfoY, {
    maxWidth: rect2Width - 5
  });

  doc.save(`${fileName}.pdf`);
  return true;
}
