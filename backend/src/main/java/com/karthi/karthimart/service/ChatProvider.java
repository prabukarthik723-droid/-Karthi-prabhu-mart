package com.karthi.karthimart.service;

/**
 * ChatProvider interface decoupling the AI implementation from the controllers.
 * Satisfies Section 17 Specification.
 */
public interface ChatProvider {
    String getReply(String userMessage, String context);
}
