package com.tirth.chatbot.controller;

import com.tirth.chatbot.service.VisitService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;

/** Live visitor analytics API. */
@RestController
@RequestMapping("/api")
public class VisitController {

    private final VisitService visits;

    public VisitController(VisitService visits) {
        this.visits = visits;
    }

    @PostMapping("/visits")
    public Map<String, Object> visit(HttpServletRequest request) {
        visits.record(hash(clientIp(request)));
        return visits.stats();
    }

    @GetMapping("/stats")
    public Map<String, Object> stats() {
        return visits.stats();
    }

    @GetMapping("/status")
    public Map<String, Object> status() {
        return visits.status();
    }

    private String clientIp(HttpServletRequest req) {
        String xff = req.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) return xff.split(",")[0].trim();
        return req.getRemoteAddr();
    }

    /** SHA-256 hash so raw IPs are never stored. */
    private String hash(String ip) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] d = md.digest(ip.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : d) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            return Integer.toHexString(ip.hashCode());
        }
    }
}
