package com.karthi.karthimart.filter;

import com.karthi.karthimart.model.User;
import com.karthi.karthimart.util.JsonUtil;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

/**
 * AuthFilter enforcing session validation on protected routes.
 * Satisfies Mandatory Engineering Rule 3 & Security Checklist.
 */
@WebFilter("/api/v1/protected/*")
public class AuthFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) {}

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse resp = (HttpServletResponse) response;

        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("currentUser") == null) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_UNAUTHORIZED, "UNAUTHENTICATED", "Authentication required to access this endpoint");
            return;
        }

        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {}
}
