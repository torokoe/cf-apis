const document = `<!DOCTYPE html>
<body>
  <h7>QQmini HTTP插件接口 - 圖片鑒黃識別 v0.2 by Toroko</h7>
  <p>接收以〝識黃〞開頭並帶上圖片的私聊或群聊消息</p>
  <p>返回由<a href="https://api.oioweb.cn/">教書先生</a>提供的數據並經處理之結果</p>

  <li>2021-03-01 v0.2
  
  <li>2020-09-24 v0.1
<details>
  <summary>支持多個參數</summary>
  <table cellspacing="0" class="t_table" style="width:80%;border: 1px;"><tbody><tr><td>at</td><td>群聊at發送人(預設:true)<br>
true/false</td></tr><tr><td>tips</td><td>沒帶上圖片時出提示信息(預設:false 不提示)<br>
true/false</td></tr><tr><td>keyword</td><td>自定義觸發詞</td></tr><tr><td>message</td><td>自定義沒帶上圖片時的提示信息</td></tr></tbody></table>
</details>
</body></html>`;
const patternImage = /\[pic={(\d{6,13}-\d{6,13}-)?([0-9A-F]{8}-?[0-9A-F]{4}-?[0-9A-F]{4}-?[0-9A-F]{4}-?[0-9A-F]{12})}.[a-z]{0,5}\]/m;
addEventListener('fetch', event => {
    if (event.request.method == "GET")
        event.respondWith(new Response(document, {
            headers: {
                "content-type": "text/html;charset=UTF-8"
            }, status: 200
        }))
    if (event.request.method == "POST")
        event.respondWith(handleTaskRequest(event.request))
})
async function handleTaskRequest(request) {
    let task, guid, matchsImage, at = true, tips = false, keyword = "識黃", message = "請附帶需要進行鑒黃識別的圖片", ratingstring;
    const skip = new Response(`{"code" : 1,"url": ${request.url}}`, { "content-type": "application/json;charset=UTF-8" });
    try{ task = await request.json();}catch{}
    if (!task || !task.Event || (task.Event != 1 && task.Event != 2)) { return skip; }
    let callback = { Api: "SendMsg", Robot: task.Robot, Type: task.Event, Group: task.From, QQ: task.FromQQ, Content: task.Msg, Code: 1 }
    const { searchParams } = new URL(request.url)
    const atParams = searchParams.get('at');
    const tipsParams = searchParams.get('tips');
    const keywordParams = searchParams.get('keyword');
    const messageParams = searchParams.get('message');
    if(atParams)        { at        = atParams      == "true";}
    if(tipsParams)      { tips      = tipsParams    == "true";}
    if(keywordParams)   { keyword   = keywordParams;}
    if(messageParams)   { message   = messageParams;}
    matchsImage = task.Msg.match(patternImage);
    if(tips && task.Msg.startsWith(keyword) && !matchsImage)
    {
        callback.Content = `${task.Event == 2 && at ? `[@${task.FromQQ}] \r\n` : ''}${message}`;
        return new Response(JSON.stringify(callback), { headers: { "content-type": "application/json" } });
    }
    if(!matchsImage){return skip;}
    if(!task.Msg.startsWith(keyword)){return skip;}
    guid = matchsImage[2].replaceAll("-", "");
    const response = await fetch(`https://api.oioweb.cn/api/ChiHuang.php?imgurl=http://gchat.qpic.cn/gchatpic_new/0/0-0-${guid}/0`);
    if (!response || response.status != 200) { return skip; }
    var result = await response.json();
    if (!result) { return skip; }
    if (result.code != 1) { return skip; }
    switch(result.rating_index){
      case 1:
      ratingstring = "正常";
      break;
      case 2:
      ratingstring = "性感";
      break;
      case 3:
      ratingstring = "色情";
      break;
    }
    callback.Content = `${task.Event == 2 && at ? `[@${task.FromQQ}] \r\n` : ''}${ratingstring}`;
    return new Response(JSON.stringify(callback), { headers: { "content-type": "application/json" }, status: 200 });
}
