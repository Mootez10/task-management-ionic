import * as functions from "firebase-functions/v1"; // ✅ use v1 explicitly
import * as admin from "firebase-admin";
import nodemailer from "nodemailer";

admin.initializeApp();

// ✅ Configure your Gmail credentials
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mootezaouinti1@gmail.com", // your Gmail
    pass: "zokdpqzorawslcvy",   // 🔒 use the app password, NOT your normal one
  },
});

// ✅ Firestore trigger: send email when new task is created
export const sendTaskEmail = functions.firestore
  .document("tasks/{taskId}")
  .onCreate(async (snapshot: functions.firestore.QueryDocumentSnapshot, context: functions.EventContext) => {
    const task = snapshot.data() as {
      title?: string;
      date?: string;
      description?: string;
      userEmail?: string;
    };

    if (!task) return;

    const mailOptions = {
      from: '"Task Manager App" <mootezaouinti1@gmail.com>',
      to: task.userEmail || "mootezaouinti1@gmail.com", // fallback to your email
      subject: `🕓 New Task Created: ${task.title || "Untitled"}`,
      text: `Hi Dorra,\n\nA new task was created:\n\nTitle: ${task.title}\nDate: ${task.date}\n\nDescription: ${task.description}\n\n– TeamFlow Task Manager`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully for task: ${task.title}`);
    } catch (error) {
      console.error("❌ Error sending email:", error);
    }
  });

