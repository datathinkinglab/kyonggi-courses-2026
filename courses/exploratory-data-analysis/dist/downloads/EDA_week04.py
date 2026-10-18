# -*- coding: utf-8 -*-
# 교육용 가상 자료. 의도적 오류 진단 셀과 수정 셀을 순서대로 비교합니다.
# %% [1] 분석 자료와 질문을 먼저 정하기
# AI에게 요청할 프롬프트
# 다음 문제를 해결할 Colab용 Python 코드를 작성해줘. 나는 문법을 외우기보다 문제 해결과 결과 확인에 집중하고 있어.
#
# 교육용 가상 학생 22명의 편도 통학 시간 자료를 만들어줘. 실제 조사 자료는 아니고 단위는 분이야.
# 값은 [10,12,15,18,20,20,22,25,28,30,32,35,38,40,42,45,50,55,60,90,미응답,미응답]이야.
# 원자료 이름은 raw로 하고 미응답은 결측으로 남겨줘. 유효 시간만 별도로 골라 valid에 저장해줘.
# 유효값이 유한한 비음수 정수인지 먼저 확인한 뒤, 그림에 쓸 정수 배열 x를 만들어줘.
# 전체·유효·결측 수와 정렬한 유효값을 출력해줘. 90분을 임의로 삭제하지 마.
# 이후 셀에서 NumPy·pandas·Matplotlib와 표 출력을 사용할 수 있도록 필요한 준비도 포함해줘.
#
# 코드와 함께 입력·처리·출력의 의미를 쉬운 말로 설명해줘. 직접 실행하지 않은 결과는 예상 결과로 구분해줘.
# 아래는 비교용 예시 코드입니다.
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from IPython.display import display

raw = pd.Series(
    [10, 12, 15, 18, 20, 20, 22, 25, 28, 30,
     32, 35, 38, 40, 42, 45, 50, 55, 60, 90, None, None],
    name="minutes", dtype="float64"
)
valid = raw.dropna()
assert np.isfinite(valid).all()
assert (valid >= 0).all()
assert (valid % 1 == 0).all()
x = valid.astype(int).to_numpy()
print("전체:", len(raw), "유효:", len(x), "결측:", raw.isna().sum())
print("정렬:", np.sort(x))

# %% [2] 코드로 재현하고 원자료를 복원하기
# AI에게 요청할 프롬프트
# 다음 문제를 해결할 Colab용 Python 코드를 작성해줘. 나는 문법을 외우기보다 문제 해결과 결과 확인에 집중하고 있어.
#
# 앞서 준비한 유효 시간 x를 줄기와 잎 그림으로 보여줘.
# 십의 자리를 줄기, 일의 자리를 잎으로 하고 2 | 5가 25분을 뜻하게 해줘.
# 각 줄기의 잎은 오름차순으로 나열하고, 반복값은 반복해서 적어줘. 1부터 9까지 빈 줄기도 생략하지 마.
# 결과를 stems에 보관하고, 잎들로 다시 복원한 정렬 자료 reconstructed가 원래 정렬값과 같은지 검사해줘.
# 잎 수를 출력해 유효 응답 20건과 대조해줘. 이 표기 규칙은 이번 비음수 정수 자료에 적용한다는 점도 설명해줘.
#
# 코드와 함께 입력·처리·출력의 의미를 쉬운 말로 설명해줘. 직접 실행하지 않은 결과는 예상 결과로 구분해줘.
# 아래는 비교용 예시 코드입니다.
stems = {}
for value in sorted(x.tolist()):
    stem, leaf = divmod(value, 10)
    stems.setdefault(stem, []).append(leaf)

for stem in range(min(stems), max(stems) + 1):
    leaves = stems.get(stem, [])
    print(f"{stem:2d} | " + " ".join(map(str, leaves)))

reconstructed = [
    10 * stem + leaf
    for stem in sorted(stems)
    for leaf in stems[stem]
]
assert reconstructed == sorted(x.tolist())
print("잎 수:", len(reconstructed), "원자료 복원 일치")

# %% [3] 기준 코드
# AI에게 요청할 프롬프트
# 다음 문제를 해결할 Colab용 Python 코드를 작성해줘. 나는 문법을 외우기보다 문제 해결과 결과 확인에 집중하고 있어.
#
# 유효 시간 x의 히스토그램과 빈도표를 작성해줘.
# 구간 경계 edges는 [0,20,40,60,80,100]분이고, 왼쪽은 포함·오른쪽은 제외하되 마지막 구간만 오른쪽 끝도 포함해줘.
# 빈도 counts와 반환된 경계 returned_edges를 보관하고, 좌·우 경계·빈도·상대빈도를 표로 출력해줘. 상대빈도 분모는 유효 응답 20건이야.
# 빈도가 [4,9,5,1,1]이고 합계가 20인지 검사해줘.
# 그래프 가로축은 0–100분, 세로축은 인원 수 0–10으로 하며 전체 유효 20건·결측 2건을 제목에 밝혀줘.
# Colab의 한글 폰트 설치 없이 읽을 수 있게 축과 제목은 영어로 적어줘. 그려진 빈도와 경계도 계산표와 일치하는지 확인해줘.
#
# 코드와 함께 입력·처리·출력의 의미를 쉬운 말로 설명해줘. 직접 실행하지 않은 결과는 예상 결과로 구분해줘.
# 아래는 비교용 예시 코드입니다.
edges = np.array([0, 20, 40, 60, 80, 100])
counts, returned_edges = np.histogram(x, bins=edges)
display(pd.DataFrame({
    "left": edges[:-1],
    "right": edges[1:],
    "count": counts,
    "relative_frequency": counts / len(x)
}))
assert counts.tolist() == [4, 9, 5, 1, 1]
assert counts.sum() == len(x)

fig, ax = plt.subplots(figsize=(8, 4))
plotted_counts, plotted_edges, _ = ax.hist(
    x, bins=edges, color="#2764a5", edgecolor="white"
)
ax.set(xlabel="Commute time (minutes)", ylabel="Count",
       title="Fictional commute data: valid n=20, missing=2",
       xlim=(0, 100), ylim=(0, 10))
ax.set_xticks(edges)
assert np.array_equal(plotted_counts, counts)
assert np.array_equal(plotted_edges, returned_edges)
plt.tight_layout()
plt.show()

# %% [4] 실험 A · 구간 폭만 바꾸기
# AI에게 요청할 프롬프트
# 다음 문제를 해결할 Colab용 Python 코드를 작성해줘. 나는 문법을 외우기보다 문제 해결과 결과 확인에 집중하고 있어.
#
# 같은 유효 시간 x에서 구간 폭 10분·20분·25분의 히스토그램을 나란히 그려줘.
# 세 그림 모두 전체 범위를 0–100분으로 하고 같은 자료를 사용해줘. 시작점은 0분으로 고정해줘.
# 비교하기 쉽게 가로축 0–100분, 세로축 인원 수 0–11을 세 그림에서 동일하게 해줘.
# 각 그림 제목에 폭을 적고, 각 구간 빈도의 합이 유효값 수와 같은지 검사해줘.
# 원자료를 변경하지 마. 폭에 따라 모양이 달라지는 이유와 서로 다른 폭의 막대 높이를 그대로 밀집도로 비교하면 안 되는 이유를 설명해줘.
#
# 코드와 함께 입력·처리·출력의 의미를 쉬운 말로 설명해줘. 직접 실행하지 않은 결과는 예상 결과로 구분해줘.
# 아래는 비교용 예시 코드입니다.
widths = [10, 20, 25]
fig, axes = plt.subplots(1, 3, figsize=(15, 4), sharex=True, sharey=True)
for ax, width in zip(axes, widths):
    trial_edges = np.arange(0, 101, width)
    trial_counts, _ = np.histogram(x, bins=trial_edges)
    assert trial_counts.sum() == len(x)
    ax.hist(x, bins=trial_edges, color="#2764a5", edgecolor="white")
    ax.set(title=f"Width={width} min", xlabel="Minutes",
           xlim=(0, 100), ylim=(0, 11))
axes[0].set_ylabel("Count")
plt.tight_layout()
plt.show()

# %% [5] 실험 B · 폭은 같게, 시작점만 바꾸기
# AI에게 요청할 프롬프트
# 다음 문제를 해결할 Colab용 Python 코드를 작성해줘. 나는 문법을 외우기보다 문제 해결과 결과 확인에 집중하고 있어.
#
# 유효 시간 x로 구간 폭은 20분으로 고정하고 시작점만 0분과 5분으로 바꾼 히스토그램을 나란히 그려줘.
# 경계는 각각 [0,20,40,60,80,100]과 [5,25,45,65,85,105]야.
# 모든 유효값을 포함하고, 두 그림은 가로축 0–110분·세로축 인원 수 0–11로 맞춰줘.
# 각 경계 목록과 빈도 목록을 출력하고 빈도 합계가 20인지 검사해줘.
# [4,9,5,1,1]과 [7,8,4,0,1]인지 확인하고, 자료가 같아도 빈 구간의 인상이 달라지는 이유를 설명해줘.
#
# 코드와 함께 입력·처리·출력의 의미를 쉬운 말로 설명해줘. 직접 실행하지 않은 결과는 예상 결과로 구분해줘.
# 아래는 비교용 예시 코드입니다.
edge_sets = [np.arange(0, 101, 20), np.arange(5, 106, 20)]
fig, axes = plt.subplots(1, 2, figsize=(11, 4), sharex=True, sharey=True)
for ax, trial_edges in zip(axes, edge_sets):
    trial_counts, _ = np.histogram(x, bins=trial_edges)
    print("경계:", trial_edges.tolist(), "빈도:", trial_counts.tolist())
    assert trial_counts.sum() == len(x)
    ax.hist(x, bins=trial_edges, color="#39876c", edgecolor="white")
    ax.set(title=f"Start={trial_edges[0]}, width=20",
           xlabel="Minutes", xlim=(0, 110), ylim=(0, 11))
axes[0].set_ylabel("Count")
plt.tight_layout()
plt.show()

# %% [6] 실험 C · 범위를 좁히면 사라지는 값
# AI에게 요청할 프롬프트
# 다음 문제를 해결할 Colab용 Python 코드를 작성해줘. 나는 문법을 외우기보다 문제 해결과 결과 확인에 집중하고 있어.
#
# 유효 시간 x를 [0,20,40,60]분 경계로 집계했을 때 빠지는 값을 확인해줘.
# 마지막 구간은 60분을 포함해줘. 빈도 short_counts와 경계 short_edges를 저장하고, 범위 밖 값은 outside로 보관해줘.
# 구간 빈도, 포함된 개수, 범위 밖 값 목록을 각각 출력해줘.
# 포함된 수와 범위 밖 수의 합이 전체 유효값 20건인지 검사해줘.
# 결과가 빈도 [4,9,6], 포함 19건, 범위 밖 [90]인지 확인하고 전체 분포로 오해하게 제시하면 안 되는 이유를 설명해줘.
#
# 코드와 함께 입력·처리·출력의 의미를 쉬운 말로 설명해줘. 직접 실행하지 않은 결과는 예상 결과로 구분해줘.
# 아래는 비교용 예시 코드입니다.
short_counts, short_edges = np.histogram(x, bins=[0, 20, 40, 60])
outside = x[(x < short_edges[0]) | (x > short_edges[-1])]
print("빈도:", short_counts.tolist())
print("그림에 포함된 수:", short_counts.sum())
print("범위 밖:", outside.tolist())
assert short_counts.sum() + len(outside) == len(x)

# %% [7] ② 다른 계산 경로로 교차확인
# AI에게 요청할 프롬프트
# 다음 문제를 해결할 Colab용 Python 코드를 작성해줘. 나는 문법을 외우기보다 문제 해결과 결과 확인에 집중하고 있어.
#
# 앞서 사용한 x, edges, counts로 히스토그램 빈도를 다른 계산 경로에서 확인하고 싶어.
# NumPy의 히스토그램 집계 함수를 다시 호출하지 말고, 각 구간의 포함 조건을 직접 적용해 값 개수를 세어줘.
# 왼쪽 경계는 포함, 오른쪽은 제외하고 마지막 구간만 오른쪽 끝도 포함해줘.
# 직접 센 목록 이름은 manual_counts로 하고 기존 counts와 같은지 검사해줘.
# 기존 빈도를 유효값 수로 나눈 상대빈도의 합도 1인지 허용오차로 확인해줘.
# 이 검사는 구간 계산을 확인하는 것이며 원자료 수집의 정확성을 입증하지는 않는다는 점도 설명해줘.
#
# 코드와 함께 입력·처리·출력의 의미를 쉬운 말로 설명해줘. 직접 실행하지 않은 결과는 예상 결과로 구분해줘.
# 아래는 비교용 예시 코드입니다.
manual_counts = []
for i, (left, right) in enumerate(zip(edges[:-1], edges[1:])):
    last_bin = i == len(edges) - 2
    n = sum(
        1 for value in x
        if value >= left and (value <= right if last_bin else value < right)
    )
    manual_counts.append(n)

assert manual_counts == counts.tolist()
assert np.isclose((counts / len(x)).sum(), 1)
print("조건문 직접 집계:", manual_counts)

# %% [8] ③ 경계값·극단 사례 투입
# AI에게 요청할 프롬프트
# 다음 문제를 해결할 Colab용 Python 코드를 작성해줘. 나는 문법을 외우기보다 문제 해결과 결과 확인에 집중하고 있어.
#
# 기존 경계 edges=[0,20,40,60,80,100]을 사용해 다음 시험 자료를 각각 집계해줘.
# 경계값 [0,20,40,60,80,100], 동점 [20,20,20], 단일값 [20], 전부 미응답 [미응답,미응답], 범위 밖 값 [10,20,150].
# 미응답은 제외하되 전체 시험의 맥락을 보존하고, 각 사례의 유효 수·구간 빈도·범위 밖 개수를 출력해줘.
# 빈도 합계와 범위 밖 수의 합이 유효값 수와 같은지 검사해줘.
# 전부 미응답이면 유효값이 없다는 뜻이며 상대빈도는 계산하지 마. 마지막 경계 100이 마지막 구간에 포함되는지도 설명해줘.
#
# 코드와 함께 입력·처리·출력의 의미를 쉬운 말로 설명해줘. 직접 실행하지 않은 결과는 예상 결과로 구분해줘.
# 아래는 비교용 예시 코드입니다.
test_cases = {
    "boundary": [0, 20, 40, 60, 80, 100],
    "ties": [20, 20, 20],
    "single": [20],
    "all_missing": [None, None],
    "outside": [10, 20, 150]
}
for name, values in test_cases.items():
    test = pd.Series(values, dtype="float64").dropna().to_numpy()
    c, _ = np.histogram(test, bins=edges)
    outside_n = ((test < edges[0]) | (test > edges[-1])).sum()
    assert c.sum() + outside_n == len(test)
    print(name, "유효:", len(test), "빈도:", c.tolist(),
          "범위 밖:", int(outside_n))

# %% [9] 보충: 상대빈도와 밀도는 다릅니다
# AI에게 요청할 프롬프트
# 다음 문제를 해결할 Colab용 Python 코드를 작성해줘. 나는 문법을 외우기보다 문제 해결과 결과 확인에 집중하고 있어.
#
# 유효 시간 x를 [0,20,40,100]분의 서로 다른 폭으로 묶어 밀도를 계산해줘.
# 밀도 높이는 구간 빈도÷(유효값 수×구간 폭)이며 막대 넓이가 상대빈도가 되게 해줘.
# 밀도 이름은 density, 경계 이름은 unequal_edges로 하고 각 막대의 넓이를 더한 값을 area로 보관해 출력해줘.
# 전체 넓이 합이 1인지 허용오차로 검사해줘.
# 높이의 합이 1일 필요는 없다는 점과 모든 유효값이 지정 범위에 들어간다는 전제를 설명해줘.
#
# 코드와 함께 입력·처리·출력의 의미를 쉬운 말로 설명해줘. 직접 실행하지 않은 결과는 예상 결과로 구분해줘.
# 아래는 비교용 예시 코드입니다.
unequal_edges = np.array([0, 20, 40, 100])
density, _ = np.histogram(x, bins=unequal_edges, density=True)
area = np.sum(density * np.diff(unequal_edges))
assert np.isclose(area, 1)
print("밀도:", density, "넓이 합:", area)
