# -*- coding: utf-8 -*-
# 교육용 가상 자료. 의도적 오류 진단 셀과 수정 셀을 순서대로 비교합니다.
# %% [1] 실습 준비: 같은 자료, 같은 출발점
# AI에게 요청할 프롬프트
# 다음 문제를 해결할 Colab용 Python 코드를 작성해줘. 나는 문법을 외우기보다 문제 해결과 결과 확인에 집중하고 있어.
#
# 가상 학생 8명의 편도 통학 응답 자료를 만들어줘. 한 행은 학생 한 명이고 단위는 분이야.
# 학생 ID: S01,S02,S03,S04,S05,S06,S07,S08
# 교통수단: 버스,버스,버스,지하철,지하철,지하철,도보,도보
# 시간: 20,40,미응답,30,50,70,10,20
# 만족도: 2,3,4,3,미응답,2,5,4
# 표 이름은 df, 열 이름은 student_id, mode, minutes, satisfaction으로 해줘.
# 미응답은 결측으로 남기고, 전체 표·행/열 수·열별 결측 수·pandas와 NumPy 버전을 출력해줘.
# 외부 파일 없이 Colab에서 실행되게 해줘. 결과에서 전체 8명, 시간 결측 1명, 만족도 결측 1명인지 확인하는 방법도 설명해줘.
#
# 코드와 함께 입력·처리·출력의 의미를 쉬운 말로 설명해줘. 직접 실행하지 않은 결과는 예상 결과로 구분해줘.
# 아래는 비교용 예시 코드입니다.
import pandas as pd
import numpy as np
from IPython.display import display

print("pandas:", pd.__version__, "numpy:", np.__version__)
df = pd.DataFrame({
    "student_id": ["S01", "S02", "S03", "S04", "S05", "S06", "S07", "S08"],
    "mode": ["버스", "버스", "버스", "지하철", "지하철", "지하철", "도보", "도보"],
    "minutes": [20, 40, None, 30, 50, 70, 10, 20],
    "satisfaction": [2, 3, 4, 3, None, 2, 5, 4]
})
display(df)
print("행·열:", df.shape)
display(df.isna().sum())

# %% [2] 코드를 읽는 네 가지 질문
# AI에게 요청할 프롬프트
# 다음 문제를 해결할 Colab용 Python 코드를 작성해줘. 나는 문법을 외우기보다 문제 해결과 결과 확인에 집중하고 있어.
#
# 앞서 만든 df에서 버스 이용자 중 통학 시간에 응답한 학생만 골라줘.
# 학생 ID와 시간만 있는 별도 표 bus를 만들고 원자료는 보존해줘.
# 유효 응답 수와 평균 통학 시간을 분 단위로 보여줘.
# 만족도 미응답 여부는 시간 분석의 제외 기준으로 사용하지 마.
# 결과를 bus_mean에도 저장해줘. 어떤 학생이 포함됐는지 설명하고 20분·40분의 손계산과 비교해줘.
#
# 코드와 함께 입력·처리·출력의 의미를 쉬운 말로 설명해줘. 직접 실행하지 않은 결과는 예상 결과로 구분해줘.
# 아래는 비교용 예시 코드입니다.
mask = (df["mode"] == "버스") & df["minutes"].notna()
bus = df.loc[mask, ["student_id", "minutes"]].copy()
bus_mean = bus["minutes"].mean()
display(bus)
print("버스 유효 응답 수:", len(bus), "평균(분):", bus_mean)

# %% [3] 변수별 제외와 행 전체 삭제
# AI에게 요청할 프롬프트
# 다음 문제를 해결할 Colab용 Python 코드를 작성해줘. 나는 문법을 외우기보다 문제 해결과 결과 확인에 집중하고 있어.
#
# 앞서 만든 df를 사용해서 결측 처리 기준에 따라 누가 빠지는지 비교하고 싶어.
# 어떤 열이든 미응답이면 제외한 표 complete와, 시간 미응답만 제외한 표 time_only를 각각 만들어줘.
# 각 표에 남은 학생 ID와 인원 수를 확인할 수 있게 해줘. 원자료는 바꾸지 마.
# S05는 만족도만 미응답이야. 시간 비교에서 이 학생을 남겨야 하는 이유와 두 기준의 차이를 설명해줘.
#
# 코드와 함께 입력·처리·출력의 의미를 쉬운 말로 설명해줘. 직접 실행하지 않은 결과는 예상 결과로 구분해줘.
# 아래는 비교용 예시 코드입니다.
complete = df.dropna()                    # 어느 열이든 결측이면 행 삭제
time_only = df.dropna(subset=["minutes"]) # 시간 결측일 때만 행 삭제
print("전체 열 완전 사례:", complete["student_id"].tolist())
print("유효 시간 사례:", time_only["student_id"].tolist())

# %% [4] 조건을 명확히 쓰기
# AI에게 요청할 프롬프트
# 다음 문제를 해결할 Colab용 Python 코드를 작성해줘. 나는 문법을 외우기보다 문제 해결과 결과 확인에 집중하고 있어.
#
# df에서 편도 통학 시간이 30분 이상인 학생의 ID·교통수단·시간을 보여줘.
# 30분을 포함하고, 시간 미응답은 제외하며 원래 행 순서를 유지해줘.
# 선택 결과 이름은 selected로 하고 원자료를 보존해줘.
# 결과에 S02,S04,S05,S06이 들어가는지 확인해줘. 30분 초과로 바꾸면 무엇이 달라지는지도 설명해줘.
#
# 코드와 함께 입력·처리·출력의 의미를 쉬운 말로 설명해줘. 직접 실행하지 않은 결과는 예상 결과로 구분해줘.
# 아래는 비교용 예시 코드입니다.
selected = df.loc[
    df["minutes"].notna() & (df["minutes"] >= 30),
    ["student_id", "mode", "minutes"]
]
display(selected)

# %% [5] 정렬은 행을 재배열하고, 순위는 값을 붙입니다
# AI에게 요청할 프롬프트
# 다음 문제를 해결할 Colab용 Python 코드를 작성해줘. 나는 문법을 외우기보다 문제 해결과 결과 확인에 집중하고 있어.
#
# df를 통학 시간이 짧은 순서로 정렬해줘. 동점이면 학생 ID 오름차순, 시간 미응답은 마지막으로 보내줘.
# 정렬한 표 이름은 ordered로 해줘. 원자료를 바꾸지 마.
# 별도 표 ranks에 학생 ID·시간과 두 종류의 순위를 보여줘. 동점에 평균 순위를 주는 방법과 가장 앞선 순위를 주는 방법을 비교해줘.
# 순위 열 이름은 rank_average와 rank_min으로 해줘.
# 두 20분 응답의 순위가 각각 2.5 또는 2가 되는지, 미응답 순위는 결측으로 남는지 확인해줘.
#
# 코드와 함께 입력·처리·출력의 의미를 쉬운 말로 설명해줘. 직접 실행하지 않은 결과는 예상 결과로 구분해줘.
# 아래는 비교용 예시 코드입니다.
ordered = df.sort_values(
    ["minutes", "student_id"],
    ascending=[True, True],
    na_position="last"
)
ranks = df[["student_id", "minutes"]].copy()
ranks["rank_average"] = ranks["minutes"].rank(method="average")
ranks["rank_min"] = ranks["minutes"].rank(method="min")
display(ordered[["student_id", "minutes"]])
display(ranks)

# %% [6] 축은 “어느 방향으로 줄여 계산하는가?”
# AI에게 요청할 프롬프트
# 다음 문제를 해결할 Colab용 Python 코드를 작성해줘. 나는 문법을 외우기보다 문제 해결과 결과 확인에 집중하고 있어.
#
# 가상 학생 A의 이틀 통학 시간은 20분·30분, B는 40분·50분이야.
# practice라는 표에 day1_minutes와 day2_minutes 열로 저장해줘.
# 날짜별 학생 평균과 학생별 이틀 평균을 각각 출력해줘.
# 모든 값의 단위는 분이야. 결과 30·40분과 25·45분이 무엇을 뜻하는지 설명해줘.
# 두 계산이 왜 다른지 표의 행·열을 기준으로 설명하고, 코드의 계산 방향도 쉬운 말로 풀어줘.
#
# 코드와 함께 입력·처리·출력의 의미를 쉬운 말로 설명해줘. 직접 실행하지 않은 결과는 예상 결과로 구분해줘.
# 아래는 비교용 예시 코드입니다.
practice = pd.DataFrame({"day1_minutes": [20, 40],
                         "day2_minutes": [30, 50]},
                        index=["A", "B"])
print("날짜별 학생 평균:")
print(practice.mean(axis=0))
print("학생별 이틀 평균:")
print(practice.mean(axis=1))

# %% [7] 손계산 워밍업과 기준 코드
# AI에게 요청할 프롬프트
# 다음 문제를 해결할 Colab용 Python 코드를 작성해줘. 나는 문법을 외우기보다 문제 해결과 결과 확인에 집중하고 있어.
#
# df에서 교통수단별 전체 인원·시간 유효 응답 수·시간 결측 수·평균 시간을 한 표로 비교하고 싶어.
# 전체 인원은 시간 미응답 학생도 포함하고, 평균은 유효 시간만 사용해줘. 만족도 결측 때문에 시간 응답을 제외하지 마.
# 교통수단이 결측인 경우도 별도 집단으로 남겨줘. 시간 응답이 전혀 없으면 평균은 결측이고 0이 아니야.
# 다른 자료에도 쓸 수 있게 summarize(data)라는 재사용 계산으로 만들어줘.
# 결과 열은 total_n, valid_n, missing_n, mean_minutes 순서로, 평균 오름차순·계산 불가 마지막으로 정렬해줘.
# df의 결과 이름은 summary로 하고 표시만 소수 둘째 자리로 해줘.
# 도보 2명·유효 2명·15분, 버스 3명·유효 2명·30분, 지하철 3명·유효 3명·50분인지 확인해줘.
#
# 코드와 함께 입력·처리·출력의 의미를 쉬운 말로 설명해줘. 직접 실행하지 않은 결과는 예상 결과로 구분해줘.
# 아래는 비교용 예시 코드입니다.
def summarize(data):
    result = data.groupby("mode", dropna=False).agg(
        total_n=("student_id", "size"),
        valid_n=("minutes", "count"),
        mean_minutes=("minutes", "mean")
    )
    result["missing_n"] = result["total_n"] - result["valid_n"]
    return result[["total_n", "valid_n", "missing_n", "mean_minutes"]].sort_values(
        "mean_minutes", na_position="last"
    )

summary = summarize(df)
display(summary.round(2))

# %% [8] ① 손계산 대조
# AI에게 요청할 프롬프트
# 다음 문제를 해결할 Colab용 Python 코드를 작성해줘. 나는 문법을 외우기보다 문제 해결과 결과 확인에 집중하고 있어.
#
# 앞서 만든 df와 교통수단별 요약표 summary가 손계산 기준과 맞는지 확인하는 코드를 작성해줘.
# 버스 전체는 3명, 유효 시간 2명, 결측 1명, 평균 30분이어야 해.
# 집단별 전체 인원의 합은 df의 행 수, 유효 인원의 합은 원자료의 시간 응답 수와 같아야 해.
# 개수는 정확히 비교하고 평균은 절대 허용오차 0.0000000001분으로 비교해줘.
# 일치하지 않으면 해당 점검에서 멈추게 해줘. 실행이 조용히 끝났을 때의 의미와 이 검사로 확인하지 못하는 것도 설명해줘.
#
# 코드와 함께 입력·처리·출력의 의미를 쉬운 말로 설명해줘. 직접 실행하지 않은 결과는 예상 결과로 구분해줘.
# 아래는 비교용 예시 코드입니다.
assert summary.loc["버스", "total_n"] == 3
assert summary.loc["버스", "valid_n"] == 2
assert summary.loc["버스", "missing_n"] == 1
assert np.isclose(summary.loc["버스", "mean_minutes"], 30, rtol=0, atol=1e-10)
assert summary["total_n"].sum() == len(df)
assert summary["valid_n"].sum() == df["minutes"].notna().sum()

# %% [9] ② 대안 방법 교차확인
# AI에게 요청할 프롬프트
# 다음 문제를 해결할 Colab용 Python 코드를 작성해줘. 나는 문법을 외우기보다 문제 해결과 결과 확인에 집중하고 있어.
#
# df와 summary를 이용해 도보·버스·지하철의 평균을 다른 방법으로 다시 확인하고 싶어.
# 집계용 평균 함수를 다시 쓰지 말고, 집단마다 유효 시간의 목록을 만든 뒤 합계÷개수로 계산해줘.
# 목록 평균과 summary의 평균, 일치 여부를 함께 출력하고 다르면 멈춰줘.
# 유효값이 없으면 평균은 결측으로 처리하고 양쪽 모두 결측이면 그 점검은 일치로 봐줘.
# 평균 비교의 절대 허용오차는 0.0000000001분이야. 원자료 자체의 정확성은 이 방법만으로 확인할 수 없다는 점도 설명해줘.
#
# 코드와 함께 입력·처리·출력의 의미를 쉬운 말로 설명해줘. 직접 실행하지 않은 결과는 예상 결과로 구분해줘.
# 아래는 비교용 예시 코드입니다.
for mode in ["도보", "버스", "지하철"]:
    values = [float(x) for x in df.loc[df["mode"] == mode, "minutes"]
              if pd.notna(x)]
    manual = sum(values) / len(values) if values else np.nan
    calculated = summary.loc[mode, "mean_minutes"]
    same = (pd.isna(manual) and pd.isna(calculated)) or np.isclose(
        calculated, manual, rtol=0, atol=1e-10
    )
    print(mode, "목록 계산:", manual, "집계:", calculated, "일치:", same)
    assert same

# %% [10] ③ 극단 사례 투입
# AI에게 요청할 프롬프트
# 다음 문제를 해결할 Colab용 Python 코드를 작성해줘. 나는 문법을 외우기보다 문제 해결과 결과 확인에 집중하고 있어.
#
# 앞서 만든 summarize가 특이한 자료에서도 명세대로 작동하는지 시험해줘.
# 별도 시험 집단을 만들고 다음 시간 목록을 각각 넣어줘: [20,20,20], [20], [20,미응답,40], [미응답,미응답], [20,20,200].
# 각 시험 자료에는 학생 ID·교통수단·시간을 넣고 시간은 결측을 표현할 수 있는 숫자형으로 만들어줘.
# 각 사례 이름과 전체·유효·결측 수·평균을 출력해줘. 원래 df는 바꾸지 마.
# 예상 평균 20,20,30,계산 불가,80분을 먼저 적고 실제 결과와 비교해줘.
#
# 코드와 함께 입력·처리·출력의 의미를 쉬운 말로 설명해줘. 직접 실행하지 않은 결과는 예상 결과로 구분해줘.
# 아래는 비교용 예시 코드입니다.
cases = {
    "동점": [20, 20, 20],
    "단일값": [20],
    "일부결측": [20, None, 40],
    "전부결측": [None, None],
    "극단값": [20, 20, 200]
}
for name, values in cases.items():
    test_df = pd.DataFrame({
        "student_id": [f"T{i}" for i in range(len(values))],
        "mode": ["시험"] * len(values),
        "minutes": pd.Series(values, dtype="float64")
    })
    print(name)
    display(summarize(test_df))

# %% [11] 사례 A · 결측 일괄 삭제: 평균이 같아도 틀린 처리
# AI에게 요청할 프롬프트
# 다음 문제를 해결할 Colab용 Python 코드를 작성해줘. 나는 문법을 외우기보다 문제 해결과 결과 확인에 집중하고 있어.
#
# 결측 일괄 삭제의 문제를 발견하는 교육용 예제를 작성해줘. 실제 분석에 쓸 올바른 처리와 구분해줘.
# 입력은 앞서 만든 df야. 의도적으로 어떤 열이든 결측이면 행을 먼저 삭제한 뒤, 교통수단별 전체·유효 인원과 평균 시간을 집계해줘.
# 진단 대상 표는 wrong_a, 열 이름은 total_n, valid_n, mean_minutes로 해줘.
# 이 코드가 어떤 ID를 삭제하는지, 지하철 평균이 우연히 50분으로 같아도 왜 명세를 어기는지 설명해줘.
# 평균뿐 아니라 분모와 사용 ID를 확인해야 한다는 진단 질문을 덧붙여줘.
#
# 코드와 함께 입력·처리·출력의 의미를 쉬운 말로 설명해줘. 직접 실행하지 않은 결과는 예상 결과로 구분해줘.
# 아래는 비교용 예시 코드입니다.
wrong_a = df.dropna().groupby("mode").agg(
    total_n=("student_id", "size"),
    valid_n=("minutes", "count"),
    mean_minutes=("minutes", "mean")
)
display(wrong_a)

# %% [12] 사례 A · 결측 일괄 삭제: 평균이 같아도 틀린 처리
# AI에게 요청할 프롬프트
# 다음 문제를 해결할 Colab용 Python 코드를 작성해줘. 나는 문법을 외우기보다 문제 해결과 결과 확인에 집중하고 있어.
#
# 원래 df의 복사본 changed에서만 S05의 시간을 50분에서 80분으로 바꿔줘. 실제 관측값을 정정하는 작업이 아니라 민감도 실험이야.
# changed에 summarize를 적용했을 때 지하철 평균과, 어떤 열이든 결측이면 먼저 삭제했을 때의 지하철 평균을 비교해줘.
# 두 값을 같은 셀에서 이름과 함께 출력해줘. 원자료 df는 유지해줘.
# 올바른 시간 응답 보존 결과 60분과 일괄 삭제 결과 50분이 나오는 이유를 사용한 값과 함께 설명해줘.
#
# 코드와 함께 입력·처리·출력의 의미를 쉬운 말로 설명해줘. 직접 실행하지 않은 결과는 예상 결과로 구분해줘.
# 아래는 비교용 예시 코드입니다.
changed = df.copy()
changed.loc[changed["student_id"] == "S05", "minutes"] = 80
print("시간 응답 보존:", summarize(changed).loc["지하철", "mean_minutes"])
print("일괄 삭제:", changed.dropna().groupby("mode")["minutes"].mean().loc["지하철"])

# %% [13] 사례 B · 0으로 채우기: 결측과 실제 값을 혼동
# AI에게 요청할 프롬프트
# 다음 문제를 해결할 Colab용 Python 코드를 작성해줘. 나는 문법을 외우기보다 문제 해결과 결과 확인에 집중하고 있어.
#
# 결측을 0으로 바꿨을 때 생기는 문제를 보여주는 교육용 진단 코드를 작성해줘.
# df의 원본은 보존하고 시간 미응답을 의도적으로 0으로 채운 복사본 wrong_b를 만들어줘.
# 앞서 만든 summarize로 교통수단별 요약을 출력해줘.
# 버스 평균이 30분에서 20분으로 변하는 이유를 분모와 함께 설명해줘.
# 이 코드는 오류 진단용이며 이번 실습의 올바른 분석 규칙은 미응답을 보존하는 것임을 분명히 해줘.
#
# 코드와 함께 입력·처리·출력의 의미를 쉬운 말로 설명해줘. 직접 실행하지 않은 결과는 예상 결과로 구분해줘.
# 아래는 비교용 예시 코드입니다.
wrong_b = df.assign(minutes=df["minutes"].fillna(0))
display(summarize(wrong_b))

# %% [14] 사례 C · 축 오류와 의미 오류
# AI에게 요청할 프롬프트
# 다음 문제를 해결할 Colab용 Python 코드를 작성해줘. 나는 문법을 외우기보다 문제 해결과 결과 확인에 집중하고 있어.
#
# 서로 다른 단위의 숫자를 평균 내는 문제를 보여주는 교육용 진단 코드를 작성해줘.
# df의 minutes와 satisfaction을 학생 한 명씩 가로로 평균 내어 wrong_c로 출력해줘. 원자료를 바꾸지 마.
# S01에서 11이 나오는 계산 과정과 S03에서 만족도 4만 남는 이유를 설명해줘.
# 분 단위 통학 시간과 순서형 만족도 점수의 평균을 섞으면 어떤 질문에도 적절한 답이 되지 않는 이유를 알려줘.
# 이번 목표인 전체 시간 평균과 교통수단별 시간 평균은 어떤 값들로 구해야 하는지도 설명해줘.
#
# 코드와 함께 입력·처리·출력의 의미를 쉬운 말로 설명해줘. 직접 실행하지 않은 결과는 예상 결과로 구분해줘.
# 아래는 비교용 예시 코드입니다.
wrong_c = df[["minutes", "satisfaction"]].mean(axis=1)
display(wrong_c)

# %% [15] 사례 D · 부동소수 동등 비교
# AI에게 요청할 프롬프트
# 다음 문제를 해결할 Colab용 Python 코드를 작성해줘. 나는 문법을 외우기보다 문제 해결과 결과 확인에 집중하고 있어.
#
# 컴퓨터에서 0.1+0.2와 0.3을 비교하는 짧은 Colab 예제를 작성해줘.
# 계산값을 실제 저장된 표현으로 보여주고, 두 값의 정확한 동등 비교와 허용오차 비교 결과를 각각 출력해줘.
# 절대 허용오차는 0.000000000001로 하고 상대오차는 사용하지 마.
# 계산값과 기준값 이름은 actual과 expected로 해줘.
# 왜 직접 비교가 False이고 허용오차 비교가 True일 수 있는지 쉬운 말로 설명해줘. 인원 수와 학생 ID에는 이런 근사 비교를 쓰지 않는다는 점도 알려줘.
#
# 코드와 함께 입력·처리·출력의 의미를 쉬운 말로 설명해줘. 직접 실행하지 않은 결과는 예상 결과로 구분해줘.
# 아래는 비교용 예시 코드입니다.
actual = 0.1 + 0.2
expected = 0.3
print("계산값:", repr(actual))
print("직접 동등 비교:", actual == expected)
print("허용오차 비교:", np.isclose(actual, expected, rtol=0, atol=1e-12))
