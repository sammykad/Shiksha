import { Document, Page, View, Text, StyleSheet, Image, Svg, Path } from '@react-pdf/renderer';
import { ID_CARD_MOTTO } from '@/constants';

const CARD_WIDTH = 360;
const CARD_HEIGHT = 228;
const HEADER_HEIGHT = 72;
const DIVIDER_HEIGHT = 1;
const BODY_HEIGHT = 115;
const FOOTER_HEIGHT = 40;

const ROLE_COLORS: Record<string, { primary: string; light: string; dark: string }> = {
  STUDENT: { primary: '#059669', light: '#d1fae5', dark: '#064e3b' },
  TEACHER: { primary: '#2563eb', light: '#dbeafe', dark: '#1e3a5f' },
  ADMIN: { primary: '#7c3aed', light: '#ede9fe', dark: '#4c1d95' },
  PARENT: { primary: '#d97706', light: '#fef3c7', dark: '#78350f' },
};

const styles = StyleSheet.create({
  page: { padding: 16, backgroundColor: '#f1f5f9' },
  card: { width: CARD_WIDTH, height: CARD_HEIGHT, overflow: 'hidden', backgroundColor: '#ffffff', borderWidth: 2, borderColor: '#e2e8f0' },

  /* Header - px-5 pt-5 pb-3 = 20px horizontal, 20px top, 12px bottom */
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start' },
  logoImage: { width: 48, height: 48, borderRadius: 12 },
  shieldBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  orgInfo: { flex: 1, marginLeft: 12 },
  orgName: { fontSize: 15, fontWeight: 'bold', color: '#0f172a' },
  orgAddress: { fontSize: 11, color: '#64748b', marginTop: 2 },
  orgContactRow: { flexDirection: 'row', marginTop: 6 },
  orgContactItem: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  orgContactText: { fontSize: 11, color: '#94a3b8', marginLeft: 4 },
  yearBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  yearBadgeText: { fontSize: 12, fontWeight: 'bold', color: '#ffffff' },

  /* Divider - mx-5 = 20px horizontal */
  divider: { marginHorizontal: 20, height: 1 },

  /* Body - p-5 = 20px all around, gap-4 = 16px */
  body: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  photoBox: { width: 80, height: 96, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, marginRight: 16 },
  initials: { fontSize: 28, fontWeight: 'bold' },
  info: { flex: 1, marginRight: 16 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6, marginTop: 6, marginBottom: 6 },
  roleBadgeText: { fontSize: 10, fontWeight: 'bold' },
  detailLine: { flexDirection: 'row', marginBottom: 1 },
  detailLabel: { fontSize: 12, fontWeight: 'bold', color: '#334155' },
  detailValue: { fontSize: 12, color: '#475569' },
  qrBox: { width: 80, height: 80, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, backgroundColor: '#ffffff', overflow: 'hidden' },
  qrImage: { width: 70, height: 70 },

  /* Footer - h-10 = 40px */
  footer: { height: 40, justifyContent: 'center', alignItems: 'center' },
  footerText: { fontSize: 11, fontWeight: 'bold', color: '#ffffff', letterSpacing: 2 },
});

interface IdCardPDFProps {
  person: { firstName: string; lastName: string; profileImage?: string; details: Record<string, string | undefined> };
  organization: { name: string; logo?: string; address?: string; phone?: string; website?: string };
  cardNumber: string;
  academicYear: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'PARENT';
  motto?: string;
  qrCodeDataUrl?: string;
}

const ShieldSvg: React.FC<{ color: string }> = ({ color }) => (
  <Svg width="28" height="28" viewBox="0 0 24 24">
    <Path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" fill={color} opacity={0.15} stroke={color} strokeWidth={1.5} />
    <Path d="M9 12l2 2 4-4" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Svg>
);

const PhoneIconSvg: React.FC<{ color: string }> = ({ color }) => (
  <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
  </Svg>
);

const GlobeIconSvg: React.FC<{ color: string }> = ({ color }) => (
  <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
    <Path d="M2 12h20" />
    <Path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </Svg>
);

export const IdCardPDF: React.FC<IdCardPDFProps> = ({ person, organization, cardNumber, academicYear, role, motto, qrCodeDataUrl }) => {
  const c = ROLE_COLORS[role] || ROLE_COLORS.STUDENT;
  const displayMotto = motto || ID_CARD_MOTTO[role] || ID_CARD_MOTTO.STUDENT;
  const dividerColor = c.primary + '30';
  const borderColor = c.primary + '40';

  const details = Object.entries(person.details).filter(([, v]) => v !== undefined);

  return (
    <Document>
      <Page size={[CARD_WIDTH + 32, CARD_HEIGHT + 32]} style={styles.page}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerRow}>
              {organization.logo ? (
                <Image src={organization.logo} style={styles.logoImage} />
              ) : (
                <View style={[styles.shieldBox, { backgroundColor: c.light }]}>
                  <ShieldSvg color={c.primary} />
                </View>
              )}
              <View style={styles.orgInfo}>
                <Text style={styles.orgName}>{organization.name}</Text>
                {organization.address && <Text style={styles.orgAddress}>{organization.address}</Text>}
                {(organization.phone || organization.website) && (
                  <View style={styles.orgContactRow}>
                    {organization.phone && (
                      <View style={styles.orgContactItem}>
                        <PhoneIconSvg color="#94a3b8" />
                        <Text style={styles.orgContactText}>{organization.phone}</Text>
                      </View>
                    )}
                    {organization.website && (
                      <View style={styles.orgContactItem}>
                        <GlobeIconSvg color="#94a3b8" />
                        <Text style={styles.orgContactText}>{organization.website}</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
              <View style={[styles.yearBadge, { backgroundColor: c.primary }]}>
                <Text style={styles.yearBadgeText}>{academicYear}</Text>
              </View>
            </View>
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />

          {/* Body */}
          <View style={styles.body}>
            {/* Photo */}
            <View style={[styles.photoBox, { backgroundColor: c.light, borderColor }]}>
              {person.profileImage ? (
                <Image src={person.profileImage} style={{ width: 80, height: 96, borderRadius: 12, objectFit: 'cover' }} />
              ) : (
                <Text style={[styles.initials, { color: c.primary }]}>{(person.firstName?.[0] || '')}{(person.lastName?.[0] || '')}</Text>
              )}
            </View>

            {/* Info */}
            <View style={styles.info}>
              <Text style={styles.name}>{person.firstName || ''} {person.lastName || ''}</Text>
              <View style={[styles.roleBadge, { backgroundColor: c.light, color: c.primary }]}>
                <Text style={styles.roleBadgeText}>{role}</Text>
              </View>
              {details.map(([label, value]) => (
                <View key={label} style={styles.detailLine}>
                  <Text style={styles.detailLabel}>{label}:</Text>
                  <Text style={styles.detailValue}> {value}</Text>
                </View>
              ))}
            </View>

            {/* QR Code */}
            <View style={[styles.qrBox, { borderColor }]}>
              {qrCodeDataUrl ? (
                <Image src={qrCodeDataUrl} style={styles.qrImage} />
              ) : (
                <Text style={{ fontSize: 10, color: '#94a3b8' }}>QR</Text>
              )}
            </View>
          </View>

          {/* Footer Wave */}
          <View style={styles.footer}>
            <Svg width={CARD_WIDTH} height={40} viewBox="0 0 400 40" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0 }}>
              <Path d="M0,8 C80,0 120,18 200,8 C280,0 320,18 400,8 L400,40 L0,40 Z" fill={c.primary} />
            </Svg>
            <Text style={styles.footerText}>{displayMotto}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
