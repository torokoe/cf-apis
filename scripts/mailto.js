const document = `<!DOCTYPE html>
<body>
  <h7>QQmini HTTP插件接口 - 郵件發送 v0.1 by Toroko</h7>
  <p>接收以〝郵件發送〞開頭的私聊或群聊消息</p>
  <p>返回由<a href="https://playjie.net/xzd/api/mail/">玩傑API</a>提供的數據並經處理之結果</p>

<li>2020-09-24 v0.1
<details>
  <summary>支持多個參數</summary>
  <table cellspacing="0" class="t_table" style="width:80%;border: 1px;"><tbody>
  <tr><td>at</td><td>群聊at發送人(預設:true)<br>true/false</td></tr>
  <tr><td>keyword</td><td>自定義觸發詞</td></tr>
  <tr><td>address</td><td>固定收件人郵箱地址</td></tr>
  <tr><td>title</td><td>固定郵件標題</td></tr>
  <tr><td>allowmodify</td><td>許可在消息中自定郵箱地址及標題 格式: {觸發詞}|{郵箱地址}|{標題}|{內文}</td></tr>
  </tbody></table>
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
    let task, at = true, allowmodify = false, keyword = "郵件發送", address = "mailto@toroko.link", title = "QQmini HTTP插件接口 - 郵件發送", message = "<h2>示例</h2>";
    const skip = new Response(`{"code" : 1,"url": ${request.url}}`, { "content-type": "application/json;charset=UTF-8" });
    try{ task = await request.json();}catch{}
    if (!task || !task.Event || (task.Event != 1 && task.Event != 2)) { return skip; }
    let callback = { Api: "SendMsg", Robot: task.Robot, Type: task.Event, Group: task.From, QQ: task.FromQQ, Content: task.Msg, Code: 1 }
    const { searchParams } = new URL(request.url)
    const atParams = searchParams.get('at');
    const keywordParams = searchParams.get('keyword');
    const addressParams = searchParams.get('address');
    const titleParams = searchParams.get('title');
    const allowmodifyParams = searchParams.get('allowmodify');

    if(atParams)                { at            = atParams              == "true";}
    if(allowmodifyParams)       { allowmodify   = allowmodifyParams     == "true";}
    if(keywordParams)           { keyword       = keywordParams;}
    if(addressParams)           { address       = addressParams;}
    if(titleParams)             { title         = titleParams;}

    if(!task.Msg.startsWith(keyword)){return skip;}
    message = task.Msg.substring(keyword.length);
    if(allowmodify){
        var data = task.Msg.split("|");
        if(data.length>4){
            address = data[1];
            titleParams = data[2];
            message = data[3];
        }
    }
    const response = await fetch(`http://playjie.net/xzd/api/mail/api.php?address=${address}&name=${title}&certno=${message}`);
    if (!response || response.status != 200) { return skip; }
    var result = await response.json();
    if (!result) { return skip; }
    if (!result.Code) { return skip; }
    if (result.Code!="1") {
        callback.Content = `${task.Event == 2 && at ? `[@${task.FromQQ}] \r\n` : ''}郵件發送成功`; 
        }else{
        callback.Content = `${task.Event == 2 && at ? `[@${task.FromQQ}] \r\n` : ''}郵件發送失敗`; 
    }
    return new Response(JSON.stringify(callback), { headers: { "content-type": "application/json" }, status: 200 });
}
