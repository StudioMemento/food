const minutes=value=>{const [h,m]=value.split(':').map(Number);return h*60+m;};
const weekdayNames={it:['Domenica','Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato'],en:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']};
Object.assign(weekdayNames,{de:['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'],fr:['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'],es:['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']});
const statusWords={it:['Aperto ora','Chiuso ora','Chiude alle','Riapre','oggi','domani','alle','Chiuso'],en:['Open now','Closed now','Closes at','Opens','today','tomorrow','at','Closed'],de:['Jetzt geöffnet','Geschlossen','Schließt um','Öffnet','heute','morgen','um','Geschlossen'],fr:['Ouvert','Fermé','Ferme à','Ouvre','aujourd’hui','demain','à','Fermé'],es:['Abierto','Cerrado','Cierra a las','Abre','hoy','mañana','a las','Cerrado']};
function localParts(date,timezone){const p=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(date).map(x=>[x.type,x.value]));const day=new Date(`${p.year}-${p.month}-${p.day}T12:00:00Z`);return{key:`${p.year}-${p.month}-${p.day}`,day,weekday:day.getUTCDay(),minute:Number(p.hour)*60+Number(p.minute)};}
function shifted(parts,offset){const d=new Date(parts.day);d.setUTCDate(d.getUTCDate()+offset);return{key:d.toISOString().slice(0,10),weekday:d.getUTCDay()};}
function periods(config,parts){return Object.hasOwn(config.exceptions||{},parts.key)?config.exceptions[parts.key]:config.hours[String(parts.weekday)]||[];}
export function openingState(config,date=new Date(),lang='it'){
 const w=statusWords[lang]||statusWords.en;
 const local=localParts(date,config.timezone),previous=shifted(local,-1);let closing=null;
 for(const [start,end] of periods(config,previous)){const a=minutes(start),b=minutes(end);if(b<=a&&local.minute<b)closing=end;}
 for(const [start,end] of periods(config,local)){const a=minutes(start),b=minutes(end);if(local.minute>=a&&(b<=a||local.minute<b))closing=end;}
 if(closing!==null)return{open:true,label:w[0],detail:`${w[2]} ${closing} · Europe/Rome`};
 for(let offset=0;offset<=7;offset++){const day=shifted(local,offset);for(const [start] of periods(config,day)){if(offset===0&&minutes(start)<=local.minute)continue;const when=offset===0?(w[4]):offset===1?(w[5]):weekdayNames[lang][day.weekday].toLowerCase();return{open:false,label:w[1],detail:`${w[3]} ${when} ${w[6]} ${start} · Europe/Rome`};}}
 return{open:false,label:w[1],detail:lang==='it'?'Prossima apertura da definire':'Next opening to be confirmed'};
}
export function weeklyRows(config,date=new Date(),lang='it'){const now=localParts(date,config.timezone);return[1,2,3,4,5,6,0].map(day=>{const offset=(day-now.weekday+7)%7;const intervals=periods(config,shifted(now,offset));return{day:weekdayNames[lang][day],today:day===now.weekday,hours:intervals.length?intervals.map(([a,b])=>`${a} – ${b}`).join(' / '):(statusWords[lang]||statusWords.en)[7]};});}
