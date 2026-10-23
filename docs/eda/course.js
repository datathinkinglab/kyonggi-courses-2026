(() => {
  const notionCourse = "https://app.notion.com/p/3b096f1add7680049123c4b50ec2eabf";
  // 학기 진행에 맞춰 이 숫자만 바꾸면 메인 화면의 기본 차수가 함께 변경됩니다.
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
      slideCount: 28,
      printFrom: 13,
      printTo: 40,
      notion: "https://app.notion.com/p/3d396f1add7680af9fbaf004faccfa7c",
      sessionTitle: "자료의 구조와<br>재현 가능한 분석 명세",
      copy: "자료의 행과 열이 의미하는 바를 정하고, 결측 처리와 출력 기준을 재현 가능한 요청으로 구체화합니다.",
      agenda: ["관측 단위·관측치·변수·값", "명목·순서·구간·비율 척도", "자료 사전과 결측 처리", "AI 분석 명세 비교 실습"]
    },
    { week: 3, title: "AI 분석 결과를 확인하고 고치는 법", activity: "AI가 요청한 조건을 지켰는지 확인하고, 자신의 말로 수정 요청을 한 뒤 실제 근거로 검증합니다.", slide: "slides/week-03.html", slideCount: 24, printFrom: 1, printTo: 24, notion: "https://app.notion.com/p/3fd96f1add76814889f5db0f5adbc6ea", sessionTitle: "AI 분석 결과를<br>확인하고 고치는 법", copy: "결과를 먼저 판단하고, 문제 발견 → 수정 요청 → 검증의 과정을 직접 수행합니다. 추가 활동은 별도 자율 실습으로 이어갑니다.", agenda: ["AI 보고서를 먼저 판단하기","원자료와 대조해 문제 발견","내 말로 수정 요청하기","실제 근거로 검증하고 기록"] },
    { week: 4, title: "분포·줄기와 잎·히스토그램의 통계 이론", activity: "분포·빈도·상대빈도·밀도와 면적·구간 선택을 설명하고 같은 자료의 그림으로 확인합니다.", slide: "slides/week-04.html", slideCount: 40, printFrom: 1, printTo: 40, notion: "https://app.notion.com/p/3fd96f1add76814ab4e0c6a9ceb60c29", sessionTitle: "분포를 이해하고<br>그림으로 설명하기", copy: "통계 이론과 직접 만든 설명 그림을 먼저 학습하고 Colab에서 확인합니다. 상세 실습은 별도 참고 슬라이드에서 이어갑니다.", agenda: ["분포·경험분포·자료의 종류","줄기와 잎·빈도·누적비율","밀도와 면적·구간 선택","이론을 AI와 Colab으로 확인"] },
    { week: 5, title: "중심위치와 저항성", activity: "평균·중앙값·최빈값·분위수·IQR의 원리를 이해하고 값 교체 실험으로 저항성을 확인합니다.", slide: "slides/week-05.html", slideCount: 21, printFrom: 1, printTo: 21, sessionTitle: "중심위치를 이해하고<br>저항성을 검증하기", copy: "대표값을 목적에 맞게 선택하고 손계산과 AI·Colab 실습으로 요약값의 변화와 근거를 확인합니다.", agenda: ["목적에 따른 대표값 선택", "저항성과 값 교체 실험", "분위수·IQR과 손계산", "프롬프트·Colab·자가 실습"] },
    { week: 6, title: "5수요약과 상자그림", activity: "울타리와 이상점, 그룹별 분포 비교를 다룹니다." },
    { week: 7, title: "재표현: 변환의 사다리", activity: "여러 변환을 적용하고 왜도의 변화를 비교합니다." },
    { week: 8, title: "표준화와 Box–Cox", activity: "표준화·로버스트 표준화·Box–Cox 변환을 다룹니다." },
    { week: 9, title: "확률분포와 Q–Q 플롯", activity: "정규분포와 확률플롯을 이용해 분포 적합성을 살펴봅니다." },
    { week: 10, title: "여러 분포와 플롯 진단", activity: "연속·이산분포의 꼬리와 비대칭을 진단합니다." },
    { week: 11, title: "이원 자료와 빈도표", activity: "주변합·비율·모자이크 플롯으로 범주형 관계를 탐색합니다." },
    { week: 12, title: "혼재변수와 심슨의 역설", activity: "층화 전후의 결론을 비교하고 혼재변수를 점검합니다." },
    { week: 13, title: "프로젝트 클리닉", activity: "팀별 진행 발표와 분석 근거, 검증 로그를 점검합니다." },
    { week: 14, title: "최종 프로젝트 발표", activity: "팀별 최종 분석 결과를 발표하고 질의응답을 진행합니다." }
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
      option.textContent = item.slide ? `${item.week}차수` : `${item.week}차수 · 준비 예정`;
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
      text.textContent = `${item.week}차수`;
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
      code.textContent = `${item.week}차수`;
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
        link.textContent = `${item.week}차수 슬라이드 열기 →`;
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
    byId("current-week-label").textContent = `${item.week}차수`;
    byId("current-week-title").textContent = item.title;
    byId("current-week-activity").textContent = item.activity;
    byId("current-week-meta").textContent = item.slide ? `${item.week}차수 · ${item.slideCount} SLIDES` : `${item.week}차수 · 준비 예정`;
    byId("current-session-title").innerHTML = item.sessionTitle || item.title;
    byId("current-session-copy").textContent = item.copy || item.activity;
    byId("current-agenda").replaceChildren(...(item.agenda || ["해당 차수 강의자료를 준비하고 있습니다."]).map((text) => {
      const li = document.createElement("li");
      li.textContent = text;
      return li;
    }));

    const slideLink = byId("current-slide-link");
    slideLink.href = item.slide || "#roadmap";
    slideLink.textContent = item.slide ? `${item.week}차수 슬라이드 열기 →` : `${item.week}차수 슬라이드 준비 예정`;
    slideLink.classList.toggle("disabled", !item.slide);
    slideLink.setAttribute("aria-disabled", String(!item.slide));

    const notionLink = byId("current-notion-link");
    notionLink.href = item.notion || notionCourse;
    notionLink.textContent = item.notion ? `${item.week}차수 원문 ↗` : "전체 Notion 강의노트 ↗";
    byId("current-card-help").innerHTML = item.slide
      ? (item.week === 5 ? "방향키 이동 · M 전체 목차<br>프롬프트·코드 복사 · 해설 팝업" : [3, 4].includes(item.week) ? "방향키 이동 · O 전체 목차<br>전체 읽기 · 코드 복사 · Colab 실습" : "방향키로 이동 · O 전체 목록<br>N 강사 노트 · 전체 화면 지원")
      : "해당 차수 슬라이드가 추가되면<br>이 버튼이 자동으로 활성화됩니다.";

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
    heroLink.textContent = item.slide ? `${item.week}차수 강의 시작 →` : `${item.week}차수 준비 예정`;
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
