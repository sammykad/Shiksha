import {
  Document,
  Page,
  View,
  Text,
  Image,
} from '@react-pdf/renderer';
import { tw, COLORS } from '@/lib/pdf-generator/tw'; // your built-in tw

// ── Role config ────────────────────────────────────────────────────────────────
export const ROLE_COLORS = {
  STUDENT: {
    primary: '#10b981',       // emerald-500
    light: '#d1fae5',         // emerald-100
    text: '#065f46',          // emerald-900
    badgeBg: '#d1fae5',
    badgeText: '#065f46',
  },
  TEACHER: {
    primary: '#2563eb',       // blue-600
    light: '#dbeafe',         // blue-100
    text: '#1e3a8a',          // blue-900
    badgeBg: '#dbeafe',
    badgeText: '#1e3a8a',
  },
} as const;

// ── Types ──────────────────────────────────────────────────────────────────────
export interface IdCardPDFProps {
  person: {
    firstName: string;
    lastName: string;
    profileImage?: string;
    details: Record<string, string>;
  };
  organization: {
    name: string;
    logo?: string;
    phone?: string;
    website?: string;
  };
  cardNumber: string;
  academicYear: string;
  role: 'STUDENT' | 'TEACHER';
  motto: string;
  qrCodeDataUrl: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function IdCardPDF({
  person,
  organization,
  cardNumber,
  academicYear,
  role,
  motto,
  qrCodeDataUrl,
}: IdCardPDFProps) {
  const rc = ROLE_COLORS[role];
  const initials = `${person.firstName[0] ?? ''}${person.lastName[0] ?? ''}`.toUpperCase();
  const fullName = `${person.firstName} ${person.lastName}`;

  return (
    <Document>
      {/* Credit-card landscape: 85.6 × 54 mm in pt = 242 × 153 pt */}
      <Page
        size={{ width: 242, height: 153 }}
        style={tw('bg-white')}
      >
        {/* ── Outer card border ─────────────────────────────────────── */}
        <View
          style={{
            ...tw('flex-col w-full h-full rounded-lg overflow-hidden'),
            borderWidth: 1.5,
            borderColor: rc.primary,
            borderRadius: 8,
          }}
        >

          {/* ── TOP ACCENT BAR ─────────────────────────────────────── */}
          <View style={{ backgroundColor: rc.primary, height: 3 }} />

          {/* ── HEADER: org logo + name + year badge ───────────────── */}
          <View
            style={{
              ...tw('flex-row items-center px-3 py-2'),
              gap: 6,
              borderBottomWidth: 1,
              borderBottomColor: COLORS.rule,
            }}
          >
            {/* Logo */}
            {organization.logo ? (
              <Image
                src={organization.logo}
                style={{ width: 22, height: 22, borderRadius: 4 }}
              />
            ) : (
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 4,
                  backgroundColor: rc.light,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 8, fontFamily: 'Geist', fontWeight: 700, color: rc.primary }}>
                  {organization.name[0]}
                </Text>
              </View>
            )}

            {/* Org name + contact */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: 'Geist',
                  fontWeight: 700,
                  fontSize: 7.5,
                  color: COLORS.ink,
                  lineHeight: 1.3,
                }}
              >
                {organization.name}
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 1 }}>
                {organization.phone && (
                  <Text style={{ fontFamily: 'Geist', fontSize: 6, color: COLORS.muted }}>
                    ✆ {organization.phone}
                  </Text>
                )}
                {organization.website && (
                  <Text style={{ fontFamily: 'Geist', fontSize: 6, color: rc.primary }}>
                    ⊕ {organization.website}
                  </Text>
                )}
              </View>
            </View>

            {/* Academic year badge */}
            <View
              style={{
                backgroundColor: rc.primary,
                borderRadius: 4,
                paddingHorizontal: 6,
                paddingVertical: 3,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Geist',
                  fontWeight: 700,
                  fontSize: 7,
                  color: COLORS.white,
                }}
              >
                {academicYear}
              </Text>
            </View>
          </View>

          {/* ── BODY ───────────────────────────────────────────────── */}
          <View style={{ ...tw('flex-row flex-1 px-3 py-2'), gap: 8 }}>

            {/* Left: avatar + details */}
            <View style={{ flex: 1, flexDirection: 'row', gap: 8 }}>

              {/* Avatar box */}
              {person.profileImage ? (
                <Image
                  src={person.profileImage}
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 6,
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <View
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 6,
                    backgroundColor: rc.light,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'Geist',
                      fontWeight: 700,
                      fontSize: 14,
                      color: rc.primary,
                    }}
                  >
                    {initials}
                  </Text>
                </View>
              )}

              {/* Name + role badge + details */}
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: 'Geist',
                    fontWeight: 700,
                    fontSize: 10,
                    color: COLORS.ink,
                    marginBottom: 2,
                  }}
                >
                  {fullName}
                </Text>

                {/* Role badge */}
                <View
                  style={{
                    backgroundColor: rc.badgeBg,
                    borderRadius: 3,
                    paddingHorizontal: 5,
                    paddingVertical: 1.5,
                    alignSelf: 'flex-start',
                    marginBottom: 5,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'Geist',
                      fontWeight: 600,
                      fontSize: 5.5,
                      color: rc.badgeText,
                      letterSpacing: 0.5,
                    }}
                  >
                    {role}
                  </Text>
                </View>

                {/* Detail rows */}
                {Object.entries(person.details).map(([label, value]) => (
                  <View
                    key={label}
                    style={{ flexDirection: 'row', marginBottom: 1.5 }}
                  >
                    <Text
                      style={{
                        fontFamily: 'Geist',
                        fontWeight: 600,
                        fontSize: 6.5,
                        color: COLORS.body,
                        width: 52,
                      }}
                    >
                      {label}:
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'Geist',
                        fontWeight: 400,
                        fontSize: 6.5,
                        color: COLORS.ink,
                        flex: 1,
                      }}
                    >
                      {value}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Right: QR code */}
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Image
                src={qrCodeDataUrl}
                style={{ width: 40, height: 40 }}
              />
            </View>
          </View>

          {/* ── FOOTER: motto bar ──────────────────────────────────── */}
          <View
            style={{
              backgroundColor: rc.primary,
              paddingVertical: 5,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: 'Geist',
                fontWeight: 600,
                fontSize: 7,
                color: COLORS.white,
                letterSpacing: 1,
              }}
            >
              {motto}
            </Text>
          </View>

        </View>
      </Page>
    </Document>
  );
}