import os
import requests
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
import xml.etree.ElementTree as ET
import asyncio
from concurrent.futures import ThreadPoolExecutor

TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), "..", "marketing_templates")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "generated")
# Using DejaVuSans as a reliable local font.
# TODO: Integrate Google Noto Sans in the future for better local language support (Hindi/Bengali) as per requirement 11.H.07.
FONT_PATH = os.path.join(os.path.dirname(__file__), "..", "assets", "fonts", "DejaVuSans.ttf")

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Helper function to run blocking/CPU-bound tasks in a thread pool
async def run_in_executor(func, *args):
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, func, *args)

def _generate_marketing_image_sync(template_type: str, tenant_name: str, logo_url: str = None, student_name: str = None):
    # 1. Load SVG Template as text
    template_path = os.path.join(TEMPLATE_DIR, f"{template_type}.svg")
    if not os.path.exists(template_path):
        raise FileNotFoundError(f"Template {template_type} not found")

    with open(template_path, 'r') as f:
        svg_content = f.read()

    # 2. Logic: Replace placeholder text FIRST
    svg_content = svg_content.replace("{{School_Name}}", tenant_name)
    if student_name:
        svg_content = svg_content.replace("{{Student_Name}}", student_name)

    # 3. Parse XML
    try:
        root = ET.fromstring(svg_content)
    except ET.ParseError as e:
        raise ValueError(f"Invalid SVG template: {e}")

    # Extract dimensions
    width = int(root.attrib.get('width', '800'))
    height = int(root.attrib.get('height', '600'))

    # Create base image
    image = Image.new("RGBA", (width, height), (255, 255, 255, 255))
    draw = ImageDraw.Draw(image)

    # Load fonts (Fixing font loading bug)
    try:
        font_large = ImageFont.truetype(FONT_PATH, 40)
        font_medium = ImageFont.truetype(FONT_PATH, 30)
        font_small = ImageFont.truetype(FONT_PATH, 24)
        font_tiny = ImageFont.truetype(FONT_PATH, 12)
    except Exception as e:
        print(f"Font load error: {e}. using default.")
        font_large = ImageFont.load_default()
        font_medium = ImageFont.load_default()
        font_small = ImageFont.load_default()
        font_tiny = ImageFont.load_default()

    # Helper for XML namespace
    def get_tag_name(elem):
        return elem.tag.split('}')[-1] if '}' in elem.tag else elem.tag

    # Logic to capture logo coordinates
    logo_coords = None

    # 4. Render elements
    for elem in root.iter():
        tag = get_tag_name(elem)

        # Check for logo placeholder by ID
        elem_id = elem.attrib.get('id')
        if elem_id == 'logo_placeholder':
            try:
                lx = int(elem.attrib.get('x', 0))
                ly = int(elem.attrib.get('y', 0))
                lw = int(elem.attrib.get('width', 100))
                lh = int(elem.attrib.get('height', 100))
                logo_coords = (lx, ly, lw, lh)
            except ValueError:
                pass

        if tag == 'rect':
            w_attr = elem.attrib.get('width')
            h_attr = elem.attrib.get('height')

            # Handle percentage
            if w_attr == '100%': w = width
            else: w = int(w_attr) if w_attr else 0

            if h_attr == '100%': h = height
            else: h = int(h_attr) if h_attr else 0

            x = int(elem.attrib.get('x', 0))
            y = int(elem.attrib.get('y', 0))
            fill = elem.attrib.get('fill', 'none')

            if fill != 'none':
                draw.rectangle([(x, y), (x+w, y+h)], fill=fill)

        elif tag == 'circle':
            cx = int(elem.attrib.get('cx', 0))
            cy = int(elem.attrib.get('cy', 0))
            r = int(elem.attrib.get('r', 0))
            fill = elem.attrib.get('fill', 'none')
            opacity = float(elem.attrib.get('opacity', 1.0))

            if fill != 'none':
                 if fill.startswith("#"):
                     rgb = tuple(int(fill.lstrip('#')[i:i+2], 16) for i in (0, 2, 4))
                     alpha = int(255 * opacity)
                     color = rgb + (alpha,)
                 else:
                     color = (128, 128, 128, int(255*opacity))

                 overlay = Image.new("RGBA", (width, height), (0,0,0,0))
                 draw_overlay = ImageDraw.Draw(overlay)
                 draw_overlay.ellipse([(cx-r, cy-r), (cx+r, cy+r)], fill=color)
                 image = Image.alpha_composite(image, overlay)
                 draw = ImageDraw.Draw(image)

        elif tag == 'text':
            x = int(elem.attrib.get('x', 0))
            y = int(elem.attrib.get('y', 0))
            fill = elem.attrib.get('fill', 'black')
            font_size = int(elem.attrib.get('font-size', 12))
            text_anchor = elem.attrib.get('text-anchor', 'start')
            content = elem.text

            if content:
                # Select font
                if font_size >= 40: font = font_large
                elif font_size >= 30: font = font_medium
                elif font_size >= 24: font = font_small
                else: font = font_tiny

                bbox = draw.textbbox((0, 0), content, font=font)
                text_width = bbox[2] - bbox[0]

                draw_x = x
                if text_anchor == 'middle':
                    draw_x -= (text_width / 2)
                elif text_anchor == 'end':
                    draw_x -= text_width

                draw_y = y - font_size

                draw.text((draw_x, draw_y), content, font=font, fill=fill)

    # 5. Overlay Logo (Dynamic)
    if logo_url:
        target_x, target_y = 350, 400
        target_w, target_h = 100, 100

        if logo_coords:
            target_x, target_y, target_w, target_h = logo_coords

        try:
            # We are inside a thread here, so synchronous requests are fine (and expected in run_in_executor)
            if logo_url.startswith("http"):
                 response = requests.get(logo_url, timeout=5)
                 response.raise_for_status()
                 logo_img = Image.open(BytesIO(response.content)).convert("RGBA")
            else:
                 logo_img = Image.open(logo_url).convert("RGBA")

            target_size = (target_w, target_h)
            logo_img.thumbnail(target_size, Image.Resampling.LANCZOS)

            image.paste(logo_img, (target_x, target_y), logo_img)

        except Exception as e:
            print(f"Failed to overlay logo: {e}")
            draw.text((target_x, target_y), "Logo Error", fill="red")

    # 6. Output WebP format
    output_filename = f"{template_type}_{tenant_name.replace(' ', '_')}_{student_name or 'generic'}.webp"
    output_path = os.path.join(OUTPUT_DIR, output_filename)

    image.save(output_path, "WEBP")

    return output_path

async def generate_marketing_image(template_type: str, tenant_name: str, logo_url: str = None, student_name: str = None):
    return await run_in_executor(_generate_marketing_image_sync, template_type, tenant_name, logo_url, student_name)

async def generate_batch_marketing_images(template_type: str, tenant_name: str, logo_url: str, student_names: list):
    tasks = []
    semaphore = asyncio.Semaphore(10)

    async def limited_generate(name):
        async with semaphore:
            return await generate_marketing_image(template_type, tenant_name, logo_url, name)

    for name in student_names:
        tasks.append(limited_generate(name))

    return await asyncio.gather(*tasks)
