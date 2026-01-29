# 開発ワークフロー

1. 開発したい機能の要件整理 (docs/requirements.mdに記載)
2. Geminiに設計レビュー 依頼
  - gemini " prompts/gemini/design-review.mdに従ってdocs/requirements.mdを実装するための設計レビューをして.全体構成はdocs/architecture.mdを参考して,claudeに渡す実装指示書はprompts/gemini/GeminiToClaude.mdを編集して."
3. Claudeに実装 依頼
  - claude "prompts/claude/implement.mdを前提にGeminiToClaude.mdを実装して.実装が終了したら実装した内容をprompts/claude/ClaudeToGemini.mdに記載して."
4. Geminiにテスト項目 依頼
  - gemini "prompts/claude/ClaudeToGemini.mdをレビューして問題なかったら,claudeにテストコード作成指示をprompts/gemini/GeminiToClaude.mdに記載して."  
5. Claudeにテストコードを作成 依頼
  - claude "GeminiToClaude.mdに追加されたテスト項目をprompts/claude/test.mdに沿ってテストケースを作成して"
6. commit判断 (Serena)
  - claude "今回の変更分のみがステージングされているか確認して"
  - Serena "prompts/serena/commit-check.mdを前提に,git diffの内容を確認してcommit可否を判断して.結果をprompts/serena/project-status.mdに記載して."
7. commit / push (Human)
8. 変更内容記載
  - gemini "docs/change-log.mdに今回の変更内容と理由をclaudeとgeminiのどちらが処理したかわかるように記載して"
