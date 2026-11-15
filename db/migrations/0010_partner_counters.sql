-- Partnership cards: replace the fixed "5 · Years supported" with a counter that updates every month.
-- Jara Beach Resort since February 2022, Lufasi Lodges since April 2026 (4 yrs 9 mos and 7 months in November 2026).
update cms_projects set
  stats = (select jsonb_agg(case when s->>'label' = 'Years supported'
      then jsonb_build_object('value', case slug when 'jara-beach-resort' then 'since 2022-02' else 'since 2026-04' end, 'label', 'As their technology partner')
      else s end order by n)
    from jsonb_array_elements(stats) with ordinality t(s, n)),
  updated_at = now()
where slug in ('jara-beach-resort', 'lufasi-lodges') and stats @> '[{"label": "Years supported"}]';
