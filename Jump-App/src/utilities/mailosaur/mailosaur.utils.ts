import { ReplyFromMailosureData, SendEmailData } from '@interfaces/mailosaur.interface';
import { MessageCreateOptions } from 'mailosaur/lib/models';
import { Message } from 'mailosaur/lib/models'; // Importing Message type
import { mailosaur, serverId } from './mailosaur.settings';

// Function to send email with/ without attachment
export const sendEmail = async (sendEmailData: SendEmailData): Promise<Message> => {
  if (!serverId) {
    throw new Error('Mailosaur server ID is not defined.');
  }

  // Prepare message options, making the attachment optional
  const messageOptions: MessageCreateOptions = {
    attachments: sendEmailData.attachment || undefined, // If attachment is not provided, it will be undefined
    from: sendEmailData.from,
    html: sendEmailData.htmlContent,
    send: true,
    subject: sendEmailData.subject,
    text: sendEmailData.textContent,
    to: sendEmailData.to,
  };

  // Creating and returning the email message
  const response = await mailosaur.messages.create(serverId, messageOptions);
  return response;
};

// Function to get email by recipient email address
export const getEmailByRecipient = async (recipientEmail: string, timeout: number = 60000): Promise<Message> => {
  if (!serverId) {
    throw new Error('Mailosaur server ID is not defined.');
  }

  // Extract an email address if a whole message/body was passed by mistake
  const emailMatch = recipientEmail.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+/);
  const sentTo = emailMatch ? emailMatch[0] : recipientEmail;

  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const email = await mailosaur.messages.get(serverId, {
        sentTo,
      });

      if (email) {
        return email;
      }
    } catch (error) {
      console.error(`Error while fetching email for recipient ${sentTo}: ${error.message}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Retry every second
  }

  throw new Error(`Timeout exceeded while waiting for email sent to ${sentTo}.`);
};

// Function to get email ID by recipient email address
export const getEmailIdByRecipient = async (recipientEmail: string, timeout: number = 60000): Promise<string> => {
  try {
    const email = await getEmailByRecipient(recipientEmail, timeout);

    if (!email.id) {
      throw new Error(`No email found for recipient ${recipientEmail}.`);
    }

    // Return the email ID
    return email.id;
  } catch (error) {
    throw new Error(`Error fetching email ID for recipient ${recipientEmail}: ${error.message}`);
  }
};

 /**
 * Gets the verification link from the email and deletes all emails afterwards
 */
export const getVerificationLink = async (emailAddress: string): Promise<string> => {
  if (!mailosaur) {
      throw new Error('Mailosaur not configured. Please set MAILOSAUR_API_KEY environment variable.');
  }

  try {
      const email = await getEmailByRecipient(emailAddress);
      if (!email) {
        throw new Error(`No email found for recipient ${emailAddress}.`);
      }

      // Debug: show all links Mailosaur detected
      if (email.html?.links) {
          email.html.links.forEach((l: { text: any; href: any; }, index: number) =>
              console.log(`  ${index + 1}. Text: "${l.text}" (length: ${l.text?.length}), Href: "${l.href}"`)
          );
      } else {
        throw new Error("No HTML links found in email");
      }
      
      // Debug: show complete HTML body
      if (email.html?.body) {
          console.log("📧 COMPLETE HTML BODY:");
          console.log("=".repeat(80));
          console.log(email.html.body);
          console.log("=".repeat(80));
      } else {
        throw new Error("No HTML body found in email");
      }
      
      // Debug: show complete text body
      if (email.text?.body) {
          console.log("📧 COMPLETE TEXT BODY:");
          console.log("=".repeat(80));
          console.log(email.text.body);
          console.log("=".repeat(80));
      } else {
        throw new Error("No text body found in email");
      }
      
      // Debug: show complete email object structure
      console.log("📧 COMPLETE EMAIL OBJECT:");
      console.log("=".repeat(80));
      console.log(JSON.stringify(email, null, 2));
      console.log("=".repeat(80));

      const body = email.html?.body || email.text?.body || '';

      // Look for any tracking URL that might contain the verification link
      const trackingUrlMatch = body.match(/(https?:\/\/[^\s"<>]*awstrack\.me[^\s"<>]*)/i);
      if (trackingUrlMatch && trackingUrlMatch[1]) {
          console.log('✅ Found tracking URL (will redirect to verification):', trackingUrlMatch[1]);
          console.log(`🔗 Final Verification URL: ${trackingUrlMatch[1]}`);
          return trackingUrlMatch[1];
      }
      
      // Option C: Look for any URL in the email content as fallback
      const urlMatch = body.match(/(https?:\/\/[^\s"<>]+)/i);
      if (urlMatch && urlMatch[1]) {
          console.log('✅ Found URL in email content (fallback):', urlMatch[1]);
          console.log(`🔗 Final Verification URL: ${urlMatch[1]}`);
          return urlMatch[1];
      }

      // Option B: "Click Here" link (case-insensitive, with flexible whitespace)
      const linkFromHtml = email.html?.links?.find(
          (l: { text: string }) => l.text?.toLowerCase().trim() === "click here"
      )?.href;

      if (linkFromHtml) {
          console.log('✅ Extracted link under { Click Here }:', linkFromHtml);
          console.log(`🔗 Final Verification URL: ${linkFromHtml}`);
          return linkFromHtml;
      }

      // Option C: Regex from HTML body (more flexible)
      const htmlBody = email.html?.body || "";
      const regex = /<a[^>]*href="([^"]+)"[^>]*>\s*Click\s+Here\s*<\/a>/i;
      const match = htmlBody.match(regex);

      if (match && match[1]) {
          console.log('✅ Extracted link from raw HTML body:', match[1]);
          console.log(`🔗 Final Verification URL: ${match[1]}`);
          return match[1];
      }

      // Option D: Fallback — any verification-like link
      if (email.html?.links?.length) {
          const verificationLink = email.html.links.find((l: { href: string }) =>
              l.href?.toLowerCase().includes("verify") ||
              l.href?.toLowerCase().includes("confirm") ||
              l.href?.toLowerCase().includes("activate")
          );
          if (verificationLink) {
              console.log('✅ Found verification-related link:', verificationLink.href);
              console.log(`🔗 Final Verification URL: ${verificationLink.href}`);
              return verificationLink.href || '';
          }
      }

      throw new Error('No verification link found in email');
  } catch (error) {
    throw new Error(`Error extracting verification link: ${error.message}`);
  }
};

// Function to delete all emails for the server (cleanup)
export const deleteAllEmails = async (): Promise<void> => {
  if (!mailosaur) {
    throw new Error('Mailosaur not configured, skipping email deletion');
      return;
  }

  try {
      await mailosaur.messages.deleteAll(serverId!);
      throw new Error('All emails deleted from Mailosaur server');
  } catch (error) {
    throw new Error(`Error deleting emails: ${error.message}`);

  }
}

// Function to reply to email (uses getEmailIdByRecipient)
export const replyToEmail = async (
  recipientEmail: string,
  replyFromMailosureData: ReplyFromMailosureData,
): Promise<void> => {
  if (!serverId) {
    throw new Error('Mailosaur server ID is not defined.');
  }

  try {
    const emailId = await getEmailIdByRecipient(recipientEmail);

    const messageOptions = {
      html: replyFromMailosureData.htmlContent,
      text: replyFromMailosureData.textContent,
    };

    await mailosaur.messages.reply(emailId, messageOptions);
  } catch (error) {
    throw new Error(`Error replying to email: ${error.message}`);
  }
};
