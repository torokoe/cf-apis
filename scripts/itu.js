const document = `<!DOCTYPE html>
<body>
  <h7>QQmini HTTP插件接口 - 圖片轉鏈 v0.4 by Toroko</h7>
  <p>對帶觸發詞的圖片消息進行解析</p>
  <p>
  <li>2021-03-01 v0.4
  <p>
  <li>2020-09-28 v0.3
  <br>
  修正觸發詞失效
  <p>
  <li>2020-09-24 v0.2
<details>
  <summary>支持多個參數</summary>
  <table cellspacing="0" class="t_table" style="width:80%;border: 1px;"><tbody><tr><td>at</td><td>群聊at發送人(預設:true)<br>
true/false</td></tr><tr><td>tips</td><td>沒帶上圖片時出提示信息(預設:false 不提示)<br>
true/false</td></tr><tr><td>keyword</td><td>自定義觸發詞</td></tr><tr><td>message</td><td>自定義沒帶上圖片時的提示信息</td></tr></tbody></table>
</details>
<p>
  <li>2020-09-24 v0.1
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
    let task, guid, matchsImage, at = true, tips = false, keyword = "#轉鏈" , message = "請附帶需要轉鏈的圖片";
    const skip = new Response(`{"code" : 1,"url": ${request.url}}`, { "content-type": "application/json;charset=UTF-8" });
    try{ task = await request.json();}catch{}
    if (!task || !task.Event || (task.Event != 1 && task.Event != 2)) { return skip; }
    let callback = { Api: "SendMsg", Robot: task.Robot, Type: task.Event, Group: task.From, QQ: task.FromQQ, Content: task.Msg, Code: 1 }
    const { searchParams } = new URL(request.url)
    const keywordParams = searchParams.get('keyword');
    const atParams = searchParams.get('at');
    const tipsParams = searchParams.get('tips');
    const messageParams = searchParams.get('message');
    if(keywordParams)   { keyword   = keywordParams;}
    if(atParams)        { at        = atParams == "true";}
    if(tipsParams)      { tips      = tipsParams == "true";}
    if(messageParams)   { message   = messageParams;}
    if(!task.Msg.StartWiths(keyword)){return skip;}
    matchsImage = task.Msg.match(patternImage);
    if(!matchsImage){
        if(tips){
            callback.Content = `${task.Event == 2 && at ? `[@${task.FromQQ}] \r\n` : ''}${message}`;
            return new Response(JSON.stringify(callback), { headers: { "content-type": "application/json" } });
        }
        return skip;
    }
    guid = matchsImage[2].replaceAll("-", "");
    callback.Content = `${task.Event == 2 && at ? `[@${task.FromQQ}] \r\n` : ''}http://gchat.qpic.cn/gchatpic_new/0/0-0-${guid}/0`;
    return new Response(JSON.stringify(callback), { headers: { "content-type": "application/json" } });
}
