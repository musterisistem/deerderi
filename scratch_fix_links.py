import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace trendyol links in product cards with product.html
content = re.sub(r'href="https://www\.trendyol\.com/[^"]+"', 'href="product.html"', content)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated links in index.html")
