import defaultPdf from '../utils/defaultPdf';
const getTableHeader = () => {
  return [
    {
      no: 'NO',
      schedule: 'HOURS',
      name: 'CUSTOMER',
      address: 'ADDRESS',
      description: 'ITEMS',
      remarks: 'REMARKS',
      contact_details: 'PIC'
    }
  ];
};

const getBody = (payload) => {
  const body = [];
  let buyer = '';
  let rowSpan = false;
  let rowSpanCount = 0;

  let orderId = null;
  let remarkRowSpan = false;
  let remarkRowSpanCount = 0;

  let i = 0;
  for (let item of payload) {
    if (buyer !== item.buyer_name) {
      buyer = item.buyer_name;
      /* if prev buyer not same with current buyer, need add rowspan */
      rowSpan = true;
      let items = payload.filter((x) => x.buyer_name === item.buyer_name);
      /* get rowspan  base on buyer_name */
      rowSpanCount = items.length;
      i++;
    } else {
      rowSpan = false;
    }

    if (orderId !== item.order_id) {
      orderId = item.order_id;
      remarkRowSpan = true;
      let items = payload.filter((x) => x.order_id === item.order_id);
      remarkRowSpanCount = items.length;
    } else {
      remarkRowSpan = false;
    }

    const data = {
      no: rowSpan ? { content: i, rowSpan: rowSpanCount } : null,
      schedule: rowSpan
        ? {
            content: `After ${item.start_time} \nBefore ${item.finish_time}`,
            rowSpan: rowSpanCount
          }
        : null,
      name: rowSpan ? { content: item.buyer_name, rowSpan: rowSpanCount } : null,
      address: rowSpan ? { content: item.delivery_address, rowSpan: rowSpanCount } : null,
      description: `${item.item}${
        item.instruction && item.instruction.length < 3 ? '' : '\n' + 'Note: ' + item.instruction + '*'
      }`,
      remarks: remarkRowSpan ? { content: item.remarks || '-', rowSpan: remarkRowSpanCount } : null,
      contact_details: rowSpan ? { content: item.contact, rowSpan: rowSpanCount } : null
    };
    body.push(data);
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
      no: { cellWidth: 10 },
      name: { cellWidth: 40 },
      address: { cellWidth: 40 },
      remarks: { cellWidth: 60 }
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
      doc.text('Delivery Schedule', data.settings.margin.left, 22);

      doc.autoTable({
        styles: { font: 'ch' },
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
