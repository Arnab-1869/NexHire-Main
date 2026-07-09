package com.nexhire.service;

import com.nexhire.entity.JobApplication;
import com.nexhire.entity.OfferLetter;
import com.nexhire.entity.JoiningLetter;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
public class PdfGenerationService {

    public byte[] generateOfferPdf(OfferLetter offer) {
        JobApplication app = offer.getApplication();
        String content = "=========================================\n" +
                "               NEXHIRE OFFER LETTER      \n" +
                "=========================================\n\n" +
                "Candidate Name: " + app.getUser().getName() + "\n" +
                "Role:           System Engineer\n" +
                "Details:        " + offer.getContent() + "\n" +
                "Date Generated: " + offer.getSentAt() + "\n\n" +
                "This is a digital copy for preview and verification.";
        return content.getBytes(StandardCharsets.UTF_8);
    }

    public byte[] generateJoiningPdf(JoiningLetter joining) {
        JobApplication app = joining.getApplication();
        String content = "=========================================\n" +
                "               NEXHIRE JOINING LETTER    \n" +
                "=========================================\n\n" +
                "Candidate Name:   " + app.getUser().getName() + "\n" +
                "Role:             System Engineer\n" +
                "Joining Date:     " + joining.getJoiningDate() + "\n" +
                "Joining Location: " + joining.getLocation().getName() + "\n" +
                "Details:          " + joining.getContent() + "\n" +
                "Date Generated:   " + joining.getSentAt() + "\n\n" +
                "This is a digital copy for preview and verification.";
        return content.getBytes(StandardCharsets.UTF_8);
    }
}
