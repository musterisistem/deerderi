
import re
import os

files_updates = {
    "I:/ANTIGRAVITY/PROJELER/DEER_DERI/checkout.html": [
        # Guest Phone
        (r'<input type="tel" id="guest-phone"[^>]*>', 
         r'<input type="tel" id="guest-phone" class="form-control" placeholder="05XX XXX XX XX" maxlength="11" oninput="this.value = this.value.replace(/[^0-9]/g, \'\').substring(0, 11)">'),
        # Guest TC (Fix duplicate oninput and structure)
        # Using specific placeholder to anchor
        (r'<input type="text" id="guest-tc"[\s\S]*?placeholder="Fatura için gereklidir">', 
         r'<input type="text" id="guest-tc" class="form-control" maxlength="11" oninput="this.value = this.value.replace(/[^0-9]/g, \'\').substring(0, 11)" placeholder="Fatura için gereklidir">')
    ],
    "I:/ANTIGRAVITY/PROJELER/DEER_DERI/register.html": [
        # Register Phone
        (r'<input type="tel" name="phone" id="phone"[^>]*>', 
         r'<input type="tel" name="phone" id="phone" placeholder=" " required maxlength="11" oninput="this.value = this.value.replace(/[^0-9]/g, \'\').substring(0, 11)">')
    ]
}

for file_path, replacements in files_updates.items():
    try:
        # Normalize path
        file_path = os.path.normpath(file_path)
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = content
        for pattern, replacement in replacements:
            # Use raw string for replacement to avoid escaping issues
            new_content = re.sub(pattern, replacement, new_content)
            
        if new_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {file_path}")
        else:
            print(f"No changes for {file_path} (Pattern found: {bool(re.search(replacements[0][0], content))})")
            
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
