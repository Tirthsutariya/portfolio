package com.tirth.chatbot.controller;

import com.tirth.chatbot.dto.ContactMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Receives contact-form submissions and EMAILS them straight to Tirth.
 * Nothing is stored in a database. (WhatsApp delivery is handled on the frontend.)
 * Email works once MAIL_USER / MAIL_PASS env vars are set; otherwise it's skipped
 * gracefully and the WhatsApp path still delivers the message.
 */
@RestController
@RequestMapping("/api")
public class ContactController {

    private static final Logger log = LoggerFactory.getLogger(ContactController.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String from;

    @Value("${contact.notify-email:}")
    private String notifyEmail;

    public ContactController(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @PostMapping("/contact")
    public Map<String, Object> contact(@RequestBody ContactMessage msg) {
        if (msg.name == null || msg.message == null || msg.name.isBlank() || msg.message.isBlank()) {
            return Map.of("ok", false, "message", "Please fill in your name and a message.");
        }

        boolean emailed = false;
        if (from != null && !from.isBlank()) {
            try {
                String to = (notifyEmail == null || notifyEmail.isBlank()) ? from : notifyEmail;
                SimpleMailMessage mail = new SimpleMailMessage();
                mail.setFrom(from);
                mail.setTo(to);
                if (msg.email != null && !msg.email.isBlank()) mail.setReplyTo(msg.email);
                mail.setSubject("📬 Portfolio message from " + msg.name);
                mail.setText("Name: " + msg.name + "\n"
                           + "Email: " + (msg.email == null ? "-" : msg.email) + "\n\n"
                           + msg.message);
                mailSender.send(mail);
                emailed = true;
            } catch (Exception e) {
                log.warn("Contact email failed (WhatsApp fallback still works): {}", e.getMessage());
            }
        }

        String reply = emailed
                ? "Thanks, " + msg.name + "! Your message was emailed to Tirth. 🚀"
                : "Thanks, " + msg.name + "! Please also tap “Send on WhatsApp” so it reaches me. 👉";
        return Map.of("ok", true, "emailed", emailed, "message", reply);
    }
}
