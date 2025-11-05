import * as React from "react";
import { Html, Head, Body, Container, Heading, Text, Section, Hr} from "@react-email/components";

export default function AdminJobPostNotificationEmail( { adminName, job, user }: {adminName: string; job:{ title: string;  company: string;  location: string;  createdAt: string;  id: string;}; user:{  name: string;  email: string;}} ) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#f9fafb", fontFamily: "Inter, sans-serif" }}>
        <Container
          style={{
            backgroundColor: "#ffffff",
            maxWidth: "600px",
            margin: "0 auto",
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <Heading style={{ color: "#111827", fontSize: "22px" }}>
            New Job Post Live Notification
          </Heading>
          <Text style={{ color: "#374151", fontSize: "16px" }}>
            Hi {adminName},
          </Text>
          <Text style={{ color: "#374151", fontSize: "16px" }}>
            A new job post has just gone live on your platform:
          </Text>

          <Section
            style={{
              backgroundColor: "#f3f4f6",
              borderRadius: "8px",
              padding: "16px",
              marginTop: "16px",
            }}
          >
            <Text><strong>Title:</strong> {job.title}</Text>
            <Text><strong>Company:</strong> {job.company}</Text>
            <Text><strong>Location:</strong> ${job.location}</Text>
            <Text><strong>Date:</strong> {job.createdAt}</Text>
            <Text><strong>Job ID:</strong> {job.id}</Text>
          </Section>

          <Hr style={{ borderColor: "#e5e7eb", marginTop: "24px", marginBottom: "24px" }} />

          <Text style={{ color: "#374151", fontSize: "16px" }}>
            <strong>Posted by:</strong>
          </Text>
          <Text>{user.name || "Unknown User"}</Text>
          <Text>{user.email}</Text>

          <Hr style={{ borderColor: "#e5e7eb", marginTop: "24px" }} />
          <Text style={{ color: "#6b7280", fontSize: "14px", marginTop: "12px" }}>
            This is an automated notification from your Job Portal system.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
