#!/usr/bin/env python3
"""
Extracts verbatim section data from capture/html/progress-in-medicine/index.html
and writes src/data/progress-in-medicine-sections.json for use by the Astro page.

Run: python3 scripts/extract-progress-in-medicine.py
"""

import json
import re
import sys
from html.parser import HTMLParser

CAPTURE_PATH = "capture/html/progress-in-medicine/index.html"
OUTPUT_PATH = "src/data/progress-in-medicine-sections.json"


def clean_html(html):
    """Strip WordPress-specific comments and excess whitespace from HTML."""
    # Remove Notion/WP comments
    html = re.sub(r'<!-- notionvc:[^>]+ -->', '', html)
    # Remove link stylesheet tags inside sections (loaded globally in Astro)
    html = re.sub(r'<link[^>]+rel="stylesheet"[^>]*>', '', html)
    # Collapse runs of whitespace (preserve single spaces)
    html = re.sub(r'\s+', ' ', html).strip()
    return html


def extract_attr(tag_str, attr):
    """Extract an attribute value from an opening tag string."""
    m = re.search(rf'{attr}=["\']([^"\']*)["\']', tag_str)
    return m.group(1) if m else None


def extract_inner(html, tag_open, tag_close="</section>"):
    """Extract everything between a tag's opening and its matching closing tag."""
    start = html.find(tag_open)
    if start == -1:
        return None, -1
    tag_end = html.find('>', start) + 1
    depth = 1
    i = tag_end
    tag_name = tag_open.lstrip('<').split()[0].rstrip('>')
    while i < len(html) and depth > 0:
        next_open = html.find(f'<{tag_name}', i)
        next_close = html.find(f'</{tag_name}>', i)
        if next_close == -1:
            break
        if next_open != -1 and next_open < next_close:
            depth += 1
            i = next_open + 1
        else:
            depth -= 1
            if depth == 0:
                return html[tag_end:next_close], next_close + len(f'</{tag_name}>')
            i = next_close + 1
    return None, -1


def parse_sections(html):
    """Walk the content area and extract each top-level section."""
    # Find main content (between LAYOUT:HEADER and end of main)
    main_start = html.find('<main')
    main_end = html.find('</main>')
    if main_start == -1:
        main_start = 0
    if main_end == -1:
        main_end = len(html)
    body = html[main_start:main_end]

    sections = []
    pos = 0
    while True:
        sec_start = body.find('<section', pos)
        if sec_start == -1:
            break
        # Get the opening tag
        tag_end = body.find('>', sec_start) + 1
        tag_str = body[sec_start:tag_end]
        classes = extract_attr(tag_str, 'class') or ''
        sec_id = extract_attr(tag_str, 'id') or ''
        style = extract_attr(tag_str, 'style') or ''
        data_view = 'data-view' in tag_str

        # Find matching </section>
        depth = 1
        i = tag_end
        while i < len(body) and depth > 0:
            next_open = body.find('<section', i)
            next_close = body.find('</section>', i)
            if next_close == -1:
                break
            if next_open != -1 and next_open < next_close:
                depth += 1
                i = next_open + 1
            else:
                depth -= 1
                if depth == 0:
                    inner = body[tag_end:next_close]
                    pos = next_close + len('</section>')
                    sections.append({
                        'classes': classes.split(),
                        'id': sec_id,
                        'style': style,
                        'data_view': data_view,
                        'inner_html': clean_html(inner),
                    })
                    break
                i = next_close + 1
        else:
            break
    return sections


def extract_expert_data(inner_html):
    """Extract expert card data from section.fellows inner HTML."""
    experts = []

    # Find each col div (person card)
    col_pattern = re.compile(
        r'<div class="col-6-sm col-4-md" id="([^"]+)">(.*?)'
        r'<div class="popup"[^>]*>.*?</div>\s*</div>',
        re.DOTALL
    )
    for m in col_pattern.finditer(inner_html):
        expert_id = m.group(1)
        card_html = m.group(2)

        name_m = re.search(r'<h4>(.*?)</h4>', card_html, re.DOTALL)
        name = clean_html(name_m.group(1)) if name_m else ''

        pos_m = re.search(r'<div class="position">(.*?)</div>', card_html, re.DOTALL)
        position = clean_html(pos_m.group(1)) if pos_m else ''

        img_m = re.search(r'<div class="thumb">\s*<img([^>]+)>', card_html)
        if img_m:
            img_attrs = img_m.group(1)
            src_m = re.search(r'src="([^"]+)"', img_attrs)
            w_m = re.search(r'width="(\d+)"', img_attrs)
            h_m = re.search(r'height="(\d+)"', img_attrs)
            image = src_m.group(1) if src_m else None
            image_width = int(w_m.group(1)) if w_m else None
            image_height = int(h_m.group(1)) if h_m else None
        else:
            image = image_width = image_height = None

        bio_m = re.search(r'<div class="bio mh"[^>]*>(.*?)</div>', card_html, re.DOTALL)
        bio = clean_html(bio_m.group(1)) if bio_m else ''

        # LinkedIn link
        li_m = re.search(
            r'<a href="(https://www\.linkedin\.com/[^"]+)"[^>]*>\s*<div>(.*?)</div>',
            card_html, re.DOTALL
        )
        linkedin_url = li_m.group(1) if li_m else None
        linkedin_label = clean_html(li_m.group(2)) if li_m else None

        # Profile link (rootsofprogress.org/expert/...)
        profile_m = re.search(
            r'<a href="(https://rootsofprogress\.org/expert/[^"]+)">\s*<div>(.*?)</div>',
            card_html, re.DOTALL
        )
        profile_url = profile_m.group(1) if profile_m else None
        profile_label = clean_html(profile_m.group(2)) if profile_m else None

        experts.append({
            'id': expert_id,
            'name': name,
            'position': position,
            'image': image,
            'image_width': image_width,
            'image_height': image_height,
            'bio': bio,
            'linkedin_url': linkedin_url,
            'linkedin_label': linkedin_label,
            'profile_url': profile_url,
            'profile_label': profile_label,
        })

    return experts


def extract_fellows_heading(inner_html):
    """Extract heading/description from fellows section."""
    grid_m = re.search(
        r'<div class="grid">\s*<div class="col-6-md">\s*<div[^>]*>(.*?)</div>\s*</div>\s*'
        r'<div class="col-6-md">\s*<div[^>]*>(.*?)</div>',
        inner_html, re.DOTALL
    )
    if grid_m:
        heading_html = clean_html(grid_m.group(1))
        desc_html = clean_html(grid_m.group(2))
        h2_m = re.search(r'<h2>(.*?)</h2>', heading_html)
        heading = clean_html(h2_m.group(1)) if h2_m else ''
        return heading, desc_html
    return '', ''


def extract_media_hero(inner_html):
    """Extract image data from section.media."""
    img_m = re.search(r'<img([^>]+)>', inner_html)
    if img_m:
        attrs = img_m.group(1)
        src_m = re.search(r'src="([^"]+)"', attrs)
        w_m = re.search(r'width="(\d+)"', attrs)
        h_m = re.search(r'height="(\d+)"', attrs)
        return (
            src_m.group(1) if src_m else None,
            int(w_m.group(1)) if w_m else None,
            int(h_m.group(1)) if h_m else None,
        )
    return None, None, None


def extract_video_section(inner_html):
    """Extract video section data."""
    headline_m = re.search(r'<div class="headline">\s*<h2[^>]*>(.*?)</h2>', inner_html, re.DOTALL)
    headline = clean_html(headline_m.group(1)) if headline_m else ''

    iframe_m = re.search(r'<iframe[^>]+src="([^"]+)"', inner_html)
    embed_url = iframe_m.group(1) if iframe_m else ''

    title_m = re.search(r'<h3 class="title"[^>]*>(.*?)</h3>', inner_html, re.DOTALL)
    video_title = clean_html(title_m.group(1)) if title_m else ''

    excerpt_m = re.search(r'<div class="excerpt"[^>]*>(.*?)</div>', inner_html, re.DOTALL)
    excerpt = clean_html(excerpt_m.group(1)) if excerpt_m else ''

    # Find all bottom links
    bottom_links = re.findall(
        r'<a href="([^"]+)"[^>]*>(?:Watch full video|.*?)</a>',
        inner_html
    )
    video_link = bottom_links[0] if bottom_links else ''

    # Tags (non-watch links)
    tag_links = re.findall(
        r'<div>\s*<span[^>]*>\s*<a href="([^"]+)"[^>]*>([^<]+)</a>',
        inner_html
    )

    return {
        'headline': headline,
        'embed_url': embed_url,
        'video_title': video_title,
        'excerpt': excerpt,
        'video_link': video_link,
        'tag_links': tag_links,
    }


def extract_agenda_section(inner_html):
    """Extract agenda section data: heading, description, image."""
    cols = re.findall(
        r'<div class="col-6-md">(.*?)</div>',
        inner_html, re.DOTALL
    )
    heading = ''
    description = ''
    if len(cols) >= 1:
        h2_m = re.search(r'<h2>(.*?)</h2>', cols[0], re.DOTALL)
        heading = clean_html(h2_m.group(1)) if h2_m else ''
    if len(cols) >= 2:
        text_m = re.search(r'<div class="text[^"]*"[^>]*>(.*?)</div>', cols[1], re.DOTALL)
        if text_m:
            description = clean_html(text_m.group(1))
        else:
            description = clean_html(cols[1])

    img_m = re.search(r'<img([^>]+)>', inner_html)
    if img_m:
        attrs = img_m.group(1)
        src_m = re.search(r'src="([^"]+)"', attrs)
        w_m = re.search(r'width="(\d+)"', attrs)
        h_m = re.search(r'height="(\d+)"', attrs)
        image_src = src_m.group(1) if src_m else None
        image_width = int(w_m.group(1)) if w_m else None
        image_height = int(h_m.group(1)) if h_m else None
    else:
        image_src = image_width = image_height = None

    return {
        'heading': heading,
        'description': description,
        'image_src': image_src,
        'image_width': image_width,
        'image_height': image_height,
    }


def extract_text_section_columns(inner_html):
    """Extract left/right column content from a text section."""
    # Find the outer grid > col-6-md divs
    # This is the first .grid's columns
    grid_m = re.search(r'<div class="grid">(.*)', inner_html, re.DOTALL)
    if not grid_m:
        return '', ''

    grid_content = grid_m.group(1)

    # Extract col-6-md divs
    cols = []
    pos = 0
    while True:
        col_start = grid_content.find('<div class="col-6-md">', pos)
        if col_start == -1:
            # Try col-12-sm
            col_start = grid_content.find('<div class="col-12-sm">', pos)
            if col_start == -1:
                break
            tag = '<div class="col-12-sm">'
        else:
            tag = '<div class="col-6-md">'

        # Find matching </div>
        content_start = col_start + len(tag)
        depth = 1
        i = content_start
        while i < len(grid_content) and depth > 0:
            next_open = grid_content.find('<div', i)
            next_close = grid_content.find('</div>', i)
            if next_close == -1:
                break
            if next_open != -1 and next_open < next_close:
                depth += 1
                i = next_open + 1
            else:
                depth -= 1
                if depth == 0:
                    cols.append(clean_html(grid_content[content_start:next_close]))
                    pos = next_close + 6
                    break
                i = next_close + 1
        else:
            break
        if len(cols) >= 2:
            break

    return cols[0] if len(cols) > 0 else '', cols[1] if len(cols) > 1 else ''


def main():
    print(f"Reading {CAPTURE_PATH}...")
    with open(CAPTURE_PATH) as f:
        html = f.read()

    sections = parse_sections(html)
    print(f"Found {len(sections)} sections")

    result = []
    for i, sec in enumerate(sections):
        classes = sec['classes']
        inner = sec['inner_html']
        entry = {
            'index': i,
            'type': 'unknown',
            'classes': classes,
            'style': sec['style'],
            'id': sec['id'],
        }

        if 'media' in classes:
            src, w, h = extract_media_hero(inner)
            entry['type'] = 'media'
            entry['src'] = src
            entry['width'] = w
            entry['height'] = h

        elif 'newsletter' in classes:
            # Extract two columns
            col1 = re.search(r'<div class="col-6-sm"[^>]*>\s*<div class="text"[^>]*>(.*?)</div>', inner, re.DOTALL)
            col2 = re.search(r'<div class="col-6-sm"[^>]*>(?:(?!<div class="text").)*?(<a href="([^"]+)")', inner, re.DOTALL)
            entry['type'] = 'newsletter'
            entry['col1_html'] = clean_html(col1.group(1)) if col1 else ''
            # For col2: get raw inner HTML
            col2_m = re.findall(r'<div class="col-6-sm"[^>]*>(.*?)</div>', inner, re.DOTALL)
            entry['col2_html'] = clean_html(col2_m[1]) if len(col2_m) >= 2 else ''

        elif 'fellows' in classes and 'alt' in classes and 'popups' in classes:
            heading, desc = extract_fellows_heading(inner)
            experts = extract_expert_data(inner)
            entry['type'] = 'expert_grid'
            entry['heading'] = heading
            entry['description'] = desc
            entry['experts'] = experts

        elif 'text' in classes and 'agenda' in classes:
            data = extract_agenda_section(inner)
            entry['type'] = 'agenda'
            entry.update(data)

        elif 'video' in classes:
            data = extract_video_section(inner)
            entry['type'] = 'video'
            entry.update(data)
            entry['background'] = sec['style'].replace('background:', '').replace('background: ', '').strip().rstrip(';') if 'background' in sec['style'] else '#fff'

        elif 'text' in classes:
            left, right = extract_text_section_columns(inner)
            entry['type'] = 'text'
            entry['left_html'] = left
            entry['right_html'] = right
            entry['full_inner_html'] = inner

        result.append(entry)

    print(f"Writing {OUTPUT_PATH}...")
    import os
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, 'w') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    # Print summary
    type_counts = {}
    for s in result:
        t = s['type']
        type_counts[t] = type_counts.get(t, 0) + 1
    print("Section types:", type_counts)

    # Print expert count
    for s in result:
        if s['type'] == 'expert_grid':
            print(f"Experts extracted: {len(s.get('experts', []))}")


if __name__ == '__main__':
    import os
    os.chdir('/home/node/.brunel/workers/albert-3fb19d5a-86aa-4112-bcae-829044b9eb7c')
    main()
