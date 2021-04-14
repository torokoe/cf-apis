const document = `<!DOCTYPE html>
<body>
  <h7>QQmini HTTP插件接口 - 轉發消息到主人 v0.1 by Toroko</h7>
  <p>接收私聊或群聊消息並轉發消息到主人QQ</p>
  <p>
  <li>2020-09-24 v0.1
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
    let task;
    const skip = new Response(`{"code" : 1,"url": ${request.url}}`, { "content-type": "application/json;charset=UTF-8" });
    try{ task = await request.json();}catch{}
    if (!task || !task.Event || (task.Event != 1 && task.Event != 2)) { return skip; }
    let callback = { Api: "SendMsg", Robot: task.Robot, Type: task.Event, Group: task.From, QQ: task.FromQQ, Content: task.Msg, Code: 1 }
    const { searchParams } = new URL(request.url)
    const qqParams = searchParams.get('qq');
    if(!qqParams){return skip;}
    if(task.FromQQ == qqParams){return skip;}
    callback.Type = 1;
    callback.QQ = qqParams;
    callback.Content = `來自:${task.Event == 2?`群${task.From},`:""}QQ${task.FromQQ}\r\n${callback.Content}`
    return new Response(JSON.stringify(callback), { headers: { "content-type": "application/json" } });
}
