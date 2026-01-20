$path = "i:\ANTIGRAVITY\PROJELER\DEER_DERI"
$files = Get-ChildItem -Path $path -Recurse -Include *.html,*.js
foreach ($file in $files) {
    if ($file.Name -eq "fix_currency.ps1") { continue }
    $content = Get-Content $file.FullName -Raw
    $original = $content
    
    # 1. Template Literals: ₺${expression} -> ${expression}₺
    $content = $content -replace '₺(\$\{[^}]+\})', '$1₺'
    
    # 2. Static Numbers: ₺123 or ₺123.45 or ₺123,45 -> 123₺ etc.
    $content = $content -replace '₺([0-9]+(?:[,.][0-9]+)?)', '$1₺'
    
    # 3. JS Concatenation: '₺' + expr -> expr + '₺'
    # Use explicit capturing for function calls or variables
    # Matches: '₺' + func(...) or '₺' + var
    $content = $content -replace "(['`""])₺\1\s*\+\s*([a-zA-Z0-9_.]+(?:\([^)]*\))?)", '$2 + $1₺$1'

    # 4. Plain text ₺ space -> space ₺ (e.g. "Total: ₺ ") -> "Total:  ₺"? 
    # Usually it is "Total: ₺100". Regex #2 handles the number part.
    # If "Total: ₺" appears at end of string?
    # Ignore for now.
    
    if ($content -ne $original) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8
        Write-Host "Updated $($file.Name)"
    }
}
