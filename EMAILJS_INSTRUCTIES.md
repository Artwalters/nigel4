# EmailJS Installatie Instructies voor Fitlike Nigel

## Wat is EmailJS?
EmailJS is een service waarmee je formulieren direct emails kunt laten versturen zonder een backend server. Perfect voor je intake formulier!

## Stap-voor-stap installatie:

### Stap 1: Maak een EmailJS account aan
1. Ga naar https://www.emailjs.com/
2. Klik op "Sign Up Free"
3. Maak een account aan met je email

### Stap 2: Stel je email service in
1. Log in op https://dashboard.emailjs.com/
2. Ga naar "Email Services" in het menu
3. Klik op "Add New Service"
4. Kies je email provider:
   - **Voor Gmail**: Selecteer Gmail
   - **Voor Outlook**: Selecteer Outlook
   - **Voor andere**: Kies de juiste optie

5. **BELANGRIJK voor Gmail gebruikers:**
   - Je hebt een App Password nodig (NIET je normale wachtwoord)
   - Ga naar https://myaccount.google.com/security
   - Zet 2-staps verificatie AAN
   - Ga naar "App-wachtwoorden"
   - Maak een nieuw app-wachtwoord voor "EmailJS"
   - Gebruik DIT wachtwoord in EmailJS

6. Vul je gegevens in en test de service
7. **Noteer je Service ID** (bijvoorbeeld: "service_abc123")

### Stap 3: Maak een email template
1. Ga naar "Email Templates"
2. Klik op "Create New Template"
3. Vul in:

**Template Name:** Intake Form

**To (email address):** (je email waar je de berichten wilt ontvangen)

**Subject:** Nieuwe Intake Aanvraag - {{name}}

**Content:**
```
Nieuwe intake aanvraag ontvangen!

CONTACTGEGEVENS:
Naam: {{name}}
Telefoon: {{phone}}
Email: {{email}}

DOELEN:
{{goals}}

ERVARING:
{{experience}}

TRAININGSVOORKEUR:
{{training_preference}}

BERICHT:
{{message}}

---
Dit bericht is verstuurd via het Fitlike Nigel intake formulier
```

4. Klik op "Save"
5. **Noteer je Template ID** (bijvoorbeeld: "template_xyz789")

### Stap 4: Vind je Public Key
1. Ga naar het account icoon rechtsboven
2. Klik op "API Keys"
3. **Kopieer je Public Key**

### Stap 5: Vul de gegevens in op je website
1. Open het bestand `script.js`
2. Zoek naar "EMAILJS CONFIGURATION" (regel 1-14)
3. Vervang de placeholder tekst met je eigen IDs:

```javascript
const EMAILJS_CONFIG = {
    PUBLIC_KEY: "jouw_public_key_hier",
    SERVICE_ID: "service_abc123",
    TEMPLATE_ID: "template_xyz789"
};
```

### Stap 6: Test het formulier
1. Open je website
2. Vul het intake formulier in
3. Verstuur het formulier
4. Check je email!

## Problemen oplossen:

**Email komt niet aan?**
- Check je spam folder
- Controleer of alle IDs correct zijn ingevuld
- Kijk in de browser console (F12) voor error messages
- Check je EmailJS dashboard voor de email history

**"Authentication failed" error?**
- Check of je App Password correct is (voor Gmail)
- Controleer je Public Key

**Template variables werken niet?**
- Zorg dat de variable namen exact overeenkomen:
  - {{name}}
  - {{phone}}
  - {{email}}
  - {{goals}}
  - {{experience}}
  - {{training_preference}}
  - {{message}}

## Support
- EmailJS documentatie: https://www.emailjs.com/docs/
- EmailJS FAQ: https://www.emailjs.com/docs/faq/

## Belangrijk voor live website
- EmailJS gratis plan: 200 emails per maand
- Voor meer emails: upgrade naar betaald plan
- Monitor je usage in het EmailJS dashboard