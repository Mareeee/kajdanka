package kajdanka.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import kajdanka.dto.response.UserProfileDto;
import kajdanka.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User profile")
public class UserController {

    private final UserService userService;

    @GetMapping("/{username}")
    @Operation(summary = "Logged in User Profile", security = @SecurityRequirement(name = "bearerAuth"))
    public UserProfileDto getMyProfile(@PathVariable String username) {
        return userService.getProfile(username);
    }
}