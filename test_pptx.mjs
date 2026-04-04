import JSZip from 'jszip';
import fs from 'fs';

async function test() {
  const fileData = fs.readFileSync('D:/jaswant/gravity-work/New folder/SQL.pptx');
  const zip = new JSZip();
  const content = await zip.loadAsync(fileData);
  let fullText = '';

  const slideRegex = /^ppt\/slides\/slide\d+\.xml$/;
  const slides = Object.keys(content.files).filter(fileName => slideRegex.test(fileName));

  slides.sort((a, b) => {
    const aNum = parseInt(a.match(/\d+/)[0]);
    const bNum = parseInt(b.match(/\d+/)[0]);
    return aNum - bNum;
  });

  for (const slide of slides) {
    const slideXml = await content.file(slide).async('text');
    const matches = slideXml.match(/<a:t[^>]*>([\s\S]*?)<\/a:t>/g);
    if (matches) {
      const slideText = matches.map(m => m.replace(/<[^>]+>/g, '').trim()).filter(Boolean).join(' ');
      fullText += slideText + '\n\n';
    }
  }

  console.log("=== Extracted Text ===");
  console.log(fullText.substring(0, 1000));
}

test();
