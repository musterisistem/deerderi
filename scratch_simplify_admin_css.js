const fs = require('fs');
let css = fs.readFileSync('admin.css', 'utf8');

// 1. Replace variables
css = css.replace(/:root \{[\s\S]*?\}/, `:root {
    --primary-color: #333;
    --secondary-color: #555;
    --accent-color: #333;
    --bg-light: #f5f5f5;
    --sidebar-bg: #2c3e50;
    --text-dark: #333;
    --text-muted: #666;
    --white: #fff;
    --border-color: #ccc;
    --success-color: #28a745;
    --danger-color: #dc3545;
    --info-color: #17a2b8;
    --sidebar-width: 220px;
    --top-bar-height: 50px;
    --transition: none;
}`);

// 2. Remove shadows and large rounded corners globally
css = css.replace(/box-shadow:\s*[^;]+;/g, 'box-shadow: none;');
css = css.replace(/border-radius:\s*(12px|16px|8px|6px)/g, 'border-radius: 0');
css = css.replace(/border-radius:\s*4px/g, 'border-radius: 0');

// 3. Dense paddings
css = css.replace(/padding:\s*30px/g, 'padding: 15px');
css = css.replace(/padding:\s*25px/g, 'padding: 10px');
css = css.replace(/padding:\s*20px/g, 'padding: 10px');
css = css.replace(/padding:\s*40px/g, 'padding: 15px');
css = css.replace(/margin-bottom:\s*40px/g, 'margin-bottom: 15px');
css = css.replace(/margin-bottom:\s*30px/g, 'margin-bottom: 15px');
css = css.replace(/margin-bottom:\s*25px/g, 'margin-bottom: 10px');
css = css.replace(/margin-bottom:\s*20px/g, 'margin-bottom: 10px');

// 4. Sidebar fixes
css = css.replace(/\.nav-link \{[\s\S]*?\}/, `.nav-link {
    display: flex;
    align-items: center;
    padding: 8px 10px;
    margin: 2px 5px;
    border-radius: 0;
    color: #bbb;
    text-decoration: none;
    gap: 8px;
    font-size: 13px;
    font-weight: 400;
}`);
css = css.replace(/\.nav-link:hover \{[\s\S]*?\}/, `.nav-link:hover {
    color: #fff;
    background-color: rgba(255,255,255,0.1);
}`);
css = css.replace(/\.nav-link\.active \{[\s\S]*?\}/, `.nav-link.active {
    color: #fff;
    background-color: rgba(255,255,255,0.2);
    font-weight: bold;
}`);
css = css.replace(/\.sidebar-header h3 \{[\s\S]*?\}/, `.sidebar-header h3 { font-size: 14px; font-weight: bold; color: #fff; margin:0; }`);

// 5. Stat cards hover fix
css = css.replace(/\.stat-card:hover \{[\s\S]*?\}/, `.stat-card:hover { background-color: #f9f9f9; }`);

// 6. Card and Table styles
css = css.replace(/\.card \{[\s\S]*?\}/, `.card {
    background: var(--white);
    border-radius: 0;
    border: 1px solid var(--border-color);
    padding: 15px;
    margin-bottom: 15px;
}`);

css = css.replace(/th \{[\s\S]*?\}/, `th {
    background-color: #eee;
    text-align: left;
    padding: 8px;
    font-size: 12px;
    font-weight: bold;
    color: #333;
    border: 1px solid #ccc;
}`);
css = css.replace(/td \{[\s\S]*?\}/, `td {
    padding: 8px;
    border: 1px solid #ccc;
    font-size: 12px;
}`);

// 7. Button styles
css = css.replace(/\.btn \{[\s\S]*?\}/, `.btn {
    padding: 4px 10px;
    border-radius: 0;
    font-size: 12px;
    font-weight: normal;
    cursor: pointer;
    border: 1px solid #999;
    background-color: #eee;
    color: #333;
    display: inline-flex;
    align-items: center;
    gap: 5px;
}`);

css = css.replace(/\.btn-primary \{[\s\S]*?\}/, `.btn-primary {
    background-color: #007bff;
    color: #fff;
    border: 1px solid #0062cc;
}`);
css = css.replace(/\.btn-edit \{[\s\S]*?\}/, `.btn-edit { background-color: #ffc107; color: #000; border: 1px solid #d39e00; }`);
css = css.replace(/\.btn-delete \{[\s\S]*?\}/, `.btn-delete { background-color: #dc3545; color: #fff; border: 1px solid #bd2130; }`);

// 8. Modals
css = css.replace(/\.modal-content \{[\s\S]*?\}/, `.modal-content {
    background-color: var(--white);
    width: 100%;
    max-width: 800px;
    max-height: 95vh;
    border: 1px solid #666;
    border-radius: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}`);

// 9. Forms
css = css.replace(/\.form-control \{[\s\S]*?\}/, `.form-control {
    width: 100%;
    padding: 6px 8px;
    border: 1px solid var(--border-color);
    border-radius: 0;
    font-family: inherit;
    font-size: 13px;
}`);

// Body font
css = css.replace(/font-family: 'Inter', sans-serif;/, `font-family: Arial, Helvetica, sans-serif;`);

fs.writeFileSync('admin.css', css, 'utf8');
console.log('admin.css successfully simplified to standard utilitarian layout');
