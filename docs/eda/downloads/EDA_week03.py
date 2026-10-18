# -*- coding: utf-8 -*-
# # 3차수 · AI 분석 결과를 확인하고 고치는 법
#
# 목표: AI가 내가 요청한 조건을 지켰는지 확인 → 수정 요청 → 검증합니다. 문법 암기가 목적이 아닙니다.
#
# 최종 산출물: 발견한 문제 → 내가 보낸 수정 요청 → 확인한 근거.
#
# [강의 슬라이드](https://datathinkinglab.github.io/kyonggi-courses-2026/eda/slides/week-03.html)

# ## 먼저 판단하기
#
# AI 초안 보고서: 버스 30분·지하철 50분·도보 15분. 이 결과를 사용해도 될까요? 판단과 이유, 더 필요한 정보를 먼저 적으세요.
#
# 나의 판단: [작성]
# 더 필요한 정보: [작성]

# ## 원자료와 대조하기
#
# <div class="table-wrap"><table class="data-table"><thead><tr><th>ID</th><th>교통수단</th><th>시간(분)</th><th>만족도</th></tr></thead><tbody><tr><td>S01</td><td>버스</td><td>20</td><td>2</td></tr><tr><td>S02</td><td>버스</td><td>40</td><td>3</td></tr><tr><td>S03</td><td>버스</td><td>미응답</td><td>4</td></tr><tr><td>S04</td><td>지하철</td><td>30</td><td>3</td></tr><tr><td>S05</td><td>지하철</td><td>50</td><td>미응답</td></tr><tr><td>S06</td><td>지하철</td><td>70</td><td>2</td></tr><tr><td>S07</td><td>도보</td><td>10</td><td>5</td></tr><tr><td>S08</td><td>도보</td><td>20</td><td>4</td></tr></tbody></table></div>
#
# 초안 포함 ID: S01·S02·S04·S06·S07·S08
#
# 발견한 문제: [어떤 응답이 왜 잘못 처리되었나?]
# 근거: [원자료와 포함 ID에서 무엇을 확인했나?]
# AI에게 더 물을 질문: [무엇을 설명해 달라고 할 것인가?]
#
# 아래 예시를 보기 전에 자신의 진단을 적으세요.

# ## 1. AI에게 요청하기: 초안 재현
#
# 앞서 화면에서 진단한 초안을 이제 Colab에서 재현합니다. 아래 요청은 수업용 초안이며, 올바른 처리인지 직접 확인해야 합니다.
#
# ~~~text
# Colab용 Python 자료를 만들어줘. 한 행은 가상 학생 한 명이야.
# student_id: S01,S02,S03,S04,S05,S06,S07,S08
# mode: 버스,버스,버스,지하철,지하철,지하철,도보,도보
# minutes: 20,40,None,30,50,70,10,20
# satisfaction: 2,3,4,3,None,2,5,4
# 표 이름은 df로 하고 미응답은 결측으로 보존해줘.
# 진단용 초안으로 df.dropna() 후 교통수단별 시간 유효 수와 평균을 출력해줘. 이것이 아직 검증되지 않은 초안임을 표시하고 원자료도 보여줘.
#
# 문법 암기보다 결과 검증이 목적이야. 코드의 입력·선택·계산·출력을 쉬운 말로 설명하고, 실행하지 않은 결과는 예상값이라고 밝혀줘.
# ~~~
#
# 생성한 코드를 먼저 사용하세요. 다음 셀은 비교용 예시입니다.

# %% 셀 5
import pandas as pd
from IPython.display import display
df = pd.DataFrame({
    "student_id": ["S01","S02","S03","S04","S05","S06","S07","S08"],
    "mode": ["버스","버스","버스","지하철","지하철","지하철","도보","도보"],
    "minutes": [20,40,None,30,50,70,10,20],
    "satisfaction": [2,3,4,3,None,2,5,4]
})
wrong = df.dropna()  # 진단할 초안: 어느 열이든 결측이면 삭제
draft = wrong.groupby("mode")["minutes"].agg(["count","mean"])
display(df)
display(draft)

# ## 진단 해설
#
# S03은 시간 미응답이지만 S05는 만족도만 미응답입니다. 시간 응답 50분을 버릴 이유가 없습니다. 지하철 평균은 두 경우 모두 50분이므로 평균만으로 판별할 수 없습니다.

# ## 2. AI에게 요청하기: 나의 수정 요청과 예시 비교
#
# 먼저 아래 틀을 자신의 말로 채워 AI에게 요청합니다. 실제 보낸 요청을 남기세요.
#
# 나의 수정 요청:
# 분석 질문은 [무엇]이야.
# 현재 [어떤 응답]이 [어떤 이유]로 잘못 처리됐어.
# [바뀌어야 할 처리 기준]으로 수정해줘.
# 원자료는 보존하고 [확인하고 싶은 인원·결과]를 보여줘.
# 어떤 처리가 달라졌는지도 설명해줘.
#
# 작성한 다음 아래 예시와 비교하세요.
#
# ~~~text
# 앞서 만든 df의 진단용 초안을 수정해줘.
# 질문은 교통수단별 편도 통학 시간 비교야. 원자료는 보존해줘.
# 시간 결측은 시간 통계에서만 제외하고 만족도 결측 때문에 시간 응답을 지우지 마. 결측을 0으로 채우지 마.
# 교통수단별 전체·시간 유효·시간 결측 수·평균을 출력해줘.
# 초안에서 제외된 학생 ID와 제외 이유를 보여주고, S05가 남는지 확인해줘.
# 수정 전후 평균이 같아도 수정이 필요한 이유를 설명해줘.
#
# 문법 암기보다 결과 검증이 목적이야. 코드의 입력·선택·계산·출력을 쉬운 말로 설명하고, 실행하지 않은 결과는 예상값이라고 밝혀줘.
# ~~~
#
# 생성한 코드를 먼저 사용하세요. 다음 셀은 비교용 예시입니다.

# %% 셀 8
summary = df.groupby("mode").agg(
    total_n=("student_id", "size"),
    valid_n=("minutes", "count"),
    mean_minutes=("minutes", "mean")
)
summary["missing_n"] = summary["total_n"] - summary["valid_n"]
display(summary[["total_n","valid_n","missing_n","mean_minutes"]])
print("초안이 제외한 ID:", df.loc[~df.index.isin(wrong.index), "student_id"].tolist())
assert summary.loc["지하철", "valid_n"] == 3
assert summary.loc["버스", "valid_n"] == 2

# ## 수정 결과 확인
#
# 지하철 유효 수 2→3명, 평균 50분 유지. 버스 전체/유효/결측은 3/2/1입니다. 수정의 목적은 질문에 맞는 응답을 포함하는 것입니다.

# ## 3. AI에게 요청하기: 나의 검증 방법과 예시 비교
#
# 무엇을 보면 수정 여부를 확인할 수 있을까요? 바꿀 학생·값과 예상 결과를 먼저 적으세요.
#
# 나의 검증 방법과 예상: [작성]
#
# 아래는 한 값을 바꾸는 검증 요청 예시입니다.
#
# ~~~text
# 수정한 분석을 시험해줘. 원자료 df를 복사한 changed에서만 S05의 minutes를 50에서 80으로 바꿔줘.
# 시간만 기준으로 계산한 지하철 평균과 전체 열 dropna() 후 평균을 비교해줘. 두 계산에 포함된 ID도 보여줘.
# 별도 리스트 [30,80,70]의 합계/개수로 올바른 평균을 독립 확인해줘.
# 전체 열 삭제가 틀린 이유를 포함된 학생과 분모를 근거로 설명해줘. 이 실험용 자료를 원자료와 섞지 마.
#
# 문법 암기보다 결과 검증이 목적이야. 코드의 입력·선택·계산·출력을 쉬운 말로 설명하고, 실행하지 않은 결과는 예상값이라고 밝혀줘.
# ~~~
#
# 생성한 코드를 먼저 사용하세요. 다음 셀은 비교용 예시입니다.

# %% 셀 11
changed = df.copy()
changed.loc[changed["student_id"] == "S05", "minutes"] = 80
valid = changed.loc[changed["mode"] == "지하철", "minutes"].dropna()
bad = changed.dropna().query('mode == "지하철"')
print("수정한 기준:", valid.mean(), "초안 기준:", bad["minutes"].mean())
print("포함 ID:", changed.loc[valid.index, "student_id"].tolist())
print("초안 ID:", bad["student_id"].tolist())
print("별도 계산:", sum([30,80,70]) / len([30,80,70]))
assert valid.mean() == 60 and bad["minutes"].mean() == 50
assert df.loc[df["student_id"] == "S05", "minutes"].iloc[0] == 50

# ## 검증 결과 확인
#
# 실험용 복사본에서 올바른 기준 60분·초안 기준 50분, 별도 합계/개수 60분입니다. 원자료 S05는 50분 유지. 한 사례의 통과가 모든 입력의 정확성을 보장하지는 않습니다.

# ## 최종 학습 기록
#
# 1. 발견한 문제
# [어떤 응답이 왜 잘못 처리됐는지 작성]
#
# 2. 내가 보낸 수정 요청
# [예시를 그대로 옮기지 말고 실제 보낸 요청 기록]
#
# 3. 확인한 근거
# [포함 ID·인원·계산·값 변경 결과 중 실제 확인한 내용 기록]
#
# 실제 학생 전체나 인과관계로 일반화하지 않습니다.
#
# [선택형 자율 실습](https://datathinkinglab.github.io/kyonggi-courses-2026/eda/week03-self-study.html)
