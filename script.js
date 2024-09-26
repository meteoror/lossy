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

async function processText() {
    const originalText = document.getElementById('input-text').value;
    
    const adjectives = (await loadFile('adjectives.txt')).split('\n').map(line => line.trim());
    const conjunctions = (await loadFile('conjunctions.txt')).split('\n').map(line => line.trim());

    const cleanedText = chunkRemoveClauses(originalText, conjunctions);
    const ultracleanedText = removeAdjectives(cleanedText, adjectives);
    const finalText = splitParagraph(ultracleanedText);

    const basicPercentage = calculatePercentageRemoved(originalText, cleanedText);
    const extraPercentage = calculatePercentageRemoved(cleanedText, ultracleanedText);
    const totalPercentage = calculatePercentageRemoved(originalText, ultracleanedText);

    document.getElementById('output-text').innerText = finalText;
    document.getElementById('output-percentage').innerText = `sentence cleaning:${basicPercentage}%\n word cleaning:${extraPercentage}%\n total cleaning:${totalPercentage}%`;
}

document.getElementById('compress-btn').addEventListener('click', processText);
