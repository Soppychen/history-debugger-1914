# 《历史现场调试器：1914》云端数据同步与天梯系统设计评审稿

日期：2026-05-21  
状态：设计文档，不改造现有实现。

---

## 1. 目标边界

这套设计解决的是：

- 跨设备恢复玩家身份与存档。
- 云端保存 RunRecord。
- 支持真实跨玩家天梯。
- 支持每周挑战统一 seed。
- 支持后台查看匿名玩法分析。
- 为未来后端重放验证、防作弊和内容调优留接口。

这套设计 **不改变核心玩法逻辑**：

- `gameLogic.ts` 仍是规则核心。
- JSON 数据仍是案件内容源。
- 前端仍可离线运行。
- 云端只负责“身份、存档、事件、成绩、榜单、挑战配置”。

---

## 2. 关键结论

第一版 Android APK 可以完全离线，不需要数据库。

但真实天梯必须联网，原因是：

- 客户端分数可以被篡改。
- 客户端 localStorage 只存在本机。
- 跨玩家排名需要统一服务器时间、统一 challenge seed、统一 run record。
- 防作弊至少需要后端重新计算或校验摘要。

推荐路线：

```txt
阶段 1：离线 App
localStorage / 本地 mock 榜单

阶段 2：云同步
Supabase / Postgres + API adapter

阶段 3：可信天梯
后端重算 DebugScore，后端验证 actionSequenceHash

阶段 4：后端重放
后端根据 seed + actionSequence 完整重放 GameState
```

---

## 3. 推荐架构

推荐使用：

```txt
Supabase
  Postgres
  Row Level Security
  Edge Functions
  Storage 可选

前端 / Android
  DataClient 接口
  LocalMockDataClient
  SupabaseDataClient
```

逻辑分层：

```txt
src/gameLogic.ts
  核心规则，不依赖网络

src/save/
src/analytics/
src/leaderboard/
  通过 client 接口读写

src/cloud/
  cloudDataClient.ts
  localMockDataClient.ts
  supabaseDataClient.ts
  syncQueue.ts
```

核心原则：

- UI 和玩法只调用抽象 client。
- 离线时写本地队列。
- 联网后同步。
- 后端不信任客户端最终分数。
- 真实天梯只使用后端确认后的记录。

---

## 4. 数据分类

### 4.1 必要数据

用于身份和恢复：

- `player_id`
- `recovery_code_hash`
- `device_session`
- consent 状态
- save metadata

### 4.2 游戏数据

- `game_state`
- `save_summary`
- ending archive
- run record
- action sequence

### 4.3 分析数据

- analytics events
- card usage
- intel opened
- risk triggered
- ending reached
- reload detected

### 4.4 榜单数据

- weekly challenge
- debug score
- grade
- ending type
- final war probability
- credibility
- irreversible count
- reload count
- verification status

---

## 5. 数据库表设计

### 5.1 `players`

```sql
create table players (
  id uuid primary key default gen_random_uuid(),
  recovery_code_hash text not null unique,
  display_code text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  status text not null default 'active',
  consent_version text not null,
  analytics_consent boolean not null default false
);
```

说明：

- 不保存邮箱、手机号、真实姓名。
- `display_code` 可选，不建议保存完整恢复码；如果保存，也应视为敏感字段。
- 恢复码是钥匙，泄露后可恢复存档。

### 5.2 `device_sessions`

```sql
create table device_sessions (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id),
  device_token_hash text not null unique,
  platform text not null,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  user_agent_hash text,
  revoked_at timestamptz
);
```

### 5.3 `save_games`

```sql
create table save_games (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id),
  case_id text not null,
  slot_type text not null,
  slot_name text not null,
  turn integer not null,
  date_label text,
  crisis_stage text,
  war_probability integer,
  game_state jsonb not null,
  summary jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique(player_id, case_id, slot_type, slot_name)
);
```

存档策略：

- autosave 使用固定 slot name 滚动覆盖。
- manual slots 使用 `manual_slot_1` 到 `manual_slot_5`。
- ending archive 使用唯一 slot name，不覆盖。

### 5.4 `analytics_events`

```sql
create table analytics_events (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id),
  anonymous_session_id text not null,
  case_id text not null,
  event_type text not null,
  turn integer,
  payload jsonb not null default '{}',
  client_version text not null,
  schema_version text not null,
  created_at timestamptz not null default now()
);
```

说明：

- 可选分析事件受 consent 控制。
- 必要事件用于存档和安全。
- 不记录真实身份信息。

### 5.5 `run_records`

```sql
create table run_records (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id),
  case_id text not null,
  mode text not null,
  seed text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  ending_type text,
  debug_score integer,
  grade text,
  final_war_probability integer,
  historical_credibility integer,
  irreversible_event_count integer,
  backlash_count integer,
  low_credibility_card_count integer,
  used_card_count integer,
  read_intel_count integer,
  reload_count integer,
  action_sequence_hash text,
  action_sequence jsonb,
  report_id uuid,
  verification_status text not null default 'unverified'
);
```

### 5.6 `leaderboard_entries`

```sql
create table leaderboard_entries (
  id uuid primary key default gen_random_uuid(),
  leaderboard_id text not null,
  leaderboard_type text not null,
  player_id uuid not null references players(id),
  run_id uuid not null references run_records(id),
  display_name text not null,
  mode text not null,
  seed text not null,
  ending_type text not null,
  debug_score integer not null,
  grade text,
  final_war_probability integer not null,
  historical_credibility integer not null,
  irreversible_event_count integer not null,
  used_card_count integer not null,
  reload_count integer not null,
  completion_time_seconds integer,
  report_id uuid,
  status text not null default 'unverified',
  created_at timestamptz not null default now()
);
```

### 5.7 `weekly_archive_challenges`

```sql
create table weekly_archive_challenges (
  id text primary key,
  case_id text not null,
  seed text not null,
  title jsonb not null,
  description jsonb,
  variable_overrides jsonb,
  visibility_overrides jsonb,
  card_pool_overrides jsonb,
  special_rules jsonb,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_at timestamptz not null default now()
);
```

### 5.8 `ending_reports`

```sql
create table ending_reports (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id),
  run_id uuid references run_records(id),
  case_id text not null,
  ending_type text not null,
  report jsonb not null,
  share_line text,
  created_at timestamptz not null default now()
);
```

---

## 6. 同步策略

### 6.1 离线优先

客户端保留本地写入能力：

```txt
save_created
analytics_event
run_started
run_completed
leaderboard_submission
```

联网后按队列上传。

### 6.2 Sync Queue

```ts
interface SyncQueueItem {
  id: string;
  type:
    | "save_upsert"
    | "analytics_event"
    | "run_record"
    | "leaderboard_submission"
    | "ending_report";
  payload: unknown;
  createdAt: string;
  attempts: number;
  lastError?: string;
}
```

### 6.3 冲突处理

存档冲突规则：

- autosave：后写覆盖，但保留 `updated_at`。
- manual slot：如果远端更新时间更晚，提示玩家选择本地/远端。
- ending archive：永不覆盖，只追加。
- run record：不可变，完成后只允许补验证状态。

### 6.4 数据一致性

客户端可以离线生成：

- 本地 save id
- 本地 run id
- 本地 event id

同步后服务端可以接受客户端 id，也可以返回 server id。建议第一版使用 UUID，客户端和服务端同构，减少映射复杂度。

---

## 7. API 设计

### 7.1 身份

```txt
POST /players/anonymous
POST /auth/device
POST /auth/recovery-code
POST /auth/revoke-device
```

### 7.2 存档

```txt
GET  /saves?caseId=case_1914
POST /saves
GET  /saves/:id
DELETE /saves/:id
```

### 7.3 分析事件

```txt
POST /analytics/events
POST /analytics/events/batch
```

### 7.4 Run 与榜单

```txt
POST /runs/start
POST /runs/:id/complete
POST /leaderboards/submit
GET  /leaderboards/:type
GET  /leaderboards/personal
```

### 7.5 挑战配置

```txt
GET /challenges/current
GET /challenges/:id
```

---

## 8. 天梯验证策略

### 8.1 第一版：未验证天梯

后端接收：

- run summary
- actionSequenceHash
- debug score input

后端重新计算 DebugScore，但不完整重放。

状态：

```txt
unverified
```

适合早期试玩。

### 8.2 第二版：摘要验证

后端检查：

- seed 是否匹配挑战。
- mode 是否允许。
- reload count 是否超限。
- ending 是否符合榜单规则。
- DebugScore 是否由后端公式重算一致。

状态：

```txt
verified_summary
```

### 8.3 第三版：完整重放

后端根据：

```txt
case JSON
seed
actionSequence
```

完整重放：

- 每次用卡是否合法。
- AP 是否足够。
- requirements 是否满足。
- risks 是否触发。
- ending 是否一致。
- DebugScore 是否一致。

状态：

```txt
verified
```

---

## 9. 权限与安全

### 9.1 Row Level Security

建议：

- 玩家只能读写自己的 `save_games`、`run_records`、`ending_reports`。
- 玩家只能插入自己的 analytics events。
- leaderboard entries 可公开读。
- weekly challenges 可公开读。
- admin analytics 只能服务端角色读。

### 9.2 恢复码安全

- 服务端只保存 hash。
- 恢复码只在创建时明文返回。
- 恢复码相当于钥匙，应在 UI 明确提示。
- 后续可加 PIN。

### 9.3 管理员后台

Android 第一版隐藏管理员后台。

真实后台建议独立 Web Admin，不内置在玩家 App 中。

---

## 10. 对现有代码的最小改造方案

新增接口层：

```txt
src/cloud/
  dataClient.ts
  localDataClient.ts
  supabaseDataClient.ts
  syncQueue.ts
```

接口示例：

```ts
interface DataClient {
  initializePlayer(): Promise<PlayerSession>;
  recoverPlayer(code: string): Promise<PlayerSession>;
  listSaves(caseId: string): Promise<SaveGame[]>;
  saveGame(save: SaveGame): Promise<SaveGame>;
  recordEvent(event: AnalyticsEvent): Promise<void>;
  startRun(input: StartRunInput): Promise<RunRecord>;
  completeRun(input: CompleteRunInput): Promise<RunRecord>;
  listLeaderboard(type: LeaderboardType): Promise<LeaderboardEntry[]>;
}
```

改造原则：

- 先把当前 localStorage client 包成 `LocalDataClient`。
- UI 不直接碰 Supabase。
- 不动 `gameLogic.ts`。
- 不动 JSON 案件格式。
- Android 和 Web 共用同一套 client 接口。

---

## 11. 隐私与合规

第一版云同步需要更新隐私说明：

必须说明：

- 收集匿名玩家编码。
- 收集存档和玩法事件。
- 收集天梯提交记录。
- 不收集邮箱、手机号、真实姓名。
- 玩家可选择关闭可选分析。
- 天梯提交是公开成绩。

建议：

- 默认只同步必要数据。
- 可选 analytics 单独开关。
- 天梯提交前弹确认。

---

## 12. 实施里程碑

### D1：文档评审

- 确认是否使用 Supabase。
- 确认是否需要真实天梯。
- 确认隐私文案。

### D2：本地 client 抽象

- 不接后端。
- 只把当前 localStorage 逻辑封装成统一接口。

### D3：Supabase schema

- 建表。
- RLS。
- Edge Functions。

### D4：云存档

- 匿名玩家。
- 恢复码。
- save sync。

### D5：云天梯

- run records。
- leaderboard entries。
- weekly challenges。

### D6：验证升级

- 后端重算 DebugScore。
- 后端重放 action sequence。

---

## 13. 需要评审的问题

1. 是否采用 Supabase / Postgres 作为第一版云端？
2. 第一版是否只做云存档，不做真实天梯？
3. 如果做真实天梯，是否接受第一版 `unverified` 标记？
4. 玩家是否需要自定义 display name，还是继续匿名代号？
5. 是否允许 Android 离线完成挑战后联网补交成绩？
6. 是否需要管理员后台独立部署？
7. 是否需要玩家删除云端数据的功能？
