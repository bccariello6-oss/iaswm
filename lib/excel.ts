import * as XLSX from 'xlsx';

interface RequestData {
    osNumber: string;
    osType: string;
    usageArea: string;
    projectNumber: string;
    assetNumber: string;
    estimatedValue: number;
    priority: string;
    justification: string;
    requesterName?: string; // Optional, can be fetched if needed
    items: Array<{
        code?: string; // For services
        sku?: string; // For parts
        description?: string; // For services
        name?: string; // For parts
        quantity: number;
        unit: string;
    }>;
}

export const generateRequestExcel = (data: RequestData, type: 'Material' | 'Serviço') => {
    // 1. Format Header Data
    const header = [
        ['REQUISIÇÃO DE ' + type.toUpperCase()],
        ['Data:', new Date().toLocaleDateString()],
        [''],
        ['DADOS DA OS'],
        ['Número da OS', data.osNumber || 'N/A'],
        ['Tipo de Intervenção', data.osType],
        ['Área de Aplicação', data.usageArea],
        ['Projeto', data.projectNumber || 'N/A'],
        ['Ativo', data.assetNumber || 'N/A'],
        ['Valor Estimado', data.estimatedValue ? `R$ ${data.estimatedValue.toFixed(2)}` : 'R$ 0,00'],
        ['Prioridade', data.priority],
        ['Justificativa', data.justification],
        [''],
        ['ITENS SOLICITADOS']
    ];

    // 2. Format Items Table
    const tableHeaders = type === 'Material'
        ? ['Código (SKU)', 'Descrição / Peça', 'Quantidade', 'Unidade', 'Valor Unit. Est.']
        : ['Código', 'Descrição do Serviço', 'Quantidade', 'Unidade', 'Valor Unit. Est.'];

    const tableRows = data.items.map(item => {
        if (type === 'Material') {
            return [
                item.sku || '',
                item.name || '',
                item.quantity,
                item.unit,
                (item as any).estimatedValue ? `R$ ${(item as any).estimatedValue.toFixed(2)}` : '-'
            ];
        } else {
            return [
                item.code || '',
                item.description || '',
                item.quantity,
                item.unit,
                (item as any).estimatedValue ? `R$ ${(item as any).estimatedValue.toFixed(2)}` : '-'
            ];
        }
    });

    // Combine all data
    const worksheetData = [...header, tableHeaders, ...tableRows];

    // 3. Create Workbook and Worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Styling hints could be added here if needed, but basic XLSX support is limited for free versions
    // Setting column widths for better visibility
    worksheet['!cols'] = [
        { wch: 20 }, // Col A
        { wch: 40 }, // Col B
        { wch: 15 }, // Col C
        { wch: 15 }, // Col D
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Requisição');

    // 4. Generate Filename
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `Requisicao_${type}_${data.osNumber || 'SemOS'}_${dateStr}.xlsx`;

    // 5. Trigger Download
    XLSX.writeFile(workbook, filename);
};
