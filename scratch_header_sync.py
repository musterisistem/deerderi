import re
import os

with open('index.html', 'r', encoding='utf-8') as f:
    index_content = f.read()

# Extract v6 header (from top bar to sidebar menu end)
header_match = re.search(r'(<!-- 1\. Top Bar \(Campaign Marquee\) -->.*?</nav>\s*</div>)', index_content, re.DOTALL)
if header_match:
    v6_header = header_match.group(1)
else:
    print("Could not find v6 header in index.html")
    exit(1)

# Extract v6 footer
footer_match = re.search(r'(<footer id="dynamic-footer">.*?</footer>)', index_content, re.DOTALL)
if footer_match:
    v6_footer = footer_match.group(1)
else:
    print("Could not find v6 footer in index.html")
    exit(1)

with open('product.html', 'r', encoding='utf-8') as f:
    product_content = f.read()

# Add v6-design.css to product.html if not present
if 'v6-design.css' not in product_content:
    product_content = product_content.replace(
        '<link rel="stylesheet" href="/styles.css">',
        '<link rel="stylesheet" href="/styles.css">\n    <link rel="stylesheet" href="v6-design.css?v=206">'
    )

# Add v6-script.js to product.html if not present
if 'v6-script.js' not in product_content:
    product_content = product_content.replace(
        '</body>',
        '    <script src="v6-script.js"></script>\n</body>'
    )

# Replace old header
# The old header starts with <!-- 1. Duyuru Bandı --> and ends with </header> (around line 859)
product_content = re.sub(r'<!-- 1\. Duyuru Bandı -->.*?</header>', v6_header, product_content, flags=re.DOTALL)

# Replace old footer
product_content = re.sub(r'<footer id="dynamic-footer">.*?</footer>', v6_footer, product_content, flags=re.DOTALL)

with open('product.html', 'w', encoding='utf-8') as f:
    f.write(product_content)

print("Successfully synced header and footer to product.html")
