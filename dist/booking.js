// Demo availability engine. No network, no real reservation is created.
export const tables=[
 {id:'T1',x:20,y:22,seats:2,zone:'Sala',shape:'round'},
 {id:'T2',x:48,y:22,seats:2,zone:'Sala',shape:'round'},
 {id:'T3',x:77,y:22,seats:4,zone:'Sala',shape:'square'},
 {id:'T4',x:20,y:53,seats:4,zone:'Sala',shape:'square'},
 {id:'T5',x:48,y:53,seats:4,zone:'Sala',shape:'square'},
 {id:'T6',x:77,y:54,seats:6,zone:'Sala',shape:'long'},
 {id:'T7',x:25,y:83,seats:6,zone:'Veranda',shape:'long'},
 {id:'T8',x:68,y:83,seats:8,zone:'Veranda',shape:'long'}
];
export const duration=90;
const mins=t=>{const [h,m]=t.split(':').map(Number);return h*60+m};
export function localNow(date=new Date(),timezone='Europe/Rome'){
 const p=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(date).map(v=>[v.type,v.value]));
 return {key:`${p.year}-${p.month}-${p.day}`,minute:+p.hour*60+(+p.minute)};
}
export function shiftDay(key,n){const d=new Date(key+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)}
export function intervals(config,key){const wd=new Date(key+'T12:00:00Z').getUTCDay();return Object.hasOwn(config.exceptions||{},key)?config.exceptions[key]:(config.hours[wd]||[])}
export function slotsFor(config,key,now=new Date()){
 const local=localNow(now,config.timezone);if(key<local.key||key>shiftDay(local.key,90))return[];
 return intervals(config,key).flatMap(([a,b])=>{const start=mins(a),rawEnd=mins(b),end=rawEnd<=start?rawEnd+1440:rawEnd;const arr=[];
 for(let m=start;m+duration<=end;m+=30){if(key===local.key&&m<local.minute+30)continue;arr.push({minute:m,label:`${String(Math.floor(m/60)%24).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`,nextDay:m>=1440})}return arr;});
}
function hash(s){return [...s].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7)}
export function tableAvailable(table,key,minute,party,reservations=[]){
 if(table.seats<party)return false;
 // Seeded example bookings fill a subset of tables for each dinner service.
 const service=minute<1020?'lunch':'dinner';if(hash(key+service+table.id)%7===0)return false;
 const absolute=Date.parse(key+'T00:00:00Z')/60000+minute;
 return !reservations.some(r=>r.table===table.id&&Math.abs((Date.parse(r.date+'T00:00:00Z')/60000+r.minute)-absolute)<duration);
}
export function availableSlots(config,key,party,reservations=[],now=new Date()){
 return slotsFor(config,key,now).map(s=>({...s,available:tables.filter(t=>tableAvailable(t,key,s.minute,party,reservations)).length}));
}
export function isValidReservation(candidate,config,reservations=[],now=new Date()){
 const table=tables.find(t=>t.id===candidate.table);
 return !!table&&Number.isInteger(candidate.party)&&candidate.party>=1&&candidate.party<=8&&Array.isArray(candidate.seats)&&candidate.seats.length===candidate.party&&new Set(candidate.seats).size===candidate.party&&candidate.seats.every(x=>Number.isInteger(x)&&x>=1&&x<=table.seats)&&slotsFor(config,candidate.date,now).some(s=>s.minute===candidate.minute)&&tableAvailable(table,candidate.date,candidate.minute,candidate.party,reservations);
}
