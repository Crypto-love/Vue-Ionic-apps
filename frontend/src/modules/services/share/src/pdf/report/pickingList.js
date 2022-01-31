import defaultPdf from '../utils/defaultPdf';

const getTableHeader = () => {
  return [
    {
      no: 'No',
      supplier_name: 'Supplier Name',
      item_name: 'Item Name',
      quantity: 'QTY',
      weight: 'WT'
    }
  ];
};

const getBody = (payload) => {
  const body = [];
  let i = 1;
  for (let supplier of payload) {
    let j = 1;
    for (let item of supplier.order_items) {
      const data = {
        no: j === 1 ? { content: i, rowSpan: supplier.order_items.length } : null,
        supplier_name:
          j === 1 ? { content: supplier.supplier_name, rowSpan: supplier.order_items.length } : null,
        item_name: item.product_name,
        quantity: item.qty,
        weight: item.weight
      };
      body.push(data);
      j++;
    }
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
    styles: {
      lineColor: 0,
      halign: 'center',
      font: 'ch'
    },
    columnStyles: {
      no: { cellWidth: 10 }
    },
    headStyles: {
      fillColor: [189, 189, 189],
      textColor: 0,
      lineWidth: 0.1,
      fontSize: 9
    },
    didDrawPage: function (data) {
      // Header
      doc.setFontSize(20);
      doc.setTextColor(40);
      doc.text('Picking List', data.settings.margin.left, 22);

      doc.autoTable({
        styles: {
          font: 'ch'
        },
        tableWidth: 'wrap',
        margin: { top: 26, left: data.settings.margin.left },
        theme: 'plain',
        body: [
          ['Date', ':', payload[0].full_date],
          ['Driver', ':', payload[0].driver_name]
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
