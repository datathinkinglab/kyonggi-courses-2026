## 통계 이론 보강: 분포에서 히스토그램까지
[40장 이론 중심 강의](https://datathinkinglab.github.io/kyonggi-courses-2026/eda/slides/week-04.html) · [상세 실습 참고](https://datathinkinglab.github.io/kyonggi-courses-2026/eda/slides/week-04-practice.html)
### 분포: 값이 어디에 얼마나 나타나는가
**분포(distribution)**는 변수의 값과 그 값들이 나타나는 빈도·비율의 구조입니다.

평균 하나가 같더라도 값이 한곳에 모이거나 두 덩어리로 나뉘는 등 구조가 다를 수 있습니다.

우리는 중심 위치·퍼짐·대칭성·봉우리·떨어진 값을 함께 봅니다. 그림은 이 구조를 드러내는 기술통계의 도구입니다.

이론 참고: [OpenStax · 통계의 기본 개념](https://openstax.org/books/introductory-statistics-2e/pages/1-1-definitions-of-statistics-probability-and-key-terms)

### 관측한 분포와 모집단 분포는 다릅니다
**경험분포**는 관측된 응답에 같은 비중을 주어 요약한 분포입니다. 유효 응답 20건이면 각 응답은 1/20=5%를 차지합니다. 반복된 값은 건수만큼 비중을 더합니다.

이 자료에서 20분은 두 건이므로 경험적 비율은 2/20=10%입니다.

표본에서 본 비율이 모집단의 참된 비율과 같다고 단정할 수 없습니다. 특히 이 가상 자료는 계산과 해석 연습용입니다.

이론 참고: [OpenStax · 통계의 기본 개념](https://openstax.org/books/introductory-statistics-2e/pages/1-1-definitions-of-statistics-probability-and-key-terms)

### 변수의 종류에 따라 표현이 달라집니다
<table header-row="true"><tr><td>변수</td><td>의미</td><td>주로 쓰는 그림</td></tr><tr><td>교통수단</td><td>범주형: 버스·지하철·도보</td><td>범주별 막대그래프</td></tr><tr><td>방문 횟수</td><td>이산형 수치: 세어서 얻은 정수</td><td>값별 빈도·점그림 등</td></tr><tr><td>통학 시간</td><td>연속형 수치: 측정해 얻는 양</td><td>점그림·줄기와 잎·히스토그램</td></tr></table>
이번 시간이 정수로 기록됐어도 측정 단위로 반올림한 결과일 수 있습니다. **정수 저장과 통계적 이산성은 같은 말이 아닙니다.**

이론 참고: [OpenStax · 빈도와 상대빈도](https://openstax.org/books/introductory-statistics-2e/pages/1-3-frequency-frequency-tables-and-levels-of-measurement)

### 모양을 읽는 말: 대칭·꼬리·봉우리
![설명용 대칭, 오른쪽 꼬리, 왼쪽 꼬리, 두 봉우리 모양](https://datathinkinglab.github.io/kyonggi-courses-2026/eda/assets/week04-theory/distribution-shapes.png)

꼬리의 방향은 드문 값이 길게 이어지는 쪽입니다. 두 봉우리가 보여도 곧바로 서로 다른 집단이 존재한다고 결론내리지는 않습니다.
설명용 모식도이며, 이번 통학 자료에서 추정한 밀도곡선이 아닙니다.

이론 참고: [OpenStax · 왜도와 대표값](https://openstax.org/books/introductory-statistics-2e/pages/2-6-skewness-and-the-mean-median-and-mode)

### 중심과 퍼짐을 함께 봅니다
이번 자료의 **평균은 34.35분, 중앙값은 31분**, 범위는 90−10=80분입니다.

평균은 모든 값의 크기에 영향을 받고, 중앙값은 정렬한 가운데 위치를 나타냅니다. 큰 값 90분이 있을 때 평균과 중앙값이 어떻게 달라지는지 관찰합니다.

오른쪽 꼬리에서 평균이 중앙값보다 큰 경우가 많지만, 이 관계만으로 분포 모양을 판정하지 않습니다. 분산·IQR·저항성은 다음 차수에서 더 자세히 다룹니다.

이론 참고: [OpenStax · 왜도와 대표값](https://openstax.org/books/introductory-statistics-2e/pages/2-6-skewness-and-the-mean-median-and-mode)

### 줄기와 잎 그림: 값을 나누어 원자료를 보존
기록된 정수 x = 10 × 줄기 + 잎
25분은 **2 | 5**로 씁니다. 여기서 줄기는 십의 자리, 잎은 일의 자리입니다.

- 같은 줄기의 잎을 작은 값부터 정렬합니다.

- 반복값은 반복해서 쓰고, 관측되지 않은 줄기도 비워 남깁니다.

- **키: 2 | 5 = 25분**과 단위를 반드시 적습니다.

소수·반올림 자료는 잎의 단위를 별도로 정합니다. 정확한 복원은 기록한 정밀도를 보존했을 때 가능합니다.

이론 참고: [OpenStax · 줄기와 잎 그림](https://openstax.org/books/introductory-statistics-2e/pages/2-1-stem-and-leaf-graphs-stemplots-line-graphs-and-bar-graphs)

### 줄기와 잎에서 분포를 읽어 봅시다
```text
1 | 0 2 5 8
2 | 0 0 2 5 8
3 | 0 2 5 8
4 | 0 2 5
5 | 0 5
6 | 0
7 |
8 |
9 | 0
```**키: 2 | 5 = 25분.** 잎은 총 20개입니다. 7·8 줄기는 비어 있고 9 줄기에 90분 한 건이 있습니다. 값 20이 두 번 기록된 것도 보존합니다.

이론 참고: [OpenStax · 줄기와 잎 그림](https://openstax.org/books/introductory-statistics-2e/pages/2-1-stem-and-leaf-graphs-stemplots-line-graphs-and-bar-graphs)

### 히스토그램은 개별 값을 구간으로 묶습니다
![같은 가상 자료 20건의 점그림과 히스토그램](https://datathinkinglab.github.io/kyonggi-courses-2026/eda/assets/week04-theory/raw-to-histogram.png)

점그림에서는 개별 값과 반복을 볼 수 있습니다. 히스토그램에서는 구간별 건수로 요약하므로 구간 내부의 정확한 위치를 알 수 없습니다.

이론 참고: [OpenStax · 히스토그램](https://openstax.org/books/introductory-statistics-2e/pages/2-2-histograms-frequency-polygons-and-time-series-graphs)

### 구간은 겹치지 않고 모든 유효값을 담아야 합니다
Bⱼ = [aⱼ, aⱼ₊₁),　구간 폭 hⱼ = aⱼ₊₁ − aⱼ
이번 기준 경계는 **0, 20, 40, 60, 80, 100분**입니다. 보통 왼쪽 경계를 포함하고 오른쪽 경계는 제외합니다.

- 20분은 [20,40)에 포함됩니다.

- 40분은 [40,60)에 포함됩니다.

- NumPy의 마지막 구간은 오른쪽 끝도 포함하므로 [80,100]입니다.

구간 폭 20분은 구간의 **개수 20개**와 다릅니다.

이론 참고: [NumPy · 구간 선택 규칙](https://numpy.org/doc/stable/reference/generated/numpy.histogram_bin_edges.html)

### 빈도·상대빈도·누적상대빈도
<table header-row="true"><tr><td>구간(분)</td><td>빈도 fⱼ</td><td>상대빈도 fⱼ/20</td><td>누적상대빈도</td></tr><tr><td>[0,20)</td><td>4</td><td>0.20</td><td>0.20</td></tr><tr><td>[20,40)</td><td>9</td><td>0.45</td><td>0.65</td></tr><tr><td>[40,60)</td><td>5</td><td>0.25</td><td>0.90</td></tr><tr><td>[60,80)</td><td>1</td><td>0.05</td><td>0.95</td></tr><tr><td>[80,100]</td><td>1</td><td>0.05</td><td>1.00</td></tr></table>
**빈도 합은 n=20, 상대빈도 합은 1**입니다. 누적상대빈도는 작은 구간부터 비율을 더한 값입니다. 여기서 40분 미만은 65%입니다.

이론 참고: [OpenStax · 빈도와 상대빈도](https://openstax.org/books/introductory-statistics-2e/pages/1-3-frequency-frequency-tables-and-levels-of-measurement)

### 구간 비율과 누적 비율은 다른 질문입니다
경험적 구간 비율 = 구간에 속한 응답 수 / n
경험누적분포 F̂(t) = #{xᵢ ≤ t} / n
**20분 이상 40분 미만:** 9/20=45%.

**40분 이하:** 14/20=70%. 40분인 한 건을 포함합니다.

반면 앞 표에서 **40분 미만**은 13/20=65%였습니다. “미만”과 “이하”는 경계값이 있을 때 다른 결과를 만듭니다.

이론 참고: [OpenStax · 빈도와 상대빈도](https://openstax.org/books/introductory-statistics-2e/pages/1-3-frequency-frequency-tables-and-levels-of-measurement)

### 범주별 막대그래프와 히스토그램
<table header-row="true"><tr><td>구분</td><td>범주별 막대그래프</td><td>히스토그램</td></tr><tr><td>가로축</td><td>서로 다른 범주</td><td>수치의 구간</td></tr><tr><td>순서·폭</td><td>범주 순서를 바꿀 수도 있음</td><td>수치 순서와 폭에 의미가 있음</td></tr><tr><td>막대 사이</td><td>분리해 표시하는 경우가 많음</td><td>인접한 수치 구간을 이어 표시</td></tr><tr><td>해석</td><td>범주의 빈도·비율 비교</td><td>수치 분포의 위치와 모양 비교</td></tr></table>
단순히 막대가 붙어 있는지만으로 구별하지 말고 **가로축이 범주인가, 수치 구간인가**를 먼저 보세요.

이론 참고: [OpenStax · 히스토그램](https://openstax.org/books/introductory-statistics-2e/pages/2-2-histograms-frequency-polygons-and-time-series-graphs)

### 같은 자료, 세 가지 세로축
![동일 구간과 자료를 빈도, 상대빈도, 밀도로 표시한 세 그림](https://datathinkinglab.github.io/kyonggi-courses-2026/eda/assets/week04-theory/count-relative-density.png)

강조한 [20,40) 구간: 빈도 9건 → 상대빈도 0.45 → 밀도 0.0225(1/분). 폭이 같으므로 모양은 같고 세로축의 해석이 바뀝니다.

이론 참고: [NIST · 히스토그램과 밀도](https://www.itl.nist.gov/div898/handbook/eda/section3/eda33e.htm)

### 밀도는 높이, 상대빈도는 면적으로 읽습니다
밀도 dⱼ = fⱼ / (n × hⱼ) = 상대빈도 / 구간 폭
막대 면적 = dⱼ × hⱼ = fⱼ / n
[20,40)의 밀도는 9/(20×20)=**0.0225(1/분)**. 면적은 0.0225×20=**0.45**입니다.

모든 유효값을 포함하면 밀도 히스토그램의 면적 합은 1입니다. **밀도의 높이 자체를 확률 2.25%로 읽으면 안 됩니다.** 밀도는 단위에 따라 1보다 클 수도 있습니다.

이론 참고: [NIST · 히스토그램과 밀도](https://www.itl.nist.gov/div898/handbook/eda/section3/eda33e.htm)

### 구간 폭이 다르면 빈도 높이가 착시를 만듭니다
![폭이 다른 구간을 빈도 높이로 그린 그림과 밀도로 보정한 그림](https://datathinkinglab.github.io/kyonggi-courses-2026/eda/assets/week04-theory/unequal-width-area.png)

[40,100]은 폭 60분으로 앞 구간보다 3배 넓습니다. 왼쪽의 면적은 비율을 나타내지 않습니다. 오른쪽처럼 높이를 밀도로 보정해야 면적을 응답 비율로 읽을 수 있습니다.

이론 참고: [NIST · 히스토그램과 밀도](https://www.itl.nist.gov/div898/handbook/eda/section3/eda33e.htm)

### 이론 확인: 높이가 같으면 비율도 같을까요?
서로 겹치지 않는 두 구간의 밀도 높이가 모두 **0.01(1/분)**입니다.

- 구간 A의 폭은 10분입니다.

- 구간 B의 폭은 30분입니다.

어느 구간에 더 많은 비율의 응답이 있나요? 각 막대의 면적을 계산하고 이유를 설명하세요.

다음 장의 해설을 보기 전에 답을 적습니다.

이론 참고: [수업 계산 예](https://datathinkinglab.github.io/kyonggi-courses-2026/eda/slides/week-04.html)

### 해설: 높이가 같아도 면적은 다릅니다
A: 0.01 × 10 = 0.10　 /　 B: 0.01 × 30 = 0.30
A는 10%, B는 30%이므로 B의 비율이 A의 **3배**입니다.

밀도 높이가 같다는 것은 **단위 폭당 비율**이 같다는 뜻입니다. 구간 전체 비율이 같다는 뜻은 아닙니다.

이 두 구간의 면적 합은 0.40이며, 전체 분포의 나머지 구간에 0.60의 비율이 있다고 해석할 수 있습니다.

이론 참고: [수업 계산 예](https://datathinkinglab.github.io/kyonggi-courses-2026/eda/slides/week-04.html)

### 폭 선택은 세부와 안정성의 균형입니다
**구간이 좁으면** 세부 구조가 보이지만, 각 구간의 응답 수가 적어 우연한 들쭉날쭉함이 두드러집니다.

**구간이 넓으면** 그림이 매끈해지지만, 봉우리나 빈 구간을 한 막대로 합쳐 숨길 수 있습니다.

밀도 추정 관점에서는 이 차이를 평활화에 따른 편향과 변동성의 균형으로 설명합니다. 표본이 작은 이번 자료에서는 모양을 하나의 정답으로 고정하지 않습니다.

이론 참고: [NumPy · 구간 선택 규칙](https://numpy.org/doc/stable/reference/generated/numpy.histogram_bin_edges.html)

### 폭 10·20·25분: 무엇이 유지되나요?
![같은 자료에 폭 10, 20, 25분을 적용한 밀도 히스토그램](https://datathinkinglab.github.io/kyonggi-courses-2026/eda/assets/week04-theory/bin-width-density.png)

자료와 가로·세로축 범위는 같습니다. 비교를 위해 밀도로 정규화했습니다. 봉우리의 높이와 세부 굴곡이 달라도, 10~60분의 응답과 90분 값은 그대로 존재합니다.

이론 참고: [NumPy · 구간 선택 규칙](https://numpy.org/doc/stable/reference/generated/numpy.histogram_bin_edges.html)

### 폭이 같아도 시작점이 달라지면 모양이 바뀝니다
![동일 폭 20분에서 시작점 0분과 5분을 비교한 빈도 히스토그램](https://datathinkinglab.github.io/kyonggi-courses-2026/eda/assets/week04-theory/bin-origin.png)

자료는 같지만 구간 경계가 이동하여 빈도가 [4,9,5,1,1]에서 [7,8,4,0,1]로 달라집니다. 생긴 빈 구간만으로 모집단에 관측이 불가능한 영역이 있다고 단정할 수 없습니다.

이론 참고: [NumPy · 구간 선택 규칙](https://numpy.org/doc/stable/reference/generated/numpy.histogram_bin_edges.html)

### 자동 구간 규칙도 비교의 출발점입니다
<table header-row="true"><tr><td>규칙</td><td>의미와 주의</td></tr><tr><td>Sturges</td><td>구간 수 k≈1+log₂(n). n=20이면 올림해 약 6개</td></tr><tr><td>Freedman–Diaconis</td><td>구간 폭 h=2×IQR×n⁻¹ᐟ³. 중간 50%의 범위와 표본 수를 사용</td></tr><tr><td>직접 지정</td><td>통학 안내 등 질문에 의미 있는 단위로 정하고 근거를 기록</td></tr></table>
구간 수 k와 구간 폭 h를 구별하세요. 자동 규칙이 질문에 가장 적합한 그림을 보장하지는 않습니다. IQR이 0인 경우 등에는 별도 처리가 필요합니다. 이론식 암기보다 여러 설정에서 유지되는 관찰을 확인합니다.

이론 참고: [NumPy · 구간 선택 규칙](https://numpy.org/doc/stable/reference/generated/numpy.histogram_bin_edges.html)

### 집단을 비교할 때는 분모와 구간을 맞춥니다
같은 40%라도 A집단 100명의 40건과 B집단 200명의 80건은 빈도 높이가 다릅니다. **분포 모양을 비교하려면 상대빈도 또는 밀도**를 고려합니다.

두 그림은 같은 구간 경계·가로축·세로축 단위를 사용해야 해석하기 쉽습니다. 각 집단의 유효 수와 결측 수도 함께 보고합니다.

이번 통학 자료에는 집단 구분 변수가 없으므로 실제 집단 비교를 만들어내지는 않습니다.

이론 참고: [OpenStax · 빈도와 상대빈도](https://openstax.org/books/introductory-statistics-2e/pages/1-3-frequency-frequency-tables-and-levels-of-measurement)

### 그림에서 관찰한 것과 통계적 결론을 구별합니다
**관찰:** 이번 자료는 10~60분에 19건이 있고 90분 한 건이 오른쪽에 떨어져 있습니다.

**추가 확인이 필요한 주장:** “90분은 입력 오류다”, “두 봉우리이니 두 집단이다”, “대칭이니 정규분포다”.

히스토그램은 탐색 도구입니다. 분포 모형·원인·모집단에 대한 결론에는 자료 생성 과정과 추가 진단이 필요합니다. 큰 값은 원자료와 맥락을 먼저 확인합니다.

이론 참고: [OpenStax · 왜도와 대표값](https://openstax.org/books/introductory-statistics-2e/pages/2-6-skewness-and-the-mean-median-and-mode)

### 영상 참고
[Khan Academy · Histograms (영어)](https://www.youtube.com/watch?v=4eLJGG2Ad30)
막대의 가로 구간과 세로 높이가 무엇을 뜻하는지 확인하세요.
