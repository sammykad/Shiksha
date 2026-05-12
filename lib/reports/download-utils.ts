'use client';

interface ExcelData {
    sheetName: string;
    headers: string[];
    rows: (string | number)[][];
}

function escapeXml(value: string | number) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function downloadBlob(content: BlobPart, filename: string, type: string) {
    const blob = new Blob([content], { type });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

/**
 * Convert JSON data to Excel and trigger download
 */
export function downloadExcel(jsonData: string, filename: string) {
    const data: ExcelData = JSON.parse(jsonData);
    const excelFilename = filename.replace(/\.xlsx$/i, '.xls');

    const columns = data.headers.map((header, i) => {
        const longestValue = Math.max(
            header.length,
            ...data.rows.map(row => String(row[i] || '').length)
        );
        const width = Math.min(Math.max(longestValue + 4, 12), 60) * 7;

        return `<Column ss:AutoFitWidth="0" ss:Width="${width}"/>`;
    }).join('');

    const rows = [data.headers, ...data.rows].map((row) => {
        const cells = row.map((cell) => {
            const type = typeof cell === 'number' ? 'Number' : 'String';

            return `<Cell><Data ss:Type="${type}">${escapeXml(cell)}</Data></Cell>`;
        }).join('');

        return `<Row>${cells}</Row>`;
    }).join('');

    const workbook = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
    xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:x="urn:schemas-microsoft-com:office:excel"
    xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
    <Worksheet ss:Name="${escapeXml(data.sheetName)}">
        <Table>
            ${columns}
            ${rows}
        </Table>
    </Worksheet>
</Workbook>`;

    downloadBlob(
        workbook,
        excelFilename,
        'application/vnd.ms-excel;charset=utf-8;'
    );
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string) {
    downloadBlob(csvContent, filename, 'text/csv;charset=utf-8;');
}
