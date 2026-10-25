(() => {
  const notionCourse = 'https://app.notion.com/p/3b096f1add7680318b68eab65a95c2c4';
  // 학기 진행에 맞춰 이 숫자만 바꾸면 메인 화면의 기본 차수가 함께 변경됩니다.
  const currentWeek = 5;
  const weeks = [
    { week: 1, title: '기업 통계컨설팅과 AX의 이해', activity: '수업 안내, 간단한 기업 사례, 관심 기업 후보 탐색', slide: 'slides/week-01.html', slideCount: 24, notion: 'https://app.notion.com/p/3b196f1add768070a79ed3301a0eed07', sessionTitle: '기업의 질문과<br>데이터의 근거', copy: '통계컨설턴트의 역할, AI 활용과 검증, PSDM, 한 학기 프로젝트를 이해합니다.', agenda: ['통계컨설팅과 AX', '바이브코딩의 역할과 검증', '매출 감소 사례와 PSDM', '개인 진단과 팀 전략 프로젝트'] },
    { week: 2, title: '바이브코딩의 개념과 활용 방식', activity: '요구사항·코드 개발·저장·첫 실행·검증과 기능 확장', slide: 'slides/week-02.html', slideCount: 54, notion: 'https://app.notion.com/p/3e796f1add768134b2dceafa4090e7f3', sessionTitle: 'AI로 개발하고<br>실행해서 검증하는 웹앱', copy: '코드 없는 시작 자료로 PRD를 작성하고 AI로 앱을 개발한 뒤, 파일 저장·실행·검증과 기능 확장을 실습합니다.', agenda: ['의뢰·규칙·PRD', 'AI 앱 개발·파일 저장', '설치·첫 실행', '검증·수정과 기능 확장'], help: '방향키로 이동 · O 전체 목록<br>N 강사 노트 · 전체 화면 지원' },
    {"week":3,"title":"바이브코딩 기반 간단한 대시보드 제작","activity":"같은 8행 자료로 전체 현황·가입기간 비교·검증·보고","slide":"slides/week-03.html","slideCount":36,"notion":"https://app.notion.com/p/3fd96f1add76815d83bafa2743148122","sessionTitle":"하나의 질문으로 만드는<br>고객 이탈 대시보드","copy":"한 의뢰를 따라 전체 현황을 계산하고 가입기간별 차이를 비교한 뒤, 수치를 검증해 설명합니다.","agenda":["의뢰와 8행 자료 이해","전체 현황과 금액 분포","가입기간 비교와 필터","검증·수정과 의뢰인 보고"]},

    {"week":4,"title":"대시보드 개선과 웹 배포 실습","activity":"사용자 개선·웹 배포·갱신 모의시험·인수인계","slide":"slides/week-04.html","slideCount":47,"notion":"https://app.notion.com/p/3fd96f1add768124a727dccd58c3f8be","sessionTitle":"업무에 쓰이는<br>분석 결과 전달하기","copy":"3차수의 검증한 앱을 사용자와 업무에 연결하고, 배포·갱신·인수인계와 효과 검증을 실습합니다.","agenda":["업무 의뢰와 사용자 개선","배포·수치·인수 확인","갱신 모의시험과 인수인계","실행 제안과 효과 검증"]},
    {"week":5,"title":"통계컨설팅 대상 기업 선정과 문제 정의","activity":"기업 선정·문제정의·개인 분석계획·6차수 조별 모임 준비","slide":"slides/week-05.html","slideCount":26,"notion":"https://app.notion.com/p/40496f1add76815a8e6ae8fcdd5218ec","sessionTitle":"기업의 문제를<br>분석 가능한 질문으로","copy":"기업 후보와 자료를 검토하고 조별 문제정의와 개인 분석계획을 작성합니다. 별도 과제 제출 없이 6차수 전 조별 모임으로 준비합니다.","agenda":["의뢰와 분석 질문","지표 계산과 비교","기업 선정과 문제정의","조별 모임·6차수 준비"],"help":"방향키로 이동 · G 전체 목록<br>전체 읽기 · 전체화면 · 인쇄"},
    { week: 6, title: 'AI 리서치를 활용한 기업 및 산업 자료조사', activity: '기업·산업 현황과 출처 검증' },
    { week: 7, title: '공공데이터와 DART 기업공시자료 확보', activity: '자료 수집, 기초 지표·추세·경쟁사 비교' },
    { week: 8, title: '기업 데이터 정제와 분석용 데이터셋 구축', activity: '데이터 정제, 기술통계·현황분석, 개인 보고서 정리' },
    { week: 9, title: '중간고사: 기업 현황분석 개별 Term Report 제출', activity: '개인별 분석 관점과 근거를 갖춘 현황분석 보고서' },
    { week: 10, title: '기업 데이터의 통계분석과 핵심 인사이트 도출', activity: '개별 분석 종합, 핵심 문제 확정과 원인 가설 검토' },
    { week: 11, title: '통계컨설팅 보고서 구조와 초안 작성', activity: '데이터 스토리텔링과 팀 전략보고서 초안' },
    { week: 12, title: '기업분석 브리핑보드 설계 및 제작', activity: '핵심 메시지·분석 근거·전략 제안 요약' },
    { week: 13, title: 'PSDM 기반 해결대안 평가와 실행전략 수립', activity: '대안 비교, 실행계획·성과지표, 시나리오 분석' },
    { week: 14, title: '최종 전략보고서 통합 및 검증', activity: '근거·해석·권고안의 일관성 검토와 발표 준비' },
    { week: 15, title: '최종 통계컨설팅 프로젝트 발표 및 결과물 제출', activity: '기말 Team Report와 조별 발표·질의응답' }
  ];

  const byId = id => document.getElementById(id);
  const selectedFromUrl = () => {
    const value = Number(new URLSearchParams(location.search).get('week'));
    return weeks.some(item => item.week === value) ? value : currentWeek;
  };

  function renderHeaderMenu(selected) {
    const select = byId('header-week-select');
    select.replaceChildren(...weeks.map(item => {
      const option = document.createElement('option');
      option.value = item.week;
      option.textContent = item.slide ? `${item.week}차` : `${item.week}차 · 준비 예정`;
      option.selected = item.week === selected;
      return option;
    }));
    select.addEventListener('change', () => selectWeek(Number(select.value), true));
  }

  function renderPicker(selected) {
    byId('week-radio-list').replaceChildren(...weeks.map(item => {
      const label = document.createElement('label');
      label.className = 'week-radio' + (item.slide ? ' available' : '');
      const input = document.createElement('input');
      input.type = 'radio'; input.name = 'course-week'; input.value = item.week; input.checked = item.week === selected;
      input.addEventListener('change', () => selectWeek(item.week, true));
      const text = document.createElement('span'); text.textContent = item.week;
      label.append(input, text); return label;
    }));
  }

  function renderRoadmap(selected) {
    byId('roadmap-list').replaceChildren(...weeks.map(item => {
      const details = document.createElement('details');
      details.className = 'week' + (item.slide ? ' available' : ''); details.open = item.week === selected;
      const summary = document.createElement('summary');
      const code = document.createElement('b'); code.textContent = `SESSION ${String(item.week).padStart(2, '0')}`;
      const title = document.createElement('span'); title.textContent = item.title; summary.append(code, title);
      summary.addEventListener('click', event => { event.preventDefault(); selectWeek(item.week, true, true); });
      const body = document.createElement('div'); body.className = 'week-body';
      const copy = document.createElement('p'); copy.textContent = item.activity; body.append(copy);
      if (item.slide) { const link = document.createElement('a'); link.className = 'button primary'; link.href = item.slide; link.textContent = `${item.week}차 슬라이드 열기 →`; body.append(link); }
      else { const pending = document.createElement('small'); pending.textContent = '슬라이드 준비 예정'; body.append(pending); }
      details.append(summary, body); return details;
    }));
  }

  function selectWeek(number, updateUrl = false, scrollToCurrent = false) {
    const item = weeks.find(entry => entry.week === number) || weeks[0];
    document.querySelectorAll('input[name="course-week"]').forEach(input => input.checked = Number(input.value) === item.week);
    byId('header-week-select').value = String(item.week);
    byId('current-week-label').textContent = `SESSION ${String(item.week).padStart(2, '0')}`;
    byId('current-week-title').textContent = item.title;
    byId('current-week-activity').textContent = item.activity;
    byId('current-week-meta').textContent = item.slide ? `${item.week}차 · ${item.slideCount || ''} SLIDES` : `${item.week}차 · 준비 예정`;
    byId('current-session-title').innerHTML = item.sessionTitle || item.title;
    byId('current-session-copy').textContent = item.copy || item.activity;
    byId('current-agenda').replaceChildren(...(item.agenda || ['강의계획에 따라 자료를 준비하고 있습니다.']).map(text => { const li = document.createElement('li'); li.textContent = text; return li; }));
    const slideLink = byId('current-slide-link');
    slideLink.href = item.slide || '#roadmap'; slideLink.textContent = item.slide ? `${item.week}차 슬라이드 열기 →` : `${item.week}차 슬라이드 준비 예정`; slideLink.classList.toggle('disabled', !item.slide); slideLink.setAttribute('aria-disabled', String(!item.slide));
    const notionLink = byId('current-notion-link'); notionLink.href = item.notion || notionCourse; notionLink.textContent = item.notion ? `${item.week}차 원문 ↗` : '전체 Notion 강의노트 ↗';
    byId('current-card-help').innerHTML = item.slide ? (item.help || '방향키로 이동 · O 전체 목록<br>N 강사 노트 · 전체 화면 지원') : '해당 차수 슬라이드가 추가되면<br>이 버튼이 자동으로 활성화됩니다.';
    const headerLink = byId('header-slide-link'); headerLink.href = item.slide || '#current-course'; headerLink.textContent = item.slide ? '슬라이드 열기 →' : '준비 예정'; headerLink.classList.toggle('disabled', !item.slide); headerLink.setAttribute('aria-disabled', String(!item.slide));
    const pdfLink = byId('header-pdf-link'); pdfLink.href = item.slide ? `${item.slide}?print=1` : '#current-course'; pdfLink.textContent = item.slide ? 'PDF 출력' : 'PDF 준비 예정'; pdfLink.classList.toggle('disabled', !item.slide); pdfLink.setAttribute('aria-disabled', String(!item.slide));
    const heroLink = byId('hero-slide-link'); heroLink.href = item.slide || '#current-course'; heroLink.textContent = item.slide ? `${item.week}차 강의 시작 →` : `${item.week}차 준비 예정`; heroLink.classList.toggle('disabled', !item.slide); heroLink.setAttribute('aria-disabled', String(!item.slide));
    renderRoadmap(item.week);
    if (updateUrl) history.replaceState(null, '', `${location.pathname}?week=${item.week}${location.hash}`);
    if (scrollToCurrent) byId('current-course').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const initial = selectedFromUrl(); renderHeaderMenu(initial); renderPicker(initial); selectWeek(initial);
})();
