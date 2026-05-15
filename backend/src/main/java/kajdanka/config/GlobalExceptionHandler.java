package kajdanka.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, String>> handleBadCredentials(BadCredentialsException e) {
        return error(HttpStatus.UNAUTHORIZED, "Invalid email or password");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArg(IllegalArgumentException e) {
        return error(HttpStatus.BAD_REQUEST, e.getMessage());
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(NoSuchElementException e) {
        return error(HttpStatus.NOT_FOUND, e.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException e) {
        Map<String, Object> body = new HashMap<>();
        body.put("error", "Validation failed");
        Map<String, String> fields = new HashMap<>();
        e.getBindingResult().getFieldErrors().forEach(fe ->
                fields.put(fe.getField(), fe.getDefaultMessage())
        );
        body.put("fields", fields);
        return ResponseEntity.badRequest().body(body);
    }

    private ResponseEntity<Map<String, String>> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of("error", message));
    }
}