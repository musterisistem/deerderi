const fs = require('fs');
let css = fs.readFileSync('v6-design.css', 'utf8');

const popupCss = `
/* Search Popup Styles */
.search-popup {
    position: absolute;
    top: 100%;
    left: 0;
    width: 350px;
    background: #fff;
    border: 1px solid #eee;
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    opacity: 0;
    visibility: hidden;
    transform: translateY(10px);
    transition: all 0.3s ease;
    z-index: 1000;
    margin-top: 10px;
    overflow: hidden;
}

.search-popup.active {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

.search-popup-content {
    max-height: 400px;
    overflow-y: auto;
}

.search-result-item {
    display: flex;
    align-items: center;
    padding: 12px 15px;
    border-bottom: 1px solid #f5f5f5;
    text-decoration: none;
    color: var(--v6-text);
    transition: background-color 0.2s;
}

.search-result-item:last-child {
    border-bottom: none;
}

.search-result-item:hover {
    background-color: #f9f9f9;
}

.search-result-img {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 4px;
    margin-right: 12px;
}

.search-result-info {
    flex: 1;
    overflow: hidden;
}

.search-result-name {
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.search-result-price {
    font-size: 13px;
    font-weight: 600;
    color: var(--v6-primary);
}
.search-no-result {
    padding: 20px;
    text-align: center;
    color: #999;
    font-size: 14px;
}
`;

css += '\n' + popupCss;
fs.writeFileSync('v6-design.css', css);
console.log('v6-design.css updated with search popup styles.');
