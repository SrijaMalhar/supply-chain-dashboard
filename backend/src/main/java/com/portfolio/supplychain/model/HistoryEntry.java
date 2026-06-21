package com.portfolio.supplychain.model;

/**
 * A single audit log entry for a spare part.
 * Not a JPA entity — stored in memory only, resets on restart.
 */
public class HistoryEntry {

    private Long id;
    private String event;
    private String note;
    private String timestamp;

    public HistoryEntry(Long id, String event, String note, String timestamp) {
        this.id = id;
        this.event = event;
        this.note = note;
        this.timestamp = timestamp;
    }

    public Long getId() { return id; }
    public String getEvent() { return event; }
    public String getNote() { return note; }
    public String getTimestamp() { return timestamp; }
}
