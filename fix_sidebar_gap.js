const fs = require('fs');
let css = fs.readFileSync('v6-design.css', 'utf8');

// Remove the old sidebar menu block I added
const oldBlock = `
/* ===== Dynamic Sidebar Menu ===== */
.v6-sidebar-nav a {
    display: flex;
    align-items: center;
    gap: 0;
}
.v6-sidebar-nav a .menu-icon-svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    margin-right: 8px;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
}
/* Pulse/glow animation for animated menu icons */
@keyframes menuIconPulse {
    0%   { opacity: 1; transform: scale(1); }
    50%  { opacity: 0.35; transform: scale(0.88); }
    100% { opacity: 1; transform: scale(1); }
}
.menu-icon-svg.is-animated {
    animation: menuIconPulse 2s ease-in-out infinite;
}`;

css = css.replace(oldBlock, '');

// Add corrected block
const newBlock = `
/* ===== Dynamic Sidebar Menu Icons ===== */
.v6-sidebar-nav a {
    display: flex !important;
    align-items: center !important;
    justify-content: flex-start !important;
    gap: 0 !important;
}
.menu-icon-svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    margin-right: 6px;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
    display: inline-block;
    vertical-align: middle;
}
/* Pulse/glow animation for animated menu icons */
@keyframes menuIconPulse {
    0%   { opacity: 1; transform: scale(1); }
    50%  { opacity: 0.3; transform: scale(0.85); }
    100% { opacity: 1; transform: scale(1); }
}
.menu-icon-svg.is-animated {
    animation: menuIconPulse 2s ease-in-out infinite;
}`;

css += '\n' + newBlock;
fs.writeFileSync('v6-design.css', css);
console.log('v6-design.css: sidebar icon spacing fixed.');
