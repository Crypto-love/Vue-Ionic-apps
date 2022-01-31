import { Api, Notice } from '../helper/services';
import XLSX from 'xlsx';

export async function ImportXlxs(state, next, file, function_name, sheet_name, filename, header, fields) {
  const selectedFile = file;
  const reader = new FileReader();
  reader.onload = async function (event) {
    const data = event.target.result;
    const workbook = XLSX.read(data, {
      type: 'binary'
    });

    const dataToImport = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name]);

    const res = await Api.exec(`${function_name}`, [
      JSON.stringify(dataToImport).replace(/\"/g, '\\"').replace(/'/g, '`'),
      state.tenant_id,
      state.id
    ]);

    if (res.status && next) {
      next(res.data, filename, header, fields);
    } else {
      Notice.fail(res.message);
    }
  };

  reader.onerror = function (event) {
    console.error('File could not be read! Code ' + event.target.error.code);
  };
  reader.readAsBinaryString(selectedFile);
}
export function dataToCSV(data, filename, header, fields) {
  try {
    if (data.length <= 0) return;
    var csv = `\uFEFF${header}\n`;
    for (let x of data) {
      let items = '';
      for (let i of fields) {
        items += `${x[i]},`;
      }
      items = items.substr(0, items.length - 1);
      csv += `${items}\n`;
    }
    csv = 'data:text/csv;charset=utf-8,' + csv;
    var encodedUri = encodeURI(csv);
    var link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
  } catch (error) {
    Notice.fail(error.message);
  }
}
