package com.tirth.chatbot.dto;

/** A message submitted through the portfolio contact form. */
public class ContactMessage {
    public String name;
    public String email;
    public String message;

    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getMessage() { return message; }
}
