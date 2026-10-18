# -*- coding: utf-8 -*-
# 교육용 가상 자료. 의도적 오류 진단 셀과 수정 셀을 순서대로 비교합니다.
# %% [1] 실습 준비: 같은 자료, 같은 출발점
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
mask = (df["mode"] == "버스") & df["minutes"].notna()
bus = df.loc[mask, ["student_id", "minutes"]].copy()
bus_mean = bus["minutes"].mean()
display(bus)
print("버스 유효 응답 수:", len(bus), "평균(분):", bus_mean)

# %% [3] 변수별 제외와 행 전체 삭제
complete = df.dropna()                    # 어느 열이든 결측이면 행 삭제
time_only = df.dropna(subset=["minutes"]) # 시간 결측일 때만 행 삭제
print("전체 열 완전 사례:", complete["student_id"].tolist())
print("유효 시간 사례:", time_only["student_id"].tolist())

# %% [4] 조건을 명확히 쓰기
selected = df.loc[
    df["minutes"].notna() & (df["minutes"] >= 30),
    ["student_id", "mode", "minutes"]
]
display(selected)

# %% [5] 정렬은 행을 재배열하고, 순위는 값을 붙입니다
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
practice = pd.DataFrame({"day1_minutes": [20, 40],
                         "day2_minutes": [30, 50]},
                        index=["A", "B"])
print("날짜별 학생 평균:")
print(practice.mean(axis=0))
print("학생별 이틀 평균:")
print(practice.mean(axis=1))

# %% [7] 손계산 워밍업과 기준 코드
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
assert summary.loc["버스", "total_n"] == 3
assert summary.loc["버스", "valid_n"] == 2
assert summary.loc["버스", "missing_n"] == 1
assert np.isclose(summary.loc["버스", "mean_minutes"], 30, rtol=0, atol=1e-10)
assert summary["total_n"].sum() == len(df)
assert summary["valid_n"].sum() == df["minutes"].notna().sum()

# %% [9] ② 대안 방법 교차확인
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
wrong_a = df.dropna().groupby("mode").agg(
    total_n=("student_id", "size"),
    valid_n=("minutes", "count"),
    mean_minutes=("minutes", "mean")
)
display(wrong_a)

# %% [12] 사례 A · 결측 일괄 삭제: 평균이 같아도 틀린 처리
changed = df.copy()
changed.loc[changed["student_id"] == "S05", "minutes"] = 80
print("시간 응답 보존:", summarize(changed).loc["지하철", "mean_minutes"])
print("일괄 삭제:", changed.dropna().groupby("mode")["minutes"].mean().loc["지하철"])

# %% [13] 사례 B · 0으로 채우기: 결측과 실제 값을 혼동
wrong_b = df.assign(minutes=df["minutes"].fillna(0))
display(summarize(wrong_b))

# %% [14] 사례 C · 축 오류와 의미 오류
wrong_c = df[["minutes", "satisfaction"]].mean(axis=1)
display(wrong_c)

# %% [15] 사례 D · 부동소수 동등 비교
actual = 0.1 + 0.2
expected = 0.3
print("계산값:", repr(actual))
print("직접 동등 비교:", actual == expected)
print("허용오차 비교:", np.isclose(actual, expected, rtol=0, atol=1e-12))
