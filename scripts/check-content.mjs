import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import YAML from 'yaml';
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const pages=walk('_sql').filter(p=>p.endsWith('.md'));
const urls=new Set(pages.map(p=>'/sql/'+p.replaceAll('\\','/').replace(/^_sql\//,'').replace(/\.md$/,'')+'/'));
urls.add('/sql/');urls.add('/dsa/');urls.add('/');
const sequences=new Set();
for(const file of pages){const text=fs.readFileSync(file,'utf8');const match=text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);assert.ok(match,'front matter '+file);const data=YAML.parse(match[1]);for(const key of ['title','description','chapter','order','sequence'])assert.notEqual(data[key],undefined,key+' '+file);assert.ok(!sequences.has(data.sequence),'duplicate sequence '+file);sequences.add(data.sequence);assert.equal((match[2].match(/^```/gm)||[]).length%2,0,'code fences '+file);assert.ok(match[2].length>150,'empty page '+file);for(const link of text.matchAll(/'((?:\/sql\/)[^']*)'\s*\|\s*relative_url/g))assert.ok(urls.has(link[1]),'missing internal URL '+link[1]+' '+file);assert.ok(!/TODO|Lorem ipsum/.test(text),'unfinished text '+file);}
console.log(`Content checks passed: ${pages.length} SQL pages, unique ordering, links, and code fences.`);
