// Demo availability engine. No network, no real reservation is created.
export const tables=[
 {
  "id": "T1",
  "x": 31.6,
  "y": 25.5,
  "seats": 2,
  "zone": "Sala"
 },
 {
  "id": "T2",
  "x": 25.3,
  "y": 31.6,
  "seats": 4,
  "zone": "Sala"
 },
 {
  "id": "T3",
  "x": 20.7,
  "y": 34.7,
  "seats": 4,
  "zone": "Sala"
 },
 {
  "id": "T4",
  "x": 17.9,
  "y": 38.5,
  "seats": 2,
  "zone": "Sala"
 },
 {
  "id": "T5",
  "x": 11.5,
  "y": 42.7,
  "seats": 4,
  "zone": "Sala"
 },
 {
  "id": "T6",
  "x": 21.6,
  "y": 47.7,
  "seats": 4,
  "zone": "Sala"
 },
 {
  "id": "T7",
  "x": 28,
  "y": 40.5,
  "seats": 4,
  "zone": "Sala"
 },
 {
  "id": "T8",
  "x": 33.4,
  "y": 35.4,
  "seats": 6,
  "zone": "Sala"
 },
 {
  "id": "T9",
  "x": 44.7,
  "y": 31.4,
  "seats": 4,
  "zone": "Sala"
 },
 {
  "id": "T10",
  "x": 47.8,
  "y": 44,
  "seats": 20,
  "zone": "Sala"
 },
 {
  "id": "T11",
  "x": 66.4,
  "y": 45,
  "seats": 4,
  "zone": "Sala"
 },
 {
  "id": "T12",
  "x": 72.1,
  "y": 47.4,
  "seats": 4,
  "zone": "Sala"
 },
 {
  "id": "T13",
  "x": 77.8,
  "y": 50.4,
  "seats": 4,
  "zone": "Sala"
 },
 {
  "id": "T14",
  "x": 60.7,
  "y": 56.7,
  "seats": 8,
  "zone": "Sala"
 },
 {
  "id": "T15",
  "x": 80.3,
  "y": 58.9,
  "seats": 2,
  "zone": "Sala"
 },
 {
  "id": "T16",
  "x": 52.2,
  "y": 64.3,
  "seats": 6,
  "zone": "Sala"
 },
 {
  "id": "T17",
  "x": 64.8,
  "y": 71.2,
  "seats": 2,
  "zone": "Sala"
 },
 {
  "id": "T18",
  "x": 27.7,
  "y": 55.9,
  "seats": 4,
  "zone": "Sala"
 },
 {
  "id": "T19",
  "x": 9,
  "y": 58.4,
  "seats": 4,
  "zone": "Esterno"
 },
 {
  "id": "T20",
  "x": 18.9,
  "y": 64.1,
  "seats": 4,
  "zone": "Esterno"
 },
 {
  "id": "T21",
  "x": 29.4,
  "y": 70.7,
  "seats": 4,
  "zone": "Esterno"
 }
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
 if(minute===null||!Number.isInteger(minute))return false;
 const absoluteCandidate=Date.parse(key+'T00:00:00Z')/60000+minute;
 for(const day of [shiftDay(key,-1),key,shiftDay(key,1)]){
  const wd=new Date(day+'T12:00:00Z').getUTCDay();if(wd===1)continue;
  const h=hash(day+table.id),start=(wd===5||wd===6)?1200:1080+(h%8)*30;
  if(h%5!==0 || wd===5||wd===6){
   const seededStart=Date.parse(day+'T00:00:00Z')/60000+start;
   if(Math.abs(seededStart-absoluteCandidate)<duration)return false;
  }
 }
 const absolute=Date.parse(key+'T00:00:00Z')/60000+minute;
 return !reservations.some(r=>r.table===table.id&&Math.abs((Date.parse(r.date+'T00:00:00Z')/60000+r.minute)-absolute)<duration);
}
export function availableSlots(config,key,party,reservations=[],now=new Date()){
 return slotsFor(config,key,now).map(s=>({...s,available:tables.filter(t=>tableAvailable(t,key,s.minute,party,reservations)).length}));
}
export function isValidReservation(candidate,config,reservations=[],now=new Date()){
 const table=tables.find(t=>t.id===candidate.table);
 return !!table&&Number.isInteger(candidate.party)&&candidate.party>=1&&candidate.party<=20&&Array.isArray(candidate.seats)&&candidate.seats.length===candidate.party&&new Set(candidate.seats).size===candidate.party&&candidate.seats.every(x=>Number.isInteger(x)&&x>=1&&x<=table.seats)&&slotsFor(config,candidate.date,now).some(s=>s.minute===candidate.minute)&&tableAvailable(table,candidate.date,candidate.minute,candidate.party,reservations);
}
