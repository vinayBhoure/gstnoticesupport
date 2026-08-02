import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

export type SupportConfirmationEmailProps = {
  name: string;
  title: string;
};

const NAVY = '#0A2540';
const GREEN = '#0B8B4E';
const NEUTRAL_600 = '#5A6878';
const NEUTRAL_200 = '#E5E9F0';
const NEUTRAL_50 = '#F7F9FC';

export function SupportConfirmationEmail({ name, title }: SupportConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>We&apos;ve received your query — GST Notice Support</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Text style={eyebrow}>GST NOTICE SUPPORT</Text>
            <Heading style={heading}>We&apos;ve Received Your Query</Heading>
          </Section>

          <Section style={card}>
            <Text style={bodyText}>Hi {name},</Text>
            <Text style={bodyText}>
              Thank you for reaching out. We&apos;ve received your query{' '}
              <strong>&ldquo;{title}&rdquo;</strong> and our team will get back to you soon.
            </Text>
          </Section>

          <Text style={footer}>
            This is an automated confirmation from gstnoticesupport.in. No action is needed
            from you right now.
          </Text>
        </Container>
      </Body>
    </Html>
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

const bodyText: React.CSSProperties = {
  color: NAVY,
  fontSize: '15px',
  lineHeight: 1.6,
  margin: '0 0 12px',
};

const footer: React.CSSProperties = {
  color: NEUTRAL_600,
  fontSize: '13px',
  lineHeight: 1.6,
  margin: '20px 4px 0',
};
