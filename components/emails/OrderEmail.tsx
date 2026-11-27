import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Row,
  Column,
} from "react-email"
import type { CartItem } from "@/lib/types"

interface OrderEmailProps {
  orderNumber: string
  customerName: string
  items: CartItem[]
  total: number
  shippingAddress?: string
}

export function OrderEmail({
  orderNumber,
  customerName,
  items,
  total,
  shippingAddress,
}: OrderEmailProps) {
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
              fontSize: "24px",
              fontWeight: "700",
              color: "#1a1a1a",
              marginBottom: "8px",
            }}
          >
            🐝 Order Confirmed!
          </Heading>
          <Text style={{ color: "#555", marginBottom: "24px" }}>
            Hi {customerName}, your order #{orderNumber} is confirmed and being
            prepared.
          </Text>

          <Section
            style={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              padding: "20px",
              border: "1px solid #e8e4de",
            }}
          >
            <Heading
              as="h2"
              style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px" }}
            >
              Order Summary
            </Heading>
            {items.map((item) => (
              <Row key={item.variantId} style={{ marginBottom: "8px" }}>
                <Column>
                  <Text style={{ margin: "0", fontSize: "14px" }}>
                    {item.title}
                    {item.variantTitle !== "Default" && ` — ${item.variantTitle}`}
                    {" "}× {item.quantity}
                  </Text>
                </Column>
                <Column style={{ textAlign: "right" }}>
                  <Text style={{ margin: "0", fontSize: "14px", fontWeight: "600" }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </Text>
                </Column>
              </Row>
            ))}
            <Hr style={{ borderColor: "#e8e4de", margin: "12px 0" }} />
            <Row>
              <Column>
                <Text style={{ margin: "0", fontWeight: "700" }}>Total</Text>
              </Column>
              <Column style={{ textAlign: "right" }}>
                <Text
                  style={{ margin: "0", fontWeight: "700", color: "#c6920a" }}
                >
                  ${total.toFixed(2)}
                </Text>
              </Column>
            </Row>
          </Section>

          {shippingAddress && (
            <Section style={{ marginTop: "20px" }}>
              <Heading
                as="h2"
                style={{ fontSize: "16px", fontWeight: "600", marginBottom: "4px" }}
              >
                Shipping To
              </Heading>
              <Text style={{ color: "#555", whiteSpace: "pre-line" }}>
                {shippingAddress}
              </Text>
            </Section>
          )}

          <Hr style={{ borderColor: "#e8e4de", margin: "32px 0 16px" }} />
          <Text style={{ fontSize: "12px", color: "#999", textAlign: "center" }}>
            HoneyBee Designs · hello@honeybeedesigns.com
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default OrderEmail
