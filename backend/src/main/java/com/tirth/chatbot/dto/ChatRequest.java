package com.tirth.chatbot.dto;

/** Incoming chat message from the portfolio frontend. */
public class ChatRequest {
    public String question;

    public ChatRequest() { }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }
}
