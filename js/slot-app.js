(function initSketchbookSlot(){
  "use strict";
  const config=globalThis.SlotConfig,engine=globalThis.SlotEngine;
  if(!config||!engine)return;
  const machine=document.querySelector("#slot-machine"),lever=document.querySelector("#lever"),reels=[...document.querySelectorAll(".reel")];
  const balanceNode=document.querySelector("#balance"),wagerNode=document.querySelector("#wager"),statusCopy=document.querySelector("#status-copy"),statusPayout=document.querySelector("#status-payout"),status=statusCopy.parentElement,historyNode=document.querySelector("#history"),resetButton=document.querySelector("#reset-button");
  const verification=engine.verifyModel(config),randomInt=engine.createRandomIntSource(),reduceMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const state={balance:config.startingBalance,spinning:false,currentStops:[0,0,0],history:[]};
  let drag=null,ignoreClick=false;
  const icon=id=>`<svg viewBox="0 0 80 80" aria-hidden="true"><use href="#icon-${id}"></use></svg>`;
  const format=value=>new Intl.NumberFormat("en-US").format(value);
  const percent=(value,digits=1)=>`${(value*100).toFixed(digits)}%`;
  function renderReel(reelIndex,centerIndex){reels[reelIndex].innerHTML=`<div class="reel-strip">${engine.visibleStops(config.reels[reelIndex],centerIndex).map(id=>`<div class="reel-symbol">${icon(id)}</div>`).join("")}</div>`}
  function renderModel(){
    if(!verification.ok){statusCopy.textContent="Model verification failed";return}
    const model=verification.analysis;
    document.querySelector("#combinations").textContent=format(model.totalCombinations);
    document.querySelector("#hit-frequency").textContent=percent(model.hitFrequency,3);
    document.querySelector("#rtp").textContent=percent(model.rtp);
    document.querySelector("#house-edge").textContent=percent(model.houseEdge);
    document.querySelector("#paytable").innerHTML=config.symbolOrder.map(id=>`<div class="pay-row">${icon(id)}<span>${config.symbols[id].label} · ${model.symbolStats[id].stopsPerReel[0]}/20 stops</span><strong>${config.symbols[id].payout}×</strong></div>`).join("");
  }
  function renderValues(){balanceNode.textContent=format(state.balance);wagerNode.textContent=format(config.wager);lever.disabled=state.spinning||state.balance<config.wager}
  function renderHistory(){historyNode.innerHTML=state.history.length?state.history.map(item=>`<div class="history-row"><span>#${item.number}</span><span class="history-symbols">${item.symbols.map(icon).join("")}</span><strong>${item.payout?`+${format(item.payout)}`:"—"}</strong></div>`).join(""):"<p>No pulls yet. The machine is waiting.</p>"}
  function setPull(amount,dragging=false){const value=Math.max(0,Math.min(1,amount));machine.style.setProperty("--lever-angle",`${value*56}deg`);lever.classList.toggle("dragging",dragging)}
  function animateReel(index,finalStop,duration){return new Promise(resolve=>{const reel=reels[index];reel.classList.add("spinning");if(reduceMotion){renderReel(index,finalStop);reel.classList.remove("spinning");resolve();return}const timer=setInterval(()=>renderReel(index,randomInt(config.reels[index].length)),76);setTimeout(()=>{clearInterval(timer);renderReel(index,finalStop);reel.classList.remove("spinning");resolve()},duration)})}
  async function playSpin(){
    if(state.spinning||state.balance<config.wager)return;
    state.spinning=true;renderValues();setPull(1);status.classList.remove("win");statusCopy.textContent="Reels in motion…";statusPayout.textContent="outcome selected";
    const outcome=engine.selectOutcome(randomInt,config),settlement=engine.settleBalance(state.balance,outcome,config);
    state.balance-=config.wager;renderValues();setTimeout(()=>setPull(0),140);
    await Promise.all(outcome.stopIndices.map((stop,index)=>animateReel(index,stop,reduceMotion?0:760+index*260)));
    state.currentStops=[...outcome.stopIndices];state.balance=settlement.closingBalance;
    statusCopy.textContent=outcome.isWin?`${config.symbols[outcome.winningSymbol].label} × 3!`:"No matching line";
    statusPayout.textContent=outcome.isWin?`+${format(settlement.payout)} credits`:`−${config.wager} credits`;status.classList.toggle("win",outcome.isWin);
    state.history.unshift({number:state.history.length+1,symbols:[...outcome.symbols],payout:settlement.payout});state.history=state.history.slice(0,3);state.spinning=false;renderValues();renderHistory();
    if(state.balance<config.wager){statusCopy.textContent="Out of credits";statusPayout.textContent="reset to continue"}
  }
  lever.addEventListener("pointerdown",event=>{if(lever.disabled)return;ignoreClick=true;drag={id:event.pointerId,startY:event.clientY,pull:0};lever.setPointerCapture(event.pointerId);setPull(0,true)});
  lever.addEventListener("pointermove",event=>{if(!drag||drag.id!==event.pointerId)return;drag.pull=Math.max(0,Math.min(1,(event.clientY-drag.startY)/145));setPull(drag.pull,true)});
  function finishDrag(event){if(!drag||drag.id!==event.pointerId)return;const spin=drag.pull>=.55;drag=null;setPull(spin?1:0,false);if(spin)playSpin();setTimeout(()=>{ignoreClick=false},0)}
  lever.addEventListener("pointerup",finishDrag);lever.addEventListener("pointercancel",event=>{if(drag&&drag.id===event.pointerId){drag=null;setPull(0)}});lever.addEventListener("click",event=>{if(ignoreClick){event.preventDefault();return}playSpin()});
  resetButton.addEventListener("click",()=>{if(state.spinning)return;state.balance=config.startingBalance;state.history=[];status.classList.remove("win");statusCopy.textContent="Pull the lever";statusPayout.textContent=`${config.wager} credits / pull`;renderValues();renderHistory();setPull(0)});
  state.currentStops.forEach((stop,index)=>renderReel(index,stop));renderModel();renderValues();renderHistory();setPull(0);
})();
