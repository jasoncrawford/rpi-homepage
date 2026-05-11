#!/usr/bin/env python3
"""
Generates src/pages/progress-in-medicine.astro from the extracted sections JSON.

Run: python3 scripts/generate-progress-in-medicine-astro.py
"""

import json
import os
import re

SECTIONS_PATH = "src/data/progress-in-medicine-sections.json"
OUTPUT_PATH = "src/pages/progress-in-medicine.astro"


def escape_backtick(s):
    """Escape backticks and ${} in template literal strings."""
    s = s.replace('\\', '\\\\')
    s = s.replace('`', '\\`')
    s = s.replace('${', '\\${')
    return s


def strip_font_tags(html):
    """Remove <font> tags but keep their content."""
    html = re.sub(r'<font[^>]*>', '', html)
    html = re.sub(r'</font>', '', html)
    return html


def render_section(s):
    """Render a section to Astro JSX."""
    t = s['type']
    classes = s.get('classes', [])
    style = s.get('style', '')
    idx = s['index']

    if t == 'media':
        src = s['src'] or ''
        w = s['width'] or ''
        h = s['height'] or ''
        return f'''  <MediaHero
    src={json.dumps(src)}
    width={{{w}}}
    height={{{h}}}
  />'''

    elif t == 'newsletter':
        col1 = escape_backtick(s['col1_html'])
        col2 = escape_backtick(s['col2_html'])
        return f'''  <section class="newsletter">
    <div class="container">
      <div class="grid">
        <div class="col-6-sm">
          <div class="text" set:html={{`{col1}`}} />
        </div>
        <div class="col-6-sm" set:html={{`{col2}`}} />
      </div>
    </div>
  </section>'''

    elif t == 'expert_grid':
        heading = strip_font_tags(s.get('heading', ''))
        desc = escape_backtick(s.get('description', ''))
        experts_js = json.dumps(s['experts'], ensure_ascii=False, indent=4)
        # Convert JSON keys to camelCase for TypeScript
        experts_js = re.sub(r'"image_width":', '"imageWidth":', experts_js)
        experts_js = re.sub(r'"image_height":', '"imageHeight":', experts_js)
        experts_js = re.sub(r'"linkedin_url":', '"linkedinUrl":', experts_js)
        experts_js = re.sub(r'"linkedin_label":', '"linkedinLabel":', experts_js)
        experts_js = re.sub(r'"profile_url":', '"profileUrl":', experts_js)
        experts_js = re.sub(r'"profile_label":', '"profileLabel":', experts_js)
        return f'''  <ExpertGrid
    heading={json.dumps(heading)}
    description={{`{desc}`}}
    experts={{experts}}
  />'''

    elif t == 'agenda':
        heading = s.get('heading', '')
        desc = escape_backtick(s.get('description', ''))
        image_src = s.get('image_src', '')
        image_width = s.get('image_width', '')
        image_height = s.get('image_height', '')
        style_attr = ''
        bg = ''
        if 'background:' in style or 'background: ' in style:
            bg_m = re.search(r'background:\s*([^;]+)', style)
            if bg_m:
                bg = f'\n    background={json.dumps(bg_m.group(1).strip())}'
        return f'''  <AgendaSection
    heading={json.dumps(heading)}{bg}
    description={{`{desc}`}}
    imageSrc={json.dumps(image_src)}
    imageWidth={{{image_width}}}
    imageHeight={{{image_height}}}
  />'''

    elif t == 'video':
        headline = s.get('headline', '')
        embed_url = s.get('embed_url', '')
        video_title = s.get('video_title', '')
        video_link = s.get('video_link', '')
        excerpt = escape_backtick(s.get('excerpt', ''))
        bg = s.get('background', '#fff')
        tag_links = s.get('tag_links', [])
        # Build tags array - only use labels (not the Watch full video link)
        tags = [lbl for url, lbl in tag_links if 'youtube' not in url and 'Watch full' not in lbl]
        tags_js = json.dumps(tags, ensure_ascii=False)
        return f'''  <VideoSection
    headline={json.dumps(headline)}
    embedUrl={json.dumps(embed_url)}
    videoTitle={json.dumps(video_title)}
    videoLink={json.dumps(video_link)}
    excerpt={{`{excerpt}`}}
    tags={{{tags_js}}}
    background={json.dumps(bg)}
  />'''

    elif t == 'text':
        # Build section class string
        cls = ' '.join(classes)
        extra_classes = [c for c in classes if c != 'text']
        data_view = ' data-view' if s.get('data_view', True) else ''
        style_attr = f' style={json.dumps(style)}' if style else ''
        inner = escape_backtick(s['full_inner_html'])
        return f'''  <section class={json.dumps(cls)}{data_view}{style_attr}>
    <Fragment set:html={{`{inner}`}} />
  </section>'''

    else:
        return f'  {{/* Unknown section type {t} index {idx} */}}'


def main():
    print(f"Reading {SECTIONS_PATH}...")
    with open(SECTIONS_PATH) as f:
        sections = json.load(f)

    # Find expert grid to extract experts variable
    expert_grid = next((s for s in sections if s['type'] == 'expert_grid'), None)
    experts_json = 'null'
    if expert_grid:
        experts = expert_grid['experts']
        # Convert keys to camelCase
        converted = []
        for e in experts:
            converted.append({
                'id': e['id'],
                'name': e['name'],
                'position': e['position'],
                'image': e.get('image'),
                'imageWidth': e.get('image_width'),
                'imageHeight': e.get('image_height'),
                'bio': e.get('bio', ''),
                'linkedinUrl': e.get('linkedin_url'),
                'linkedinLabel': e.get('linkedin_label'),
                'profileUrl': e.get('profile_url'),
                'profileLabel': e.get('profile_label'),
            })
        experts_json = json.dumps(converted, ensure_ascii=False, indent=2)

    rendered_sections = [render_section(s) for s in sections]

    page = f'''---
import Base from "../layouts/Base.astro";
import MediaHero from "../components/MediaHero.astro";
import TextSection from "../components/TextSection.astro";
import ExpertGrid from "../components/ExpertGrid.astro";
import AgendaSection from "../components/AgendaSection.astro";
import VideoSection from "../components/VideoSection.astro";

const experts = {experts_json};
---

<Base
  title="Progress in Medicine"
  description="A 6-week summer career exploration program for high school students interested in medicine, biotech, health &amp; longevity."
>
{chr(10).join(rendered_sections)}
</Base>
'''

    print(f"Writing {OUTPUT_PATH}...")
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, 'w') as f:
        f.write(page)
    print("Done!")


if __name__ == '__main__':
    import os
    os.chdir('/home/node/.brunel/workers/albert-3fb19d5a-86aa-4112-bcae-829044b9eb7c')
    main()
