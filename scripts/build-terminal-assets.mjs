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
const logoRows = [
 ' ################                       ',
 '  #################               ##### ',
 '   #################             #####  ',
 '                #####          #####    ',
 '                 ######       #####     ',
 '                ########    #####       ',
 '    #####   ######## ##### #####        ',
 '     ######  ######   ##### ##          ',
 '      ######  ###      #####            ',
 '       #######          #####           ',
 '         ######         #####           ',
 '          #######       #####           ',
 '            ######      #####           ',
 '             ######     #####           ',
 '              #######   #####           ',
 '                ######  #####           ',
];
function logo(x,y,stepX,stepY) {
  // Sampled from the existing RY mark; vector cells also work without a block font.
  return `<g class="green">${logoRows.flatMap((row,r)=>[...row].map((c,col)=>c==='#'?`<rect x="${x+col*stepX}" y="${y+r*stepY}" width="${stepX-1.2}" height="${stepY-1.2}"/>`:'')).join('')}</g>`;
}
const cursor=(x,y)=>`<rect x="${x}" y="${y-12}" width="8" height="15" class="green"/>`;
function header(theme,compact) {
  const w=compact?360:900,h=compact?200:240;
  const stepX=compact?7.5:9,stepY=compact?9:11;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Ramazan Yıldırım RY logo"><style>.green{fill:${palettes[theme].green}}</style>${logo((w-40*stepX)/2,(h-16*stepY)/2,stepX,stepY)}</svg>\n`;
}
const tux = ['    .--.    ','   |o_o |   ','   |:_/ |   ','  //   \\ \\  ',' (|     | ) ','/\'\\_   _/`\\','\\___)=(___/'];
function about(compact) {
  const w=compact?360:900;
  let b=txt(24,66,compact?'$ cat ~/about.conf':'$ neofetch --config ~/about.conf',compact?12:14,'green');
  if(!compact) {
    tux.forEach((line,i)=>b+=txt(34,112+i*19,line,20,i<3?'amber':'text','xml:space="preserve"'));
    ['green','cyan','amber','text'].forEach((color,i)=>b+=`<rect x="${44+i*30}" y="267" width="27" height="13" class="${color}"/>`);
  }
  const x=compact?24:260;
  b+=txt(x,compact?100:104,'ramazan@linux',compact?19:21,'cyan','font-weight="700"');
  b+=txt(x,compact?122:129,'-------------',14,'muted');
  if(compact) {
    const rows=[['education','Computer Engineering'],['graduation','2027'],['focus','Deep learning / Computer vision'],['language','Turkish NLP'],['build','FastAPI / Laravel / PHP / Vue.js'],['mindset','Practical, reproducible systems']];
    rows.forEach(([key,val],i)=>{b+=txt(x,154+i*44,key,11,'green')+txt(x,173+i*44,val,12,'text');});
    b+=`<path d="M24 412h312" class="rule"/>`+txt(24,437,'$ ',13,'green')+cursor(42,437);
  } else {
    [['education','Computer Engineering student'],['graduation','2027'],['focus','Deep learning / Computer vision'],['language','Turkish NLP'],['build','FastAPI / Laravel / PHP / Vue.js'],['mindset','Practical, reproducible software & AI']].forEach(([key,val],i)=>{b+=txt(x,156+i*25,key,13,'green')+txt(x+114,156+i*25,val,13);});
    b+=`<path d="M24 301h852" class="rule"/>`+txt(24,326,'$ ',13,'green')+cursor(42,326);
  }
  return terminal('ramazan@linux: ~',w,compact?458:348,b,'dark','About Ramazan Yıldırım: Computer Engineering student graduating in 2027. Focused on deep learning, computer vision and Turkish NLP. Building with FastAPI, Laravel, PHP and Vue.js. Interested in practical, reproducible software and AI systems.');
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
const buttons={website:['./website',160],cv:['./cv --en',160],portfolio:['./portfolio',182],linkedin:['./linkedin',172],email:['./mail',138],documents:['cd ~/documents/cv-and-portfolio',338],'visit-platform':['./open dijitaldisdunyasi.com',330],'download-cv-en':['./download cv --en',244],'download-cv-tr':['./download cv --tr',244],'download-portfolio':['./download portfolio',270],'cv-repository':['./open cv-repository',270]};
await mkdir(path.join(root,'assets/terminal'),{recursive:true});
for(const theme of ['dark','light']) for(const compact of [false,true]) await writeFile(path.join(root,`assets/brand/header-${theme}${compact?'-compact':''}.svg`),header(theme,compact));
for(const compact of [false,true]) {
  await writeFile(path.join(root,`assets/terminal/about${compact?'-compact':''}.svg`),about(compact));
  await writeFile(path.join(root,`assets/terminal/project${compact?'-compact':''}.svg`),await project(compact));
}
for(const [name,[label,w]] of Object.entries(buttons)) {
  const p=palettes.dark;
  const body=`<rect x=".5" y=".5" width="${w-1}" height="43" rx="3" fill="${p.bg}" stroke="${p.line}"/><text x="14" y="27" fill="${p.green}" font-family="Consolas,'Liberation Mono',monospace" font-size="14">$</text><text x="34" y="27" fill="${p.text}" font-family="Consolas,'Liberation Mono',monospace" font-size="13">${xml(label)}</text><path d="M${w-23}18l5 4-5 4" fill="none" stroke="${p.green}" stroke-width="1.5"/>`;
  await writeFile(path.join(root,`assets/ui/${name}.svg`),`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="44" viewBox="0 0 ${w} 44" role="img" aria-label="${xml(label)}">${body}</svg>\n`);
}
for(const name of await readdir(path.join(root,'assets/tech-cards'))) {
  if(!name.endsWith('.svg'))continue;
  const file=path.join(root,'assets/tech-cards',name), old=await readFile(file,'utf8');
  const label=old.match(/aria-label="([^"]+)"/)[1], icon=old.match(/<image[^>]+href="([^"]+)"/)[1];
  await writeFile(file,`<svg xmlns="http://www.w3.org/2000/svg" width="116" height="92" viewBox="0 0 116 92" role="img" aria-label="${label}"><rect x=".5" y=".5" width="115" height="91" rx="3" fill="#0d1117" stroke="#30363d"/><path d="M1 20.5h114" stroke="#30363d"/><text x="9" y="14" fill="#8bd49c" font-family="Consolas,'Liberation Mono',monospace" font-size="9">[pkg]</text><path d="M101 9l2 2 4-4" fill="none" stroke="#8bd49c"/><image x="43" y="29" width="30" height="30" href="${icon}"/><text x="58" y="79" text-anchor="middle" fill="#e6edf3" font-family="Consolas,'Liberation Mono',monospace" font-size="11">${label}</text></svg>\n`);
}
console.log('Generated terminal headers, profile panels, command buttons and package cards.');
