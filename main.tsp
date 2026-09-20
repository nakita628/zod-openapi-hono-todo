import "@typespec/http";
import "@typespec/openapi";

using Http;
using OpenAPI;

@service(#{ title: "Todo API" })
@info(#{ version: "1.0.0" })
namespace TodoApi;

alias dateTimeTransform = "z.date().transform((date) => date.toISOString())";

/** Todo ID（サーバーが発行する cuid2、英数字 24 文字）。パスパラメータの取り違えを防ぐため brand する。 */
@format("cuid2")
@extension("x-error-message", "Todo ID の形式が不正です")
@extension("x-brand", "TodoId")
scalar todoId extends string;

/** Todo（ワイヤ表現）。 */
@example(#{
  id: "kx9a2b3c4d5e6f7g8h9i0j1k",
  title: "牛乳を買う",
  completed: false,
  createdAt: utcDateTime.fromISO("2026-07-18T00:00:00.000Z"),
  updatedAt: utcDateTime.fromISO("2026-07-18T00:00:00.000Z"),
})
model Todo {
  /** Todo ID */
  id: todoId;

  /** タイトル（やること） */
  title: string;

  /** 完了フラグ */
  completed: boolean;

  /** 作成日時（ISO 8601） */
  @extension("x-transform", dateTimeTransform)
  createdAt: utcDateTime;

  /** 最終更新日時（ISO 8601） */
  @extension("x-transform", dateTimeTransform)
  updatedAt: utcDateTime;
}

/** Todo 一覧（新しい順） */
model TodoList is Array<Todo>;

/** Todo 作成リクエスト */
@example(#{ title: "牛乳を買う" })
model CreateTodoRequest {
  /** タイトル（やること） */
  @minLength(1)
  @maxLength(200)
  @extension("x-error-message", "タイトルは文字列で指定してください")
  @extension("x-minLength-message", "タイトルは必須です")
  @extension("x-maxLength-message", "タイトルは 200 文字以内で入力してください")
  @extension("x-trim", true)
  title: string;
}

/** Todo 部分更新リクエスト（タイトル・完了フラグのいずれか、または両方） */
@example(#{ title: "オーツミルクを買う", completed: true })
model UpdateTodoRequest {
  /** タイトル（やること） */
  @minLength(1)
  @maxLength(200)
  @extension("x-error-message", "タイトルは文字列で指定してください")
  @extension("x-minLength-message", "タイトルは必須です")
  @extension("x-maxLength-message", "タイトルは 200 文字以内で入力してください")
  @extension("x-trim", true)
  title?: string;

  /** 完了フラグ */
  completed?: boolean;
}

/** 検証に失敗したフィールド 1 件。 */
@example(#{ field: "title", message: "タイトルは必須です" })
model FieldError {
  /** エラーが発生したフィールドのドット区切りパス */
  field: string;

  /** エラーメッセージ */
  message: string;
}

/**
 * リクエストの検証に失敗したときの RFC 9457 Problem Details。
 * `errors` は拡張メンバー — RFC 9457 §3.2 が problem type 独自のメンバー追加を認めている。
 */
@example(#{
  type: "/problems/validation-failed",
  title: "検証に失敗しました",
  status: 422,
  detail: "リクエストの検証に失敗しました。問題のあったフィールドは `errors` を参照してください。",
  instance: "/api/todos",
  errors: #[#{ field: "title", message: "タイトルは必須です" }],
})
model ValidationProblem {
  /** problem type 識別子（相対 URI 参照。API のベース URI から解決される） */
  type: "/problems/validation-failed";

  /** problem type の短い人間可読なまとめ */
  title: "検証に失敗しました";

  /** HTTP ステータスコード。RFC 9457 に従いボディにも再掲する */
  status: 422;

  /** この発生事象に固有の人間可読な説明 */
  detail: string;

  /** この発生事象を識別する URI 参照（リクエストパス） */
  instance: string;

  /** 拡張メンバー: 検証に失敗したフィールドごとに 1 件 */
  errors: FieldError[];
}

/** 422 Unprocessable Content（`application/problem+json`）。OpenAPIHono の defaultHook が返す */
@error
model ValidationProblemResponse {
  @statusCode statusCode: 422;
  @header contentType: "application/problem+json";
  @body body: ValidationProblem;
}

/** 対象が存在しないときの RFC 9457 Problem Details。 */
@example(#{
  type: "/problems/not-found",
  title: "見つかりません",
  status: 404,
  detail: "Todo が見つかりません",
  instance: "/api/todos/kx9a2b3c4d5e6f7g8h9i0j1k",
})
model NotFoundProblem {
  /** problem type 識別子（相対 URI 参照。API のベース URI から解決される） */
  type: "/problems/not-found";

  /** problem type の短い人間可読なまとめ */
  title: "見つかりません";

  /** HTTP ステータスコード。RFC 9457 に従いボディにも再掲する */
  status: 404;

  /** この発生事象に固有の人間可読な説明 */
  detail: string;

  /** この発生事象を識別する URI 参照（リクエストパス） */
  instance: string;
}

/** 404 Not Found（`application/problem+json`） */
@error
model NotFoundProblemResponse {
  @statusCode statusCode: 404;
  @header contentType: "application/problem+json";
  @body body: NotFoundProblem;
}

/** 契約違反やその他の想定外のサーバー障害を表す RFC 9457 Problem Details。 */
@example(#{
  type: "/problems/internal-server-error",
  title: "サーバー内部エラー",
  status: 500,
  detail: "予期しないエラーが発生しました。",
  instance: "/api/todos",
})
model InternalServerProblem {
  /** problem type 識別子（相対 URI 参照。API のベース URI から解決される） */
  type: "/problems/internal-server-error";

  /** problem type の短い人間可読なまとめ */
  title: "サーバー内部エラー";

  /** HTTP ステータスコード。RFC 9457 に従いボディにも再掲する */
  status: 500;

  /** この発生事象に固有の人間可読な説明 */
  detail: string;

  /** この発生事象を識別する URI 参照（リクエストパス） */
  instance: string;
}

/** 500 Internal Server Error（`application/problem+json`） */
@error
model InternalServerProblemResponse {
  @statusCode statusCode: 500;
  @header contentType: "application/problem+json";
  @body body: InternalServerProblem;
}

/** DB へ到達できないなど、一時的な下流障害を表す RFC 9457 Problem Details。 */
@example(#{
  type: "/problems/service-unavailable",
  title: "サービス利用不可",
  status: 503,
  detail: "サービスが一時的に利用できません。時間をおいて再試行してください。",
  instance: "/api/todos",
})
model ServiceUnavailableProblem {
  /** problem type 識別子（相対 URI 参照。API のベース URI から解決される） */
  type: "/problems/service-unavailable";

  /** problem type の短い人間可読なまとめ */
  title: "サービス利用不可";

  /** HTTP ステータスコード。RFC 9457 に従いボディにも再掲する */
  status: 503;

  /** この発生事象に固有の人間可読な説明 */
  detail: string;

  /** この発生事象を識別する URI 参照（リクエストパス） */
  instance: string;
}

/** 503 Service Unavailable（`application/problem+json`） */
@error
model ServiceUnavailableProblemResponse {
  @statusCode statusCode: 503;
  @header contentType: "application/problem+json";
  @body body: ServiceUnavailableProblem;
}

@route("/todos")
@tag("todos")
namespace Todos {
  /** Todo を一覧する（新しい順）。 */
  @get
  @operationId("readTodos")
  op list():
    | TodoList
    | InternalServerProblemResponse
    | ServiceUnavailableProblemResponse;

  /** Todo を 1 件取得する。存在しなければ 404。 */
  @get
  @route("/{todoId}")
  @operationId("readTodo")
  op read(@path todoId: todoId):
    | Todo
    | NotFoundProblemResponse
    | ValidationProblemResponse
    | InternalServerProblemResponse
    | ServiceUnavailableProblemResponse;

  /** Todo を作成する。 */
  @post
  @operationId("createTodo")
  op create(@body body: CreateTodoRequest):
    | {
        @statusCode statusCode: 201;
        @body body: Todo;
      }
    | ValidationProblemResponse
    | InternalServerProblemResponse
    | ServiceUnavailableProblemResponse;

  /** Todo を部分更新する（タイトル / 完了フラグ）。存在しなければ 404。 */
  @patch
  @route("/{todoId}")
  @operationId("updateTodo")
  op update(@path todoId: todoId, @body body: UpdateTodoRequest):
    | Todo
    | NotFoundProblemResponse
    | ValidationProblemResponse
    | InternalServerProblemResponse
    | ServiceUnavailableProblemResponse;

  /** Todo を削除する。存在しなければ 404。 */
  @delete
  @route("/{todoId}")
  @operationId("deleteTodo")
  op remove(@path todoId: todoId):
    | {
        @statusCode statusCode: 204;
      }
    | NotFoundProblemResponse
    | ValidationProblemResponse
    | InternalServerProblemResponse
    | ServiceUnavailableProblemResponse;
}
