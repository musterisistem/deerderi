const fs = require('fs');

// ----- 1. Add CSS to v6-design.css (sidebar menu icons + pulse anim) -----
let css = fs.readFileSync('v6-design.css', 'utf8');
const sidebarMenuCss = `
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
}
`;
css += '\n' + sidebarMenuCss;
fs.writeFileSync('v6-design.css', css);
console.log('v6-design.css updated.');

// ----- 2. Add CSS to admin.css (animation toggle UI) -----
let adminCss = fs.readFileSync('admin.css', 'utf8');
const adminAnimCss = `
/* Menu animation toggle */
.anim-toggle-wrap {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    user-select: none;
    font-size: 12px;
    color: #555;
}
.anim-toggle-wrap input[type="checkbox"] {
    width: 14px;
    height: 14px;
    cursor: pointer;
    accent-color: var(--primary-color);
}
.anim-toggle-label {
    font-size: 11px;
    color: #777;
}
.anim-demo {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
}
@keyframes adminIconPulse {
    0%   { opacity: 1; transform: scale(1); }
    50%  { opacity: 0.3; transform: scale(0.85); }
    100% { opacity: 1; transform: scale(1); }
}
.anim-demo.is-animated svg,
.anim-demo.is-animated i {
    animation: adminIconPulse 1.5s ease-in-out infinite;
}
`;
adminCss += '\n' + adminAnimCss;
fs.writeFileSync('admin.css', adminCss);
console.log('admin.css updated.');
