// Utility functions to read file content
console.log('JavaScript file is loaded');

async function loadFile(filepath) {
    const response = await fetch(filepath);
    if (!response.ok) throw new Error(`Failed to load ${filepath}`);
    return response.text();
}

function removeClarifyingClauses(text, conjunctions) {
    const conjunctionsPattern = conjunctions.map(c => `\\b${c}\\b`).join('|');
    const regex = new RegExp(`,\\s*((${conjunctionsPattern}).*?)\\s*,`, 'gi');
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

// Function to split the paragraphs by replacing periods with newlines
function splitParagraph(text) {
    return text.replace(/\. /g, '.\n - ');  // Ensure space after period is considered
}

function processText() {
    const originalText = document.getElementById('input-text').value;

    const cleanedText = removeClarifyingClauses(originalText, conjunctions);
    const ultracleanedText = removeAdjectives(cleanedText, adjectives);
    const finalText = splitParagraph(ultracleanedText);  // Split paragraphs

    const basicPercentage = calculatePercentageRemoved(originalText, cleanedText);
    const extraPercentage = calculatePercentageRemoved(cleanedText, ultracleanedText);
    const totalPercentage = calculatePercentageRemoved(originalText, ultracleanedText);

    document.getElementById('output-text').innerText = finalText;
    document.getElementById('output-percentage').innerText = `You saved ${basicPercentage}% with basic cleaning, and ${extraPercentage}% with advanced cleaning, for a total of ${totalPercentage}% removal!`;
}

document.getElementById('compress-btn').addEventListener('click', processText);
