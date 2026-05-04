import { Document, Page, View, Text, Image, StyleSheet, Font, Svg, Path } from '@react-pdf/renderer';
import phetsarathRegular from '../../assets/fonts/Phetsarath-Regular.ttf';
import phetsarathBold from '../../assets/fonts/Phetsarath-Bold.ttf';
import cscLogo from '../../assets/Logo/CSC_LOGO_HD.png';

Font.register({
  family: 'Phetsarath',
  fonts: [
    { src: phetsarathRegular, fontWeight: 'normal' },
    { src: phetsarathBold, fontWeight: 'bold' },
  ],
});

/* ─── Measurements (pt) ─── */
const PAGE_W = 595.28;   // 210mm
const HEADER_H = 110;
const FOOTER_H = 95;
const MARGIN_X = 51;     // ~18mm

const s = StyleSheet.create({
  /* Page has ZERO padding — absolute elements span full width */
  page: {
    fontFamily: 'Phetsarath',
    fontSize: 10,
    color: '#111',
    position: 'relative',
  },

  /* ── Header (fixed = repeats every page) ── */
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: PAGE_W,
    height: HEADER_H,
  },
  logo: {
    position: 'absolute',
    left: 22,
    top: 6,
    width: 66,
    height: 66,
  },
  headerTextWrap: {
    alignItems: 'center',
    paddingTop: 11,
  },
  headerT1: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0F75BC',
    lineHeight: 1.3,
  },
  headerT2: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0F75BC',
    marginTop: 4,
    lineHeight: 1.3,
  },
  headerLines: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: PAGE_W,
    height: 60,
  },

  /* ── Footer (fixed) ── */
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: PAGE_W,
    height: FOOTER_H,
  },
  footerSvg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: PAGE_W,
    height: FOOTER_H,
  },
  footerTopRow: {
    position: 'absolute',
    top: 6,
    left: 22,
    right: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerTopTxt: { fontSize: 8, color: '#0F75BC', fontWeight: 'bold' },
  footerBotRow: {
    position: 'absolute',
    bottom: 6,
    left: 22,
    right: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  footerBotTxt: { fontSize: 8.5, color: '#fff', fontWeight: 'bold' },
  footerBotSub: { fontSize: 7.5, color: 'rgba(255,255,255,0.85)', marginTop: 1 },

  /* ── Content area (pushed down by margin to avoid header/footer) ── */
  body: {
    marginTop: HEADER_H,
    marginBottom: FOOTER_H,
    marginHorizontal: MARGIN_X,
  },

  /* ── Content styles ── */
  docNoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 9,
    marginBottom: 6,
  },
  docNoLeft: { marginLeft: 80 },
  docNoRight: { alignItems: 'flex-end', marginRight: 30 },
  heading: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 6,
  },
  fieldRow: { flexDirection: 'row', marginBottom: 2 },
  fieldLabel: { fontWeight: 'bold', color: '#000' },
  fieldVal: { flex: 1 },
  bodyText: { textIndent: 20, marginTop: 4, lineHeight: 1.6 },

  /* ── Table ── */
  tableSection: { marginTop: 5 },
  tableTitle: { fontSize: 9.5, fontWeight: 'bold', marginBottom: 3 },
  tableRowView: { flexDirection: 'row' },
  tableCell: {
    borderWidth: 0.5,
    borderColor: '#000',
    paddingHorizontal: 3,
    paddingVertical: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableCellTxt: { fontSize: 8.5, textAlign: 'center', color: '#000' },

  /* ── Closing ── */
  remarkRow: { flexDirection: 'row', marginTop: 14 },
  remarkLabel: { marginLeft: 30, marginRight: 3, color: '#000' },
  remarkVal: { flex: 1 },
  closingPara: { textIndent: 20, marginTop: 8, lineHeight: 1.6 },
  closingRespect: { textAlign: 'right', fontSize: 9.5, marginTop: 4 },
  sigRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
  sigBox: { alignItems: 'center', width: 100 },
  sigLabel: { fontWeight: 'bold', fontSize: 9.5, textAlign: 'center' },
  sigName: { marginTop: 20, fontSize: 9, textAlign: 'center' },
});

/* ━━━━━━━━━━━━ Header ━━━━━━━━━━━━ */
function PDFHeader() {
  return (
    <View fixed style={s.header}>
      <Image src={cscLogo} style={s.logo} />
      <View style={s.headerTextWrap}>
        <Text style={s.headerT1}>ສາທາລະນະລັດ ປະຊາທິປະໄຕ ປະຊາຊົນລາວ</Text>
        <Text style={s.headerT2}>ສັນຕິພາບ ເອກະລາດ ປະຊາທິປະໄຕ ເອກະພາບ ວັດທະນະຖາວອນ</Text>
      </View>
      <View style={s.headerLines}>
        <Svg width={PAGE_W} height={30} viewBox={`0 0 ${PAGE_W} 30`}>
          <Path d={`M${PAGE_W} 4 L170 4 L140 22 L0 22`} stroke="#0F75BC" strokeWidth={3} fill="none" />
          <Path d={`M${PAGE_W} 8 L172 8 L142 26 L0 26`} stroke="#0F75BC" strokeWidth={2} fill="none" />
        </Svg>
      </View>
    </View>
  );
}

/* ━━━━━━━━━━━━ Footer ━━━━━━━━━━━━ */
function PDFFooter() {
  return (
    <View fixed style={s.footer}>
      <View style={s.footerSvg}>
        <Svg width={PAGE_W} height={FOOTER_H} viewBox="0 0 800 120">
          <Path d="M0 45 L500 45 C580 45 620 45 640 25 C660 5 660 0 680 0 L800 0" stroke="#0F75BC" strokeWidth="8" fill="none" />
          <Path d="M0 60 L500 60 C580 60 620 60 645 40 C665 23 665 15 680 15 L800 15 L800 120 L0 120 Z" fill="#0F75BC" />
        </Svg>
      </View>
      <View style={s.footerTopRow}>
        <Text style={s.footerTopTxt}>http://csccomplex-center.com</Text>
        <Text style={[s.footerTopTxt, { marginRight: 80 }]}>csc complex center Co.,Ltd</Text>
      </View>
      <View style={s.footerBotRow}>
        <View>
          <Text style={s.footerBotTxt}>ຊີເອັສຊີ ນະຄອນຫຼວງວຽງຈັນ ຈຳກັດຜູ້ດຽວ</Text>
          <Text style={s.footerBotSub}>ຕັ້ງຢູ່ ຖະໜົນ 450 ປີ, ບ້ານ ໂຊກໃຫຍ່, ເມືອງ ໄຊເສດຖາ, ນະຄອນຫຼວງວຽງຈັນ</Text>
        </View>
        <Text style={s.footerBotTxt}>021 463 555-57</Text>
      </View>
    </View>
  );
}

/* ━━━━━━━━━━━━ Table ━━━━━━━━━━━━ */
function PDFTable({ section }) {
  const cells = section.cells || [];
  const maxCols = cells.reduce(
    (mx, row) => Math.max(mx, row.reduce((sum, c) => sum + (c?.colspan || 1), 0)), 0,
  );
  if (maxCols === 0) return null;

  return (
    <View style={s.tableSection}>
      {section.title ? <Text style={s.tableTitle}>➤ {section.title}</Text> : null}
      <View>
        {cells.map((row, ri) => (
          <View key={ri} style={s.tableRowView}>
            {row.map((cell, ci) => {
              if (!cell) return null;
              const w = `${((cell.colspan || 1) / maxCols) * 100}%`;
              const val = cell.value ?? (typeof cell === 'string' ? cell : '');
              return (
                <View key={ci} style={[s.tableCell, { width: w, backgroundColor: cell.bg || undefined }]}>
                  <Text style={[s.tableCellTxt, { color: cell.color || '#000' }]}>{String(val)}</Text>
                </View>
              );
            })}
          </View>
        ))}
        {section.summaryRow && (() => {
          const { label, labelColspan = 1, values = [] } = section.summaryRow;
          const single = `${(1 / maxCols) * 100}%`;
          const lw = `${(labelColspan / maxCols) * 100}%`;
          return (
            <View style={s.tableRowView}>
              <View style={[s.tableCell, { width: lw }]}>
                <Text style={[s.tableCellTxt, { fontWeight: 'bold' }]}>{label}</Text>
              </View>
              {values.map((v, vi) => (
                <View key={vi} style={[s.tableCell, { width: single }]}>
                  <Text style={[s.tableCellTxt, { fontWeight: 'bold' }]}>{String(v)}</Text>
                </View>
              ))}
            </View>
          );
        })()}
      </View>
    </View>
  );
}

/* ━━━━━━━━━━━━ Signature box ━━━━━━━━━━━━ */
function SignatureBox({ label, name }) {
  return (
    <View style={s.sigBox}>
      <Text style={s.sigLabel}>{label}</Text>
      <Text style={s.sigName}>{name || ''}</Text>
    </View>
  );
}

/* ━━━━━━━━━━━━ Main Document ━━━━━━━━━━━━ */
export default function DocumentPDF({
  reqTo = '',
  reqReason = '',
  references = [],
  bodyParagraph = '',
  remark = '',
  titleTableSections = [],
  reqNo = '',
  date = '',
  creatorName = '',
  signatureGroups = [],
}) {
  const sigGroups = signatureGroups.length > 0
    ? signatureGroups
    : [{ label: 'ຫົວໜ້າຝ່າຍໄອທີ', approverName: '' }, { label: 'ຜູ້ຈັດການສາຂາ', approverName: '' }];

  const firstRow = [...sigGroups.slice(0, 2), { label: 'ຜູ້ສະເໜີ', approverName: creatorName }];
  const rest = sigGroups.slice(2);
  const extraSigRows = [];
  for (let i = 0; i < rest.length; i += 3) extraSigRows.push(rest.slice(i, i + 3));

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* Header & Footer — absolute, full width, fixed on every page */}
        <PDFHeader />
        <PDFFooter />

        {/* Content — pushed down by margin */}
        <View style={s.body}>

          {/* Doc number row */}
          <View style={s.docNoRow}>
            <Text style={s.docNoLeft}>ຝ່າຍໃດໜຶ່ງ</Text>
            <View style={s.docNoRight}>
              <Text>ເລກທີ:{reqNo || 'ອກ'}</Text>
              <Text>ນະຄອນຫຼວງວຽງຈັນ, ວັນທີ:{date}</Text>
            </View>
          </View>

          <Text style={s.heading}>ໃບສະເໜີ</Text>

          {!!reqTo && (
            <View style={s.fieldRow}>
              <Text style={s.fieldLabel}>ຮຽນ : </Text>
              <Text style={s.fieldVal}>{reqTo}</Text>
            </View>
          )}

          {!!reqReason && (
            <View style={s.fieldRow}>
              <Text style={s.fieldLabel}>ເລື່ອງ : </Text>
              <Text style={s.fieldVal}>{reqReason}</Text>
            </View>
          )}

          {references.filter(r => r?.trim()).map((ref, i) => (
            <View key={i} style={s.fieldRow}>
              <Text style={s.fieldLabel}>ອີງຕາມ : </Text>
              <Text style={s.fieldVal}>{ref}</Text>
            </View>
          ))}

          {!!bodyParagraph && <Text style={s.bodyText}>{bodyParagraph}</Text>}

          {titleTableSections.map((sec, si) => (
            <PDFTable key={si} section={sec} />
          ))}

          {!!remark && (
            <View style={s.remarkRow}>
              <Text style={s.remarkLabel}>ໝາຍເຫດ:</Text>
              <Text style={s.remarkVal}>{remark}</Text>
            </View>
          )}

          <Text style={s.closingPara}>
            ດັ່ງນັ້ນ, ຂ້ານະເຈົ້າຈຶ່ງຂໍສະເໜີມາຍັງທ່ານ ເພື່ອພິຈາລະນາອະນຸມັດຕາມທີ່ເຫັນສົມຄວນດ້ວຍ.
          </Text>
          <Text style={s.closingRespect}>ຮຽນມາດ້ວຍຄວາມນັບຖື,</Text>

          <View style={s.sigRow}>
            {firstRow.map((box, i) => (
              <SignatureBox key={i} label={box.label} name={box.approverName} />
            ))}
          </View>

          {extraSigRows.map((row, ri) => (
            <View key={ri} style={s.sigRow}>
              {row.map((box, bi) => (
                <SignatureBox key={bi} label={box.label} name={box.approverName} />
              ))}
            </View>
          ))}

        </View>
      </Page>
    </Document>
  );
}
