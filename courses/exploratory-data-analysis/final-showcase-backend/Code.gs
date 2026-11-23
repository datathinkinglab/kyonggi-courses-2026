/**
 * 경기대학교 자료탐색방법론 2026-2 · 기말 프로젝트 발표관 백엔드
 * Google 스프레드시트에 연결된 Apps Script (확장 프로그램 > Apps Script 에 붙여넣기)
 *
 * 1) 이 파일 전체를 붙여넣고 저장 → setup 함수 1회 실행(권한 승인)
 * 2) '명단' 시트의 학번 열 채우기
 * 3) 배포 > 새 배포 > 웹 앱 (실행: 나 / 액세스: 모든 사용자) → URL을 final-showcase.html 의 API_URL 에 입력
 */

const CFG = {
  COURSE: '자료탐색방법론',
  TZ: 'Asia/Seoul',
  DRIVE_FOLDER: '자료탐색방법론_기말발표_업로드',
  MAX_FILE_MB: 25,
  ALLOWED_EXT: ['pdf', 'pptx', 'ppt', 'key', 'ipynb', 'html', 'md', 'txt', 'csv', 'xlsx', 'docx', 'hwp', 'hwpx', 'zip', 'png', 'jpg', 'jpeg'],
  // 자료 구분. 앞의 4개는 필수 제출물로 조별 제출 현황에 표시됩니다.
  MATERIAL_TYPES: ['발표자료', '노트북', '검증 로그', 'AI 대화 로그', '참고자료'],
  REQUIRED_TYPES: ['발표자료', '노트북', '검증 로그', 'AI 대화 로그'],
  // 다른 조 발표 평가 항목 (기말과제 평가 기준표 기반, 항목당 1~5점)
  TEAM_SCALE: { min: 1, max: 5 },
  TEAM_CRITERIA: [
    { label: '질문 설계', desc: '탐색 가치가 있고 자료로 답할 수 있는 질문인가' },
    { label: '방법의 적절성', desc: '요약·시각화·재표현이 자료와 질문에 맞는가' },
    { label: '검증의 엄밀성', desc: '독립적인 방법으로 주요 결과를 확인하고 근거를 남겼는가' },
    { label: '해석과 결론', desc: '자료가 뒷받침하는 범위 안에서 답했는가' },
    { label: '재현성과 소통', desc: '다른 사람이 재실행하고 판단 근거를 이해할 수 있게 전달했는가' }
  ],
  // 팀원 간 동료평가 항목 (항목당 0·1·2점, 합계 6점 × 5 = 30점)
  PEER_CRITERIA: ['역할 수행', '분석·검증 기여', '협업·피드백'],
  SHEETS: {
    ROSTER: '명단', SETTINGS: '설정', TEAMINFO: '조정보', MATERIALS: '자료',
    TEAMEVAL: '발표평가', PEEREVAL: '동료평가', TEAMSUM: '발표평가_집계', PEERSUM: '동료평가_집계',
    GRADELOG: '성적열람기록'
  },
  // 성적 시트. 시트의 머리글(1행)을 읽어 화면을 구성합니다. (머리글 규칙은 설치 안내서 참고)
  EXAMS: [
    { key: 'mid', sheet: '중간고사', label: '중간고사', weight: '개인 과제 · 40%', setting: '중간성적공개' },
    { key: 'fin', sheet: '기말고사', label: '기말고사', weight: '팀 프로젝트 · 60%', setting: '기말성적공개' }
  ],
  LOGIN_HOURS: 12
};

const ROSTER_SEED = [
  [1, '김도빈'], [1, '최세현'], [1, '임혜진'], [1, '이예진'],
  [2, '김서이'], [2, '배진우'], [2, '조은수'], [2, '허가은'],
  [3, '이승민'], [3, '강선재'], [3, '신승우'], [3, '김민영'],
  [4, '송서윤'], [4, '오원석'], [4, '이미령'], [4, '이현지'],
  [5, '추민재'], [5, '김성욱'], [5, '김재윤'], [5, '장보경'],
  [6, '서세연'], [6, '조준성'], [6, '김건'], [6, '고건녕'],
  [7, '조혜선'], [7, '오현규'], [7, '임서연'], [7, '문지찬'],
  [8, '유연수'], [8, '이동규'], [8, '이하늘'], [8, '정형기'],
  [9, '황동하'], [9, '이예준'], [9, '김혜진'], [9, '추형준'],
  [10, '김도완'], [10, '이신영'], [10, '이정민'],
  [11, '이정현'], [11, '최은설'], [11, '박준경']
];

const HEADERS = {
  '명단': ['조', '이름', '학번'],
  '설정': ['항목', '값', '설명'],
  '조정보': ['조', '프로젝트 제목', '한 줄 요약', '데이터 출처', 'GitHub 주소', '수정시각', '수정자'],
  '자료': ['ID', '등록시각', '조', '구분', '형태', '제목', '설명', 'URL', '파일ID', '파일명', '등록자', '삭제'],
  '발표평가': ['제출시각', '평가자 학번', '평가자', '평가자 조', '대상 조']
    .concat(CFG.TEAM_CRITERIA.map(function (c) { return c.label; }))
    .concat(['총점', '좋았던 점', '질문·개선 제안']),
  '동료평가': ['제출시각', '평가자 학번', '평가자', '조', '대상 팀원']
    .concat(CFG.PEER_CRITERIA)
    .concat(['합계(6)', '환산(30)', '판단 근거', '확인 어려움']),
  // 중간고사: 채점 엑셀(자료탐색방법론_중간고사_채점결과.xlsx) [채점결과] 시트와 같은 열 순서 → 5행부터 그대로 붙여넣기
  '중간고사': ['No', '학번', '이름', '제출구분', '메일 수신시각(KST)', '채점 대상본',
    '① 문제 정의와 자료 이해 (15)', '② 프롬프트와 수정 과정 (20)', '③ 분석 결과와 재현성 (10)', '④ 오류 진단과 검증 (40)', '⑤ 해석과 최종 제안 (15)',
    '원점수 (100)', '감점률', '최종점수 (100)', '순위', '피드백 (강점 / 보완)', '※ 교수자 확인 필요', '항목별 상세 피드백'],
  '기말고사': ['학번', '이름', '조',
    '① 질문 설계 (15)', '② 방법의 적절성 (15)', '③ 검증의 엄밀성 (18)', '④ 해석과 결론 (15)', '⑤ 재현성과 소통 (7)', '⑥ 동료평가 (30)',
    '감점', '산출물 원점수 (100)', '최종 발표 (100)', '기말 최종점수 (60)', '피드백', '※ 교수자 메모'],
  '성적열람기록': ['시각', '학번', '이름', '조회 결과']
};

const SETTINGS_SEED = [
  ['자료등록', 'Y', 'Y이면 각 조가 자료를 등록·수정할 수 있습니다 (12/7 오픈)'],
  ['발표평가', 'N', 'Y이면 다른 조 발표 평가를 제출할 수 있습니다 (12/14 발표 후 Y로 변경)'],
  ['동료평가', 'N', 'Y이면 팀원 간 동료평가를 제출할 수 있습니다 (12/14 발표 후 Y로 변경)'],
  ['결과공개', 'N', 'Y이면 조별 발표평가 평균 점수가 사이트에 표시됩니다'],
  ['중간성적공개', 'N', 'Y이면 학생이 본인의 중간고사 점수와 피드백을 볼 수 있습니다'],
  ['기말성적공개', 'N', 'Y이면 학생이 본인의 기말고사 점수와 피드백을 볼 수 있습니다'],
  ['성적통계', 'Y', 'Y이면 성적 화면에 수강생 평균·중앙값을 함께 보여 줍니다']
];

/* ───────────── 설치 · 메뉴 ───────────── */

function onOpen() {
  SpreadsheetApp.getUi().createMenu('기말발표 관리')
    .addItem('초기 설정 (최초 1회)', 'setup')
    .addItem('집계 갱신', 'refreshSummary')
    .addSeparator()
    .addItem('명단 학번 채우기 (중간고사 시트 기준)', 'fillStudentIds')
    .addItem('성적 시트 점검', 'checkGrades')
    .addToUi();
}

function setup() {
  const ss = SpreadsheetApp.getActive();
  Object.keys(HEADERS).forEach(function (name) {
    let s = ss.getSheetByName(name);
    if (!s) s = ss.insertSheet(name);
    if (s.getLastRow() === 0) {
      s.getRange(1, 1, 1, HEADERS[name].length).setValues([HEADERS[name]]).setFontWeight('bold').setBackground('#e8edf7');
      s.setFrozenRows(1);
    }
  });
  const roster = ss.getSheetByName(CFG.SHEETS.ROSTER);
  if (roster.getLastRow() < 2) {
    roster.getRange(2, 1, ROSTER_SEED.length, 2).setValues(ROSTER_SEED);
    roster.getRange('C:C').setNumberFormat('@');
  }
  // 설정: 빠진 항목만 추가 (이미 운영 중인 시트에 다시 실행해도 안전)
  const st = ss.getSheetByName(CFG.SHEETS.SETTINGS);
  const have = rows_(CFG.SHEETS.SETTINGS).map(function (r) { return norm_(r['항목']); });
  SETTINGS_SEED.forEach(function (s) { if (have.indexOf(s[0]) < 0) st.appendRow(s); });
  CFG.EXAMS.forEach(function (ex) { ss.getSheetByName(ex.sheet).getRange('B:B').setNumberFormat('@'); });
  secret_();
  folder_();
  try { SpreadsheetApp.getUi().alert('초기 설정이 끝났습니다.\n\n1) [명단] 시트의 학번 열을 채워 주세요. (중간고사 시트를 먼저 붙여넣었다면 메뉴의 "명단 학번 채우기"로 자동 입력)\n2) 배포 > 새 배포 > 웹 앱으로 배포한 뒤 URL을 사이트에 입력하세요.'); } catch (e) { }
}

/* ───────────── 웹 앱 진입점 ───────────── */

function doGet() { return out_({ ok: true, service: CFG.COURSE + ' 기말 발표관 API' }); }

function doPost(e) {
  try {
    const req = JSON.parse(e.postData.contents || '{}');
    const fn = ACTIONS[req.action];
    if (!fn) throw new Error('알 수 없는 요청입니다.');
    const res = fn(req) || {};
    res.ok = true;
    return out_(res);
  } catch (err) {
    return out_({ ok: false, error: String(err && err.message || err) });
  }
}

const ACTIONS = {
  bootstrap: function () { return bootstrap_(); },
  login: function (r) { return login_(r); },
  me: function (r) { const u = auth_(r.token); return { me: pub_(u), mine: mine_(u) }; },
  saveTeamInfo: function (r) { return saveTeamInfo_(auth_(r.token), r); },
  addLink: function (r) { return addMaterial_(auth_(r.token), r, null); },
  uploadFile: function (r) { return uploadFile_(auth_(r.token), r); },
  deleteMaterial: function (r) { return deleteMaterial_(auth_(r.token), r); },
  submitTeamEval: function (r) { return submitTeamEval_(auth_(r.token), r); },
  submitPeerEval: function (r) { return submitPeerEval_(auth_(r.token), r); },
  grades: function (r) { return grades_(auth_(r.token)); }
};

function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/* ───────────── 공통 도구 ───────────── */

function sh_(name) {
  const s = SpreadsheetApp.getActive().getSheetByName(name);
  if (!s) throw new Error("'" + name + "' 시트가 없습니다. 초기 설정을 먼저 실행하세요.");
  return s;
}

function rows_(name) {
  const v = sh_(name).getDataRange().getValues();
  const h = v.shift() || [];
  return v.map(function (r, i) {
    const o = { _row: i + 2 };
    h.forEach(function (k, j) { o[k] = typeof r[j] === 'string' ? r[j].replace(/^'(?=[=+\-@])/, '') : r[j]; });
    return o;
  });
}

/** 시트에 기록할 문자열 정리: 길이 제한 + 수식 주입 방지 */
function safe_(s, max) {
  let t = String(s == null ? '' : s).replace(/\r/g, '').trim().slice(0, max || 500);
  if (/^[=+\-@]/.test(t)) t = "'" + t;
  return t;
}

function norm_(s) { return String(s == null ? '' : s).replace(/\s+/g, '').trim(); }
function teamNo_(v) { const n = parseInt(String(v).replace(/[^0-9]/g, ''), 10); return isNaN(n) ? null : n; }
function fmt_(d) { return d instanceof Date ? Utilities.formatDate(d, CFG.TZ, 'MM/dd HH:mm') : String(d || ''); }

function roster_() {
  return rows_(CFG.SHEETS.ROSTER)
    .map(function (r) { return { team: teamNo_(r['조']), name: norm_(r['이름']), sid: sid_(r['학번']) }; })
    .filter(function (r) { return r.name; });   // 조가 비어 있는 학생도 로그인·성적 조회는 가능
}

/** 학번 정리: 숫자로 저장된 학번(202311179, 2.02311179E8 등)도 같은 문자열로 */
function sid_(v) {
  if (typeof v === 'number') return String(Math.round(v));
  return norm_(v).replace(/\.0+$/, '');
}

function settings_() {
  const m = {};
  rows_(CFG.SHEETS.SETTINGS).forEach(function (r) { m[norm_(r['항목'])] = norm_(r['값']).toUpperCase() === 'Y'; });
  return {
    upload: !!m['자료등록'], teamEval: !!m['발표평가'], peerEval: !!m['동료평가'], results: !!m['결과공개'],
    mid: !!m['중간성적공개'], fin: !!m['기말성적공개'], gradeStats: m['성적통계'] !== false
  };
}

function lock_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try { return fn(); } finally { lock.releaseLock(); }
}

/* ───────────── 본인 확인 ───────────── */

function secret_() {
  const p = PropertiesService.getScriptProperties();
  let s = p.getProperty('SECRET');
  if (!s) { s = Utilities.getUuid() + Utilities.getUuid(); p.setProperty('SECRET', s); }
  return s;
}

function sign_(sid) { return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(sid, secret_())); }

function login_(r) {
  const name = norm_(r.name), sid = norm_(r.sid);
  if (!name || !sid) throw new Error('이름과 학번을 모두 입력해 주세요.');
  const cache = CacheService.getScriptCache();
  const key = 'fail_' + Utilities.base64EncodeWebSafe(name).slice(0, 60);
  const fails = Number(cache.get(key) || 0);
  if (fails >= 5) throw new Error('입력 오류가 반복되어 10분간 잠겼습니다. 잠시 후 다시 시도해 주세요.');
  const hit = roster_().filter(function (x) { return x.name === name; });
  const u = hit.filter(function (x) { return x.sid && x.sid === sid; })[0];
  if (!u) {
    cache.put(key, String(fails + 1), 600);
    if (hit.length && hit.every(function (x) { return !x.sid; })) throw new Error('학번이 아직 명단에 등록되지 않았습니다. 담당 교수에게 문의해 주세요.');
    throw new Error('이름 또는 학번이 명단과 일치하지 않습니다.');
  }
  cache.remove(key);
  const body = u.sid + '.' + Date.now();
  return { token: body + '.' + sign_(body), me: pub_(u), mine: mine_(u) };
}

/** 토큰 = 학번.발급시각.서명 — 서명이 맞고 LOGIN_HOURS 이내일 때만 유효 */
function auth_(token) {
  const p = String(token || '').split('.');
  if (p.length !== 3) throw new Error('로그인이 필요합니다.');
  const body = p[0] + '.' + p[1];
  if (sign_(body) !== p[2]) throw new Error('로그인 정보가 올바르지 않습니다. 다시 로그인해 주세요.');
  if (!(Date.now() - Number(p[1]) < CFG.LOGIN_HOURS * 3600 * 1000)) throw new Error('로그인 시간이 지났습니다. 다시 로그인해 주세요.');
  const u = roster_().filter(function (x) { return x.sid && x.sid === p[0]; })[0];
  if (!u) throw new Error('명단에서 찾을 수 없습니다. 다시 로그인해 주세요.');
  return u;
}

function pub_(u) { return { name: u.name, team: u.team }; }

/** 본인이 이미 제출한 평가 (본인에게만 반환) */
function mine_(u) {
  const teamEvals = {}, peerEvals = {};
  rows_(CFG.SHEETS.TEAMEVAL).forEach(function (r) {
    if (norm_(r['평가자 학번']) !== u.sid) return;
    teamEvals[teamNo_(r['대상 조'])] = {
      scores: CFG.TEAM_CRITERIA.map(function (c) { return Number(r[c.label]); }),
      good: String(r['좋았던 점'] || ''), improve: String(r['질문·개선 제안'] || '')
    };
  });
  rows_(CFG.SHEETS.PEEREVAL).forEach(function (r) {
    if (norm_(r['평가자 학번']) !== u.sid) return;
    peerEvals[norm_(r['대상 팀원'])] = {
      scores: CFG.PEER_CRITERIA.map(function (c) { return Number(r[c]); }),
      evidence: String(r['판단 근거'] || ''), unsure: norm_(r['확인 어려움']) === 'Y'
    };
  });
  return { teamEvals: teamEvals, peerEvals: peerEvals };
}

/* ───────────── 공개 데이터 ───────────── */

function bootstrap_() {
  const teams = {};
  roster_().forEach(function (r) {
    if (!r.team) return;
    if (!teams[r.team]) teams[r.team] = { team: r.team, members: [], info: {}, materials: [] };
    teams[r.team].members.push(r.name);
  });
  rows_(CFG.SHEETS.TEAMINFO).forEach(function (r) {
    const t = teams[teamNo_(r['조'])];
    if (t) t.info = { title: String(r['프로젝트 제목'] || ''), summary: String(r['한 줄 요약'] || ''), dataSource: String(r['데이터 출처'] || ''), github: String(r['GitHub 주소'] || '') };
  });
  rows_(CFG.SHEETS.MATERIALS).forEach(function (r) {
    const t = teams[teamNo_(r['조'])];
    if (!t || norm_(r['삭제']) === 'Y') return;
    t.materials.push({
      id: String(r['ID']), type: String(r['구분']), kind: String(r['형태']), title: String(r['제목']), desc: String(r['설명'] || ''),
      url: String(r['URL']), fileId: String(r['파일ID'] || ''), fileName: String(r['파일명'] || ''), by: String(r['등록자']), at: fmt_(r['등록시각'])
    });
  });
  const st = settings_();
  const res = {
    course: CFG.COURSE,
    teams: Object.keys(teams).map(Number).sort(function (a, b) { return a - b; }).map(function (k) { return teams[k]; }),
    settings: st,
    types: CFG.MATERIAL_TYPES, required: CFG.REQUIRED_TYPES,
    criteria: { team: CFG.TEAM_CRITERIA, scale: CFG.TEAM_SCALE, peer: CFG.PEER_CRITERIA },
    exams: CFG.EXAMS.map(function (ex) { return { key: ex.key, label: ex.label, weight: ex.weight, open: !!st[ex.key] }; }),
    maxFileMb: CFG.MAX_FILE_MB, allowedExt: CFG.ALLOWED_EXT
  };
  if (st.results) res.results = teamAverages_();
  return res;
}

function teamAverages_() {
  const acc = {};
  rows_(CFG.SHEETS.TEAMEVAL).forEach(function (r) {
    const t = teamNo_(r['대상 조']);
    if (!t) return;
    if (!acc[t]) acc[t] = { n: 0, sum: 0, items: CFG.TEAM_CRITERIA.map(function () { return 0; }) };
    acc[t].n++;
    acc[t].sum += Number(r['총점']) || 0;
    CFG.TEAM_CRITERIA.forEach(function (c, i) { acc[t].items[i] += Number(r[c.label]) || 0; });
  });
  const res = {};
  Object.keys(acc).forEach(function (t) {
    const a = acc[t];
    res[t] = { n: a.n, avg: Math.round(a.sum / a.n * 10) / 10, items: a.items.map(function (x) { return Math.round(x / a.n * 100) / 100; }) };
  });
  return res;
}

/* ───────────── 조 정보 · 자료 ───────────── */

function needOpen_(flag, label) { if (!settings_()[flag]) throw new Error(label + ' 기간이 아닙니다.'); }
function needTeam_(u) { if (!u.team) throw new Error('조 배정 정보가 없습니다. 담당 교수에게 문의해 주세요.'); }

function url_(u, required) {
  const t = String(u || '').trim();
  if (!t) { if (required) throw new Error('주소(URL)를 입력해 주세요.'); return ''; }
  if (!/^https?:\/\/[^\s]+$/i.test(t) || t.length > 600) throw new Error('주소는 http:// 또는 https:// 로 시작해야 합니다.');
  return t;
}

function saveTeamInfo_(u, r) {
  needOpen_('upload', '자료 등록');
  needTeam_(u);
  const row = [u.team, safe_(r.title, 120), safe_(r.summary, 400), safe_(r.dataSource, 400), url_(r.github, false), new Date(), u.name];
  return lock_(function () {
    const s = sh_(CFG.SHEETS.TEAMINFO);
    const ex = rows_(CFG.SHEETS.TEAMINFO).filter(function (x) { return teamNo_(x['조']) === u.team; })[0];
    if (ex) s.getRange(ex._row, 1, 1, row.length).setValues([row]); else s.appendRow(row);
    return {};
  });
}

function addMaterial_(u, r, file) {
  needOpen_('upload', '자료 등록');
  needTeam_(u);
  if (CFG.MATERIAL_TYPES.indexOf(r.type) < 0) throw new Error('자료 구분을 선택해 주세요.');
  const title = safe_(r.title, 120);
  if (!title) throw new Error('제목을 입력해 주세요.');
  const row = [Utilities.getUuid().slice(0, 8), new Date(), u.team, r.type, file ? '파일' : '링크', title, safe_(r.desc, 500),
    file ? file.url : url_(r.url, true), file ? file.id : '', file ? safe_(file.name, 200) : '', u.name, ''];
  return lock_(function () { sh_(CFG.SHEETS.MATERIALS).appendRow(row); return { id: row[0] }; });
}

function folder_() {
  const p = PropertiesService.getScriptProperties();
  const id = p.getProperty('FOLDER_ID');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) { } }
  const f = DriveApp.createFolder(CFG.DRIVE_FOLDER);
  p.setProperty('FOLDER_ID', f.getId());
  return f;
}

function uploadFile_(u, r) {
  needOpen_('upload', '자료 등록');
  needTeam_(u);
  if (CFG.MATERIAL_TYPES.indexOf(r.type) < 0) throw new Error('자료 구분을 선택해 주세요.');
  if (!safe_(r.title, 120)) throw new Error('제목을 입력해 주세요.');
  const name = String(r.fileName || '').replace(/[\\/:*?"<>|]/g, '_').slice(0, 150);
  const ext = (name.split('.').pop() || '').toLowerCase();
  if (!name || CFG.ALLOWED_EXT.indexOf(ext) < 0) throw new Error('올릴 수 없는 파일 형식입니다. (' + CFG.ALLOWED_EXT.join(', ') + ')');
  const bytes = Utilities.base64Decode(String(r.data || ''));
  if (!bytes.length) throw new Error('파일 내용이 비어 있습니다.');
  if (bytes.length > CFG.MAX_FILE_MB * 1024 * 1024) throw new Error('파일은 ' + CFG.MAX_FILE_MB + 'MB 이하만 올릴 수 있습니다. 더 큰 파일은 링크로 등록해 주세요.');
  const root = folder_();
  const sub = root.getFoldersByName(u.team + '조');
  const dir = sub.hasNext() ? sub.next() : root.createFolder(u.team + '조');
  const f = dir.createFile(Utilities.newBlob(bytes, r.mime || 'application/octet-stream', u.team + '조_' + name));
  try { f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) { }
  return addMaterial_(u, r, { id: f.getId(), name: name, url: 'https://drive.google.com/file/d/' + f.getId() + '/view' });
}

function deleteMaterial_(u, r) {
  needOpen_('upload', '자료 등록');
  return lock_(function () {
    const m = rows_(CFG.SHEETS.MATERIALS).filter(function (x) { return String(x['ID']) === String(r.id) && norm_(x['삭제']) !== 'Y'; })[0];
    if (!m) throw new Error('자료를 찾을 수 없습니다.');
    if (teamNo_(m['조']) !== u.team) throw new Error('우리 조 자료만 삭제할 수 있습니다.');
    sh_(CFG.SHEETS.MATERIALS).getRange(m._row, HEADERS['자료'].indexOf('삭제') + 1).setValue('Y');
    if (m['파일ID']) { try { DriveApp.getFileById(String(m['파일ID'])).setTrashed(true); } catch (e) { } }
    return {};
  });
}

/* ───────────── 평가 ───────────── */

function upsert_(sheetName, match, row) {
  const s = sh_(sheetName);
  const ex = rows_(sheetName).filter(match)[0];
  if (ex) s.getRange(ex._row, 1, 1, row.length).setValues([row]); else s.appendRow(row);
}

function submitTeamEval_(u, r) {
  needOpen_('teamEval', '발표 평가');
  const target = teamNo_(r.target);
  const teams = {};
  roster_().forEach(function (x) { if (x.team) teams[x.team] = true; });
  if (!target || !teams[target]) throw new Error('평가 대상 조가 올바르지 않습니다.');
  if (target === u.team) throw new Error('본인 조는 평가할 수 없습니다.');
  const sc = (r.scores || []).map(Number);
  if (sc.length !== CFG.TEAM_CRITERIA.length || sc.some(function (v) { return Math.floor(v) !== v || v < CFG.TEAM_SCALE.min || v > CFG.TEAM_SCALE.max; }))
    throw new Error('모든 항목에 점수를 선택해 주세요.');
  const total = sc.reduce(function (a, b) { return a + b; }, 0);
  const row = [new Date(), u.sid, u.name, u.team, target].concat(sc).concat([total, safe_(r.good, 1000), safe_(r.improve, 1000)]);
  return lock_(function () {
    upsert_(CFG.SHEETS.TEAMEVAL, function (x) { return norm_(x['평가자 학번']) === u.sid && teamNo_(x['대상 조']) === target; }, row);
    return { total: total };
  });
}

function submitPeerEval_(u, r) {
  needOpen_('peerEval', '동료평가');
  needTeam_(u);
  const mates = roster_().filter(function (x) { return x.team === u.team && x.sid !== u.sid; }).map(function (x) { return x.name; });
  const items = r.items || [];
  const byName = {};
  items.forEach(function (it) { byName[norm_(it.target)] = it; });
  const rows = mates.map(function (name) {
    const it = byName[name];
    if (!it) throw new Error(name + ' 팀원에 대한 평가가 빠졌습니다.');
    const sc = (it.scores || []).map(Number);
    if (sc.length !== CFG.PEER_CRITERIA.length || sc.some(function (v) { return [0, 1, 2].indexOf(v) < 0; })) throw new Error(name + ' 팀원의 모든 항목 점수를 선택해 주세요.');
    const ev = safe_(it.evidence, 1500), unsure = !!it.unsure;
    if (!ev && !unsure) throw new Error(name + " 팀원의 판단 근거를 적거나 '확인 어려움'을 표시해 주세요.");
    const sum = sc[0] + sc[1] + sc[2];
    return { name: name, row: [new Date(), u.sid, u.name, u.team, name].concat(sc).concat([sum, sum * 5, ev, unsure ? 'Y' : '']) };
  });
  return lock_(function () {
    rows.forEach(function (x) {
      upsert_(CFG.SHEETS.PEEREVAL, function (e) { return norm_(e['평가자 학번']) === u.sid && norm_(e['대상 팀원']) === x.name; }, x.row);
    });
    return {};
  });
}

/* ───────────── 집계 (메뉴: 기말발표 관리 > 집계 갱신) ───────────── */

function refreshSummary() {
  const ss = SpreadsheetApp.getActive();
  const roster = roster_().filter(function (r) { return r.team; });
  const write = function (name, header, data) {
    let s = ss.getSheetByName(name);
    if (!s) s = ss.insertSheet(name);
    s.clear();
    s.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight('bold').setBackground('#e8edf7');
    if (data.length) s.getRange(2, 1, data.length, header.length).setValues(data);
    s.setFrozenRows(1);
  };

  // 1) 발표평가: 조별 평균
  const avg = teamAverages_();
  const max = CFG.TEAM_CRITERIA.length * CFG.TEAM_SCALE.max;
  const teamNos = roster.map(function (r) { return r.team; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).sort(function (a, b) { return a - b; });
  const evaluators = roster.length;
  write(CFG.SHEETS.TEAMSUM,
    ['조', '받은 평가 수', '평가 가능 인원'].concat(CFG.TEAM_CRITERIA.map(function (c) { return c.label + ' 평균'; })).concat(['총점 평균(' + max + ')', '100점 환산']),
    teamNos.map(function (t) {
      const a = avg[t], size = roster.filter(function (r) { return r.team === t; }).length;
      return [t, a ? a.n : 0, evaluators - size].concat(a ? a.items : CFG.TEAM_CRITERIA.map(function () { return ''; })).concat(a ? [a.avg, Math.round(a.avg / max * 1000) / 10] : ['', '']);
    }));

  // 2) 동료평가: 개인별 평균 ('확인 어려움' 표시 응답은 평균에서 제외하고 건수만 표시)
  const pe = rows_(CFG.SHEETS.PEEREVAL);
  const te = rows_(CFG.SHEETS.TEAMEVAL);
  write(CFG.SHEETS.PEERSUM,
    ['조', '이름', '학번', '받아야 할 평가 수', '받은 평가 수', '유효 평가 수', '확인 어려움 수', '평균 환산(30)', '최저', '최고', '점검 필요', '동료평가 제출', '발표평가 제출 수'],
    roster.map(function (m) {
      const mates = roster.filter(function (r) { return r.team === m.team && r.name !== m.name; }).length;
      const got = pe.filter(function (r) { return teamNo_(r['조']) === m.team && norm_(r['대상 팀원']) === m.name; });
      const valid = got.filter(function (r) { return norm_(r['확인 어려움']) !== 'Y'; }).map(function (r) { return Number(r['환산(30)']) || 0; });
      const mean = valid.length ? Math.round(valid.reduce(function (a, b) { return a + b; }, 0) / valid.length * 10) / 10 : '';
      const lo = valid.length ? Math.min.apply(null, valid) : '', hi = valid.length ? Math.max.apply(null, valid) : '';
      const flags = [];
      if (got.length < mates) flags.push('평가 누락');
      if (got.length > valid.length) flags.push('근거 부족');
      if (valid.length && hi - lo >= 15) flags.push('평가자 간 차이 큼');
      const gave = pe.filter(function (r) { return norm_(r['평가자 학번']) === m.sid && m.sid; }).length;
      const gaveTeam = te.filter(function (r) { return norm_(r['평가자 학번']) === m.sid && m.sid; }).length;
      return [m.team, m.name, m.sid, mates, got.length, valid.length, got.length - valid.length, mean, lo, hi, flags.join(', '), gave >= mates ? '완료' : '미제출', gaveTeam];
    }));
  try { SpreadsheetApp.getUi().alert('집계를 갱신했습니다. [발표평가_집계], [동료평가_집계] 시트를 확인하세요.'); } catch (e) { }
}

/* ───────────── 성적 조회 ───────────── */

/**
 * 성적 시트의 머리글 해석 규칙
 *  - 학번(필수), 이름 : 본인 확인용 (화면에는 표시하지 않음)
 *  - "(숫자)"로 끝나는 열 : 항목 점수. 괄호 안 숫자가 만점  예) ① 질문 설계 (15)
 *  - 원점수·최종점수·총점·합계·환산이 들어간 열 : 합계 점수. 최종점수 > 총점 > 원점수 순으로 대표 점수
 *  - 감점이 들어간 열 : 감점 (감점률이고 1 이하이면 % 로 표시)
 *  - 피드백이 들어간 열 : 피드백 글 (첫 번째 열은 펼쳐서, 나머지는 접어서 표시)
 *  - ※로 시작하거나 교수자·비공개·메모가 들어간 열, No·순위·조·메일 수신시각·채점 대상본 : 학생에게 표시하지 않음
 *  - 그 밖의 열 : 값이 있으면 '제출 정보'로 표시 (예: 제출구분)
 */
const GRADE_HIDE = ['no', '번호', '순위', '조', '메일수신시각(kst)', '메일수신시각', '채점대상본'];

function gradeCols_(header) {
  return header.map(function (h, i) {
    const t = String(h == null ? '' : h).replace(/\s+/g, ' ').trim();
    const k = norm_(t).toLowerCase();
    const c = { i: i, label: t };
    if (!t) c.kind = 'skip';
    else if (k === '학번') c.kind = 'sid';
    else if (k === '이름' || k === '성명') c.kind = 'name';
    else if (/^※/.test(t) || /교수자|비공개|메모/.test(t) || GRADE_HIDE.indexOf(k) >= 0) c.kind = 'hidden';
    else if (/피드백/.test(t)) c.kind = 'feedback';
    else if (/감점/.test(t)) { c.kind = 'deduct'; c.rate = /률|율|%/.test(t); }
    else {
      const m = t.match(/\(\s*(\d+(?:\.\d+)?)\s*점?\s*\)\s*$/);
      if (m) { c.max = Number(m[1]); c.label = t.slice(0, m.index).trim(); }
      if (/원점수|최종점수|총점|합계|환산|반영/.test(t)) {
        c.kind = 'total';
        c.rank = /최종점수/.test(t) ? 3 : /총점|반영/.test(t) ? 2 : /원점수/.test(t) ? 1 : 0;
      } else c.kind = m ? 'item' : 'info';
    }
    return c;
  });
}

function num_(v) {
  if (v === '' || v == null || typeof v === 'boolean') return null;
  const n = typeof v === 'number' ? v : Number(String(v).replace(/[,\s점]/g, ''));
  return isFinite(n) ? n : null;
}
function round1_(n) { return Math.round(n * 10) / 10; }
function text_(v) { return v instanceof Date ? fmt_(v) : String(v == null ? '' : v).trim(); }

function examSheet_(ex) {
  const s = SpreadsheetApp.getActive().getSheetByName(ex.sheet);
  if (!s || s.getLastRow() < 2) return null;
  const v = s.getDataRange().getValues();
  const cols = gradeCols_(v[0]);
  const sidCol = cols.filter(function (c) { return c.kind === 'sid'; })[0];
  if (!sidCol) return null;
  return { cols: cols, sidCol: sidCol, rows: v.slice(1).filter(function (r) { return sid_(r[sidCol.i]); }) };
}

function primary_(cols) {
  const totals = cols.filter(function (c) { return c.kind === 'total'; });
  return totals.sort(function (a, b) { return b.rank - a.rank || b.i - a.i; })[0] || null;
}

function examResult_(ex, sheet, row, withStats) {
  const cols = sheet.cols;
  const items = cols.filter(function (c) { return c.kind === 'item'; });
  const main = primary_(cols);
  const itemMax = items.reduce(function (a, c) { return a + (c.max || 0); }, 0);
  const res = { key: ex.key, label: ex.label, weight: ex.weight, open: true, found: true, items: [], totals: [], feedback: [], info: [] };
  items.forEach(function (c) { res.items.push({ label: c.label, score: num_(row[c.i]), max: c.max }); });
  cols.forEach(function (c) {
    const v = row[c.i];
    if (c.kind === 'total' && c !== main) {
      const n = num_(v);
      if (n != null) res.totals.push({ label: c.label, score: round1_(n), max: c.max || null });
    } else if (c.kind === 'deduct') {
      const n = num_(v);
      if (n) res.deduct = { label: c.label, text: c.rate && n <= 1 ? Math.round(n * 1000) / 10 + '%' : round1_(n) + '점' };
      else if (n == null && text_(v)) res.deduct = { label: c.label, text: text_(v) };
    } else if (c.kind === 'feedback') {
      if (text_(v)) res.feedback.push({ label: c.label, text: text_(v) });
    } else if (c.kind === 'info') {
      if (text_(v)) res.info.push({ label: c.label, text: text_(v) });
    }
  });
  if (main) {
    const n = num_(row[main.i]);
    const maxOther = cols.filter(function (c) { return c.kind === 'total' && c.max; }).map(function (c) { return c.max; })[0];
    res.score = n == null ? null : round1_(n);
    res.max = main.max || maxOther || itemMax || null;
    res.scoreLabel = main.label;
    if (withStats && n != null) {
      const all = sheet.rows.map(function (r) { return num_(r[main.i]); }).filter(function (x) { return x != null; }).sort(function (a, b) { return a - b; });
      if (all.length >= 5) {   // 응시 인원이 너무 적으면 통계로 개인 점수가 드러나므로 표시하지 않음
        const mid = Math.floor(all.length / 2);
        res.stats = {
          n: all.length,
          mean: round1_(all.reduce(function (a, b) { return a + b; }, 0) / all.length),
          median: round1_(all.length % 2 ? all[mid] : (all[mid - 1] + all[mid]) / 2)
        };
      }
    }
  } else if (items.length) {
    const sc = res.items.map(function (x) { return x.score; });
    if (sc.every(function (x) { return x != null; })) { res.score = round1_(sc.reduce(function (a, b) { return a + b; }, 0)); res.max = itemMax; res.scoreLabel = '합계'; }
  }
  return res;
}

function grades_(u) {
  const st = settings_();
  const out = CFG.EXAMS.map(function (ex) {
    const base = { key: ex.key, label: ex.label, weight: ex.weight };
    if (!st[ex.key]) return Object.assign(base, { open: false });
    const sheet = examSheet_(ex);
    const row = sheet && sheet.rows.filter(function (r) { return sid_(r[sheet.sidCol.i]) === u.sid; })[0];
    if (!row) return Object.assign(base, { open: true, found: false });
    return examResult_(ex, sheet, row, st.gradeStats);
  });
  try {
    sh_(CFG.SHEETS.GRADELOG).appendRow([new Date(), u.sid, u.name,
      out.map(function (g) { return g.label + ':' + (!g.open ? '비공개' : g.found ? '조회' : '성적 없음'); }).join(', ')]);
  } catch (e) { }
  return { grades: out };
}

/* ───────────── 성적 관리 메뉴 ───────────── */

/** 중간고사 시트의 학번·이름으로 명단의 빈 학번을 채웁니다. 이미 적힌 학번은 바꾸지 않습니다. */
function fillStudentIds() {
  const ex = CFG.EXAMS[0], sheet = examSheet_(ex);
  const msg = [];
  if (!sheet) msg.push("'" + ex.sheet + "' 시트에 학번이 있는 행이 없습니다.");
  else {
    const nameCol = sheet.cols.filter(function (c) { return c.kind === 'name'; })[0];
    const byName = {};
    sheet.rows.forEach(function (r) {
      const n = norm_(nameCol ? r[nameCol.i] : '');
      if (n) (byName[n] = byName[n] || []).push(sid_(r[sheet.sidCol.i]));
    });
    const rs = sh_(CFG.SHEETS.ROSTER), col = HEADERS['명단'].indexOf('학번') + 1;
    let filled = 0; const missing = [], dup = [];
    rows_(CFG.SHEETS.ROSTER).forEach(function (r) {
      const n = norm_(r['이름']);
      if (!n || sid_(r['학번'])) return;
      const ids = byName[n] || [];
      if (ids.length === 1) { rs.getRange(r._row, col).setNumberFormat('@').setValue(ids[0]); filled++; }
      else if (ids.length > 1) dup.push(n); else missing.push(n);
    });
    msg.push('학번 ' + filled + '명을 채웠습니다.');
    if (dup.length) msg.push('동명이인이라 직접 입력해야 하는 학생: ' + dup.join(', '));
    if (missing.length) msg.push('중간고사 시트에 없어 직접 입력해야 하는 학생: ' + missing.join(', '));
  }
  try { SpreadsheetApp.getUi().alert(msg.join('\n\n')); } catch (e) { Logger.log(msg.join('\n')); }
  return msg;
}

/** 성적 시트가 학생 화면에 어떻게 보일지 점검합니다. */
function checkGrades() {
  const roster = roster_(), bySid = {};
  roster.forEach(function (r) { if (r.sid) bySid[r.sid] = r; });
  const st = settings_(), msg = [];
  CFG.EXAMS.forEach(function (ex) {
    const sheet = examSheet_(ex);
    const head = '[' + ex.sheet + '] ' + (st[ex.key] ? '공개 중' : '비공개');
    if (!sheet) { msg.push(head + '\n · 학번이 있는 행이 없습니다.'); return; }
    const cols = sheet.cols, main = primary_(cols);
    const lines = [head + ' · ' + sheet.rows.length + '명'];
    const show = function (k) { return cols.filter(function (c) { return c.kind === k; }).map(function (c) { return c.label + (c.max ? '(' + c.max + ')' : ''); }).join(', ') || '없음'; };
    lines.push(' · 대표 점수: ' + (main ? main.label : '없음 (항목 합계 사용)'));
    lines.push(' · 항목 점수: ' + show('item'));
    lines.push(' · 피드백: ' + show('feedback'));
    lines.push(' · 표시 안 함: ' + show('hidden'));
    const nameCol = cols.filter(function (c) { return c.kind === 'name'; })[0];
    const notIn = [], mismatch = [], over = [], seen = {}, dupl = [];
    sheet.rows.forEach(function (r) {
      const sid = sid_(r[sheet.sidCol.i]), nm = nameCol ? norm_(r[nameCol.i]) : '';
      if (seen[sid]) dupl.push(sid); seen[sid] = true;
      if (!bySid[sid]) notIn.push(nm || sid);
      else if (nm && bySid[sid].name !== nm) mismatch.push(sid + ' ' + nm + '→명단 ' + bySid[sid].name);
      cols.forEach(function (c) { const n = num_(r[c.i]); if (c.kind === 'item' && c.max && n != null && (n < 0 || n > c.max)) over.push((nm || sid) + ' ' + c.label + ' ' + n); });
    });
    const absent = roster.filter(function (m) { return m.sid && !seen[m.sid]; }).map(function (m) { return m.name; });
    if (notIn.length) lines.push(' ⚠ 명단에 학번이 없어 조회할 수 없음: ' + notIn.join(', '));
    if (mismatch.length) lines.push(' ⚠ 이름이 명단과 다름: ' + mismatch.join(', '));
    if (dupl.length) lines.push(' ⚠ 학번 중복(첫 행만 표시): ' + dupl.join(', '));
    if (over.length) lines.push(' ⚠ 만점 범위를 벗어난 점수: ' + over.slice(0, 10).join(', '));
    if (absent.length) lines.push(' · 성적 행이 없는 학생(조회 시 "성적 없음"): ' + absent.join(', '));
    msg.push(lines.join('\n'));
  });
  const noSid = roster.filter(function (m) { return !m.sid; }).map(function (m) { return m.name; });
  if (noSid.length) msg.push('[명단] 학번이 비어 로그인할 수 없는 학생: ' + noSid.join(', '));
  try { SpreadsheetApp.getUi().alert(msg.join('\n\n')); } catch (e) { Logger.log(msg.join('\n\n')); }
  return msg;
}
