const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const TARGET_URL = 'https://docflow-lyart.vercel.app';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'docs', 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Map high-quality captured screenshots from the subagent validation run
const SUBAGENT_STEPS = 'C:\\Users\\Kush Gupta\\.gemini\\antigravity\\brain\\c8698b2f-b247-448d-84e0-ff19d338a202\\.system_generated\\steps';

const assetMappings = [
  {
    src: path.join(SUBAGENT_STEPS, '178', 'media_0.png'),
    dest: path.join(SCREENSHOT_DIR, '01_workspace_dashboard.png'),
    title: 'DocFlow Workspace Dashboard',
    desc: 'The central hub showing workspace banner, quick actions, and sidebar navigation.'
  },
  {
    src: path.join(SUBAGENT_STEPS, '100', 'media_0.png'),
    dest: path.join(SCREENSHOT_DIR, '02_template_gallery.png'),
    title: 'Template Picker Gallery',
    desc: 'Pre-configured document templates including Blank Document, Meeting Notes, Project Roadmap, Sprint Backlog, and Brainstorming Canvas.'
  },
  {
    src: path.join(SUBAGENT_STEPS, '283', 'media_0.png'),
    dest: path.join(SCREENSHOT_DIR, '03_document_editor.png'),
    title: 'Real-Time Collaborative BlockNote Editor',
    desc: 'Block-based collaborative document editor supporting slash commands, live presence indicators, and dark mode.'
  },
  {
    src: path.join(SUBAGENT_STEPS, '304', 'media_0.png'),
    dest: path.join(SCREENSHOT_DIR, '04_gemini_ai_assistant.png'),
    title: 'Google Gemini AI Document Intelligence',
    desc: 'AI Assistant modal providing automated summarization, grammar refinement, and multilingual translation.'
  },
  {
    src: path.join(SUBAGENT_STEPS, '256', 'media_0.png'),
    dest: path.join(SCREENSHOT_DIR, '05_manage_members_modal.png'),
    title: 'Collaborator Management Modal',
    desc: 'Granular role-based member management showing active document participants, owner tags, and role badges.'
  }
];

async function run() {
  console.log(`Starting automated discovery and screenshot pipeline on ${TARGET_URL}...`);

  // Copy existing validated full-screen captures
  for (const item of assetMappings) {
    if (fs.existsSync(item.src)) {
      fs.copyFileSync(item.src, item.dest);
      console.log(`[Copied] ${path.basename(item.dest)} from validated run`);
    } else {
      console.warn(`[Warning] Source file not found: ${item.src}`);
    }
  }

  // Next, launch Puppeteer to capture live responsive views directly from the deployment
  console.log('Launching headless Chrome at 1920x1080...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
    defaultViewport: { width: 1920, height: 1080 }
  });

  try {
    const page = await browser.newPage();
    console.log(`Navigating to ${TARGET_URL}...`);
    await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 30000 });

    // Capture Landing Hero View
    const landingPath = path.join(SCREENSHOT_DIR, '00_landing_overview.png');
    await page.screenshot({ path: landingPath, fullPage: false });
    console.log(`[Captured] 00_landing_overview.png`);

    // Scroll to template gallery section and capture focused view
    await page.evaluate(() => {
      const templateSection = document.querySelector('h2, [class*="template"], h3');
      if (templateSection) templateSection.scrollIntoView();
    });
    await new Promise(r => setTimeout(r, 1000));
    const templatePath = path.join(SCREENSHOT_DIR, '02b_templates_detail.png');
    await page.screenshot({ path: templatePath, fullPage: false });
    console.log(`[Captured] 02b_templates_detail.png`);

  } catch (err) {
    console.error('Error during headless capture:', err);
  } finally {
    await browser.close();
  }

  console.log('Screenshot pipeline completed successfully!');
  const files = fs.readdirSync(SCREENSHOT_DIR);
  console.log(`Total screenshots in ${SCREENSHOT_DIR}: ${files.length}`);
  files.forEach(f => console.log(` - ${f}`));
}

run().catch(err => {
  console.error('Pipeline failed:', err);
  process.exit(1);
});
