package com.tirth.chatbot.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * In-memory visitor analytics.
 * Unique visitors are counted by a HASHED IP (never the raw IP) — DPDP-friendly.
 * (Swap this for Redis/PostgreSQL later for persistence across restarts.)
 */
@Service
public class VisitService {

    private final long startTime = System.currentTimeMillis();
    private final AtomicLong total = new AtomicLong();
    private final AtomicLong today = new AtomicLong();
    private volatile String todayDate = LocalDate.now().toString();

    private final Set<String> uniqueHashes = ConcurrentHashMap.newKeySet();
    private final Map<String, Long> lastSeen = new ConcurrentHashMap<>();

    /** Record a visit from a hashed IP. */
    public void record(String ipHash) {
        total.incrementAndGet();
        uniqueHashes.add(ipHash);
        lastSeen.put(ipHash, System.currentTimeMillis());

        String d = LocalDate.now().toString();
        if (!d.equals(todayDate)) {
            synchronized (this) {
                if (!d.equals(todayDate)) { todayDate = d; today.set(0); }
            }
        }
        today.incrementAndGet();
    }

    public Map<String, Object> stats() {
        long now = System.currentTimeMillis();
        long online = lastSeen.values().stream().filter(t -> now - t < 120_000).count();
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("total", total.get());
        m.put("unique", uniqueHashes.size());
        m.put("today", today.get());
        m.put("online", Math.max(online, 1));   // at least the current viewer
        return m;
    }

    public Map<String, Object> status() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("status", "up");
        m.put("uptimeSeconds", (System.currentTimeMillis() - startTime) / 1000);
        m.put("time", Instant.now().toString());
        return m;
    }
}
