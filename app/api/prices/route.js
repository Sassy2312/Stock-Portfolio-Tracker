import { NextResponse } from 'next/server';

export async function GET() {
  const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRgoHIl_PJoLDIk-7zwobM4Z2VVRRn6CDlVhTwN2cBzLkWcixEChWqGWfYrM_gNjruRXcSeWX7LMWmn/pub?gid=1839365475&single=true&output=csv';

  try {
    const res = await fetch(url);
    const csv = await res.text();

    const rows = csv.trim().split('\n').slice(1); // skip header
    const prices = {};

    rows.forEach(row => {
      const cols = row.split(',');
      const ticker = cols[0]?.trim();
      const price = parseFloat(cols[1]);
      if (ticker && !isNaN(price)) {
        prices[ticker] = price;
      }
    });

    return NextResponse.json({ success: true, data: prices });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
