"""4차수: 업무 질문, 사용자 검증, 안전한 합성 자료 갱신 모의시험."""
from pathlib import Path
import json

import pandas as pd
import plotly.express as px
import streamlit as st

from analysis_core import validate, subset, summary, bands, compare_means, category_test
from operations import SCENARIOS, fingerprint, inspect_update, csv_bytes, build_record

ROOT = Path(__file__).resolve().parent
VERSION = 'week04-20261025'
COLORS = {'유지': '#074c8c', '이탈': '#f2604f'}
st.set_page_config(page_title='4차수 · 고객 운영회의 대시보드', layout='wide')
st.title('고객 이탈 현황과 다음 조사')
st.write('운영회의에서 전체·가입 초기 고객의 현황을 확인하고 추가 조사할 자료를 정합니다.')
st.caption('학습용 합성 자료 · 고객 한 명당 한 행 · 금액 CU · 실제 기준일 없음 · 기준 시점 이후 공통 관찰기간을 가정')
st.info('이 화면은 현황 탐색과 추가 조사 계획을 돕습니다. 실제 고객의 원인·예측 성능·개선 효과는 확인하지 않았습니다.')

choice = st.sidebar.selectbox('실습 데이터', ['8행 검증 자료', '100행 합성 자료'], key='dataset')
filename = 'validation_8rows.csv' if choice == '8행 검증 자료' else 'sample_churn.csv'
st.sidebar.caption('공개 수업 모드: 제공된 합성 자료만 사용합니다.')
try:
    payload = (ROOT / 'data' / filename).read_bytes()
    raw = pd.read_csv(ROOT / 'data' / filename)
    clean, quality, reasons = validate(raw)
except (ValueError, OSError, pd.errors.ParserError) as exc:
    st.error(f'자료를 사용할 수 없습니다: {exc}')
    st.stop()
signature = fingerprint(payload)
st.caption(f'자료: {filename} · 파일 식별값: {signature} · 코드: {VERSION}')
st.caption('식별값은 파일 내용을 구분하는 값입니다. 고객 관찰일이나 갱신 승인 시각이 아닙니다.')

with st.expander('업무 목적과 완료 기준'):
    st.write('사용자: 가상 구독 서비스 운영 담당자 / 판단: 추가 조사할 집단·자료·담당자')
    st.write('완료: 다른 조가 자료·조건·분모를 설명하고, 사실과 원인 가설을 구분한다.')
    st.write('기업 적용 전에 관찰기간, 자료 사용 범위, 갱신 담당, 장애 대응을 협의한다.')

with st.expander('자료 품질과 원자료'):
    st.write(quality)
    st.dataframe(reasons.rename('건수'))
    st.dataframe(raw, hide_index=True)
if quality['제외 고객 수']:
    st.warning('제외 행이 있습니다. 비율 변화가 실제 이탈 변화인지 분모 변화인지 확인하세요.')
if clean.empty:
    st.warning('분석 가능한 고객이 없습니다.')
    st.stop()

def reset_filters():
    st.session_state['low'] = 0
    st.session_state['high'] = int(clean['tenure_months'].max())

if st.session_state.get('_signature') != signature:
    reset_filters()
    st.session_state['_signature'] = signature
st.sidebar.button('전체 조건', on_click=reset_filters)
low = st.sidebar.number_input('가입기간 최솟값', min_value=0, step=1, key='low')
high = st.sidebar.number_input('가입기간 최댓값', min_value=0, step=1, key='high')
try:
    selected = subset(clean, low, high)
except ValueError as exc:
    st.error(str(exc))
    st.stop()
s = summary(selected)
condition = f'가입기간 {low}–{high}개월'
st.subheader('현재 조건의 현황')
st.write(f'{choice} / {condition} / 선택 {s["n"]}명 / 정제 후 전체 {len(clean)}명')
a, b, c = st.columns(3)
a.metric('분석 고객 수', f'{s["n"]}명')
b.metric('이탈 비율', '계산 불가' if not s['n'] else f'{s["rate"]:.1f}%')
b.caption(f'이탈 {s["churn"]}명 / 현재 대상 {s["n"]}명')
c.metric('평균 월 청구 금액', '계산 불가' if not s['n'] else f'{s["mean"]:.1f} CU')
if selected.empty:
    st.info('조건에 맞는 고객이 없습니다. 전체 조건으로 돌아가거나 범위를 넓히세요.')
else:
    variable = st.selectbox('비교할 연속형 변수', ['monthly_charges', 'tenure_months', 'age'])
    label, unit = {'monthly_charges': ('월 청구 금액', 'CU'), 'tenure_months': ('가입기간', '개월'), 'age': ('연령', '세')}[variable]
    plot_df = selected.copy()
    plot_df['집단'] = plot_df['churn'].map({0: '유지', 1: '이탈'})
    counts = plot_df.groupby('집단')[variable].count()
    count_text = ' · '.join(f'{g} n={int(counts.get(g, 0))}' for g in ['유지', '이탈'])
    left, right = st.columns(2)
    left.plotly_chart(px.histogram(plot_df, x=variable, nbins=12,
        labels={variable: f'{label} ({unit})', 'count': '고객 수'}, title='선택 고객의 분포'), width='stretch')
    right.plotly_chart(px.box(plot_df, x='집단', y=variable, color='집단', points='all',
        color_discrete_map=COLORS, category_orders={'집단': ['유지', '이탈']},
        labels={variable: f'{label} ({unit})'}, title=f'집단별 분포 · {count_text}'), width='stretch')
    st.caption(f'차트 유효 관측값: {count_text}. 연령 결측은 연령 차트·검정에서 제외하며 핵심 KPI의 분모는 유지합니다.')
    st.dataframe(bands(selected), hide_index=True)
    st.subheader('확인 사실과 다음 조사')
    st.write(f'이 합성 자료에서 {condition} 고객 {s["n"]}명 중 {s["churn"]}명이 이탈해 {s["rate"]:.1f}%입니다.')
    st.write('원인은 확정할 수 없습니다. 실제 자료의 관찰기간·상품 구성·초기 이용 경험을 확인할 계획을 작성하세요.')
    with st.expander('선택 복습: 두 집단 평균 비교'):
        method = st.selectbox('검정 방식', ['Welch (기본)', 'Levene 분기 (학습 비교)'])
        result = compare_means(selected, variable, 'welch' if method.startswith('Welch') else 'levene_demo')
        if 'error' in result:
            st.info(result['error'])
        else:
            st.write(f'{result["name"]} 양측 검정 / 이탈 n={result["n_churn"]}, 유지 n={result["n_keep"]}')
            st.write(f't={result["t"]:.4f}, p={result["p"]:.4f}, 평균 차이(이탈−유지)={result["difference"]:.4f} {unit}')
            st.caption('독립성·분포·자료 수집 설계는 별도 점검합니다. p값은 원인이나 사업 효과의 크기가 아닙니다.')
    if 'contract_type' in selected:
        with st.expander('선택 복습: 계약유형과 이탈의 관련성'):
            ct = category_test(selected, 'contract_type')
            if 'error' in ct:
                st.info(ct['error'])
            else:
                st.dataframe(ct['observed'])
                st.write(f'χ²={ct["chi2"]:.4f}, p={ct["p"]:.4f}, 자유도={ct["dof"]}, 최소 기대빈도={ct["min_expected"]:.2f}')
                st.caption('연속성 보정 없는 학습 예제입니다. 독립 관측·기대빈도 조건을 확인하고 인과로 해석하지 않습니다.')
                if ct['min_expected'] < 5:
                    st.warning('기대빈도가 5 미만인 셀이 있습니다. 근사 검정의 적절성을 추가 검토하세요.')

st.divider()
st.subheader('갱신 모의시험: 새 자료를 반영해도 될까요?')
st.write('고정된 원본 8행의 메모리 사본으로 시험합니다. 위 현황 화면과 저장된 CSV는 바뀌지 않습니다.')
scenario = st.selectbox('모의 갱신 자료', SCENARIOS, key='scenario')
st.caption(f'선택한 시험: {scenario}')
st.text_area('결과를 보기 전에 예상과 판단을 적으세요', key='prediction',
    placeholder='예상 고객 수·이탈 수·비율 / 반영 가능 여부 / 확인할 담당자')
show = st.checkbox('예상을 작성한 뒤 결과 확인', key=f'reveal_{scenario}')
if show:
    try:
        baseline = pd.read_csv(ROOT / 'data' / 'validation_8rows.csv')
        outcome = inspect_update(baseline, scenario)
    except (ValueError, OSError, pd.errors.ParserError) as exc:
        st.error(f'모의시험 원자료 확인 필요: {exc}')
    else:
        st.write(f'모의 점검 판정: {outcome["status"]}')
        st.write(outcome['message'])
        if outcome['summary'] is not None:
            u = outcome['summary']
            st.write(outcome['quality'])
            st.write(f'후보 자료: {u["n"]}명 / 이탈 {u["churn"]}명 / {u["rate"]:.1f}% / 평균 {u["mean"]:.1f} CU')
            if outcome['quality']['제외 고객 수']:
                st.warning('이탈 수 3명은 그대로입니다. 3/8에서 3/7로 분모가 바뀌어 약 5.4%포인트 높아졌습니다. 실제 이탈 증가가 아닙니다.')
        else:
            st.warning('필수 열이 없어 후보 자료 분석을 중단했습니다. 후보 값은 표시하지 않습니다.')
        st.dataframe(outcome['candidate'], hide_index=True)
        st.download_button('시험 후보 CSV 내려받기', csv_bytes(outcome['candidate']),
            file_name='synthetic_candidate.csv', mime='text/csv')
        st.caption('이 버튼은 합성 시험 자료만 내려받습니다. 운영 자료 반영이나 자동 승인은 수행하지 않습니다.')
        record = {'시나리오': scenario, '예상': st.session_state.get('prediction', ''),
                  '점검 판정': outcome['status'], '후보 요약': outcome['summary'],
                  '원본 8행 식별값': fingerprint((ROOT/'data'/'validation_8rows.csv').read_bytes()),
                  '코드 버전': VERSION, '실제 기준일': '없음 — 합성 자료'}
        st.download_button('모의시험 기록 내려받기', json.dumps(record, ensure_ascii=False, indent=2),
            file_name='update_test_record.json', mime='application/json')

with st.expander('업무 인수인계안 작성·내려받기'):
    st.caption('작성 → 초안 저장 → 내려받기 순서로 진행합니다. 새로고침·종료 전 내려받으세요. 실제 승인·장기 저장 기능은 없습니다.')
    with st.form('handover_form'):
        fields = {}
        for i, name in enumerate(['팀·작성자·확인 시각', '지원할 판단과 해석의 한계', '갱신 주기·통과 조건',
            '자료 제공·품질 검증·업무 확인 담당', '실패 시 이전 자료 유지 또는 중단의 선택과 이유',
            '사용자 안내문', '정상본 위치·복원 절차·연락 담당', '조건부 행동·비교집단·관찰기간',
            '성과·비용·불편 지표와 미확정 사항']):
            fields[name] = st.text_area(name, key=f'handover_{i}')
        saved = st.form_submit_button('초안을 확인하고 저장', key='save_handover')
    if saved:
        fields['현재 화면의 자료·조건'] = f'{filename} / {signature} / {condition}'
        fields['코드 버전'] = VERSION
        fields['실제 데이터 기준일'] = '없음 — 학습용 합성 자료'
        st.session_state['handover_export'] = build_record(fields)
        st.success('초안을 저장했습니다. 아래 파일을 내려받아 확인하세요.')
    if 'handover_export' in st.session_state:
        st.caption('아래 파일은 마지막 저장한 초안입니다. 내용을 수정했다면 다시 저장하세요.')
        st.download_button('인수인계안 내려받기', st.session_state['handover_export'],
            file_name='handover.md', mime='text/markdown')
