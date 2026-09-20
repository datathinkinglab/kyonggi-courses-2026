(() => {
  const notionCourse = "https://app.notion.com/p/3b096f1add7680049123c4b50ec2eabf";
  // 학기 진행에 맞춰 이 숫자만 바꾸면 메인 화면의 기본 주차가 함께 변경됩니다.
  const currentWeek = 1;
  const weeks = [
    {
      week: 1,
      title: "EDA의 출발점 · 4가지 원칙",
      activity: "탐색과 확증의 차이, 저항성·잔차·재표현·현시성을 살펴봅니다.",
      slide: "slides/week-01-02.html#3",
      slideCount: 10,
      printFrom: 3,
      printTo: 12,
      notion: "https://app.notion.com/p/3d196f1add768148a985d21d826ca92b",
      sessionTitle: "EDA의 질문법과<br>네 가지 탐색 원칙",
      copy: "계산보다 먼저 자료의 맥락을 살피고, 탐색과 확증을 구분하는 네 가지 관점을 익힙니다.",
      agenda: ["탐색과 확증의 차이", "저항성과 대표값", "잔차·재표현·현시성", "손계산과 해석 실습"]
    },
    {
      week: 2,
      title: "자료 구조 · 분석 명세",
      activity: "관측 단위·변수·측정척도를 구분하고, 모호한 요청을 재현 가능한 분석 명세로 바꿉니다.",
      slide: "slides/week-01-02.html#13",
      slideCount: 19,
      printFrom: 13,
      printTo: 31,
      notion: "https://app.notion.com/p/3d396f1add7680af9fbaf004faccfa7c",
      sessionTitle: "자료의 구조와<br>재현 가능한 분석 명세",
      copy: "자료의 행과 열이 의미하는 바를 정하고, 결측 처리와 출력 기준을 재현 가능한 요청으로 구체화합니다.",
      agenda: ["관측 단위·관측치·변수·값", "명목·순서·구간·비율 척도", "자료 사전과 결측 처리", "AI 분석 명세 비교 실습"]
    },
    { week: 3, title: "코드 읽기와 결과 검증", activity: "결측 처리, 부분세트·정렬, 검증 3종 세트를 다룹니다." },
    { week: 4, title: "줄기와 잎 · 히스토그램", activity: "분포의 모양과 구간 폭에 따른 표현 차이를 탐색합니다." },
    { week: 5, title: "중심위치와 저항성", activity: "평균·중앙값·분위수·IQR과 저항성을 학습합니다." },
    { week: 6, title: "5수요약과 상자그림", activity: "울타리와 이상점, 그룹별 분포 비교를 다룹니다." },
    { week: 7, title: "재표현: 변환의 사다리", activity: "여러 변환을 적용하고 왜도의 변화를 비교합니다." },
    { week: 8, title: "중간고사", activity: "앞선 주차의 핵심 개념과 탐색 과정을 평가합니다." },
    { week: 9, title: "표준화와 Box–Cox", activity: "표준화·로버스트 표준화·Box–Cox 변환을 다룹니다." },
    { week: 10, title: "확률분포와 Q–Q 플롯", activity: "정규분포와 확률플롯을 이용해 분포 적합성을 살펴봅니다." },
    { week: 11, title: "여러 분포와 플롯 진단", activity: "연속·이산분포의 꼬리와 비대칭을 진단합니다." },
    { week: 12, title: "이원 자료와 빈도표", activity: "주변합·비율·모자이크 플롯으로 범주형 관계를 탐색합니다." },
    { week: 13, title: "혼재변수와 심슨의 역설", activity: "층화 전후의 결론을 비교하고 혼재변수를 점검합니다." },
    { week: 14, title: "프로젝트 클리닉", activity: "팀별 진행 발표와 분석 근거, 검증 로그를 점검합니다." },
    { week: 15, title: "최종 프로젝트 발표", activity: "팀별 최종 분석 결과를 발표하고 질의응답을 진행합니다." }
  ];

  const byId = (id) => document.getElementById(id);
  const selectedFromUrl = () => {
    const value = Number(new URLSearchParams(location.search).get("week"));
    return weeks.some((item) => item.week === value) ? value : currentWeek;
  };

  const printUrl = (item) => {
    if (!item.slide) return "#current-course";
    const url = new URL(item.slide, location.href);
    url.searchParams.set("print", "1");
    if (item.printFrom) url.searchParams.set("from", String(item.printFrom));
    if (item.printTo) url.searchParams.set("to", String(item.printTo));
    url.hash = String(item.printFrom || 1);
    return url.href;
  };

  function renderHeaderMenu(selected) {
    const select = byId("header-week-select");
    select.replaceChildren(...weeks.map((item) => {
      const option = document.createElement("option");
      option.value = item.week;
      option.textContent = item.slide ? `${item.week}주차` : `${item.week}주차 · 준비 예정`;
      option.selected = item.week === selected;
      return option;
    }));
    select.addEventListener("change", () => selectWeek(Number(select.value), true));
  }

  function renderPicker(selected) {
    byId("week-radio-list").replaceChildren(...weeks.map((item) => {
      const label = document.createElement("label");
      label.className = `week-radio${item.slide ? " available" : ""}`;
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "course-week";
      input.value = item.week;
      input.checked = item.week === selected;
      input.addEventListener("change", () => selectWeek(item.week, true));
      const text = document.createElement("span");
      text.textContent = item.week;
      label.append(input, text);
      return label;
    }));
  }

  function renderRoadmap(selected) {
    byId("roadmap-list").replaceChildren(...weeks.map((item) => {
      const details = document.createElement("details");
      details.className = `week${item.slide ? " available" : ""}`;
      details.open = item.week === selected;
      const summary = document.createElement("summary");
      const code = document.createElement("b");
      code.textContent = `WEEK ${String(item.week).padStart(2, "0")}`;
      const title = document.createElement("span");
      title.textContent = item.title;
      summary.append(code, title);
      summary.addEventListener("click", (event) => {
        event.preventDefault();
        selectWeek(item.week, true, true);
      });
      const body = document.createElement("div");
      body.className = "week-body";
      const copy = document.createElement("p");
      copy.textContent = item.activity;
      body.append(copy);
      if (item.slide) {
        const link = document.createElement("a");
        link.className = "button primary";
        link.href = item.slide;
        link.textContent = `${item.week}주차 슬라이드 열기 →`;
        body.append(link);
      } else {
        const pending = document.createElement("small");
        pending.textContent = "슬라이드 준비 예정";
        body.append(pending);
      }
      details.append(summary, body);
      return details;
    }));
  }

  function selectWeek(number, updateUrl = false, scrollToCurrent = false) {
    const item = weeks.find((entry) => entry.week === number) || weeks[0];
    document.querySelectorAll('input[name="course-week"]').forEach((input) => {
      input.checked = Number(input.value) === item.week;
    });
    byId("header-week-select").value = String(item.week);
    byId("current-week-label").textContent = `WEEK ${String(item.week).padStart(2, "0")}`;
    byId("current-week-title").textContent = item.title;
    byId("current-week-activity").textContent = item.activity;
    byId("current-week-meta").textContent = item.slide ? `${item.week}주차 · ${item.slideCount} SLIDES` : `${item.week}주차 · 준비 예정`;
    byId("current-session-title").innerHTML = item.sessionTitle || item.title;
    byId("current-session-copy").textContent = item.copy || item.activity;
    byId("current-agenda").replaceChildren(...(item.agenda || ["해당 주차 강의자료를 준비하고 있습니다."]).map((text) => {
      const li = document.createElement("li");
      li.textContent = text;
      return li;
    }));

    const slideLink = byId("current-slide-link");
    slideLink.href = item.slide || "#roadmap";
    slideLink.textContent = item.slide ? `${item.week}주차 슬라이드 열기 →` : `${item.week}주차 슬라이드 준비 예정`;
    slideLink.classList.toggle("disabled", !item.slide);
    slideLink.setAttribute("aria-disabled", String(!item.slide));

    const notionLink = byId("current-notion-link");
    notionLink.href = item.notion || notionCourse;
    notionLink.textContent = item.notion ? `${item.week}주차 원문 ↗` : "전체 Notion 강의노트 ↗";
    byId("current-card-help").innerHTML = item.slide
      ? "방향키로 이동 · O 전체 목록<br>N 강사 노트 · 전체 화면 지원"
      : "해당 주차 슬라이드가 추가되면<br>이 버튼이 자동으로 활성화됩니다.";

    const headerLink = byId("header-slide-link");
    headerLink.href = item.slide || "#current-course";
    headerLink.textContent = item.slide ? "슬라이드 열기 →" : "준비 예정";
    headerLink.classList.toggle("disabled", !item.slide);
    headerLink.setAttribute("aria-disabled", String(!item.slide));

    const pdfLink = byId("header-pdf-link");
    pdfLink.href = printUrl(item);
    pdfLink.textContent = item.slide ? "PDF 출력" : "PDF 준비 예정";
    pdfLink.classList.toggle("disabled", !item.slide);
    pdfLink.setAttribute("aria-disabled", String(!item.slide));

    const heroLink = byId("hero-slide-link");
    heroLink.href = item.slide || "#current-course";
    heroLink.textContent = item.slide ? `${item.week}주차 강의 시작 →` : `${item.week}주차 준비 예정`;
    heroLink.classList.toggle("disabled", !item.slide);
    heroLink.setAttribute("aria-disabled", String(!item.slide));

    renderRoadmap(item.week);
    if (updateUrl) history.replaceState(null, "", `${location.pathname}?week=${item.week}${location.hash}`);
    if (scrollToCurrent) byId("current-course").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const initial = selectedFromUrl();
  renderHeaderMenu(initial);
  renderPicker(initial);
  selectWeek(initial);
})();
