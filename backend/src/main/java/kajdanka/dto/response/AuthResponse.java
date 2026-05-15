package kajdanka.dto.response;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresIn,
        UserDto user
) {
    public record UserDto(
            Long id,
            String username,
            String email,
            String role
    ) {}
}