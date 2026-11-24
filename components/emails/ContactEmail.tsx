import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
} from "react-email"
import type { ContactFormData } from "@/lib/types"

interface ContactEmailProps {
  data: ContactFormData
}

export function ContactEmail({ data }: ContactEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#faf9f6", fontFamily: "Inter, sans-serif" }}>
        <Container
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            padding: "40px 20px",
          }}
        >
          <Heading
            style={{
              fontSize: "22px",
              fontWeight: "700",
              color: "#1a1a1a",
              marginBottom: "4px",
            }}
          >
            🐝 New Contact Message
          </Heading>
          <Text style={{ color: "#888", marginBottom: "24px", fontSize: "13px" }}>
            Via HoneyBee Designs contact form
          </Text>

          <Section
            style={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              padding: "20px",
              border: "1px solid #e8e4de",
            }}
          >
            <Text style={{ margin: "0 0 4px", fontSize: "12px", color: "#888" }}>
              FROM
            </Text>
            <Text style={{ margin: "0 0 16px", fontWeight: "600" }}>
              {data.name} &lt;{data.email}&gt;
            </Text>

            {data.customRequest && (
              <>
                <Text style={{ margin: "0 0 4px", fontSize: "12px", color: "#888" }}>
                  CUSTOM REQUEST
                </Text>
                <Text style={{ margin: "0 0 16px" }}>{data.customRequest}</Text>
              </>
            )}

            <Text style={{ margin: "0 0 4px", fontSize: "12px", color: "#888" }}>
              MESSAGE
            </Text>
            <Text style={{ margin: "0", whiteSpace: "pre-wrap" }}>
              {data.message}
            </Text>
          </Section>

          <Hr style={{ borderTop: "1px solid #e8e4de", margin: "32px 0 16px" }} />
          <Text style={{ fontSize: "12px", color: "#999", textAlign: "center" }}>
            HoneyBee Designs · hello@honeybeedesigns.com
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default ContactEmail
