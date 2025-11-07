export function jsonToGridCSS(config) {
    const cols = config.columnWidths?.join(' ') || Array(config.gridSize[0]).fill('1fr').join(' ')
    const rows = config.rowHeights?.join(' ') || Array(config.gridSize[1]).fill('1fr').join(' ')
    return `
        display: grid;
        grid-template-columns: ${cols};
        grid-template-rows: ${rows};
    `
}
