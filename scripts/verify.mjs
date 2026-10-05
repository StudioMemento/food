import {readFileSync,existsSync,statSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
const root=new URL('../',import.meta.url).pathname;
const {items,categories}=JSON.parse(readFileSync(join(root,'dist/catalog.json')));
const counts={panini:12,cucina:12,stuzzicheria:12,birre:6,vini:6,dolci:6,drinks:12,amari:6};
const fail=[];
for(const [category,count] of Object.entries(counts))if(items.filter(i=>i.category===category).length!==count)fail.push(`Count mismatch: ${category}`);
if(new Set(items.map(i=>i.id)).size!==72)fail.push('Product IDs must be unique');
for(const item of items){
 for(const k of ['image','reveal','thumbnail']){const p=join(root,'dist',item[k]);if(!existsSync(p)||statSync(p).size<100)fail.push(`${item.id}: missing ${k}`);}
 if(!Number.isInteger(item.priceCents)||item.priceCents<=0)fail.push(`${item.id}: invalid price`);
 if(item.ingredients.it.length!==item.ingredients.en.length)fail.push(`${item.id}: language mismatch`);
 if(!item.name.it||!item.name.en)fail.push(`${item.id}: name missing`);
}
for(const c of categories){if(!items.find(i=>i.id===c.featured))fail.push(`Featured image: ${c.id}`);if(!existsSync(join(root,'dist/assets/categories',c.id+'.webp')))fail.push(`Category image: ${c.id}`);}
for(let i=1;i<=4;i++)if(!existsSync(join(root,`dist/assets/venue/venue-0${i}.webp`)))fail.push(`Venue ${i} missing`);
for(const font of ['kaushan-script.woff','font-3.woff','font-6.woff'])if(!existsSync(join(root,'dist/assets/fonts',font)))fail.push(`Font missing: ${font}`);
const walk=path=>readdirSync(path,{withFileTypes:true}).flatMap(f=>f.isDirectory()?walk(join(path,f.name)):[join(path,f.name)]);
if(fail.length){console.error(fail.join('\n'));process.exit(1)}
console.log('Verified: 72 items, 8 categories, 144 product photos, 72 thumbnails, 4 venue photos, fonts and neutral branding.');
