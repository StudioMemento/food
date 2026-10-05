// A light responds to the pointer; the mark itself moves by only a few pixels.
export function initHeroInteraction(){
  const hero=document.querySelector('.hero');
  const mark=document.querySelector('.hero-mark');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  if(!hero||!mark)return;
  let frame=0,point=null;
  const reset=()=>{
    cancelAnimationFrame(frame);frame=0;point=null;
    for(const name of ['--mark-x','--mark-y','--mark-rx','--mark-ry','--light-x','--light-y'])mark.style.removeProperty(name);
    mark.classList.remove('is-interacting');
  };
  const render=()=>{
    frame=0;if(!point||reduced.matches)return;
    const r=mark.getBoundingClientRect(),x=Math.max(0,Math.min(1,(point.x-r.x)/r.width)),y=Math.max(0,Math.min(1,(point.y-r.y)/r.height));
    mark.style.setProperty('--mark-x',`${(x-.5)*10}px`);
    mark.style.setProperty('--mark-y',`${(y-.5)*7}px`);
    mark.style.setProperty('--mark-rx',`${(.5-y)*3}deg`);
    mark.style.setProperty('--mark-ry',`${(x-.5)*4}deg`);
    mark.style.setProperty('--light-x',`${x*100}%`);
    mark.style.setProperty('--light-y',`${y*100}%`);
    mark.classList.add('is-interacting');
  };
  const move=e=>{if(reduced.matches)return;point={x:e.clientX,y:e.clientY};if(!frame)frame=requestAnimationFrame(render);};
  hero.addEventListener('pointermove',move,{passive:true});
  mark.addEventListener('pointerdown',move,{passive:true});
  hero.addEventListener('pointerleave',reset);
  hero.addEventListener('pointercancel',reset);
  hero.addEventListener('pointerup',e=>{if(e.pointerType!=='mouse')reset();});
  reduced.addEventListener('change',reset);
}
