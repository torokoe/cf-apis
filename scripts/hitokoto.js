const document = `<!DOCTYPE html>
<script>
var opener = window.opener?.document || parent?.window?.opener?.document || document;
opener.write("QQmini HTTP插件接口 - 一言 v0.1 by Toroko");
</script>
<body>
  <p>接收以〝一言〞開頭的私聊或群聊消息</p>
  <p>返回由<a href="https://api.kotori.love/">あかねぞら</a>提供的數據並經處理之結果</p>
<p>
    2021-03-30 v0.2<p>
  <li>2020-09-25 v0.1
<details>
  <summary>支持多個參數</summary>
  <table cellspacing="0" class="t_table" style="width:80%;border: 1px;"><tbody><tr><td>at</td><td>群聊at發送人(預設:true)<br>
true/false</td></tr><tr><td>keyword</td><td>自定義觸發詞</td></tr></tbody></table>
</details>
</body></html>`;
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
    let task, at = true, keyword = "一言";
    const skip = new Response(`{"code" : 1,"url": ${request.url}}`, { "content-type": "application/json;charset=UTF-8" });
    try{ task = await request.json();}catch{}
    if (!task || !task.Event || (task.Event != 1 && task.Event != 2)) { return skip; }
    let callback = { Api: "SendMsg", Robot: task.Robot, Type: task.Event, Group: task.From, QQ: task.FromQQ, Content: task.Msg, Code: 1 }
    const { searchParams } = new URL(request.url)
    const atParams = searchParams.get('at');
    const keywordParams = searchParams.get('keyword');
    if(atParams)        { at        = atParams      == "true";}
    if(keywordParams)   { keyword   = keywordParams;}
    if(!task.Msg.startsWith(keyword)){return skip;}
    const response = await fetch(`https://api.kotori.love/hitokoto/json`);
    if (!response || response.status != 200) { return skip; }
    var result = await response.json();
    if (!result) { return skip; }
    if (result.status!="success") { return skip; }
    const data = result.result;
    callback.Content = `${task.Event == 2 && at ? `[@${task.FromQQ}] \r\n` : ''}${data.hitokoto}`;
    return new Response(JSON.stringify(callback), { headers: { "content-type": "application/json" }, status: 200 });
}
