package kajdanka.service;

import kajdanka.dto.request.LoginRequest;
import kajdanka.dto.request.RefreshTokenRequest;
import kajdanka.dto.request.RegisterRequest;
import kajdanka.dto.response.AuthResponse;
import kajdanka.entity.EmailVerificationToken;
import kajdanka.entity.RefreshToken;
import kajdanka.entity.Role;
import kajdanka.entity.User;
import kajdanka.repository.EmailVerificationTokenRepository;
import kajdanka.repository.RefreshTokenRepository;
import kajdanka.repository.UserRepository;
import kajdanka.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final EmailVerificationTokenRepository verificationTokenRepository;
    private final EmailService emailService;

    @Value("${app.jwt.access-token-expiration}")
    private long accessTokenExpiration;

    @Value("${app.jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;

    @Value("${app.email.verification-expiration:86400000}")
    private long verificationExpiration;

    @Transactional
    public Map<String, String> register(RegisterRequest request) {

        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(Role.USER)
                .enabled(false)
                .build();

        userRepository.save(user);

        String tokenStr = UUID.randomUUID().toString();
        EmailVerificationToken token = EmailVerificationToken.builder()
                .token(tokenStr)
                .user(user)
                .expiresAt(Instant.now().plusMillis(verificationExpiration))
                .build();
        verificationTokenRepository.save(token);
        emailService.sendVerificationEmail(user, tokenStr);

        return Map.of("message", "Registration success! Check your email to activate account.");
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        if (!user.isEnabled()) {
            throw new IllegalStateException("Account not activated. Check mail.");
        }

        refreshTokenRepository.revokeAllByUser(user);

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepository
                .findByToken(request.refreshToken())
                .orElseThrow(() -> new IllegalArgumentException("Refresh token not found"));

        if (!refreshToken.isValid()) {
            throw new IllegalArgumentException("Refresh token has expired or been compromised");
        }

        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        User user = refreshToken.getUser();
        return buildAuthResponse(user);
    }

    @Transactional
    public void logout(String refreshTokenStr) {
        refreshTokenRepository.findByToken(refreshTokenStr).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
        });
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user);

        String refreshTokenStr = UUID.randomUUID().toString();
        RefreshToken refreshToken = RefreshToken.builder()
                .token(refreshTokenStr)
                .user(user)
                .expiresAt(Instant.now().plusMillis(refreshTokenExpiration))
                .build();
        refreshTokenRepository.save(refreshToken);

        return new AuthResponse(
                accessToken,
                refreshTokenStr,
                "Bearer",
                accessTokenExpiration / 1000,
                new AuthResponse.UserDto(
                        user.getId(),
                        user.getUsername(),
                        user.getEmail(),
                        user.getRole().name()
                )
        );
    }

    @Transactional
    public AuthResponse verifyEmail(String tokenStr) {
        EmailVerificationToken token = verificationTokenRepository
                .findByToken(tokenStr)
                .orElseThrow(() -> new IllegalArgumentException("Invalid token"));

        if (!token.isValid()) {
            throw new IllegalArgumentException("Token expired or has already been used");
        }

        User user = token.getUser();
        user.setEnabled(true);
        userRepository.save(user);

        token.setUsed(true);
        verificationTokenRepository.save(token);

        return buildAuthResponse(user);
    }
}