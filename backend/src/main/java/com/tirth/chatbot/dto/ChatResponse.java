package com.tirth.chatbot.dto;

/** Reply sent back to the frontend. The frontend reads {@code answer}. */
public class ChatResponse {
    public String answer;
    public boolean fromLlm;

    public ChatResponse() { }

    public ChatResponse(String answer, boolean fromLlm) {
        this.answer = answer;
        this.fromLlm = fromLlm;
    }

    public String getAnswer() { return answer; }
    public boolean isFromLlm() { return fromLlm; }
}
