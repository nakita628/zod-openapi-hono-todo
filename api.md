<h1 id="todo-api">Todo API v1.0.0</h1>

> Scroll down for code samples, example requests and responses. Select a language for code samples from the tabs above or the mobile navigation menu.

<h1 id="todo-api-todos">todos</h1>

## readTodos

<a id="opIdreadTodos"></a>

> Code samples

```bash
curl http://localhost:8787/api/todos \
  -H 'Accept: application/json'
```

`GET /todos`

Todo を一覧する（新しい順）。

> Example responses

> 200 Response

```json
[
  {
    "id": "kx9a2b3c4d5e6f7g8h9i0j1k",
    "title": "牛乳を買う",
    "completed": false,
    "createdAt": "2026-07-18T00:00:00.000Z",
    "updatedAt": "2026-07-18T00:00:00.000Z"
  }
]
```

<h3 id="readtodos-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|OK|The request has succeeded.|[TodoList](#schematodolist)|
|500|Internal Server Error|500 Internal Server Error（`application/problem+json`）|None|
|503|Service Unavailable|503 Service Unavailable（`application/problem+json`）|None|

<aside class="success">
This operation does not require authentication
</aside>

## createTodo

<a id="opIdcreateTodo"></a>

> Code samples

```bash
curl http://localhost:8787/api/todos \
  -X POST \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
    "title": "牛乳を買う"
  }'
```

`POST /todos`

Todo を作成する。

> Body parameter

```json
{
  "title": "牛乳を買う"
}
```

<h3 id="createtodo-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[CreateTodoRequest](#schemacreatetodorequest)|true|none|
|» title|body|string|true|タイトル（やること）|

> Example responses

> 201 Response

```json
{
  "id": "kx9a2b3c4d5e6f7g8h9i0j1k",
  "title": "牛乳を買う",
  "completed": false,
  "createdAt": "2026-07-18T00:00:00.000Z",
  "updatedAt": "2026-07-18T00:00:00.000Z"
}
```

<h3 id="createtodo-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|Created|The request has succeeded and a new resource has been created as a result.|[Todo](#schematodo)|
|422|Unprocessable Entity|422 Unprocessable Content（`application/problem+json`）。OpenAPIHono の defaultHook が返す|None|
|500|Internal Server Error|500 Internal Server Error（`application/problem+json`）|None|
|503|Service Unavailable|503 Service Unavailable（`application/problem+json`）|None|

<aside class="success">
This operation does not require authentication
</aside>

## readTodo

<a id="opIdreadTodo"></a>

> Code samples

```bash
curl 'http://localhost:8787/api/todos/{todoId}' \
  -H 'Accept: application/json'
```

`GET /todos/{todoId}`

Todo を 1 件取得する。存在しなければ 404。

<h3 id="readtodo-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|todoId|path|[todoId](#schematodoid)|true|none|

> Example responses

> 200 Response

```json
{
  "id": "kx9a2b3c4d5e6f7g8h9i0j1k",
  "title": "牛乳を買う",
  "completed": false,
  "createdAt": "2026-07-18T00:00:00.000Z",
  "updatedAt": "2026-07-18T00:00:00.000Z"
}
```

<h3 id="readtodo-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|OK|The request has succeeded.|[Todo](#schematodo)|
|404|Not Found|404 Not Found（`application/problem+json`）|None|
|422|Unprocessable Entity|422 Unprocessable Content（`application/problem+json`）。OpenAPIHono の defaultHook が返す|None|
|500|Internal Server Error|500 Internal Server Error（`application/problem+json`）|None|
|503|Service Unavailable|503 Service Unavailable（`application/problem+json`）|None|

<aside class="success">
This operation does not require authentication
</aside>

## deleteTodo

<a id="opIddeleteTodo"></a>

> Code samples

```bash
curl 'http://localhost:8787/api/todos/{todoId}' \
  -X DELETE
```

`DELETE /todos/{todoId}`

Todo を削除する。存在しなければ 404。

<h3 id="deletetodo-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|todoId|path|[todoId](#schematodoid)|true|none|

<h3 id="deletetodo-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|204|No Content|There is no content to send for this request, but the headers may be useful. |None|
|404|Not Found|404 Not Found（`application/problem+json`）|None|
|422|Unprocessable Entity|422 Unprocessable Content（`application/problem+json`）。OpenAPIHono の defaultHook が返す|None|
|500|Internal Server Error|500 Internal Server Error（`application/problem+json`）|None|
|503|Service Unavailable|503 Service Unavailable（`application/problem+json`）|None|

<aside class="success">
This operation does not require authentication
</aside>

## updateTodo

<a id="opIdupdateTodo"></a>

> Code samples

```bash
curl 'http://localhost:8787/api/todos/{todoId}' \
  -X PATCH \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
    "title": "オーツミルクを買う",
    "completed": true
  }'
```

`PATCH /todos/{todoId}`

Todo を部分更新する（タイトル / 完了フラグ）。存在しなければ 404。

> Body parameter

```json
{
  "title": "オーツミルクを買う",
  "completed": true
}
```

<h3 id="updatetodo-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|todoId|path|[todoId](#schematodoid)|true|none|
|body|body|[UpdateTodoRequest](#schemaupdatetodorequest)|true|none|
|» title|body|string|false|タイトル（やること）|
|» completed|body|boolean|false|完了フラグ|

> Example responses

> 200 Response

```json
{
  "id": "kx9a2b3c4d5e6f7g8h9i0j1k",
  "title": "牛乳を買う",
  "completed": false,
  "createdAt": "2026-07-18T00:00:00.000Z",
  "updatedAt": "2026-07-18T00:00:00.000Z"
}
```

<h3 id="updatetodo-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|OK|The request has succeeded.|[Todo](#schematodo)|
|404|Not Found|404 Not Found（`application/problem+json`）|None|
|422|Unprocessable Entity|422 Unprocessable Content（`application/problem+json`）。OpenAPIHono の defaultHook が返す|None|
|500|Internal Server Error|500 Internal Server Error（`application/problem+json`）|None|
|503|Service Unavailable|503 Service Unavailable（`application/problem+json`）|None|

<aside class="success">
This operation does not require authentication
</aside>

# Schemas

<h2 id="tocS_todoId">todoId</h2>
<!-- backwards compatibility -->
<a id="schematodoid"></a>
<a id="schema_todoId"></a>
<a id="tocStodoid"></a>
<a id="tocstodoid"></a>

```json
"string"
```

<h2 id="tocS_Todo">Todo</h2>
<!-- backwards compatibility -->
<a id="schematodo"></a>
<a id="schema_Todo"></a>
<a id="tocStodo"></a>
<a id="tocstodo"></a>

```json
{
  "id": "kx9a2b3c4d5e6f7g8h9i0j1k",
  "title": "牛乳を買う",
  "completed": false,
  "createdAt": "2026-07-18T00:00:00.000Z",
  "updatedAt": "2026-07-18T00:00:00.000Z"
}
```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|id|object|true|none|Todo ID|
|title|string|true|none|タイトル（やること）|
|completed|boolean|true|none|完了フラグ|
|createdAt|string(date-time)|true|none|作成日時（ISO 8601）|
|updatedAt|string(date-time)|true|none|最終更新日時（ISO 8601）|

<h2 id="tocS_TodoList">TodoList</h2>
<!-- backwards compatibility -->
<a id="schematodolist"></a>
<a id="schema_TodoList"></a>
<a id="tocStodolist"></a>
<a id="tocstodolist"></a>

```json
[
  {
    "id": "kx9a2b3c4d5e6f7g8h9i0j1k",
    "title": "牛乳を買う",
    "completed": false,
    "createdAt": "2026-07-18T00:00:00.000Z",
    "updatedAt": "2026-07-18T00:00:00.000Z"
  }
]
```

<h2 id="tocS_InternalServerProblem">InternalServerProblem</h2>
<!-- backwards compatibility -->
<a id="schemainternalserverproblem"></a>
<a id="schema_InternalServerProblem"></a>
<a id="tocSinternalserverproblem"></a>
<a id="tocsinternalserverproblem"></a>

```json
{
  "type": "/problems/internal-server-error",
  "title": "サーバー内部エラー",
  "status": 500,
  "detail": "予期しないエラーが発生しました。",
  "instance": "/api/todos"
}
```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|type|string|true|none|problem type 識別子（相対 URI 参照。API のベース URI から解決される）|
|title|string|true|none|problem type の短い人間可読なまとめ|
|status|number|true|none|HTTP ステータスコード。RFC 9457 に従いボディにも再掲する|
|detail|string|true|none|この発生事象に固有の人間可読な説明|
|instance|string|true|none|この発生事象を識別する URI 参照（リクエストパス）|

#### Enumerated Values

|Property|Value|
|---|---|
|type|/problems/internal-server-error|
|title|サーバー内部エラー|
|status|500|

<h2 id="tocS_ServiceUnavailableProblem">ServiceUnavailableProblem</h2>
<!-- backwards compatibility -->
<a id="schemaserviceunavailableproblem"></a>
<a id="schema_ServiceUnavailableProblem"></a>
<a id="tocSserviceunavailableproblem"></a>
<a id="tocsserviceunavailableproblem"></a>

```json
{
  "type": "/problems/service-unavailable",
  "title": "サービス利用不可",
  "status": 503,
  "detail": "サービスが一時的に利用できません。時間をおいて再試行してください。",
  "instance": "/api/todos"
}
```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|type|string|true|none|problem type 識別子（相対 URI 参照。API のベース URI から解決される）|
|title|string|true|none|problem type の短い人間可読なまとめ|
|status|number|true|none|HTTP ステータスコード。RFC 9457 に従いボディにも再掲する|
|detail|string|true|none|この発生事象に固有の人間可読な説明|
|instance|string|true|none|この発生事象を識別する URI 参照（リクエストパス）|

#### Enumerated Values

|Property|Value|
|---|---|
|type|/problems/service-unavailable|
|title|サービス利用不可|
|status|503|

<h2 id="tocS_NotFoundProblem">NotFoundProblem</h2>
<!-- backwards compatibility -->
<a id="schemanotfoundproblem"></a>
<a id="schema_NotFoundProblem"></a>
<a id="tocSnotfoundproblem"></a>
<a id="tocsnotfoundproblem"></a>

```json
{
  "type": "/problems/not-found",
  "title": "見つかりません",
  "status": 404,
  "detail": "Todo が見つかりません",
  "instance": "/api/todos/kx9a2b3c4d5e6f7g8h9i0j1k"
}
```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|type|string|true|none|problem type 識別子（相対 URI 参照。API のベース URI から解決される）|
|title|string|true|none|problem type の短い人間可読なまとめ|
|status|number|true|none|HTTP ステータスコード。RFC 9457 に従いボディにも再掲する|
|detail|string|true|none|この発生事象に固有の人間可読な説明|
|instance|string|true|none|この発生事象を識別する URI 参照（リクエストパス）|

#### Enumerated Values

|Property|Value|
|---|---|
|type|/problems/not-found|
|title|見つかりません|
|status|404|

<h2 id="tocS_FieldError">FieldError</h2>
<!-- backwards compatibility -->
<a id="schemafielderror"></a>
<a id="schema_FieldError"></a>
<a id="tocSfielderror"></a>
<a id="tocsfielderror"></a>

```json
{
  "field": "title",
  "message": "タイトルは必須です"
}
```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|field|string|true|none|エラーが発生したフィールドのドット区切りパス|
|message|string|true|none|エラーメッセージ|

<h2 id="tocS_ValidationProblem">ValidationProblem</h2>
<!-- backwards compatibility -->
<a id="schemavalidationproblem"></a>
<a id="schema_ValidationProblem"></a>
<a id="tocSvalidationproblem"></a>
<a id="tocsvalidationproblem"></a>

```json
{
  "type": "/problems/validation-failed",
  "title": "検証に失敗しました",
  "status": 422,
  "detail": "リクエストの検証に失敗しました。問題のあったフィールドは `errors` を参照してください。",
  "instance": "/api/todos",
  "errors": [
    {
      "field": "title",
      "message": "タイトルは必須です"
    }
  ]
}
```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|type|string|true|none|problem type 識別子（相対 URI 参照。API のベース URI から解決される）|
|title|string|true|none|problem type の短い人間可読なまとめ|
|status|number|true|none|HTTP ステータスコード。RFC 9457 に従いボディにも再掲する|
|detail|string|true|none|この発生事象に固有の人間可読な説明|
|instance|string|true|none|この発生事象を識別する URI 参照（リクエストパス）|
|errors|[[FieldError](#schemafielderror)]|true|none|拡張メンバー: 検証に失敗したフィールドごとに 1 件|

#### Enumerated Values

|Property|Value|
|---|---|
|type|/problems/validation-failed|
|title|検証に失敗しました|
|status|422|

<h2 id="tocS_CreateTodoRequest">CreateTodoRequest</h2>
<!-- backwards compatibility -->
<a id="schemacreatetodorequest"></a>
<a id="schema_CreateTodoRequest"></a>
<a id="tocScreatetodorequest"></a>
<a id="tocscreatetodorequest"></a>

```json
{
  "title": "牛乳を買う"
}
```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|title|string|true|none|タイトル（やること）|

<h2 id="tocS_UpdateTodoRequest">UpdateTodoRequest</h2>
<!-- backwards compatibility -->
<a id="schemaupdatetodorequest"></a>
<a id="schema_UpdateTodoRequest"></a>
<a id="tocSupdatetodorequest"></a>
<a id="tocsupdatetodorequest"></a>

```json
{
  "title": "オーツミルクを買う",
  "completed": true
}
```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|title|string|false|none|タイトル（やること）|
|completed|boolean|false|none|完了フラグ|
