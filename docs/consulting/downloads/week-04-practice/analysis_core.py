"""Shared calculations for the week 2-4 synthetic-data exercises."""
import numpy as np
import pandas as pd
from scipy import stats

REQUIRED = ['customer_id', 'age', 'tenure_months', 'monthly_charges', 'churn']

def validate(raw):
    missing = [c for c in REQUIRED if c not in raw]
    if missing:
        raise ValueError('필수 열 누락: ' + ', '.join(missing))
    df = raw.copy()
    ids = df['customer_id'].astype('string').str.strip()
    if ids.isna().any() or ids.eq('').any():
        raise ValueError('고객 ID가 누락되었습니다. 원자료를 수정하세요.')
    if ids.duplicated().any():
        raise ValueError('고객 ID가 중복되었습니다. 원자료를 수정하세요.')
    df['customer_id'] = ids
    for c in ['age', 'tenure_months', 'monthly_charges', 'churn']:
        df[c] = pd.to_numeric(df[c], errors='coerce')
    tenure = df['tenure_months']
    reasons = pd.DataFrame({
        '이탈 값 오류': ~df['churn'].isin([0, 1]),
        '가입기간 오류': ~(np.isfinite(tenure) & (tenure >= 0) & (tenure % 1 == 0)),
        '청구 금액 오류': ~(np.isfinite(df['monthly_charges']) & (df['monthly_charges'] >= 0)),
    }, index=df.index)
    excluded = reasons.any(axis=1)
    quality = {'원본 고객 수': len(raw), '제외 고객 수': int(excluded.sum()),
               '분석 가능 고객 수': int((~excluded).sum()),
               '연령 결측·비유한 값 수': int((~np.isfinite(df['age'])).sum())}
    df.loc[~np.isfinite(df['age']), 'age'] = np.nan
    return df.loc[~excluded].copy(), quality, reasons.sum().astype(int)

def subset(df, low, high):
    if low < 0 or high < low:
        raise ValueError('가입기간 최솟값·최댓값을 확인하세요.')
    return df.loc[df['tenure_months'].between(low, high, inclusive='both')].copy()

def summary(df):
    n = len(df)
    k = int(df['churn'].sum()) if n else 0
    return {'n': n, 'churn': k, 'rate': 100 * k / n if n else None,
            'mean': float(df['monthly_charges'].mean()) if n else None}

def bands(df):
    labels = ['0–11개월', '12–23개월', '24개월 이상']
    out=[]
    for lo, hi, label in [(0, 11, labels[0]), (12, 23, labels[1]), (24, np.inf, labels[2])]:
        s = summary(df.loc[df['tenure_months'].between(lo, hi)])
        out.append({'가입기간': label, '고객 수': s['n'], '이탈 수': s['churn'],
                    '이탈 비율(%)': s['rate']})
    return pd.DataFrame(out)

def compare_means(df, variable, method='welch'):
    a = df.loc[df['churn'].eq(1), variable].dropna().to_numpy(float)
    b = df.loc[df['churn'].eq(0), variable].dropna().to_numpy(float)
    a, b = a[np.isfinite(a)], b[np.isfinite(b)]
    if len(a)<2 or len(b)<2:
        return {'error':'각 집단에 유효 관측값이 두 개 이상 필요합니다.'}
    if np.var(a, ddof=1)==0 or np.var(b, ddof=1)==0:
        return {'error':'분산이 0인 집단이 있습니다. 이번 예제는 검정을 생략합니다.'}
    deviations=[np.abs(a-np.median(a)),np.abs(b-np.median(b))]
    if all(np.var(x,ddof=1)==0 for x in deviations):
        levene_p=None
    else:
        lv=stats.levene(a, b, center='median')
        levene_p=float(lv.pvalue) if np.isfinite(lv.pvalue) else None
    if method=='levene_demo' and levene_p is None:
        return {'error':'중앙값 편차의 변동이 없어 Levene을 계산할 수 없습니다. Welch 방식과 자료 전제를 확인하세요.'}
    equal_var = bool(method=='levene_demo' and levene_p >= .05)
    result=stats.ttest_ind(a,b,equal_var=equal_var,alternative='two-sided')
    if not np.isfinite(result.statistic) or not np.isfinite(result.pvalue):
        return {'error':'유한한 검정 결과를 얻지 못했습니다. 자료와 전제를 확인하세요.'}
    return {'name':'Student' if equal_var else 'Welch', 't':float(result.statistic),
            'p':float(result.pvalue), 'levene_p':levene_p,
            'difference':float(a.mean()-b.mean()), 'n_churn':len(a), 'n_keep':len(b)}

def category_test(df, column):
    if column not in df:
        return {'error':'이 자료에는 해당 범주형 변수가 없습니다.'}
    valid = df.loc[df[column].notna()].copy()
    observed=pd.crosstab(valid[column], valid['churn'])
    if observed.shape[0]<2 or observed.shape[1]<2:
        return {'error':'행과 열에 두 개 이상의 범주가 필요합니다.'}
    chi,p,dof,expected=stats.chi2_contingency(observed, correction=False)
    return {'observed':observed,'chi2':float(chi),'p':float(p),'dof':int(dof),
            'min_expected':float(expected.min()),'n':len(valid)}
