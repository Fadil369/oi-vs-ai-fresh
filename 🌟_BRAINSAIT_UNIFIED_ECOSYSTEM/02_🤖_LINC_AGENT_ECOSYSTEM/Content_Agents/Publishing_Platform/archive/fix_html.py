#!/usr/bin/env python3
import re

# Read the original file
with open('/Users/fadil369/AGENTS/raw-arabic.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the first occurrence of </html>
first_html_close = content.find('</html>')

# Extract content before first </html>
main_content = content[:first_html_close]

# Extract content after first </html> (which contains misplaced chapters)
extra_content = content[first_html_close + 7:]  # +7 to skip </html>

# Find where chapter 3 ends (around line 1830)
chapter3_end = main_content.find('<!-- Chapter 5 -->')

# Extract everything up to chapter 3
content_before_chapter4 = main_content[:chapter3_end].strip()

# Find chapter 4 in the extra content
chapter4_match = re.search(r'<!-- Chapter 4 -->.*?(?=<!-- Chapter 5 -->|$)', extra_content, re.DOTALL)
if chapter4_match:
    chapter4_content = chapter4_match.group(0).strip()
else:
    print("Chapter 4 not found!")
    chapter4_content = ""

# Find the real chapter 5 (in extra content after chapter 4)
chapter5_start = extra_content.find('<!-- Chapter 5 -->', extra_content.find('<!-- Chapter 4 -->') + 1)
chapter5_match = re.search(r'<!-- Chapter 5 -->.*?(?=<!-- Chapter|$)', extra_content[chapter5_start:], re.DOTALL)
if chapter5_match:
    chapter5_content = chapter5_match.group(0).strip()
else:
    # Use the chapter 5 from main content
    chapter5_match = re.search(r'<!-- Chapter 5 -->.*?(?=<!-- Paywall|$)', main_content, re.DOTALL)
    if chapter5_match:
        chapter5_content = chapter5_match.group(0).strip()
    else:
        print("Chapter 5 not found!")
        chapter5_content = ""

# Extract remaining chapters (6-20) from extra content
remaining_chapters = []
for i in range(6, 21):
    chapter_pattern = rf'<!-- Chapter {i} -->.*?(?=<!-- Chapter|<div class="chapter" id="about-author">|$)'
    chapter_match = re.search(chapter_pattern, extra_content, re.DOTALL)
    if chapter_match:
        remaining_chapters.append(chapter_match.group(0).strip())

# Extract glossary and about author sections
glossary_match = re.search(r'<!-- Glossary -->.*?(?=<!-- About Author -->|$)', content, re.DOTALL)
if not glossary_match:
    # Try to find glossary section
    glossary_match = re.search(r'<div class="glossary".*?</div>\s*</div>', content, re.DOTALL)

about_author_match = re.search(r'<div class="chapter" id="about-author">.*?</div>\s*</div>', extra_content, re.DOTALL)

# Extract the paywall and footer sections from main content
paywall_match = re.search(r'<!-- Paywall Overlay -->.*?<!-- Footer -->', main_content, re.DOTALL)
footer_match = re.search(r'<!-- Footer -->.*?</script>', main_content, re.DOTALL)

# Build the fixed HTML
fixed_html = content_before_chapter4 + "\n\n"
fixed_html += "    " + chapter4_content + "\n\n"
fixed_html += "    " + chapter5_content + "\n\n"

# Add remaining chapters
for chapter in remaining_chapters:
    fixed_html += "    " + chapter + "\n\n"

# Add glossary if found
if glossary_match:
    fixed_html += "    " + glossary_match.group(0).strip() + "\n\n"

# Add about author if found
if about_author_match:
    fixed_html += "    " + about_author_match.group(0).strip() + "\n\n"

# Add paywall section
if paywall_match:
    fixed_html += "    " + paywall_match.group(0).strip() + "\n\n"

# Add footer and closing tags
if footer_match:
    fixed_html += "    " + footer_match.group(0).strip() + "\n"

fixed_html += "</body>\n</html>"

# Write the fixed HTML
with open('/Users/fadil369/AGENTS/arabic-fixed.html', 'w', encoding='utf-8') as f:
    f.write(fixed_html)

print("HTML file has been fixed and saved as 'arabic-fixed.html'")