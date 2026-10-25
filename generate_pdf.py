import os
import subprocess
import markdown
import shutil

report_md_path = r'C:\Users\Admin\.gemini\antigravity\scratch\AI-MotorGuard\docs\AI_MotorGuard_Comprehensive_Project_Report.md'
output_dir = r'C:\Users\Admin\.gemini\antigravity\scratch\AI-MotorGuard\docs'
artifact_dir = r'C:\Users\Admin\.gemini\antigravity\brain\ff47a11e-e105-4cf6-bd2c-b0c20a5eb5b5'
pdf_name = 'AI_MotorGuard_Technical_Project_Report.pdf'

with open(report_md_path, 'r', encoding='utf-8') as f:
    md_text = f.read()

# Convert markdown to HTML with tables, fenced code, and linebreaks
html_body = markdown.markdown(md_text, extensions=['tables', 'fenced_code', 'nl2br'])

# Custom CSS for executive engineering report
html_full = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>AI-MotorGuard Technical Project Report</title>
<style>
    @page {{
        size: A4;
        margin: 18mm 16mm 18mm 16mm;
        @bottom-right {{
            content: "Page " counter(page);
            font-family: 'Segoe UI', system-ui, sans-serif;
            font-size: 8pt;
            color: #64748b;
        }}
    }}
    body {{
        font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
        color: #1e293b;
        line-height: 1.55;
        font-size: 9.5pt;
        background-color: #ffffff;
        margin: 0;
        padding: 0;
    }}
    .header-banner {{
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        color: #ffffff;
        padding: 24px;
        border-radius: 8px;
        margin-bottom: 24px;
        border-left: 6px solid #0284c7;
    }}
    .header-banner h1 {{
        color: #ffffff;
        margin: 0 0 8px 0;
        font-size: 18pt;
        border: none;
        padding: 0;
    }}
    .header-banner p {{
        color: #94a3b8;
        margin: 4px 0 0 0;
        font-size: 9.5pt;
    }}
    h1 {{
        color: #0f172a;
        font-size: 17pt;
        font-weight: 800;
        border-bottom: 2px solid #0284c7;
        padding-bottom: 6px;
        margin-top: 20px;
        margin-bottom: 12px;
        letter-spacing: -0.02em;
    }}
    h2 {{
        color: #0f172a;
        font-size: 13pt;
        font-weight: 700;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 4px;
        margin-top: 22px;
        margin-bottom: 8px;
        page-break-after: avoid;
    }}
    h3 {{
        color: #0369a1;
        font-size: 10.5pt;
        font-weight: 600;
        margin-top: 14px;
        margin-bottom: 6px;
        page-break-after: avoid;
    }}
    p {{
        margin-top: 0;
        margin-bottom: 9px;
        text-align: justify;
    }}
    strong {{
        color: #0f172a;
        font-weight: 600;
    }}
    a {{
        color: #0284c7;
        text-decoration: none;
    }}
    table {{
        width: 100%;
        border-collapse: collapse;
        margin: 12px 0;
        font-size: 8.5pt;
        page-break-inside: avoid;
    }}
    th {{
        background-color: #0f172a;
        color: #ffffff;
        text-align: left;
        padding: 7px 9px;
        font-weight: 600;
        border: 1px solid #0f172a;
    }}
    td {{
        padding: 6px 9px;
        border: 1px solid #cbd5e1;
        vertical-align: top;
    }}
    tr:nth-child(even) {{
        background-color: #f8fafc;
    }}
    code {{
        background-color: #f1f5f9;
        color: #0369a1;
        padding: 1px 4px;
        border-radius: 3px;
        font-family: 'Cascadia Code', 'Consolas', 'Courier New', monospace;
        font-size: 8pt;
        border: 1px solid #e2e8f0;
    }}
    pre {{
        background-color: #0f172a;
        color: #f1f5f9;
        padding: 10px 12px;
        border-radius: 6px;
        font-family: 'Cascadia Code', 'Consolas', 'Courier New', monospace;
        font-size: 7.5pt;
        line-height: 1.4;
        overflow-x: auto;
        margin: 10px 0;
        border: 1px solid #1e293b;
        page-break-inside: avoid;
        white-space: pre-wrap;
        word-wrap: break-word;
    }}
    pre code {{
        background-color: transparent;
        color: inherit;
        padding: 0;
        border: none;
        font-size: inherit;
    }}
    blockquote {{
        border-left: 4px solid #0284c7;
        background-color: #f0f9ff;
        padding: 8px 12px;
        margin: 12px 0;
        border-radius: 0 4px 4px 0;
        color: #0369a1;
        font-size: 8.5pt;
    }}
    hr {{
        border: none;
        border-top: 1px solid #e2e8f0;
        margin: 18px 0;
    }}
    ul, ol {{
        margin-top: 0;
        margin-bottom: 10px;
        padding-left: 20px;
    }}
    li {{
        margin-bottom: 3px;
    }}
</style>
</head>
<body>
{html_body}
</body>
</html>
"""

temp_html = os.path.join(output_dir, 'report_temp.html')
with open(temp_html, 'w', encoding='utf-8') as f:
    f.write(html_full)

local_pdf = os.path.join(output_dir, pdf_name)
artifact_pdf = os.path.join(artifact_dir, pdf_name)

edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
file_url = 'file:///' + temp_html.replace('\\', '/')

cmd = [
    edge_path,
    '--headless',
    '--disable-gpu',
    '--no-pdf-header-footer',
    f'--print-to-pdf={local_pdf}',
    file_url
]

print('Running Edge headless PDF rendering...')
res = subprocess.run(cmd, capture_output=True, text=True)
print('Edge returncode:', res.returncode)

if os.path.exists(local_pdf):
    size = os.path.getsize(local_pdf)
    print(f'Local PDF successfully created: {local_pdf} ({size} bytes)')
    shutil.copy2(local_pdf, artifact_pdf)
    print(f'Copied to artifact directory: {artifact_pdf} ({os.path.getsize(artifact_pdf)} bytes)')

if os.path.exists(temp_html):
    os.remove(temp_html)
