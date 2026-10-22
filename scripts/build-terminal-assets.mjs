import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Run with `node scripts/build-terminal-assets.mjs`. No dependencies required.
const root = fileURLToPath(new URL('../', import.meta.url));
const xml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const palettes = {
  dark: {bg:'#0d1117',bar:'#161b22',line:'#30363d',text:'#e6edf3',muted:'#9ba8b7',green:'#8bd49c',cyan:'#83d6e8',amber:'#e5c07b'},
  light: {bg:'#f6f8f5',bar:'#e9eee8',line:'#c8d2c5',text:'#24352a',muted:'#53685b',green:'#246b39',cyan:'#176678',amber:'#805d14'},
};
function txt(x,y,value,size=14,color='text',extra='') {
  return `<text x="${x}" y="${y}" class="${color}" font-size="${size}" ${extra}>${xml(value)}</text>`;
}
function terminal(title,width,height,body,theme='dark',description=title) {
  const p=palettes[theme];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
<title id="title">${xml(title)}</title><desc id="desc">${xml(description)}</desc>
<style>text{font-family:'DejaVu Sans Mono',Consolas,'Liberation Mono',monospace}.text{fill:${p.text}}.muted{fill:${p.muted}}.green{fill:${p.green}}.cyan{fill:${p.cyan}}.amber{fill:${p.amber}}.rule{stroke:${p.line}}</style>
<rect x=".5" y=".5" width="${width-1}" height="${height-1}" rx="6" fill="${p.bg}" stroke="${p.line}"/>
<path d="M6 .5H${width-6}q5.5 0 5.5 6V35.5H.5V6q0-5.5 5.5-5.5" fill="${p.bar}"/>
<path d="M1 35.5H${width-1}" class="rule"/>
<path d="M17 15h8m-4-4v8M34 15h8M52 11l8 8m0-8-8 8" class="rule" fill="none"/>
${txt(width/2,23,title,width===360?10:12,'muted','text-anchor="middle"')}
${body}</svg>\n`;
}
// Original 88 x 58 luminance sample of the user's RY mark. Preserve this silhouette.
const logoRows=JSON.parse(await readFile(new URL('./ry-grid.json',import.meta.url),'utf8'));
const cursor=(x,y)=>`<rect x="${x}" y="${y-12}" width="8" height="15" class="green"/>`;
const headerPalettes = {
  dark: {text:'#e6edf3',muted:'#9ba8b7'},
  light: {text:'#24292f',muted:'#57606a'},
};
function label(x,y,value,size,fill,extra='') {
  return `<text x="${x}" y="${y}" fill="${fill}" font-family="Consolas,'Liberation Mono','DejaVu Sans Mono',monospace" font-size="${size}" ${extra}>${xml(value)}</text>`;
}
function header(theme,compact) {
  const w=compact?360:900,h=compact?236:304,step=compact?3:4,depth=compact?3:4;
  const cellSize=step*.82;
  const points=logoRows.flatMap((row,y)=>[...row].flatMap((c,x)=>c==='#'?[[x,y]]:[]));
  const minX=Math.min(...points.map(([x])=>x)),maxX=Math.max(...points.map(([x])=>x));
  const minY=Math.min(...points.map(([,y])=>y)),maxY=Math.max(...points.map(([,y])=>y));
  const markWidth=(maxX-minX)*step+cellSize+depth,markHeight=(maxY-minY)*step+cellSize+depth;
  const x=(w-markWidth)/2-minX*step,y=(h-markHeight)/2-minY*step+depth;
  const cells=points.map(([col,row])=>`<rect x="${(col*step).toFixed(2)}" y="${(row*step).toFixed(2)}" width="${cellSize.toFixed(2)}" height="${cellSize.toFixed(2)}" rx=".12"/>`).join('');
  const layers=Array.from({length:depth},(_,i)=>{
    const offset=depth-i,shade=Math.round(101+i/(depth-1)*58);
    return `<use href="#cells" transform="translate(${offset} ${-offset})" fill="rgb(${shade},${shade+9},${shade+19})"/>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title desc"><title id="title">Ramazan Yıldırım — RY logo</title><desc id="desc">Original RY monogram in 1,708 small white square cells, with subtle silver depth on a transparent background.</desc><defs><linearGradient id="porcelain" x1="0" y1="0" x2=".75" y2="1"><stop stop-color="#ffffff"/><stop offset=".5" stop-color="#f4f6f9"/><stop offset="1" stop-color="#e5eaf0"/></linearGradient><g id="cells">${cells}</g></defs><g transform="translate(${x.toFixed(2)} ${y.toFixed(2)})">${layers}<use href="#cells" fill="url(#porcelain)" stroke="${theme==='light'?'#8d99a8':'#d8e0e9'}" stroke-width="${theme==='light'?'.24':'.14'}"/></g></svg>\n`;
}
function tux(x,y,width,height) {
  return `<svg x="${x}" y="${y}" width="${width}" height="${height}" viewBox="0 0 160 196" aria-hidden="true">
<defs><linearGradient id="tux-coat" x2=".8" y2="1"><stop stop-color="#46515f"/><stop offset=".45" stop-color="#202a36"/><stop offset="1" stop-color="#111820"/></linearGradient><linearGradient id="tux-belly" x2=".7" y2="1"><stop stop-color="#ffffff"/><stop offset="1" stop-color="#cbd5e1"/></linearGradient><linearGradient id="tux-gold" x2=".7" y2="1"><stop stop-color="#ffd889"/><stop offset="1" stop-color="#d99b37"/></linearGradient></defs>
<ellipse cx="80" cy="184" rx="62" ry="7" fill="#000000" opacity=".22"/>
<path d="M48 83C32 93 20 119 16 145c-1 8 6 12 13 7l21-23M112 83c16 10 28 36 32 62 1 8-6 12-13 7l-21-23" fill="url(#tux-coat)" stroke="#566171" stroke-width="1.3"/>
<path d="M47 78c-6-10-6-18-5-29C44 20 59 9 80 9s36 11 38 40c1 11 1 19-5 29 9 20 18 41 16 62-1 26-20 39-49 39s-48-13-49-39c-2-21 7-42 16-62Z" fill="url(#tux-coat)" stroke="#687484" stroke-width="1.2"/>
<path d="M59 78c-9 14-19 35-18 55 0 23 15 37 39 37s39-14 39-37c1-20-9-41-18-55-8-9-34-9-42 0Z" fill="url(#tux-belly)"/>
<ellipse cx="66" cy="53" rx="12" ry="19" fill="#f8fafc" transform="rotate(-8 66 53)"/><ellipse cx="94" cy="53" rx="12" ry="19" fill="#f8fafc" transform="rotate(8 94 53)"/>
<ellipse cx="69" cy="57" rx="4.5" ry="8" fill="#111820"/><ellipse cx="91" cy="57" rx="4.5" ry="8" fill="#111820"/><circle cx="70" cy="54" r="1.7" fill="#ffffff"/><circle cx="92" cy="54" r="1.7" fill="#ffffff"/>
<path d="M59 74c6-9 15-13 21-13s15 4 21 13c-5 8-13 15-21 15S64 82 59 74Z" fill="url(#tux-gold)" stroke="#b88639" stroke-width="1.1"/><path d="M64 75q16 8 32 0" fill="none" stroke="#ac7b32" stroke-width="1.2"/>
<path d="m48 151-19 7c-6 1-8 6-6 11l-7 5c-4 4-2 9 4 10l33 3c11 0 17-6 17-14-1-9-12-21-22-22Z" fill="url(#tux-gold)" stroke="#b88639" stroke-width="1.3"/>
<path d="m112 151 19 7c6 1 8 6 6 11l7 5c4 4 2 9-4 10l-33 3c-11 0-17-6-17-14 1-9 12-21 22-22Z" fill="url(#tux-gold)" stroke="#b88639" stroke-width="1.3"/>
<path d="m28 168 9 7m2-13 9 10m84-4-9 7m-2-13-9 10" stroke="#bd8c3f" stroke-width="1.2" fill="none" stroke-linecap="round"/>
</svg>`;
}
const aboutFields=[
  ['education','Computer Engineering | Final Year'],
  ['university','Burdur Mehmet Akif Ersoy University'],
  ['role','Co-Founder & Developer | Dijital Diş Dünyası',['Co-Founder & Developer |','Dijital Diş Dünyası']],
  ['focus','Deep Learning / Computer Vision / Turkish NLP',['Deep Learning / Computer Vision /','Turkish NLP']],
  ['exploring','LLM Fine-Tuning / VLMs / AI Agents'],
  ['mindset','Turning ideas into real-world solutions'],
];
function about(compact) {
  const w=compact?360:900;
  let b=txt(24,66,'$ whoami',compact?12:14,'green');
  if(!compact) {
    b+=tux(51,91,152,186);
    ['green','cyan','amber','text'].forEach((color,i)=>b+=`<rect x="${65+i*30}" y="285" width="27" height="8" class="${color}"/>`);
  } else b+=tux(273,79,58,71);
  const x=compact?24:260;
  b+=txt(x,compact?100:104,'ramazan@linux',compact?19:21,'cyan','font-weight="700"');
  b+=txt(x,compact?122:129,'-------------',14,'muted');
  if(compact) {
    let y=159;
    aboutFields.forEach(([key,val,lines=[val]])=>{
      b+=txt(x,y,`${key}:`,11,'green');
      lines.forEach((line,i)=>b+=txt(x,y+19+i*18,line,12));
      y+=44+(lines.length-1)*18;
    });
    b+=`<path d="M24 ${y-4}h312" class="rule"/>`+txt(24,y+21,'$ ',13,'green')+cursor(42,y+21);
    return terminal('ramazan@linux: ~',w,y+42,b,'dark',aboutFields.map(([key,val])=>`${key}: ${val}`).join('. '));
  } else {
    aboutFields.forEach(([key,val],i)=>{b+=txt(x,156+i*25,`${key}:`,13,'green')+txt(x+114,156+i*25,val,13);});
    b+=`<path d="M24 301h852" class="rule"/>`+txt(24,326,'$ ',13,'green')+cursor(42,326);
  }
  return terminal('ramazan@linux: ~',w,348,b,'dark',aboutFields.map(([key,val])=>`${key}: ${val}`).join('. '));
}
async function project(compact) {
  const original=await readFile(path.join(root,'assets/dijital-dis-dunyasi/logo.svg'),'utf8');
  const brand=original.slice(original.indexOf('<svg')).replace(/<svg\b[^>]*>/,tag=>tag.replace(/\s(?:x|y|width|height)="[^"]*"/g,'').replace('<svg ','<svg x="24" y="96" width="'+(compact?300:320)+'" height="86" ')).replaceAll('#0D6093','#83d6e8');
  let b=txt(24,65,compact?'$ cat ~/projects/ddd.conf':'$ cat ~/projects/dijital-dis-dunyasi.conf',compact?12:14,'green')+brand;
  if(compact) {
    b+=txt(24,218,'Co-Founder & Developer',15,'cyan','font-weight="700"')+txt(24,246,'A digital platform for the',12)+txt(24,265,'dental ecosystem.',12);
    b+=txt(24,297,'clinics / labs / suppliers',11,'muted')+txt(24,316,'patients / professionals',11,'muted')+txt(24,350,'procurement / operations / AI',11,'green');
  } else {
    b+=`<path d="M372 97v109" class="rule"/>`+txt(400,114,'Co-Founder & Developer',20,'cyan','font-weight="700"')+txt(400,146,'An integrated digital platform',14)+txt(400,169,'for the dental ecosystem.',14)+txt(400,201,'procurement / operations / communication / AI',11,'muted');
    b+=`<path d="M24 232h852" class="rule"/>`+txt(24,260,'clinics / laboratories / suppliers / patients / professionals',13,'green');
  }
  return terminal('ramazan@linux: ~/projects',compact?360:900,compact?376:284,b,'dark','Dijital Diş Dünyası. Co-Founder & Developer. An integrated digital platform connecting clinics, laboratories, suppliers, patients and professionals across procurement, operations, communication and AI-assisted workflows.');
}
const buttons={website:['website',126],cv:['download CV',140,'download'],portfolio:['download portfolio',194,'download'],linkedin:['linkedin',136],email:['email',108],'visit-platform':['dijitaldisdunyasi.com',220],'download-cv-en':['download CV --en',184,'download'],'download-cv-tr':['download CV --tr',184,'download'],'download-portfolio':['download portfolio',194,'download'],'cv-repository':['cv-repository',178]};
await mkdir(path.join(root,'assets/terminal'),{recursive:true});
for(const theme of ['dark','light']) for(const compact of [false,true]) await writeFile(path.join(root,`assets/brand/header-${theme}${compact?'-compact':''}.svg`),header(theme,compact));
for(const compact of [false,true]) {
  await writeFile(path.join(root,`assets/terminal/about${compact?'-compact':''}.svg`),about(compact));
  await writeFile(path.join(root,`assets/terminal/project${compact?'-compact':''}.svg`),await project(compact));
}
for(const [name,[value,w,action='open']] of Object.entries(buttons)) for(const theme of ['dark','light']) {
  const p=headerPalettes[theme],stroke=p.muted;
  let body=`<path d="M9 7H4v22h5M${w-9} 7h5v22h-5" stroke="${stroke}" fill="none"/>`;
  body+=label(16,23,value,13,p.text);
  const icon=action==='download'?`M${w-26} 12v11m-4-4 4 4 4-4m-9 6v3h10v-3`:`M${w-30} 22l8-8m-7 0h7v7`;
  body+=`<path d="${icon}" stroke="${stroke}" stroke-width="1.3" fill="none"/>`;
  await writeFile(path.join(root,`assets/ui/${name}${theme==='light'?'-light':''}.svg`),`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="36" viewBox="0 0 ${w} 36" role="img" aria-label="${xml(value)}">${body}</svg>\n`);
}
for(const [name,title] of [['cv','CV'],['portfolio','Portfolio']]) {
  const p=headerPalettes.dark,light=headerPalettes.light;
  // One inline <img> keeps the native summary marker beside the label. Theme inside the SVG.
  const themeStyle=`<style>@media (prefers-color-scheme:light){.preview-title{fill:${light.text}}.preview-meta{fill:${light.muted}}.preview-rule{stroke:#d0d7de}}</style>`;
  const body=label(16,25,title,13,p.text,'class="preview-title"')
    +`<path d="M136 10v20" stroke="#30363d" class="preview-rule"/>`
    +label(148,25,'preview',10,p.muted,'class="preview-meta"');
  await writeFile(path.join(root,`assets/ui/${name}-preview.svg`),`<svg xmlns="http://www.w3.org/2000/svg" width="208" height="40" viewBox="0 0 208 40" role="img" aria-label="Toggle ${xml(title)} previews">${themeStyle}${body}</svg>\n`);
}
for(const name of await readdir(path.join(root,'assets/tech-cards'))) {
  if(!name.endsWith('.svg'))continue;
  const file=path.join(root,'assets/tech-cards',name), old=await readFile(file,'utf8');
  const label=old.match(/aria-label="([^"]+)"/)[1], icon=old.match(/<image[^>]+href="([^"]+)"/)[1];
  await writeFile(file,`<svg xmlns="http://www.w3.org/2000/svg" width="116" height="92" viewBox="0 0 116 92" role="img" aria-label="${label}"><rect x=".5" y=".5" width="115" height="91" rx="3" fill="#0d1117" stroke="#30363d"/><path d="M1 20.5h114" stroke="#30363d"/><text x="9" y="14" fill="#8bd49c" font-family="Consolas,'Liberation Mono',monospace" font-size="9">[pkg]</text><path d="M101 9l2 2 4-4" fill="none" stroke="#8bd49c"/><image x="43" y="29" width="30" height="30" href="${icon}"/><text x="58" y="79" text-anchor="middle" fill="#e6edf3" font-family="Consolas,'Liberation Mono',monospace" font-size="11">${label}</text></svg>\n`);
}
console.log('Generated terminal headers, profile panels, command buttons and package cards.');
