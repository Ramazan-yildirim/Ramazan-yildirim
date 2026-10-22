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
// Character-only Tux: preserve spaces and disable ligatures to retain its terminal grid.
const tuxRows=[
  "          _nnnn_",
  "         dGGGGMMb",
  "        @p~qp~~qMb",
  "        M|@||@) M|",
  "        @,----.JM|",
  "       JS^\\__/  qKL",
  "      dZP        qKRb",
  "     dZP          qKKb",
  "    fZP            SMMb",
  "    HZM            MMMM",
  "    FqM            MMMM",
  "  __| \".        |\\dS\"qML",
  "  |    `.       | `' \\Zq",
  " _)      \\.___.,|     .'",
  " \\____   )MMMMMM|   .'",
  "      `-'       `--'"
];
function tux(x,y,size=14,lineHeight=14) {
  const rows=tuxRows.map((line,i)=>{
    let content=xml(line);
    if(i===4||i===5) {
      content=xml(line.slice(0,9))+`<tspan class="amber">${xml(line.slice(9,14))}</tspan>`+xml(line.slice(14));
    }
    return `<text x="${x}" y="${y+i*lineHeight}" font-size="${size}" class="${i>=12?'amber':'text'}">${content}</text>`;
  }).join('');
  return `<g aria-hidden="true" xml:space="preserve" style="font-variant-ligatures:none">${rows}</g>`;
}
function ansiStrip(x,y,cell=18) {
  return ['#30363d','#d88c9a','#8bd49c','#e5c07b','#91b9ed','#b6a2de','#83d6e8','#e6edf3'].map((fill,i)=>`<rect x="${x+i*cell}" y="${y}" width="${cell}" height="7" fill="${fill}"/>`).join('');
}
function aboutPrompt(y,compact=false,command='') {
  const size=compact?11:12;
  return txt(24,y,'ramazan@linux',size,'green')+txt(compact?116:125,y,'~',size,'cyan')+txt(compact?132:143,y,`$ ${command}`,size);
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
  const description='Linux terminal profile with a character-art Tux penguin. '+aboutFields.map(([key,val])=>`${key}: ${val}`).join('. ');
  let b=aboutPrompt(67,compact,'whoami');
  if(compact) {
    b+=tux(21,97,9,9.5);
    b+=txt(174,125,'Ramazan',19,'text','font-weight="700"')+txt(174,150,'Yıldırım',19,'text','font-weight="700"');
    b+=txt(174,176,'ramazan@linux',11,'cyan')+txt(174,196,'~/profile',11,'muted');
    b+=ansiStrip(174,218,18);
    b+=`<path d="M24 257h312" class="rule"/>`;
    let y=282;
    aboutFields.forEach(([key,val,lines=[val]])=>{
      b+=txt(24,y,`${key}:`,11,'green');
      lines.forEach((line,i)=>b+=txt(24,y+19+i*18,line,12));
      y+=45+(lines.length-1)*18;
    });
    b+=`<path d="M24 ${y-3}h312" class="rule"/>`+aboutPrompt(y+22,true)+cursor(146,y+22);
    return terminal('~/profile — bash',w,y+43,b,'dark',description);
  }
  b+=tux(37,123,14,14);
  b+=txt(149,369,'[ linux / tux ]',11,'muted','text-anchor="middle"');
  b+=`<path d="M287 102v253" class="rule"/>`;
  b+=txt(318,126,'Ramazan Yıldırım',23,'text','font-weight="700"');
  b+=txt(318,151,'ramazan@linux',13,'cyan')+txt(450,151,'~/profile',12,'muted');
  b+=`<path d="M318 173h558" class="rule"/>`;
  aboutFields.forEach(([key,val],i)=>{
    const y=201+i*26;
    b+=txt(318,y,`${key}:`,12,'green')+txt(432,y,val,13);
  });
  b+=ansiStrip(318,357);
  b+=`<path d="M24 385h852" class="rule"/>`+aboutPrompt(412)+cursor(158,412);
  return terminal('~/profile — bash',w,436,b,'dark',description);
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
for(const name of await readdir(path.join(root,'assets/tech-cards'))) {
  if(!name.endsWith('.svg'))continue;
  const file=path.join(root,'assets/tech-cards',name), old=await readFile(file,'utf8');
  const label=old.match(/aria-label="([^"]+)"/)[1], icon=old.match(/<image[^>]+href="([^"]+)"/)[1];
  await writeFile(file,`<svg xmlns="http://www.w3.org/2000/svg" width="116" height="92" viewBox="0 0 116 92" role="img" aria-label="${label}"><rect x=".5" y=".5" width="115" height="91" rx="3" fill="#0d1117" stroke="#30363d"/><path d="M1 20.5h114" stroke="#30363d"/><text x="9" y="14" fill="#8bd49c" font-family="Consolas,'Liberation Mono',monospace" font-size="9">[pkg]</text><path d="M101 9l2 2 4-4" fill="none" stroke="#8bd49c"/><image x="43" y="29" width="30" height="30" href="${icon}"/><text x="58" y="79" text-anchor="middle" fill="#e6edf3" font-family="Consolas,'Liberation Mono',monospace" font-size="11">${label}</text></svg>\n`);
}
console.log('Generated terminal headers, profile panels, command buttons and package cards.');
