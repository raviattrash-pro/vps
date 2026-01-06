package com.visionpublicschool.service;

import org.springframework.stereotype.Service;

@Service
public class WhatsAppService {

    public void sendWhatsAppMessage(String groupParams, String message) {
        // In a real application, you would integrate with Twilio or Meta WhatsApp API
        // here.
        System.out.println("=================================");
        System.out.println("WHATSAPP NOTIFICATION SENT");
        System.out.println("Target Group: " + groupParams);
        System.out.println("Message: " + message);
        System.out.println("=================================");
    }
}
