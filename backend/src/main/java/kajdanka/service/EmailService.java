package kajdanka.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import kajdanka.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public void sendVerificationEmail(User user, String token) {
        String link = frontendUrl + "/verify-email?token=" + token;

        try {
            MimeMessage message = mailSender.createMimeMessage();

            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("Kajdanka <no-reply@kajdanka.com>");
            helper.setTo(user.getEmail());
            helper.setSubject("Aktiviraj svoj Kajdanka nalog");

            String htmlContent = """
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px 10px; color: #1f2937;">
                    <div style="max-width: 350px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
 
                        <div style="font-size: 22px; font-weight: 700; color: #1e40af; margin-bottom: 24px; letter-spacing: -0.5px;">
                            Kajdanka
                        </div>
 
                        <h1 style="font-size: 20px; font-weight: 600; color: #0f172a; margin-top: 0; margin-bottom: 16px;">
                            Aktivacija naloga
                        </h1>
 
                        <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 12px;">
                            Zdravo %s,
                        </p>
 
                        <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 24px;">
                            Klikni na dugme ispod kako bi aktivirao svoj nalog:
                        </p>
 
                        <div style="margin: 28px 0; text-align: left;">
                            <a href="%s" style="background-color: #2563eb; color: #ffffff !important; padding: 12px 28px; text-decoration: none; font-weight: 500; font-size: 15px; border-radius: 8px; display: inline-block;">
                                Aktiviraj nalog
                            </a>
                        </div>
                    </div>
                </div>
                """.formatted(user.getUsername(), link);

            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Verification mail successfully sent: {}", user.getEmail());

        } catch (MessagingException e) {
            log.error("Error while sending verification mail: {}", user.getEmail(), e);
        }
    }
}