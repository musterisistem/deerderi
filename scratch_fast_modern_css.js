const fs = require('fs');

let css = fs.readFileSync('admin.css', 'utf8');

// Update Root Variables
css = css.replace(/:root \{[\s\S]*?\}/, `:root {
    --primary-color: #3b82f6; /* blue-500 */
    --secondary-color: #2563eb; /* blue-600 */
    --accent-color: #1e293b; /* slate-800 */
    --bg-light: #f8fafc; /* slate-50 */
    --sidebar-bg: #0f172a; /* slate-900 */
    --text-dark: #0f172a;
    --text-muted: #64748b; /* slate-500 */
    --white: #ffffff;
    --border-color: #e2e8f0; /* slate-200 */
    --success-color: #10b981;
    --danger-color: #ef4444;
    --info-color: #0ea5e9;
    --sidebar-width: 250px;
    --top-bar-height: 60px;
    --transition: all 0.15s ease-in-out;
}`);

// Body Font
css = css.replace(/font-family: Arial, Helvetica, sans-serif;/, `font-family: 'Inter', sans-serif;`);

// Sidebar Nav
css = css.replace(/\.nav-link \{[\s\S]*?\}/, `.nav-link {
    display: flex;
    align-items: center;
    padding: 10px 14px;
    margin: 4px 12px;
    border-radius: 6px;
    color: #94a3b8;
    text-decoration: none;
    transition: var(--transition);
    gap: 10px;
    font-size: 14px;
    font-weight: 500;
}`);
css = css.replace(/\.nav-link:hover \{[\s\S]*?\}/, `.nav-link:hover {
    color: #f8fafc;
    background-color: #1e293b;
}`);
css = css.replace(/\.nav-link\.active \{[\s\S]*?\}/, `.nav-link.active {
    color: #ffffff;
    background-color: #334155;
    font-weight: 600;
}`);

// Card Styles
css = css.replace(/\.card \{[\s\S]*?\}/, `.card {
    background: var(--white);
    border-radius: 8px;
    border: 1px solid var(--border-color);
    box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03);
    padding: 20px;
    margin-bottom: 20px;
    transition: box-shadow 0.15s ease;
}`);

// Stat Card Hover
css = css.replace(/\.stat-card:hover \{[\s\S]*?\}/, `.stat-card:hover { 
    background-color: #fff;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03); 
    transform: translateY(-2px); 
}`);

// Tables
css = css.replace(/th \{[\s\S]*?\}/, `th {
    background-color: #f8fafc;
    text-align: left;
    padding: 12px;
    font-size: 12px;
    font-weight: 600;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid var(--border-color);
}`);
css = css.replace(/td \{[\s\S]*?\}/, `td {
    padding: 12px;
    border-bottom: 1px solid var(--border-color);
    font-size: 13px;
    color: #1e293b;
    background-color: #ffffff;
    transition: background-color 0.15s ease;
}`);
css = css.replace(/tr:hover td \{[\s\S]*?\}/, `tr:hover td {
    background-color: #f1f5f9 !important;
}`);

// Buttons
css = css.replace(/\.btn \{[\s\S]*?\}/, `.btn {
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    border: 1px solid transparent;
    transition: var(--transition);
    display: inline-flex;
    align-items: center;
    gap: 6px;
}`);

css = css.replace(/\.btn-primary \{[\s\S]*?\}/, `.btn-primary {
    background-color: var(--primary-color);
    color: var(--white);
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}`);
css = css.replace(/\.btn-edit \{[\s\S]*?\}/, `.btn-edit { background-color: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }`);
css = css.replace(/\.btn-delete \{[\s\S]*?\}/, `.btn-delete { background-color: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }`);

// Inputs
css = css.replace(/\.form-control \{[\s\S]*?\}/, `.form-control {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-family: inherit;
    font-size: 14px;
    transition: all 0.15s ease;
    box-shadow: 0 1px 2px rgba(0,0,0,0.02) inset;
}`);
css = css.replace(/\.form-control:focus \{[\s\S]*?\}/, `.form-control:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}`);

// Modals
css = css.replace(/\.modal-content \{[\s\S]*?\}/, `.modal-content {
    background-color: var(--white);
    width: 100%;
    max-width: 700px;
    max-height: 95vh;
    border-radius: 8px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideUp 0.2s ease-out;
}`);

fs.writeFileSync('admin.css', css, 'utf8');

// PRODUCT FORM CSS
let pfCss = fs.readFileSync('product-form.css', 'utf8');

pfCss = pfCss.replace(/border-radius:\s*0/g, 'border-radius: 6px');
pfCss = pfCss.replace(/\.form-control \{[\s\S]*?\}/, `.form-control {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 13px;
    background: #fff;
    transition: all 0.15s ease;
    box-shadow: 0 1px 2px rgba(0,0,0,0.02) inset;
}`);
pfCss = pfCss.replace(/box-shadow:\s*none;/g, 'box-shadow: 0 1px 3px rgba(0,0,0,0.05);');

fs.writeFileSync('product-form.css', pfCss, 'utf8');

console.log('Fast-Modern style applied to admin.css and product-form.css');
