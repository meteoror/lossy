// Utility functions to read file content
async function loadFile(filepath) {
    const response = await fetch(filepath);
    if (!response.ok) throw new Error(`Failed to load ${filepath}`);
    return response.text();
}

function chunkRemoveClauses(text, conjunctions) {
    const conjunctionsPattern = conjunctions.map(c => `\\b${c}\\b`).join('|');
    const regex = new RegExp(`,\\s*((${conjunctionsPattern}).*?)\\s*,`, 'gi');
    return text.replace(regex, '');
}

function removeClauses(text, conjunctions) {
    const conjunctionsPattern = conjunctions.map(c => `\\b${c}\\b`).join('|');
    // Updated regex to ensure there are no periods between the commas
    const regex = new RegExp(`,\\s*((${conjunctionsPattern})[^.]*?)\\s*,`, 'gi');
    return text.replace(regex, '');
}

function removeAdjectives(text, adjectives) {
    const adjectivePattern = adjectives.map(adj => `\\b${adj}\\b`).join('|');
    const regex = new RegExp(adjectivePattern, 'gi');
    return text.replace(regex, '').replace(/\s+/g, ' ').trim();
}

function calculatePercentageRemoved(originalText, compressedText) {
    const originalLength = originalText.length;
    const compressedLength = compressedText.length;
    if (originalLength === 0) return 0;
    return (((originalLength - compressedLength) / originalLength) * 100).toFixed(2);
}

function splitParagraph(text) {
    return text.replace(/\.\s*/g, '.\n -');
}

async function processText(applyNotate = false) {
    const originalText = document.getElementById('input-text').value;
    const compressionAmount = document.getElementById('compression-range').value;
    
    const adjectives = (await loadFile('adjectives.txt')).split('\n').map(line => line.trim());
    const conjunctions = (await loadFile('conjunctions.txt')).split('\n').map(line => line.trim());

    let cleanedText = originalText;

    // Apply compression based on slider value
    if (compressionAmount == 1) {
        // Only remove adjectives
        cleanedText = removeAdjectives(cleanedText, adjectives);
    } 
    else if (compressionAmount == 2) {
        // Remove adjectives and regular clarifying clauses
        cleanedText = removeAdjectives(cleanedText, adjectives);
        cleanedText = removeClauses(cleanedText, conjunctions);
    } 
    else if (compressionAmount == 3) {
        // Chunk remove clauses first, then remove adjectives
        cleanedText = chunkRemoveClauses(originalText, conjunctions);
        cleanedText = removeAdjectives(cleanedText, adjectives);
    }

    // Optionally apply paragraph splitting (notation)
    if (applyNotate) {
        cleanedText = splitParagraph(cleanedText);
    }

    const basicPercentage = calculatePercentageRemoved(originalText, cleanedText);
    const totalPercentage = calculatePercentageRemoved(originalText, cleanedText);

    document.getElementById('output-text').innerText = cleanedText;
    document.getElementById('output-percentage').innerText = `compression amount: ${compressionAmount}\n total cleaning: ${totalPercentage}%`;
}

// Event listeners for compression and notate
document.getElementById('compress-btn').addEventListener('click', () => processText(false));
document.getElementById('notate-btn').addEventListener('click', () => processText(true));

// Update slider label when value changes
document.getElementById('compression-range').addEventListener('input', function() {
    document.getElementById('compression-value').innerText = this.value;
});
