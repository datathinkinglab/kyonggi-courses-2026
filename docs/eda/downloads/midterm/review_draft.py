# -*- coding: utf-8 -*-
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from IPython.display import display

BASE_URL = "https://datathinkinglab.github.io/kyonggi-courses-2026/eda/downloads/midterm/"
df = pd.read_csv(BASE_URL + "cafeteria_wait_120.csv", encoding="utf-8-sig")
validation = pd.read_csv(BASE_URL + "validation_12.csv", encoding="utf-8-sig")
display(df.head())
print("전체 자료:", df.shape, "손계산 자료:", validation.shape)

# 검토용 초안: 아래 처리는 정답이 아닙니다. 원래 목적에 맞는지 진단하세요.
# 처리 A: 시간 미응답을 0분으로 바꾼 전체 평균
draft_a = df["wait_minutes"].fillna(0).mean()
print("초안 A 평균:", draft_a)

# 처리 B: 어떤 열이든 미응답인 방문을 먼저 제외한 시간대별 요약
draft_b = df.dropna().groupby("time_slot").agg(
    total_n=("visit_id", "size"),
    valid_n=("wait_minutes", "count"),
    mean_wait=("wait_minutes", "mean")
)
display(draft_b)

# 처리 C: 0~40분 경계만 사용한 히스토그램
draft_x = df["wait_minutes"].dropna().to_numpy()
draft_counts, _ = np.histogram(draft_x, bins=[0, 10, 20, 30, 40])
print("초안 C 빈도 합계:", draft_counts.sum())
plt.hist(draft_x, bins=[0, 10, 20, 30, 40], edgecolor="white")
plt.xlabel("Wait time (minutes)")
plt.ylabel("Count")
plt.title("Draft: waiting time distribution")
plt.show()
