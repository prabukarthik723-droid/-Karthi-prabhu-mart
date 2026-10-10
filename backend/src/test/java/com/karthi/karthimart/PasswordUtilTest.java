package com.karthi.karthimart;

import com.karthi.karthimart.util.PasswordUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests validating PasswordUtil and BCrypt security requirements.
 */
class PasswordUtilTest {

    @Test
    @DisplayName("Password hashing should generate valid BCrypt hash")
    void testHashPassword() {
        String plain = "Secret123!";
        String hashed = PasswordUtil.hashPassword(plain);

        assertNotNull(hashed);
        assertTrue(hashed.startsWith("$2a$10$"));
        assertTrue(PasswordUtil.checkPassword(plain, hashed));
    }

    @Test
    @DisplayName("Invalid password candidate should fail verification")
    void testInvalidPasswordCheck() {
        String plain = "Secret123!";
        String hashed = PasswordUtil.hashPassword(plain);

        assertFalse(PasswordUtil.checkPassword("WrongPassword", hashed));
    }

    @Test
    @DisplayName("Empty password input should throw IllegalArgumentException")
    void testEmptyPasswordException() {
        assertThrows(IllegalArgumentException.class, () -> PasswordUtil.hashPassword(""));
    }
}
