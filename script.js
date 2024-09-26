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
    return text.replace(/\.\s*/g, '.\n -    ');
}

async function processText() {
    const originalText = document.getElementById('input-text').value;
    
    const adjectives = (await loadFile('adjectives.txt')).split('\n').map(line => line.trim());
    const conjunctions = (await loadFile('conjunctions.txt')).split('\n').map(line => line.trim());

    let cleanedText = originalText;

    // Apply actions based on toggles
    const isCompressionToggled = document.getElementById('toggle-compression').checked;
    const isAdjectiveRemove = document.getElementById('toggle-adjectiveRemove').checked;
    const isNotate = document.getElementById('toggle-notate').checked;

    // Apply transformations
    if (isCompressionToggled) {
        cleanedText = chunkRemoveClauses(cleanedText, conjunctions);
    } else {
        cleanedText = removeClauses(cleanedText, conjunctions);
    }

    if (isAdjectiveRemove) {
        cleanedText = removeAdjectives(cleanedText, adjectives);
    }

    // Optionally apply paragraph splitting (notation)
    if (isNotate) {
        cleanedText = splitParagraph(cleanedText);
    }

    const totalPercentage = calculatePercentageRemoved(originalText, cleanedText);

    // Update UI with results
    document.getElementById('output-text').innerText = cleanedText;
    document.getElementById('output-percentage').innerText = `cleaning: ${totalPercentage}%`;
}

// Event listeners for compression
document.getElementById('compress-btn').addEventListener('click', processText);

// Change the displayed text when toggled
document.getElementById('toggle-compression').addEventListener('change', function() {
    const modeText = this.checked ? 'chunk' : 'segment';
    document.getElementById('compression-mode').innerText = modeText;
});
