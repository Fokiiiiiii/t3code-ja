import type { WebMessages } from "../messages";

export const JA_MESSAGES_SOURCE_CONTROL = {
  "sourceControl.versionControl": "バージョン管理",
  "sourceControl.providers": "ソース管理プロバイダー",
  "sourceControl.textGeneration": "テキスト生成",
  "sourceControl.writingStyle.title": "ソース管理の文章スタイル",
  "sourceControl.writingStyle.repoConventions": "リポジトリの慣例",
  "sourceControl.writingStyle.repoConventionsDescription":
    "各プロジェクトで、最近の変更説明と変更リクエストのタイトルに合わせます。",
  "sourceControl.writingStyle.conventionalCommits": "Conventional Commits 形式",
  "sourceControl.writingStyle.conventionalCommitsDescription":
    "変更説明には Conventional Commit の接頭辞を使い、変更リクエストのタイトルと説明は簡潔にします。",
  "sourceControl.writingStyle.custom": "カスタム指示",
  "sourceControl.writingStyle.customDescription":
    "すべてのプロジェクトで、変更説明と変更リクエストのタイトル・説明に指示を適用します。",
  "sourceControl.writingStyle.customPlaceholder":
    "タイトルは簡潔にし、説明には短い箇条書きを使います。",
  "sourceControl.followTemplates.title": "変更リクエストのテンプレートに従う",
  "sourceControl.followTemplates.description":
    "利用可能な場合は、現在のリポジトリのテンプレートを使って変更リクエストの説明を構成します。",
  "sourceControl.writerModel.title": "ソース管理の文章作成モデル",
  "sourceControl.writerModel.description":
    "変更説明、変更リクエストのタイトルと説明、branch や bookmark の名前に使うモデルを任意で上書きします。オフにすると、グローバルのテキスト生成モデルを使います。",
  "sourceControl.action.rescan": "サーバー環境を再スキャン",
  "sourceControl.action.rescanTooltip": "Git とホスティング連携を再スキャン",
  "sourceControl.action.toggleDetails": "{provider} の詳細を表示/非表示",
  "sourceControl.action.availability": "{provider} の利用可否",
  "sourceControl.action.accountVisibility": "ソース管理アカウントの表示/非表示",
  "sourceControl.action.revealAccount": "クリックしてアカウントを表示",
  "sourceControl.action.hideAccount": "クリックしてアカウントを非表示",
  "sourceControl.status.authenticated": "認証済み",
  "sourceControl.status.authenticatedAs": "認証済みアカウント",
  "sourceControl.changeRequest.pullRequest": "プルリクエスト",
  "sourceControl.changeRequest.mergeRequest": "マージリクエスト",
  "sourceControl.changeRequest.generic": "変更リクエスト",
  "sourceControl.status.notAuthenticated": "未認証",
  "sourceControl.status.unknown": "ステータス不明",
  "sourceControl.status.available": "利用可能",
  "sourceControl.status.comingSoon": "近日対応予定",
  "sourceControl.summary.comingSoon": "{provider} への対応は近日中に追加されます。",
  "sourceControl.summary.unavailable": "このサーバーでは利用できません：{hint}",
  "sourceControl.summary.availableHint": "利用可能です。{hint}",
  "sourceControl.summary.notAuthenticated":
    "このサーバーでは {provider} が認証されていません。変更リクエスト機能を有効にするには、サーバーホスト上で {command} ツールを使ってサインインするか、認証情報を設定してください。",
  "sourceControl.summary.verifyFailed": "{provider} を確認できませんでした。{hint}",
  "sourceControl.hint.azure":
    "Azure コマンドラインツール（`az`）をインストールし、`az extension add --name azure-devops` で Azure DevOps 対応を有効にしてください。",
  "sourceControl.hint.git":
    "Git は https://git-scm.com/downloads から、またはパッケージマネージャーでインストールしてください。",
  "sourceControl.hint.jujutsu":
    "Jujutsu は `brew install jj` または https://github.com/jj-vcs/jj からインストールしてください。",
  "sourceControl.hint.github":
    "GitHub コマンドラインツール（`gh`）を https://cli.github.com/ から、またはパッケージマネージャーでインストールしてください（例：`brew install gh`）。",
  "sourceControl.hint.gitlab":
    "GitLab コマンドラインツール（`glab`）を https://gitlab.com/gitlab-org/cli から、またはパッケージマネージャーでインストールしてください（例：`brew install glab`）。",
  "sourceControl.hint.bitbucket":
    "サーバー上で T3CODE_BITBUCKET_EMAIL と T3CODE_BITBUCKET_API_TOKEN を設定してください。pull request、リポジトリ、ユーザーの read スコープを持つ Bitbucket API token を使用してください。",
  "sourceControl.fetch.title": "Fetch 間隔",
  "sourceControl.fetch.policyTooltip":
    "この間隔が設定されるのは Git のみです。タイマーが発火したときに Git の更新を実行できるかどうかは、共有のバックグラウンド動作ポリシーによって決まります。カスタム間隔は General 設定では Advanced として表示されます。",
  "sourceControl.fetch.description":
    "バックグラウンドでリモート branch の状態を更新します。Git の認証情報やセキュリティキーの入力を明示的な Git 操作のときだけ求める場合は、0 秒に設定してください。",
  "sourceControl.fetch.seconds": "秒",
  "sourceControl.fetch.decrease": "Fetch 間隔を短くする",
  "sourceControl.fetch.inSeconds": "秒単位の自動 Git fetch 間隔",
  "sourceControl.fetch.increase": "Fetch 間隔を長くする",
  "sourceControl.empty.section": "サーバー環境",
  "sourceControl.empty.scanFailed": "サーバー環境をスキャンできませんでした",
  "sourceControl.empty.title": "まだ何も検出されていません",
  "sourceControl.empty.description":
    "サーバーに Git をインストールし、ワークスペースに必要な任意のホスティング連携や認証情報を追加してから、再スキャンしてください。",
  "sourceControl.empty.scan": "スキャン",
} as const satisfies Partial<WebMessages>;
