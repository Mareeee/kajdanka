package kajdanka.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kajdanka.entity.User;
import kajdanka.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class GuestTokenFilter extends OncePerRequestFilter {

    private static final String COOKIE_NAME = "anon_token";
    private static final Duration COOKIE_MAX_AGE = Duration.ofDays(395);

    private final UserRepository userRepository;

    @Value("${app.cookie.secure:false}")
    private boolean secureCookie;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        try {
            Long userId = resolveAuthenticatedUserId();
            if (userId != null) {
                CurrentActor.setUserId(userId);
            } else {
                String anonToken = resolveOrIssueAnonToken(request, response);
                CurrentActor.setAnonToken(anonToken);
            }
            filterChain.doFilter(request, response);
        } finally {
            CurrentActor.clear();
        }
    }

    private Long resolveAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        Object principal = authentication.getPrincipal();
        if (principal == null || "anonymousUser".equals(principal)) {
            return null;
        }
        return userRepository.findByEmail(authentication.getName())
                .map(User::getId)
                .orElse(null);
    }

    private String resolveOrIssueAnonToken(HttpServletRequest request, HttpServletResponse response) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (COOKIE_NAME.equals(cookie.getName()) && cookie.getValue() != null && !cookie.getValue().isBlank()) {
                    return cookie.getValue();
                }
            }
        }
        String newToken = UUID.randomUUID().toString();
        ResponseCookie responseCookie = ResponseCookie.from(COOKIE_NAME, newToken)
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite("Lax")
                .path("/")
                .maxAge(COOKIE_MAX_AGE)
                .build();
        response.addHeader("Set-Cookie", responseCookie.toString());
        return newToken;
    }
}