"""Synthetic-data exercises only: inspect a candidate without replacing live data."""
from hashlib import sha256
from analysis_core import validate, summary


SCENARIOS = ['정상 8행', '필수 열 누락', 'T08 청구 금액 결측']


def fingerprint(payload):
    return sha256(payload).hexdigest()[:12]


def inspect_update(baseline, scenario):
    """Always copy baseline; no disk writes, activation or automatic approval."""
    if scenario not in SCENARIOS:
        raise ValueError('알 수 없는 모의시험입니다.')
    candidate = baseline.copy(deep=True)
    if scenario == SCENARIOS[1]:
        candidate = candidate.rename(columns={'churn': 'churn_typo'})
    elif scenario == SCENARIOS[2]:
        candidate.loc[candidate['customer_id'].eq('T08'), 'monthly_charges'] = float('nan')
    try:
        clean, quality, reasons = validate(candidate)
    except ValueError as exc:
        return {'status': '반영 보류', 'message': str(exc), 'candidate': candidate,
                'quality': None, 'summary': None, 'reasons': None}
    status = '업무 확인 필요' if quality['제외 고객 수'] else '기술 점검 통과'
    return {'status': status, 'message': '계산 통과와 업무 사용 승인은 별개입니다.',
            'candidate': candidate, 'quality': quality, 'summary': summary(clean),
            'reasons': reasons}


def csv_bytes(frame):
    return frame.to_csv(index=False).encode('utf-8-sig')


def build_record(fields):
    """Export a user's record; empty decisions stay visibly unconfirmed."""
    return '# 4차수 운영·인수인계 기록\n\n' + '\n\n'.join(
        f'## {label}\n{str(value).strip() or "미작성 — 확인 필요"}'
        for label, value in fields.items()) + '\n'
