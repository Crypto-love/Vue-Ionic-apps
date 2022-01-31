import Vue from 'vue';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
/**
 *
 * @param {String} staticPath
 */
export default async function (countryCode = 'en', orientation = 'landscape', unit = 'mm') {
  const doc = new jsPDF({
    orientation: orientation,
    unit: unit
  });
  const font = await Vue.prototype.$font(countryCode);
  doc.addFileToVFS(`${countryCode}.ttf`, font);
  doc.addFont(`${countryCode}.ttf`, `${countryCode}`, 'normal');
  doc.addFont(`${countryCode}.ttf`, `${countryCode}`, 'bold');
  return doc;
}
