#!/usr/bin/env python3
"""
Parse AESENERGY LLC Chase business-checking statements into categorized
transactions, validate every section against the bank's printed control
totals, and write data.json + embed.json.

Add a new month:
  1. Drop the PDF in ./statements/  (name it YYYY-MM-Name.pdf).
  2. Add an entry to FILES, MONTH_LABEL, CONTROL and SUMMARY below
     (the CONTROL/SUMMARY numbers come from the statement's CHECKING SUMMARY box).
  3. Run:  python3 parse.py       -> rewrites data.json / embed.json
          python3 build.py       -> rebuilds dashboard.html
     Then republish dashboard.html to the same artifact URL.

The script refuses to write if any section's transaction count or total does
not match the bank's printed figure, so a parsing error can never slip through.
"""
import pdfplumber, re, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "statements")

# month key -> statement filename in ./statements/
FILES = {
    "2026-01": "2026-01-January.pdf",
    "2026-02": "2026-02-February.pdf",
    "2026-03": "2026-03-March.pdf",
    "2026-04": "2026-04-April.pdf",
    "2026-05": "2026-05-May.pdf",
    "2026-06": "2026-06-June.pdf",
    "2026-07": "2026-07-July.pdf",
}
MONTH_LABEL = {
    "2026-01": "Jan 2026", "2026-02": "Feb 2026", "2026-03": "Mar 2026",
    "2026-04": "Apr 2026", "2026-05": "May 2026", "2026-06": "Jun 2026", "2026-07": "Jul 2026",
}
# Printed control totals (count, amount) per section, for validation.
CONTROL = {
    "2026-01": {"deposits": (7, 30040.00), "electronic": (21, 22110.00), "other": (1, 7800.00), "fees": (4, 98.74), "atm": (0, 0.0)},
    "2026-02": {"deposits": (14, 24884.13), "atm": (29, 1340.42), "electronic": (34, 23068.00), "other": (1, 150.00), "fees": (3, 28.32)},
    "2026-03": {"deposits": (32, 149532.14), "atm": (148, 24341.93), "electronic": (72, 123785.00), "fees": (16, 370.87), "other": (0, 0.0)},
    "2026-04": {"deposits": (23, 119532.49), "atm": (180, 20589.07), "electronic": (59, 97082.00), "fees": (11, 174.19), "other": (0, 0.0)},
    "2026-05": {"deposits": (20, 108180.51), "atm": (130, 19757.85), "electronic": (21, 36340.00), "other": (1, 8000.00), "fees": (22, 668.86)},
    "2026-06": {"deposits": (43, 165471.51), "atm": (209, 80967.53), "electronic": (77, 106947.00), "other": (6, 23500.00), "fees": (16, 234.00)},
    "2026-07": {"deposits": (25, 110635.43), "atm": (197, 29106.11), "electronic": (38, 68215.00), "other": (1, 1500.00), "fees": (22, 464.67)},
}
SUMMARY = {  # beginning/ending balance per month
    "2026-01": (22.75, 54.01), "2026-02": (54.01, 351.40), "2026-03": (351.40, 1385.74),
    "2026-04": (1385.74, 3072.97), "2026-05": (3072.97, 46486.77),
    "2026-06": (46486.77, 309.75), "2026-07": (309.75, 11659.40),
}

AMT_RE = re.compile(r'^(\d{2}/\d{2})\s+(.*?)\s+\$?([\d,]+\.\d{2})$')

def detect_section(line):
    u = line.upper()
    if 'DEPOSITS AND ADDITIONS' in u: return 'deposits'
    if 'ATM & DEBIT CARD WITHDRAWALS' in u: return 'atm'
    if 'ELECTRONIC WITHDRAWALS' in u: return 'electronic'
    if 'OTHER WITHDRAWALS' in u: return 'other'
    if u.strip() == 'FEES' or 'FEES DATE DESCRIPTION' in u: return 'fees'
    if 'DAILY ENDING BALANCE' in u: return 'balance'
    if 'CHECKING SUMMARY' in u or 'DISCLOSURE' in u or 'IN CASE OF ERRORS' in u: return 'stop'
    if 'ATM & DEBIT CARD SUMMARY' in u or 'ATM & DEBIT CARD TOTALS' in u: return 'stop'
    return None

def parse_pdf(path):
    lines = []
    with pdfplumber.open(path) as pdf:
        for p in pdf.pages:
            lines.extend((p.extract_text() or '').split('\n'))
    return lines

def extract(month, path):
    lines = parse_pdf(path)
    section = None
    txns = []
    for raw in lines:
        line = raw.strip()
        if not line:
            continue
        sec = detect_section(line)
        if sec is not None:
            section = None if sec == 'stop' else sec
            continue
        if section in (None, 'balance'):
            if line.lower().startswith('*') and 'deposit' in line.lower():
                m = re.search(r'(\d{2}/\d{2})\s+(.*?)\s+([\d,]+\.\d{2})$', line)
                if m:
                    txns.append(_mk(month, 'deposits', m.group(1), m.group(2), m.group(3)))
            continue
        if line.lower().startswith('total '):
            continue
        m = AMT_RE.match(line)
        if m:
            txns.append(_mk(month, section, m.group(1), m.group(2), m.group(3)))
        elif line.lower().startswith('*'):
            m2 = re.search(r'(\d{2}/\d{2})\s+(.*?)\s+([\d,]+\.\d{2})$', line)
            if m2:
                txns.append(_mk(month, section, m2.group(1), m2.group(2), m2.group(3)))
    return txns

def _mk(month, section, mmdd, desc, amt):
    amount = float(amt.replace(',', ''))
    mm, dd = mmdd.split('/')
    kind = 'revenue' if section == 'deposits' else 'expense'
    return {"month": month, "section": section, "date": f"2026-{mm}-{dd}", "mmdd": mmdd,
            "description": re.sub(r'\s+', ' ', desc).strip(), "amount": round(amount, 2), "kind": kind}

# ---------------- Categorization ----------------
def categorize(t):
    d = t["description"].lower()
    sec = t["section"]

    if sec == 'deposits':
        if any(k in d for k in ['chips credit','book transfer credit','online domestic wire','wire transfer','fedwire','real time transfer','real time payment']):
            return ('Incoming Wires', 'Customer wires, Fedwire, CHIPS & instant transfers')
        if 'payment received' in d and 'cash app' in d:
            return ('Cash App / P2P In', 'Inbound Cash App / P2P receipts')
        if 'zelle payment from' in d and 'souadou' in d:
            return ('Owner Contributions', 'Owner / related-party deposits (Souadou Bah)')
        if 'zelle payment from' in d:
            return ('Zelle Received', 'Inbound Zelle transfers')
        if 'online transfer from mma' in d:
            return ('Internal Transfer In', 'Transfer from linked MMA account')
        if 'purchase return' in d or 'card purchase return' in d:
            return ('Refunds & Returns', 'Merchant refunds / returns')
        if 'atm cash deposit' in d or 'cash deposit' in d:
            return ('Cash Deposits', 'ATM / branch cash deposits')
        if d.startswith('deposit') or 'deposit ' in d:
            return ('Check & Mobile Deposits', 'Deposited checks / items')
        if 'orig co name' in d or 'acctverify' in d:
            return ('Other Income', 'Misc credits')
        return ('Other Income', 'Uncategorized credit')

    if sec == 'fees':
        return ('Bank Fees & Charges', 'Chase fees, overdraft, wire & ATM fees')
    if sec == 'other':
        return ('Cash Withdrawals', 'Counter / teller cash withdrawal')
    if sec == 'electronic':
        if 'online transfer to mma' in d:
            return ('Internal Transfer Out', 'Transfer to linked MMA account')
        if any(k in d for k in ['shine logistics','oakland warehouse','7villages','7villagesshipp','ticaju','h s carriers','oceanpath','ati ocean',' ati ','to ati','sam used auto','marp cargo']):
            return ('Shipping & Logistics', 'Freight, warehousing & carriers')
        if 'first america' in d:
            return ('Suppliers & Inventory', 'Vendor wire (First America)')
        if any(k in d for k in ['solar','santan','good sun','yuma','grec','jeiser','a.s.i cyber','asi cyber']):
            return ('Solar & Equipment Suppliers', 'Solar panels, inverters & equipment')
        if 'my new place owner' in d or 'matress' in d or 'mattress' in d:
            return ('Rent & Facilities', 'Rent / facilities')
        if any(k in d for k in ['souadou','my wife','my father','my new place','capital one']):
            return ('Owner & Family Draws', 'Owner / related-party transfers')
        if 'zelle payment to' in d or 'online domestic wire' in d or 'wire transfer' in d:
            return ('Contractor & Vendor Payments', 'Zelle / wires to workers & vendors')
        return ('Other Payments', 'Uncategorized electronic payment')

    # ATM & debit card purchases
    if 'atm withdrawal' in d or 'atm withdraw' in d or 'non-chase atm withdraw' in d or 'cash back' in d:
        return ('Cash Withdrawals', 'ATM cash withdrawals')
    if 'apple cash' in d or 'cash app' in d:
        return ('Owner & Family Draws', 'Apple Cash / Cash App transfers')
    if any(k in d for k in ['sunoco','phillips 66','shell ','exxon','circle k','circlek','speedway',' qt ','qt 1433','go! gas','y&m gas','chevron','bp#','petr','gas & food','gas station','texaco','quiktrip','wawa']):
        return ('Fuel & Gas', 'Vehicle fuel')
    if any(k in d for k in ['expedia','cheapoair','delta air','swa inflight','inflight wifi','economy inn','ramada','inn ','hotel','motel','bay breeze','nu car rental','wyndham','airport','airlines','maggiano','dfw','phx',
                            'days inn','daystop','american air','united 0','united.com','ua inflt','southwes','greyhound','odysea','boardwalk','national forest','aquarium']):
        return ('Travel & Lodging', 'Flights, hotels & car rental')
    if any(k in d for k in ['uber','lyft','mta','e-z*pass','ezpass','e-z pass','tsa ','nyc boot','sheriff','booting','toll','paygo','penske','portcheck','pierpass','parking','iah ']):
        return ('Transportation & Tolls', 'Rideshare, tolls, parking & trucking')
    if any(k in d for k in ['t-mobile','tmobile','comcast','xfinity','vectrafon','centerpoint','energy']):
        return ('Telecom & Utilities', 'Phone, internet & utilities')
    if any(k in d for k in ['google *workspace','workspace','apple.com/bill','wix.com','linkedin','cloaked','clear *','clearme','experian','myfico','comcast','amazon prime','prime video','amzn.com/bill','kalshi']):
        return ('Software & Subscriptions', 'SaaS, subscriptions & online services')
    if 'extra space' in d:
        return ('Rent & Facilities', 'Storage unit rental')
    if 'progressive' in d or 'insurance' in d or ' ins ' in d:
        return ('Insurance', 'Business insurance')
    if 'tiktok' in d:
        return ('E-commerce & Marketing', 'TikTok Shop purchases')
    if any(k in d for k in ['maersk','ubox','cargo','total quality logisti','logisti','freight']):
        return ('Shipping & Logistics', 'Freight & container costs')
    if any(k in d for k in ['home depot','best buy','a.s.i cyber','asi cyber','apple store','ace hardware','arties','tractor supply','herc rentals','bro retail','hardware']):
        return ('Suppliers & Inventory', 'Equipment, tools & hardware')
    if any(k in d for k in ['deli','restaurant','restau','grocery','market','halal','meat','poultry','buffet','pizza','burger','mcdonald','chick-fil-a','chick fil','subway','jersey mike','pollo','wingstop','panda express','jade palace','applebee','safeway','food city','ctown','dollar general','wal-mart','walmart','wm supercenter','supercenter','target t-','frys','fry','kitchen','cuisine','cafe','coff','snack','juice','gourmet','sonic','sq *','tst*','tst ','cinema','chuck e cheese','star cinema','auntie anne','feast wave','gohan','empire buffet','dragon gate','saba','biryani','kabab','curry','pintoh','oak town','castillo','super discount','bridge mart','alhayat','minto','bob marley','heaven creek','sam food','macombs','accra','creme of','surma','w & h2','angels naija','zola','ej beauty','uptown beauty','beauty supply','ross stores','de lauers','franklin mini','hunts point','pitkin','theville','new ivoire','quick snacks','mtr grocery','shake shack','first watch','hubcap','haha innovation','oak ',
                            'chipotle','waffle house','starbucks','smoothie king','tasty pot','india plaza','gen - tempe','cork & bottle','homemade taqueria','stop & go','fiesta mart','grubhub','antojitos','dalaba','domino','vape city','white cloud smoke','smoke shop','goodwill','walgreens','tractor sup','bebe','fresh','taqueria','convenienc','food mart','smoothie']):
        return ('Meals, Groceries & Retail', 'Food, groceries & retail purchases')
    return ('Other Card Purchases', 'Uncategorized card purchases')

def main():
    all_txns, report, allok = [], {}, True
    for month, fn in FILES.items():
        txns = extract(month, os.path.join(SRC, fn))
        secsum = {}
        for t in txns:
            secsum.setdefault(t["section"], [0, 0.0])
            secsum[t["section"]][0] += 1
            secsum[t["section"]][1] += t["amount"]
        report[month] = {}
        for sec, (cnt, amt) in CONTROL[month].items():
            got = secsum.get(sec, [0, 0.0])
            ok = (got[0] == cnt) and (abs(got[1] - amt) < 0.01)
            allok = allok and ok
            report[month][sec] = {"expected": [cnt, round(amt, 2)], "got": [got[0], round(got[1], 2)], "ok": ok}
        for t in txns:
            t["category"], t["subcategory"] = categorize(t)
        all_txns.extend(txns)

    print("VALIDATION (transaction count & total vs. bank's printed figures)")
    for month, r in report.items():
        for sec, v in r.items():
            print(f"  {'OK ' if v['ok'] else 'XX '}{month} {sec:11s} expected {v['expected']}  got {v['got']}")
    print("ALL SECTIONS MATCH:", allok, "| TOTAL TXNS:", len(all_txns))
    if not allok:
        raise SystemExit("Validation FAILED — not writing data files. Check CONTROL totals / parsing.")

    out = {
        "account": {"name": "AESENERGY LLC", "bank": "JPMorgan Chase", "type": "Business Complete Checking", "number_masked": "...1863"},
        "months": [{"key": k, "label": MONTH_LABEL[k], "begin": SUMMARY[k][0], "end": SUMMARY[k][1]} for k in FILES],
        "transactions": all_txns,
    }
    with open(os.path.join(HERE, "data.json"), "w") as f:
        json.dump(out, f, indent=1)
    compact = {"account": out["account"], "months": out["months"],
               "t": [[t['month'], t['section'], t['mmdd'], t['kind'], t['category'], t['description'], t['amount']] for t in all_txns]}
    with open(os.path.join(HERE, "embed.json"), "w") as f:
        json.dump(compact, f, separators=(',', ':'))
    print("Wrote data.json and embed.json")

if __name__ == "__main__":
    main()
