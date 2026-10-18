# -*- coding: utf-8 -*-
# # 3차수 핵심 실습: 평균이 같아도 분석은 틀릴 수 있다
#
# 한 사례를 준비 → 수정 → 반례 검증 순서로 해결합니다. 각 Python 셀 앞의 프롬프트로 먼저 AI에게 요청하고, 아래 코드는 비교용으로 활용하세요. 교육용 가상 자료입니다. 문법 암기가 목적이 아닙니다.
#
# [자율 실습 안내](https://datathinkinglab.github.io/kyonggi-courses-2026/eda/week03-self-study.html)

# ## 1. AI에게 요청하기
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
# 확인값: 초안 평균은 버스 30·지하철 50·도보 15분. 지하철 유효 수는 잘못된 2명.

# %% 셀 3
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


# ## 2. AI에게 요청하기
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
# 확인값: 수정 후 전체/유효/결측은 버스 3/2/1, 지하철 3/3/0, 도보 2/2/0. 평균은 30·50·15분.

# %% 셀 5
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


# ## 3. AI에게 요청하기
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
# 확인값: 변경 자료는 올바른 기준 60분, 초안 기준 50분. 별도 계산은 60분. 원자료 S05는 50분 유지.

# %% 셀 7
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


# ## 검증 기록
#
# 분석 질문: 교통수단별 편도 통학 시간 비교
# 발견한 문제: [누구의 어떤 응답이 잘못 제외되었나?]
# 수정 요청: [AI에게 전달한 실제 요청]
# 검증 근거: [인원·손계산·값 변경 전후 비교]
# 해석: [확인된 사실과 이 자료의 한계]
#
# 교육용 가상 소표본이므로 실제 학생 전체나 인과관계로 일반화하지 않습니다.