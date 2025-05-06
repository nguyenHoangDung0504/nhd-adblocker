const fs = require('fs');
const path = require('path');

// Đọc file urls.txt từ thư mục generateRules
const urls = fs.readFileSync(path.join(__dirname, 'urls.txt'), 'utf-8')
    .split('\n')
    .map(url => url.trim())
    .filter(url => url && !url.startsWith('#'));

const rules = urls.map((url, index) => ({
    id: index + 1,
    priority: 1,
    action: { type: "block" },
    condition: {
        urlFilter: url,
        resourceTypes: ["script", "image", "media", "xmlhttprequest", "stylesheet", "sub_frame", "main_frame", "other"]
    }
}));

// Ghi file rules.json trong thư mục generateRules
const jsonString = JSON.stringify(rules);
fs.writeFileSync('rules.json', jsonString);
console.log("Rules have been written to rules.json");