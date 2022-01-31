import defaultPdf from '../utils/defaultPdf';

const getTableHeader = () => {
  return [
    {
      no: 'NO',
      company: 'CUSTOMER',
      invoice_number: 'INVOICE',
      amount: 'AMOUNT',
      amountCollected: 'COLLECTED',
      ncnd: 'NCND',
      remark: 'REMARK',
      driver_sign: 'DRIVER SIGN'
    }
  ];
};

const getBody = (payload) => {
  const body = [];
  let i = 1;
  for (let item of payload) {
    const data = {
      no: i,
      company: item.buyer_name,
      invoice_number: item.invoice_number,
      amount: item.invoice_amount,
      amountCollected: '',
      ncnd: item.ncnd,
      remark: '',
      driver_sign: ''
    };
    body.push(data);
    i++;
  }
  return body;
};
export default async function (payload, fileName) {
  if (!payload) return false;
  if (!fileName) return false;
  if (Array.isArray(payload) && payload.length <= 0) return false;

  const doc = await defaultPdf('ch', 'landscape');
  const totalPagesExp = '{total_pages_count_string}';
  const body = getBody(payload);
  doc.autoTable({
    theme: 'grid',
    head: getTableHeader(),
    body,
    styles: { lineColor: 0, font: 'ch', halign: 'center' },
    headStyles: {
      fillColor: [189, 189, 189],
      textColor: 0,
      lineWidth: 0.1,
      fontSize: 10
    },
    columnStyles: {
      no: { cellWidth: 10 },
      invoice_number: { cellWidth: 35 },
      amount: { cellWidth: 25 },
      amountCollected: { cellWidth: 25 },
      ncnd: { cellWidth: 15 },
      remark: { cellWidth: 55 }
    },
    didDrawPage: function (data) {
      // Header
      doc.setFontSize(20);
      doc.setTextColor(40);
      doc.setFontStyle('normal');
      doc.text('Picking Collection', data.settings.margin.left, 22);

      doc.autoTable({
        styles: {
          font: 'ch'
        },
        tableWidth: 'wrap',
        margin: { top: 26, left: data.settings.margin.left },
        theme: 'plain',
        body: [
          ['Date', ':', payload[0].delivery_date],
          ['Final Delivery Driver', ':', payload[0].deliver_driver]
        ],
        columnStyles: { 0: { cellPadding: { left: 0 } } }
      });

      // Footer
      var str = 'Page ' + doc.internal.getNumberOfPages();
      // Total page number plugin only available in jspdf v1.0+
      if (typeof doc.putTotalPages === 'function') {
        str = str + ' of ' + totalPagesExp;
      }
      doc.setFontSize(10);

      // jsPDF 1.4+ uses getWidth, <1.4 uses .width
      var pageSize = doc.internal.pageSize;
      var pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
      doc.text(str, data.settings.margin.left, pageHeight - 10);
    },
    margin: { top: 42 }
  });

  // Total page number plugin only available in jspdf v1.0+
  if (typeof doc.putTotalPages === 'function') {
    doc.putTotalPages(totalPagesExp);
  }

  doc.save(`${fileName}.pdf`);
  return true;
}
