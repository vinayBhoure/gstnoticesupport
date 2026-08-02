import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

export type SupportRequestEmailProps = {
  name: string;
  email: string;
  mobile: string;
  title: string;
  message: string;
};

const NAVY = '#0A2540';
const GREEN = '#0B8B4E';
const NEUTRAL_600 = '#5A6878';
const NEUTRAL_200 = '#E5E9F0';
const NEUTRAL_50 = '#F7F9FC';

export function SupportRequestEmail({
  name,
  email,
  mobile,
  title,
  message,
}: SupportRequestEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New Help &amp; Support request from {name}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Text style={eyebrow}>GST NOTICE SUPPORT</Text>
            <Heading style={heading}>New Help &amp; Support Request</Heading>
          </Section>

          <Section style={card}>
            <Field label="Name" value={name} />
            <Field label="Email" value={email} />
            <Field label="Mobile" value={mobile} />
            <Hr style={divider} />
            <Text style={fieldLabel}>Title</Text>
            <Text style={fieldValue}>{title}</Text>
            <Hr style={divider} />
            <Text style={fieldLabel}>Message</Text>
            <Text style={queryText}>{message}</Text>
          </Section>

          <Text style={footer}>
            This request was submitted from the Help &amp; Support page on the logged-in
            dashboard. Reply directly to this email to respond to {name}.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <Section style={fieldRow}>
      <Text style={fieldLabel}>{label}</Text>
      <Text style={fieldValue}>{value}</Text>
    </Section>
  );
}

const body: React.CSSProperties = {
  backgroundColor: NEUTRAL_50,
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  padding: '24px 0',
};

const container: React.CSSProperties = {
  maxWidth: '560px',
  margin: '0 auto',
  padding: '0 16px',
};

const header: React.CSSProperties = {
  padding: '8px 0 16px',
};

const eyebrow: React.CSSProperties = {
  color: GREEN,
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.1em',
  margin: '0 0 6px',
};

const heading: React.CSSProperties = {
  color: NAVY,
  fontSize: '22px',
  fontWeight: 700,
  margin: 0,
};

const card: React.CSSProperties = {
  backgroundColor: '#ffffff',
  border: `1px solid ${NEUTRAL_200}`,
  borderRadius: '10px',
  padding: '24px',
};

const fieldRow: React.CSSProperties = {
  marginBottom: '14px',
};

const fieldLabel: React.CSSProperties = {
  color: NEUTRAL_600,
  fontSize: '12px',
  fontWeight: 600,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  margin: '0 0 2px',
};

const fieldValue: React.CSSProperties = {
  color: NAVY,
  fontSize: '15px',
  fontWeight: 500,
  margin: 0,
};

const queryText: React.CSSProperties = {
  color: NAVY,
  fontSize: '15px',
  lineHeight: 1.6,
  margin: '4px 0 0',
  whiteSpace: 'pre-wrap',
};

const divider: React.CSSProperties = {
  borderColor: NEUTRAL_200,
  margin: '18px 0',
};

const footer: React.CSSProperties = {
  color: NEUTRAL_600,
  fontSize: '13px',
  lineHeight: 1.6,
  margin: '20px 4px 0',
};
