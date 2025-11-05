import * as React from "react";
import { Html, Head, Body, Container, Section, Text, Hr, Heading, Button } from "@react-email/components";

export default function JobPostSuccessEmail({ name, title, company, location, date, status, jobUrl }: { name: string; title: string; company: string; location: string; date: string; status: string, jobUrl: string }) {

  if (status == "PUBLISHED") {
    return (
      <Html>
        <Head />
        <Body style={{ backgroundColor: "#f9fafb", fontFamily: "Inter, sans-serif" }}>
          <Container style={{ margin: "0 auto", maxWidth: "600px", backgroundColor: "#ffffff", borderRadius: "8px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <Heading style={{ color: "#111827", fontSize: "24px", marginBottom: "16px" }}>
              Your Job Post is Live Now!
            </Heading>
            <Text style={{ fontSize: "16px", color: "#374151", marginBottom: "12px" }}>
              Hi {name || "there"},
            </Text>
            <Text style={{ fontSize: "16px", color: "#374151" }}>
              Your job post has been successfully published. Here are the details:
            </Text>

            <Section style={{ backgroundColor: "#f3f4f6", borderRadius: "8px", padding: "16px", marginTop: "16px" }}>
              <Text><strong>Title:</strong> {title}</Text>
              <Text><strong>Company:</strong> {company}</Text>
              <Text><strong>Location:</strong> ${location}</Text>
              <Text><strong>Date:</strong> {date}</Text>
            </Section>

            <Hr style={{ borderColor: "#e5e7eb", marginTop: "24px", marginBottom: "24px" }} />

            <Button
              href={jobUrl}
              style={{
                backgroundColor: "#2563eb",
                color: "#ffffff",
                padding: "12px 24px",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "16px",
              }}
            >
              View Your Job Post
            </Button>

            <Text style={{ fontSize: "14px", color: "#6b7280", marginTop: "24px" }}>
              Thank you for using Iftekhars Job Portal!
            </Text>
          </Container>
        </Body>
      </Html>
    );

  } else {
    return (
      <Html>
        <Head />
        <Body style={{ backgroundColor: "#f9fafb", fontFamily: "Inter, sans-serif" }}>
          <Container style={{ margin: "0 auto", maxWidth: "600px", backgroundColor: "#ffffff", borderRadius: "8px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <Heading style={{ color: "#111827", fontSize: "24px", marginBottom: "16px" }}>
              Your Job Post Was Rejected!
            </Heading>
            <Text style={{ fontSize: "16px", color: "#374151", marginBottom: "12px" }}>
              Hi {name || "there"},
            </Text>
            <Text style={{ fontSize: "16px", color: "#374151" }}>
              We’re sorry, but your job post didn’t meet our publishing criteria
              and has been rejected. Here are the details:
            </Text>

            <Section style={{ backgroundColor: "#f3f4f6", borderRadius: "8px", padding: "16px", marginTop: "16px" }}>
              <Text><strong>Title:</strong> {title}</Text>
              <Text><strong>Company:</strong> {company}</Text>
              <Text><strong>Location:</strong> ${location}</Text>
              <Text><strong>Date:</strong> {date}</Text>
            </Section>

            <Hr style={{ borderColor: "#e5e7eb", marginTop: "24px", marginBottom: "24px" }} />

            <Text
              style={{
                fontSize: "16px",
                color: "#374151",
                marginBottom: "16px",
              }}
            >
              You can review your post, make changes, and resubmit for
              approval using the button below:
            </Text>

            <Button
              href={jobUrl}
              style={{
                backgroundColor: "#2563eb",
                color: "#ffffff",
                padding: "12px 24px",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "16px",
              }}
            >
              Review Your Job Post
            </Button>

            <Text style={{ fontSize: "14px", color: "#6b7280", marginTop: "24px" }}>
              Thank you for using Iftekhars Job Portal!
            </Text>
          </Container>
        </Body>
      </Html>
    );
  };
};
