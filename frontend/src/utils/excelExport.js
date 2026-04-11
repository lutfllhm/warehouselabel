import ExcelJS from 'exceljs';

/**
 * Export LPS document to Excel
 * @param {Object} lpsDoc - LPS document data
 */
export async function exportLpsToExcel(lpsDoc) {
  try {
    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');

    // Set column widths to match template exactly
    worksheet.columns = [
      { width: 2 },   // A - empty
      { width: 15 },  // B - PAPERCORE
      { width: 38 },  // C - NAMA ITEM
      { width: 18 },  // D - CUSTOMER
      { width: 15 },  // E - P.NUMBER
      { width: 18 },  // F - NO.SPK
      { width: 12 },  // G - PO
      { width: 12 },  // H - JUMLAH
      { width: 18 },  // I - BAHAN
      { width: 2 }    // J - empty
    ];

    // Row 1 - Empty
    worksheet.getRow(1).height = 5;

    // Row 2 - Title (merged B2:I2)
    worksheet.mergeCells('B2:I2');
    const titleCell = worksheet.getCell('B2');
    titleCell.value = 'LAPORAN PRODUKSI SELESAI (LPS)';
    titleCell.font = { size: 14, bold: true };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(2).height = 25;

    // Row 3 - Complex header with merged cells
    worksheet.getRow(3).height = 20;
    
    // Merge B3:C3 (empty space before No. LPS)
    worksheet.mergeCells('B3:C3');
    const emptyCell = worksheet.getCell('B3');
    emptyCell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
      bottom: { style: 'thin' }
    };
    
    // D3 - "No. LPS :"
    const d3 = worksheet.getCell('D3');
    d3.value = 'No. LPS :';
    d3.font = { size: 10, bold: true };
    d3.alignment = { horizontal: 'right', vertical: 'middle' };
    d3.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
      bottom: { style: 'thin' }
    };
    
    // Merge E3:F3 - No. LPS value
    worksheet.mergeCells('E3:F3');
    const noLpsCell = worksheet.getCell('E3');
    noLpsCell.value = lpsDoc.no_lps || '';
    noLpsCell.font = { size: 10 };
    noLpsCell.alignment = { horizontal: 'center', vertical: 'middle' };
    noLpsCell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
      bottom: { style: 'thin' }
    };
    
    // G3 - "Tgl LPS :"
    const g3 = worksheet.getCell('G3');
    g3.value = 'Tgl LPS :';
    g3.font = { size: 10, bold: true };
    g3.alignment = { horizontal: 'right', vertical: 'middle' };
    g3.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
      bottom: { style: 'thin' }
    };
    
    // Merge H3:I3 - Tgl LPS value
    worksheet.mergeCells('H3:I3');
    const tglLpsCell = worksheet.getCell('H3');
    if (lpsDoc.tanggal) {
      const date = new Date(lpsDoc.tanggal);
      const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: '2-digit' 
      };
      const formattedDate = date.toLocaleDateString('en-GB', options);
      tglLpsCell.value = formattedDate;
    }
    tglLpsCell.font = { size: 10 };
    tglLpsCell.alignment = { horizontal: 'center', vertical: 'middle' };
    tglLpsCell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
      bottom: { style: 'thin' }
    };

    // Row 4 - Table header
    const headerRow = worksheet.getRow(4);
    headerRow.height = 25;
    
    const headers = [
      { col: 'B', text: 'PAPERCORE' },
      { col: 'C', text: 'NAMA ITEM' },
      { col: 'D', text: 'CUSTOMER' },
      { col: 'E', text: 'P.NUMBER' },
      { col: 'F', text: 'NO.SPK' },
      { col: 'G', text: 'PO' },
      { col: 'H', text: 'JUMLAH' },
      { col: 'I', text: 'BAHAN' }
    ];

    headers.forEach(({ col, text }) => {
      const cell = headerRow.getCell(col);
      cell.value = text;
      cell.font = { bold: true, size: 10 };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFFFF' }
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
        bottom: { style: 'thin' }
      };
    });

    // Data rows (starting from row 5)
    let lastDataRow = 4;
    if (lpsDoc.items && Array.isArray(lpsDoc.items)) {
      lpsDoc.items.forEach((item, index) => {
        const rowNum = 5 + index;
        lastDataRow = rowNum;
        const row = worksheet.getRow(rowNum);
        row.height = 35;

        const cellData = [
          { col: 'B', value: item.papercore || '', align: 'center' },
          { col: 'C', value: item.nama_item || '', align: 'left' },
          { col: 'D', value: item.customer || '', align: 'center' },
          { col: 'E', value: item.p_number || item.pn || '', align: 'center' },
          { col: 'F', value: item.no_spk || '', align: 'center' },
          { col: 'G', value: item.po || '', align: 'center' },
          { col: 'H', value: String(item.jumlah || item.jumlah_roll || 0), align: 'center' },
          { col: 'I', value: item.bahan || '', align: 'center' }
        ];

        cellData.forEach(({ col, value, align }) => {
          const cell = row.getCell(col);
          cell.value = value;
          cell.alignment = { horizontal: align, vertical: 'middle', wrapText: true };
          cell.font = { size: 10 };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' },
            bottom: { style: 'thin' }
          };
        });
      });
    }

    // Add empty rows with borders after data (at least 5 rows to match template)
    const emptyRowsCount = Math.max(5, 10 - (lpsDoc.items?.length || 0));
    for (let i = 1; i <= emptyRowsCount; i++) {
      const rowNum = lastDataRow + i;
      const row = worksheet.getRow(rowNum);
      row.height = 35;

      ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].forEach(col => {
        const cell = row.getCell(col);
        cell.value = '';
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' },
          bottom: { style: 'thin' }
        };
      });
    }

    // Add "Dibuat oleh," text
    const signatureRowNum = lastDataRow + emptyRowsCount + 2;
    const signatureCell = worksheet.getCell(`H${signatureRowNum}`);
    signatureCell.value = 'Dibuat oleh,';
    signatureCell.alignment = { horizontal: 'center', vertical: 'middle' };
    signatureCell.font = { size: 10 };

    // Generate filename
    const filename = `LPS_${lpsDoc.no_lps}_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Write the file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    alert('Gagal export ke Excel: ' + error.message);
    return false;
  }
}


/**
 * Export SJ document to Excel
 * @param {Object} sjDoc - SJ document data
 */
export async function exportSjToExcel(sjDoc) {
  try {
    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');

    // Set column widths
    worksheet.columns = [
      { width: 2 },   // A - empty
      { width: 38 },  // B - NAMA BARANG
      { width: 18 },  // C - PART NUMBER
      { width: 18 },  // D - CUSTOMER
      { width: 15 },  // E - QUANTITY
      { width: 2 }    // F - empty
    ];

    // Row 1 - Empty
    worksheet.getRow(1).height = 5;

    // Row 2 - Company name
    worksheet.mergeCells('B2:E2');
    const companyCell = worksheet.getCell('B2');
    companyCell.value = 'CV. RAJAWALI BINA MAJU ( Label )';
    companyCell.font = { size: 14, bold: true };
    companyCell.alignment = { horizontal: 'left', vertical: 'middle' };
    worksheet.getRow(2).height = 20;

    // Row 3 - Address line 1
    worksheet.mergeCells('B3:E3');
    const addr1Cell = worksheet.getCell('B3');
    addr1Cell.value = 'Pusat Pergudangan Romokalisari Blok. D-39';
    addr1Cell.font = { size: 10 };
    addr1Cell.alignment = { horizontal: 'left', vertical: 'middle' };
    worksheet.getRow(3).height = 15;

    // Row 4 - Address line 2
    worksheet.mergeCells('B4:E4');
    const addr2Cell = worksheet.getCell('B4');
    addr2Cell.value = 'KEC. BENOWO';
    addr2Cell.font = { size: 10 };
    addr2Cell.alignment = { horizontal: 'left', vertical: 'middle' };
    worksheet.getRow(4).height = 15;

    // Row 5 - Address line 3
    worksheet.mergeCells('B5:E5');
    const addr3Cell = worksheet.getCell('B5');
    addr3Cell.value = 'SURABAYA - JAWA TIMUR  60192';
    addr3Cell.font = { size: 10 };
    addr3Cell.alignment = { horizontal: 'left', vertical: 'middle' };
    worksheet.getRow(5).height = 15;

    // Row 6 - Empty
    worksheet.getRow(6).height = 10;

    // Row 7 - Delivery Order No
    worksheet.getRow(7).height = 15;
    const doLabelCell = worksheet.getCell('B7');
    doLabelCell.value = 'Delivery Order No :';
    doLabelCell.font = { size: 10, bold: true };
    doLabelCell.alignment = { horizontal: 'left', vertical: 'middle' };

    // Row 8 - DO Number value
    worksheet.getRow(8).height = 15;
    const doValueCell = worksheet.getCell('B8');
    doValueCell.value = sjDoc.no_sj || '';
    doValueCell.font = { size: 10 };
    doValueCell.alignment = { horizontal: 'left', vertical: 'middle' };

    // Row 7-8 right side - Dated and Deliver To
    const datedCell = worksheet.getCell('D7');
    datedCell.value = 'Dated';
    datedCell.font = { size: 10 };
    datedCell.alignment = { horizontal: 'left', vertical: 'middle' };

    const dateValueCell = worksheet.getCell('E7');
    if (sjDoc.tanggal) {
      const date = new Date(sjDoc.tanggal);
      const options = { 
        weekday: 'long', 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
      };
      dateValueCell.value = ': ' + date.toLocaleDateString('id-ID', options);
    }
    dateValueCell.font = { size: 10 };
    dateValueCell.alignment = { horizontal: 'left', vertical: 'middle' };

    const deliverToCell = worksheet.getCell('D8');
    deliverToCell.value = 'Deliver To';
    deliverToCell.font = { size: 10 };
    deliverToCell.alignment = { horizontal: 'left', vertical: 'middle' };

    const customerCell = worksheet.getCell('E8');
    customerCell.value = ':';
    customerCell.font = { size: 10 };
    customerCell.alignment = { horizontal: 'left', vertical: 'middle' };

    // Row 9 - Customer name
    worksheet.mergeCells('D9:E9');
    const customerNameCell = worksheet.getCell('D9');
    customerNameCell.value = sjDoc.customer || '';
    customerNameCell.font = { size: 10, bold: true };
    customerNameCell.alignment = { horizontal: 'left', vertical: 'middle' };
    worksheet.getRow(9).height = 15;

    // Row 10 - Customer address (if available)
    worksheet.mergeCells('D10:E10');
    const customerAddrCell = worksheet.getCell('D10');
    customerAddrCell.value = ''; // Could add customer address if available
    customerAddrCell.font = { size: 10 };
    customerAddrCell.alignment = { horizontal: 'left', vertical: 'middle' };
    worksheet.getRow(10).height = 15;

    // Row 11 - Empty
    worksheet.getRow(11).height = 10;

    // Row 12 - Table header
    const headerRow = worksheet.getRow(12);
    headerRow.height = 25;
    
    const headers = [
      { col: 'A', text: 'No.' },
      { col: 'B', text: 'Nama Barang' },
      { col: 'C', text: 'Part Number' },
      { col: 'D', text: 'Customer' },
      { col: 'E', text: 'Quantity' }
    ];

    headers.forEach(({ col, text }) => {
      const cell = headerRow.getCell(col);
      cell.value = text;
      cell.font = { bold: true, size: 10 };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9D9D9' }
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
        bottom: { style: 'thin' }
      };
    });

    // Data rows (starting from row 13)
    let lastDataRow = 12;
    if (sjDoc.items && Array.isArray(sjDoc.items)) {
      sjDoc.items.forEach((item, index) => {
        const rowNum = 13 + index;
        lastDataRow = rowNum;
        const row = worksheet.getRow(rowNum);
        row.height = 30;

        const cellData = [
          { col: 'A', value: index + 1, align: 'center' },
          { col: 'B', value: item.nama_item || '', align: 'left' },
          { col: 'C', value: item.pn || '', align: 'center' },
          { col: 'D', value: sjDoc.customer || '', align: 'center' },
          { col: 'E', value: `${item.jumlah || item.jumlah_roll || 0} Roll`, align: 'center' }
        ];

        cellData.forEach(({ col, value, align }) => {
          const cell = row.getCell(col);
          cell.value = value;
          cell.alignment = { horizontal: align, vertical: 'middle', wrapText: true };
          cell.font = { size: 10 };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' },
            bottom: { style: 'thin' }
          };
        });
      });
    }

    // Add signature section
    const signatureRowNum = lastDataRow + 3;
    worksheet.getRow(signatureRowNum).height = 15;
    
    const locationCell = worksheet.getCell(`D${signatureRowNum}`);
    if (sjDoc.tanggal) {
      const date = new Date(sjDoc.tanggal);
      locationCell.value = `Surabaya, ${date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`;
    } else {
      locationCell.value = 'Surabaya, _______________';
    }
    locationCell.alignment = { horizontal: 'center', vertical: 'middle' };
    locationCell.font = { size: 10 };

    const signatureTextRow = signatureRowNum + 1;
    worksheet.getRow(signatureTextRow).height = 15;
    const signatureTextCell = worksheet.getCell(`D${signatureTextRow}`);
    signatureTextCell.value = 'Diterima Oleh';
    signatureTextCell.alignment = { horizontal: 'center', vertical: 'middle' };
    signatureTextCell.font = { size: 10 };

    // Generate filename
    const filename = `SJ_${sjDoc.no_sj}_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Write the file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    alert('Gagal export ke Excel: ' + error.message);
    return false;
  }
}
