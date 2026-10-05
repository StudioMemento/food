/* Continuous rails and quiet, pointer-responsive edge dust. No dependencies. */
const motion=matchMedia('(prefers-reduced-motion: reduce)');
export function createEndlessRail(track,{speed=13}={}){
 const original=track.innerHTML;
 track.innerHTML=`<div class="stream-belt">${[0,1,2].map(i=>`<div class="stream-set" ${i===1?'':'aria-hidden="true" inert'}>${original}</div>`).join('')}</div>`;
 const belt=track.firstElementChild,sets=[...belt.children];let cycle=0,x=0,last=0,frame=0,visible=false,drag=null,velocity=0,pauseUntil=0,hover=false,focused=false,destroyed=false;
 track.tabIndex=0;track.setAttribute('role','region');track.setAttribute('aria-label',track.dataset.label||track.id);
 const normalize=()=>{if(!cycle)return;while(x<cycle)x+=cycle;while(x>=cycle*2)x-=cycle;};
 const draw=()=>{normalize();belt.style.transform=`translate3d(${-x}px,0,0)`;track.dataset.offset=x.toFixed(2);};
 const measure=()=>{const prior=cycle;cycle=sets[0].getBoundingClientRect().width+parseFloat(getComputedStyle(belt).columnGap||0);x=cycle+(prior?(x-prior)%prior:0);draw();};
 const resize=new ResizeObserver(measure);resize.observe(track);measure();
 const observer=new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible)start();else{cancelAnimationFrame(frame);frame=0;last=0}},{rootMargin:'80px'});observer.observe(track);
 function tick(now){frame=0;if(destroyed||!visible||document.hidden)return;const dt=last?Math.min(40,now-last):0;last=now;if(!drag&&!focused&&now>pauseUntil){if(Math.abs(velocity)>.015){x+=velocity*dt;velocity*=Math.pow(.94,dt/16)}else if(!motion.matches&&!hover)x+=speed*dt/1000;}draw();frame=requestAnimationFrame(tick);}
 function start(){if(!frame&&!destroyed&&visible&&!document.hidden)frame=requestAnimationFrame(tick);}
 const onVisibility=()=>{last=0;start();};document.addEventListener('visibilitychange',onVisibility);
 track.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')hover=true});track.addEventListener('pointerleave',()=>{hover=false});
 track.addEventListener('focusin',()=>focused=track.matches(':focus-visible'));track.addEventListener('focusout',()=>focused=false);
 track.addEventListener('dragstart',e=>e.preventDefault());
 track.addEventListener('pointerdown',e=>{if(e.button!==0)return;velocity=0;drag={id:e.pointerId,startX:e.clientX,startY:e.clientY,lastX:e.clientX,lastT:performance.now(),horizontal:false};pauseUntil=Infinity;});
 track.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.startX,dy=e.clientY-drag.startY;if(!drag.horizontal){if(Math.abs(dx)<7)return;if(Math.abs(dy)>Math.abs(dx)){drag=null;pauseUntil=performance.now()+1600;return;}drag.horizontal=true;track.setPointerCapture(e.pointerId);track.classList.add('dragging');}const now=performance.now(),delta=drag.lastX-e.clientX;x+=delta;velocity=delta/Math.max(10,now-drag.lastT);drag.lastX=e.clientX;drag.lastT=now;draw();});
 function end(){if(!drag)return;drag=null;track.classList.remove('dragging');pauseUntil=performance.now()+80;if(motion.matches)velocity=0;}
 track.addEventListener('pointerup',end);track.addEventListener('pointercancel',end);track.addEventListener('lostpointercapture',e=>{if(e.target===track)end();});
 track.addEventListener('wheel',e=>{if(Math.abs(e.deltaX)>Math.abs(e.deltaY)){e.preventDefault();x+=e.deltaX;velocity=0;pauseUntil=performance.now()+1800;draw();}},{passive:false});
 function step(direction){x+=direction*(track.querySelector('article').getBoundingClientRect().width+parseFloat(getComputedStyle(sets[0]).gap));pauseUntil=performance.now()+2000;velocity=0;draw();}
 track.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();step(e.key==='ArrowRight'?1:-1)}});
 return {step,destroy(){destroyed=true;cancelAnimationFrame(frame);resize.disconnect();observer.disconnect();document.removeEventListener('visibilitychange',onVisibility);}};
}
export function initParticles(){
 const canvas=document.getElementById('ambient-particles'),ctx=canvas.getContext('2d');if(!ctx)return;
 let width=0,height=0,particles=[],last=0,frame=0,pointer={x:-1000,y:-1000,until:0};
 function resize(){width=innerWidth;height=innerHeight;const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);const edge=Math.min(width*.28,Math.max(90,(width-1440)/2+100));particles=Array.from({length:width<700?32:Math.min(155,Math.round(width/13))},()=>{const side=Math.random()<.5,edgeBias=Math.random()<.88;return {x:edgeBias?(side?Math.random()*edge:width-Math.random()*edge):Math.random()*width,y:Math.random()*height,r:.35+Math.random()*1.25,vx:(Math.random()-.5)*.13,vy:-.06-Math.random()*.13,ox:0,oy:0,alpha:.12+Math.random()*.42,phase:Math.random()*6.3}});if(motion.matches)draw(performance.now(),0);}
 function draw(now,dt){ctx.clearRect(0,0,width,height);for(const p of particles){if(!motion.matches){p.y+=p.vy*dt;p.x+=p.vx*dt;if(p.y<0)p.y=height;if(p.x<0)p.x=width;if(p.x>width)p.x=0;let dx=p.x-pointer.x,dy=p.y-pointer.y,d=Math.hypot(dx,dy);if(now<pointer.until&&d<135&&d>0){const force=(1-d/135)*.85;p.ox+=dx/d*force*dt;p.oy+=dy/d*force*dt;}p.ox*=Math.pow(.965,dt);p.oy*=Math.pow(.965,dt);}const a=p.alpha*(.75+.25*Math.sin(now/2700+p.phase));ctx.fillStyle=`rgba(212,179,119,${a})`;ctx.beginPath();ctx.arc(p.x+p.ox,p.y+p.oy,p.r,0,Math.PI*2);ctx.fill();}}
 function tick(now){frame=0;if(document.hidden||motion.matches)return;const dt=last?Math.min(2,(now-last)/16.67):1;last=now;draw(now,dt);frame=requestAnimationFrame(tick);}
 function start(){last=0;if(!frame&&!document.hidden&&!motion.matches)frame=requestAnimationFrame(tick);}
 addEventListener('resize',resize,{passive:true});document.addEventListener('pointermove',e=>{pointer={x:e.clientX,y:e.clientY,until:performance.now()+1300}},{passive:true});document.addEventListener('pointerdown',e=>{pointer={x:e.clientX,y:e.clientY,until:performance.now()+1800}},{passive:true});document.addEventListener('visibilitychange',start);motion.addEventListener('change',()=>{cancelAnimationFrame(frame);frame=0;resize();start()});resize();start();
}
