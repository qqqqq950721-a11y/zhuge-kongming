let engine=null;
let ready=null;
function init(){
  if(ready)return ready;
  importScripts('xiangqi-engine.js');
  ready=createXiangqiEngine({locateFile:name=>name}).then(m=>{
    engine=m;
    return {
      set:m.cwrap('xq_set_position','number',['string','number']),
      best:m.cwrap('xq_best_move','number',['number','number'])
    };
  });
  return ready;
}
self.onmessage=async event=>{
  const data=event.data||{};
  try{
    const api=await init();
    if(data.type==='best'){
      const ok=api.set(String(data.position||''),-1);
      const packed=ok?api.best(Math.max(100,Number(data.time)||900),Math.max(1,Number(data.depth)||12)):-1;
      self.postMessage({type:'best',id:data.id,packed});
    }else self.postMessage({type:'ready'});
  }catch(error){self.postMessage({type:'error',id:data.id,message:String(error)})}
};
