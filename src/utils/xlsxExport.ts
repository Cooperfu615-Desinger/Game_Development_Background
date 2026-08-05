export interface XlsxColumn {
    key: string
    label: string
}

function escapeXml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
}

function columnName(index: number) {
    let value = index + 1
    let name = ''
    while (value > 0) {
        const remainder = (value - 1) % 26
        name = String.fromCharCode(65 + remainder) + name
        value = Math.floor((value - 1) / 26)
    }
    return name
}

function textCell(reference: string, value: unknown, style = '') {
    const text = value === null || value === undefined ? '' : String(value)
    return `<c r="${reference}" t="inlineStr"${style ? ` s="${style}"` : ''}><is><t xml:space="preserve">${escapeXml(text)}</t></is></c>`
}

function concatBytes(parts: Uint8Array[]) {
    const length = parts.reduce((total, part) => total + part.length, 0)
    const result = new Uint8Array(length)
    let offset = 0
    for (const part of parts) {
        result.set(part, offset)
        offset += part.length
    }
    return result
}

function u16(value: number) {
    return new Uint8Array([value & 0xff, (value >>> 8) & 0xff])
}

function u32(value: number) {
    return new Uint8Array([
        value & 0xff,
        (value >>> 8) & 0xff,
        (value >>> 16) & 0xff,
        (value >>> 24) & 0xff,
    ])
}

function crc32(bytes: Uint8Array) {
    let crc = 0xffffffff
    for (const byte of bytes) {
        crc ^= byte
        for (let bit = 0; bit < 8; bit += 1) {
            crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
        }
    }
    return (crc ^ 0xffffffff) >>> 0
}

function zipStore(files: Array<{ name: string; content: string }>) {
    const encoder = new TextEncoder()
    const localParts: Uint8Array[] = []
    const centralParts: Uint8Array[] = []
    let offset = 0

    for (const file of files) {
        const name = encoder.encode(file.name)
        const data = encoder.encode(file.content)
        const checksum = crc32(data)
        const localHeader = concatBytes([
            u32(0x04034b50), u16(20), u16(0), u16(0), u16(0), u16(0), u32(checksum), u32(data.length), u32(data.length), u16(name.length), u16(0), name, data,
        ])
        localParts.push(localHeader)

        const centralHeader = concatBytes([
            u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(0), u16(0), u32(checksum), u32(data.length), u32(data.length), u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), name,
        ])
        centralParts.push(centralHeader)
        offset += localHeader.length
    }

    const local = concatBytes(localParts)
    const central = concatBytes(centralParts)
    const end = concatBytes([
        u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(central.length), u32(local.length), u16(0),
    ])
    return concatBytes([local, central, end])
}

function triggerDownload(bytes: Uint8Array, filename: string) {
    const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.xlsx`
    link.click()
    URL.revokeObjectURL(url)
}

/**
 * Create a dependency-free XLSX workbook with one worksheet.
 * The archive intentionally uses ZIP "store" entries; Excel supports this
 * valid XLSX shape and it keeps the prototype build free of a large library.
 */
export function exportToXlsx(data: Array<Record<string, unknown>>, filename: string, columns: XlsxColumn[]) {
    const rows = [
        columns.map((column) => column.label),
        ...data.map((item) => columns.map((column) => item[column.key])),
    ]
    const sheetRows = rows.map((row, rowIndex) => {
        const cells = row.map((value, columnIndex) => textCell(`${columnName(columnIndex)}${rowIndex + 1}`, value, rowIndex === 0 ? '1' : ''))
        return `<row r="${rowIndex + 1}">${cells.join('')}</row>`
    }).join('')

    const files = [
        {
            name: '[Content_Types].xml',
            content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>',
        },
        {
            name: '_rels/.rels',
            content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
        },
        {
            name: 'xl/workbook.xml',
            content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Game Rounds" sheetId="1" r:id="rId1"/></sheets></workbook>',
        },
        {
            name: 'xl/_rels/workbook.xml.rels',
            content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
        },
        {
            name: 'xl/styles.xml',
            content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Aptos"/></font><font><b/><sz val="11"/><name val="Aptos"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0"/></cellXfs></styleSheet>',
        },
        {
            name: 'xl/worksheets/sheet1.xml',
            content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheetRows}</sheetData></worksheet>`,
        },
    ]

    triggerDownload(zipStore(files), filename)
}
