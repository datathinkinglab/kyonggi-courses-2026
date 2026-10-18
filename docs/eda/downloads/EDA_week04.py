# -*- coding: utf-8 -*-
# 교육용 가상 자료. 의도적 오류 진단 셀과 수정 셀을 순서대로 비교합니다.
# %% [1] 분석 자료와 질문을 먼저 정하기
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
short_counts, short_edges = np.histogram(x, bins=[0, 20, 40, 60])
outside = x[(x < short_edges[0]) | (x > short_edges[-1])]
print("빈도:", short_counts.tolist())
print("그림에 포함된 수:", short_counts.sum())
print("범위 밖:", outside.tolist())
assert short_counts.sum() + len(outside) == len(x)

# %% [7] ② 다른 계산 경로로 교차확인
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
unequal_edges = np.array([0, 20, 40, 100])
density, _ = np.histogram(x, bins=unequal_edges, density=True)
area = np.sum(density * np.diff(unequal_edges))
assert np.isclose(area, 1)
print("밀도:", density, "넓이 합:", area)
