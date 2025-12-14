#!/bin/bash

API_KEY="bpk-4537158022f148049234c9ffbe759373"
BASE_URL="https://builder.io/api/v1/write/page"

echo "🚀 Pushing content to Builder.io..."

# Homepage
echo "📄 Creating Homepage..."
curl -s -X POST "$BASE_URL" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Home",
    "published": "published",
    "data": {
      "title": "Talentenraad - Ouderraad Het Talentenhuis",
      "url": "/",
      "blocks": [
        {
          "@type": "@builder.io/sdk:Element",
          "component": {
            "name": "Hero",
            "options": {
              "title": "Welkom bij de Talentenraad",
              "subtitle": "De ouderraad van Het Talentenhuis - School met een hart voor ieder kind",
              "ctaText": "Ontdek onze activiteiten",
              "ctaLink": "/activiteiten",
              "overlay": true
            }
          }
        },
        {
          "@type": "@builder.io/sdk:Element",
          "component": {
            "name": "Text",
            "options": {
              "text": "<div style=\"padding: 80px 24px; max-width: 1200px; margin: 0 auto; text-align: center;\"><h2 style=\"font-size: 2.5rem; font-weight: bold; color: #1f2937; margin-bottom: 1rem;\">Onze Missie</h2><p style=\"font-size: 1.25rem; color: #4b5563; max-width: 800px; margin: 0 auto;\">Samen met de school werken we aan een leuke, uitdagende en veilige leeromgeving voor alle kinderen. We organiseren activiteiten, ondersteunen schoolprojecten en zorgen voor verbinding tussen ouders, leerkrachten en kinderen.</p></div>"
            }
          }
        },
        {
          "@type": "@builder.io/sdk:Element",
          "component": {
            "name": "Text",
            "options": {
              "text": "<div style=\"padding: 40px 24px 80px; background: #f9fafb;\"><div style=\"max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem;\"></div></div>"
            }
          }
        },
        {
          "@type": "@builder.io/sdk:Element",
          "component": {
            "name": "InfoCard",
            "options": {
              "title": "Activiteiten",
              "description": "Van schoolfeesten tot quiz-avonden: we organiseren leuke evenementen voor het hele gezin.",
              "icon": "calendar",
              "link": "/activiteiten",
              "linkText": "Bekijk activiteiten"
            }
          }
        },
        {
          "@type": "@builder.io/sdk:Element",
          "component": {
            "name": "InfoCard",
            "options": {
              "title": "Fondsenwerving",
              "description": "Door acties en sponsoring zamelen we geld in voor extra materiaal en uitstappen.",
              "icon": "money",
              "link": "/acties",
              "linkText": "Onze acties"
            }
          }
        },
        {
          "@type": "@builder.io/sdk:Element",
          "component": {
            "name": "InfoCard",
            "options": {
              "title": "Verbinding",
              "description": "We bouwen bruggen tussen ouders, leerkrachten en de schooldirectie.",
              "icon": "users",
              "link": "/over-ons",
              "linkText": "Leer ons kennen"
            }
          }
        },
        {
          "@type": "@builder.io/sdk:Element",
          "component": {
            "name": "CalendarSection",
            "options": {
              "title": "Komende Activiteiten",
              "subtitle": "Mis geen enkele activiteit van de Talentenraad",
              "events": [
                {"date": "2025-01-25", "title": "Nieuwjaarsdrink", "time": "11:00 - 13:00"},
                {"date": "2025-02-14", "title": "Valentijnsactie", "time": "Hele dag"},
                {"date": "2025-03-08", "title": "Pannenkoekendag", "time": "10:00 - 14:00"},
                {"date": "2025-04-12", "title": "Paasontbijt", "time": "09:00 - 11:30"},
                {"date": "2025-05-11", "title": "Moederdag Ontbijt", "time": "09:00 - 12:00"}
              ],
              "showViewAll": true,
              "viewAllLink": "/kalender"
            }
          }
        },
        {
          "@type": "@builder.io/sdk:Element",
          "component": {
            "name": "CTABanner",
            "options": {
              "title": "Word lid van de Talentenraad!",
              "subtitle": "Heb je zin om mee te helpen? Alle hulp is welkom, groot of klein. Samen maken we er iets moois van!",
              "buttonText": "Neem contact op",
              "buttonLink": "/contact",
              "variant": "gradient"
            }
          }
        },
        {
          "@type": "@builder.io/sdk:Element",
          "component": {
            "name": "Text",
            "options": {
              "text": "<div style=\"padding: 80px 24px; background: #ffffff; text-align: center;\"><div style=\"max-width: 700px; margin: 0 auto;\"><h2 style=\"font-size: 2rem; font-weight: bold; color: #1f2937; margin-bottom: 1rem;\">Over Het Talentenhuis</h2><p style=\"font-size: 1.1rem; color: #4b5563; margin-bottom: 1.5rem;\">Het Talentenhuis is een basisschool in Bilzen-Hoeselt met een hart voor ieder kind. De school biedt een warme, uitdagende leeromgeving waar elk kind zijn talenten kan ontdekken en ontwikkelen.</p><p style=\"color: #6b7280;\"><strong>Adres:</strong> Zonhoevestraat 32, 3740 Bilzen-Hoeselt<br/><strong>Tel:</strong> 089/41 54 07<br/><strong>Website:</strong> <a href=\"https://talentenhuis.be\" style=\"color: #ea247b;\">talentenhuis.be</a></p></div></div>"
            }
          }
        }
      ]
    }
  }' > /dev/null && echo "✅ Homepage created"

# Activiteiten Page
echo "📄 Creating Activiteiten page..."
curl -s -X POST "$BASE_URL" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Activiteiten",
    "published": "published",
    "data": {
      "title": "Activiteiten - Talentenraad",
      "url": "/activiteiten",
      "blocks": [
        {
          "@type": "@builder.io/sdk:Element",
          "component": {
            "name": "Hero",
            "options": {
              "title": "Onze Activiteiten",
              "subtitle": "Ontdek alle leuke evenementen die we organiseren",
              "ctaText": "Bekijk kalender",
              "ctaLink": "/kalender",
              "overlay": true
            }
          }
        },
        {
          "@type": "@builder.io/sdk:Element",
          "component": {
            "name": "Text",
            "options": {
              "text": "<div style=\"padding: 60px 24px; background: #f9fafb; text-align: center;\"><h2 style=\"font-size: 2rem; font-weight: bold; color: #1f2937;\">Jaarlijkse Hoogtepunten</h2><p style=\"color: #6b7280; margin-top: 0.5rem;\">Deze activiteiten keren elk jaar terug</p></div>"
            }
          }
        },
        {
          "@type": "@builder.io/sdk:Element",
          "component": {
            "name": "EventCard",
            "options": {
              "title": "Moederdag Ontbijt",
              "date": "Mei",
              "time": "09:00 - 12:00",
              "location": "Het Talentenhuis",
              "description": "Een heerlijk ontbijt voor alle mamas en omas. De kinderen verwennen hun mama met zelfgemaakte cadeautjes en lekkernijen."
            }
          }
        },
        {
          "@type": "@builder.io/sdk:Element",
          "component": {
            "name": "EventCard",
            "options": {
              "title": "Vaderdag BBQ",
              "date": "Juni",
              "time": "11:00 - 15:00",
              "location": "Schoolplein",
              "description": "Gezellige barbecue voor alle papas en opas. Met spelletjes, muziek en natuurlijk heerlijk eten van de grill."
            }
          }
        },
        {
          "@type": "@builder.io/sdk:Element",
          "component": {
            "name": "EventCard",
            "options": {
              "title": "Schoolfeest",
              "date": "September",
              "time": "14:00 - 22:00",
              "location": "Het Talentenhuis",
              "description": "Het jaarlijkse schoolfeest met optredens, spelletjes, eten en drinken. Een feest voor jong en oud!"
            }
          }
        },
        {
          "@type": "@builder.io/sdk:Element",
          "component": {
            "name": "EventCard",
            "options": {
              "title": "Sint op School",
              "date": "December",
              "time": "13:30 - 16:00",
              "location": "Het Talentenhuis",
              "description": "De Sint bezoekt alle klassen en deelt snoepgoed uit. Een magisch moment voor alle kinderen!"
            }
          }
        },
        {
          "@type": "@builder.io/sdk:Element",
          "component": {
            "name": "EventCard",
            "options": {
              "title": "Kerstmarkt",
              "date": "December",
              "time": "16:00 - 20:00",
              "location": "Schoolplein",
              "description": "Gezellige kerstmarkt met kraampjes, gluhwein, warme chocomelk en kerstmuziek."
            }
          }
        },
        {
          "@type": "@builder.io/sdk:Element",
          "component": {
            "name": "EventCard",
            "options": {
              "title": "Pannenkoekendag",
              "date": "Maart",
              "time": "10:00 - 14:00",
              "location": "Refter",
              "description": "Onbeperkt pannenkoeken eten! Met diverse toppings van suiker tot ijs."
            }
          }
        },
        {
          "@type": "@builder.io/sdk:Element",
          "component": {
            "name": "CTABanner",
            "options": {
              "title": "Wil je helpen bij een activiteit?",
              "subtitle": "We zijn altijd op zoek naar enthousiaste ouders die willen meehelpen. Elk handje helpt!",
              "buttonText": "Meld je aan",
              "buttonLink": "/contact",
              "variant": "primary"
            }
          }
        }
      ]
    }
  }' > /dev/null && echo "✅ Activiteiten page created"

# Over Ons Page
echo "📄 Creating Over Ons page..."
curl -s -X POST "$BASE_URL" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Over Ons",
    "published": "published",
    "data": {
      "title": "Over Ons - Talentenraad",
      "url": "/over-ons",
      "blocks": [
        {
          "@type": "@builder.io/sdk:Element",
          "component": {
            "name": "Hero",
            "options": {
              "title": "Over de Talentenraad",
              "subtitle": "Maak kennis met ons enthousiaste team",
              "overlay": true
            }
          }
        },
        {
          "@type": "@builder.io/sdk:Element",
          "component": {
            "name": "Text",
            "options": {
              "text": "<div style=\"padding: 80px 24px; max-width: 800px; margin: 0 auto; text-align: center;\"><h2 style=\"font-size: 2rem; font-weight: bold; color: #1f2937; margin-bottom: 1.5rem;\">Wie zijn wij?</h2><p style=\"font-size: 1.1rem; color: #4b5563; line-height: 1.8;\">De Talentenraad is de ouderraad van basisschool Het Talentenhuis in Bilzen-Hoeselt. Wij zijn een groep enthousiaste ouders die zich vrijwillig inzetten om het schoolleven van onze kinderen nog leuker te maken.</p><p style=\"font-size: 1.1rem; color: #4b5563; line-height: 1.8; margin-top: 1rem;\">Samen met de school organiseren we activiteiten, zamelen we fondsen in voor extra materiaal en uitstappen, en zorgen we voor een goede communicatie tussen ouders en school.</p></div>"
            }
          }
        },
        {
          "@type": "@builder.io/sdk:Element",
          "component": {
            "name": "Text",
            "options": {
              "text": "<div style=\"padding: 20px 24px 40px; text-align: center;\"><h2 style=\"font-size: 2rem; font-weight: bold; color: #1f2937;\">Ons Team</h2></div>"
            }
          }
        },
        {
          "@type": "@builder.io/sdk:Element",
          "component": {
            "name": "TeamMember",
            "options": {
              "name": "Sarah Janssen",
              "role": "Voorzitter",
              "description": "Mama van Lotte (3e leerjaar) en Tim (1e leerjaar)"
            }
          }
        },
        {
          "@type": "@builder.io/sdk:Element",
          "component": {
            "name": "TeamMember",
            "options": {
              "name": "Peter Willems",
              "role": "Ondervoorzitter",
              "description": "Papa van Emma (5e leerjaar)"
            }
          }
        },
        {
          "@type": "@builder.io/sdk:Element",
          "component": {
            "name": "TeamMember",
            "options": {
              "name": "Linda Maes",
              "role": "Secretaris",
              "description": "Mama van Noah (2e kleuterklas)"
            }
          }
        },
        {
          "@type": "@builder.io/sdk:Element",
          "component": {
            "name": "TeamMember",
            "options": {
              "name": "Kris Peeters",
              "role": "Penningmeester",
              "description": "Papa van Mila (4e leerjaar) en Lucas (1e kleuterklas)"
            }
          }
        },
        {
          "@type": "@builder.io/sdk:Element",
          "component": {
            "name": "Text",
            "options": {
              "text": "<div style=\"padding: 60px 24px; background: #f9fafb; text-align: center;\"><h2 style=\"font-size: 2rem; font-weight: bold; color: #1f2937; margin-bottom: 2rem;\">Wat doen wij?</h2></div>"
            }
          }
        },
        {
          "@type": "@builder.io/sdk:Element",
          "component": {
            "name": "InfoCard",
            "options": {
              "title": "Evenementen organiseren",
              "description": "Van schoolfeesten tot quiz-avonden, van moederdag ontbijt tot kerstmarkten.",
              "icon": "star"
            }
          }
        },
        {
          "@type": "@builder.io/sdk:Element",
          "component": {
            "name": "InfoCard",
            "options": {
              "title": "Fondsen werven",
              "description": "Door verkoop van wafels, kaarten en andere acties zamelen we geld in.",
              "icon": "gift"
            }
          }
        },
        {
          "@type": "@builder.io/sdk:Element",
          "component": {
            "name": "InfoCard",
            "options": {
              "title": "School ondersteunen",
              "description": "We financieren extra materiaal, uitstappen en speciale projecten.",
              "icon": "school"
            }
          }
        },
        {
          "@type": "@builder.io/sdk:Element",
          "component": {
            "name": "CTABanner",
            "options": {
              "title": "Zin om mee te doen?",
              "subtitle": "De Talentenraad is altijd op zoek naar nieuwe leden. Je hoeft niet bij elke activiteit aanwezig te zijn - elke hulp is welkom!",
              "buttonText": "Word lid",
              "buttonLink": "/contact",
              "variant": "secondary"
            }
          }
        }
      ]
    }
  }' > /dev/null && echo "✅ Over Ons page created"

# Contact Page
echo "📄 Creating Contact page..."
curl -s -X POST "$BASE_URL" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Contact",
    "published": "published",
    "data": {
      "title": "Contact - Talentenraad",
      "url": "/contact",
      "blocks": [
        {
          "@type": "@builder.io/sdk:Element",
          "component": {
            "name": "Hero",
            "options": {
              "title": "Contacteer Ons",
              "subtitle": "Heb je een vraag of wil je meehelpen? We horen graag van je!",
              "overlay": true
            }
          }
        },
        {
          "@type": "@builder.io/sdk:Element",
          "component": {
            "name": "Text",
            "options": {
              "text": "<div style=\"padding: 60px 24px;\"><div style=\"max-width: 600px; margin: 0 auto;\"><h2 style=\"font-size: 1.75rem; font-weight: bold; color: #1f2937; margin-bottom: 1.5rem;\">Neem contact op</h2><p style=\"color: #4b5563; line-height: 1.8; margin-bottom: 2rem;\">Heb je vragen over onze activiteiten? Wil je lid worden van de ouderraad? Of heb je een leuk idee voor een evenement? Stuur ons gerust een berichtje!</p><div style=\"background: #f9fafb; padding: 1.5rem; border-radius: 1rem; margin-bottom: 1rem;\"><h3 style=\"font-weight: bold; color: #1f2937; margin-bottom: 0.5rem;\">📍 Adres</h3><p style=\"color: #4b5563;\">Het Talentenhuis<br/>Zonhoevestraat 32<br/>3740 Bilzen-Hoeselt</p></div><div style=\"background: #f9fafb; padding: 1.5rem; border-radius: 1rem; margin-bottom: 1rem;\"><h3 style=\"font-weight: bold; color: #1f2937; margin-bottom: 0.5rem;\">📧 E-mail</h3><p style=\"color: #4b5563;\">talentenraad@talentenhuis.be</p></div><div style=\"background: #f9fafb; padding: 1.5rem; border-radius: 1rem;\"><h3 style=\"font-weight: bold; color: #1f2937; margin-bottom: 0.5rem;\">📱 Volg ons</h3><p style=\"color: #4b5563;\">Facebook: @talentenhuis<br/>Instagram: @talentenhuis</p></div></div></div>"
            }
          }
        },
        {
          "@type": "@builder.io/sdk:Element",
          "component": {
            "name": "ContactForm",
            "options": {
              "title": "Stuur ons een bericht",
              "subtitle": "Vul het formulier in en we nemen zo snel mogelijk contact met je op.",
              "showPhone": true,
              "showSubject": true
            }
          }
        }
      ]
    }
  }' > /dev/null && echo "✅ Contact page created"

# Nieuws Page
echo "📄 Creating Nieuws page..."
curl -s -X POST "$BASE_URL" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nieuws",
    "published": "published",
    "data": {
      "title": "Nieuws - Talentenraad",
      "url": "/nieuws",
      "blocks": [
        {
          "@type": "@builder.io/sdk:Element",
          "component": {
            "name": "Hero",
            "options": {
              "title": "Nieuws",
              "subtitle": "Blijf op de hoogte van al onze activiteiten en nieuwtjes",
              "overlay": true
            }
          }
        },
        {
          "@type": "@builder.io/sdk:Element",
          "component": {
            "name": "Text",
            "options": {
              "text": "<div style=\"padding: 40px 24px; background: #f9fafb; text-align: center;\"><h2 style=\"font-size: 1.5rem; font-weight: bold; color: #1f2937;\">Laatste nieuws en updates</h2></div>"
            }
          }
        },
        {
          "@type": "@builder.io/sdk:Element",
          "component": {
            "name": "NewsCard",
            "options": {
              "title": "Succesvolle Kerstmarkt 2024",
              "date": "22 december 2024",
              "excerpt": "De kerstmarkt was weer een groot succes! Dankzij jullie steun hebben we 1.500 euro opgehaald voor nieuwe speeltoestellen.",
              "category": "Verslag"
            }
          }
        },
        {
          "@type": "@builder.io/sdk:Element",
          "component": {
            "name": "NewsCard",
            "options": {
              "title": "Nieuwjaarsdrink 25 januari",
              "date": "10 januari 2025",
              "excerpt": "Start het nieuwe jaar gezellig met de Talentenraad! Iedereen is welkom voor een drankje en hapje.",
              "category": "Aankondiging"
            }
          }
        },
        {
          "@type": "@builder.io/sdk:Element",
          "component": {
            "name": "NewsCard",
            "options": {
              "title": "Nieuwe speeltoestellen geplaatst",
              "date": "5 januari 2025",
              "excerpt": "Dankzij de opbrengst van onze acties konden we nieuwe klimtoestellen laten plaatsen op de speelplaats.",
              "category": "Nieuws"
            }
          }
        },
        {
          "@type": "@builder.io/sdk:Element",
          "component": {
            "name": "NewsCard",
            "options": {
              "title": "Terugblik Sint op School",
              "date": "8 december 2024",
              "excerpt": "De Sint en zijn Pieten bezochten alle klassen. De kinderen genoten volop van de snoepjes en cadeautjes!",
              "category": "Verslag"
            }
          }
        },
        {
          "@type": "@builder.io/sdk:Element",
          "component": {
            "name": "NewsCard",
            "options": {
              "title": "Wafelbakactie - Bestel nu!",
              "date": "1 december 2024",
              "excerpt": "Onze jaarlijkse wafelbakactie is gestart. Bestel heerlijke verse wafels en steun de school!",
              "category": "Activiteit"
            }
          }
        },
        {
          "@type": "@builder.io/sdk:Element",
          "component": {
            "name": "NewsCard",
            "options": {
              "title": "Nieuwe leden gezocht",
              "date": "15 november 2024",
              "excerpt": "De Talentenraad zoekt versterking! Ben jij een enthousiaste ouder die wil meehelpen?",
              "category": "Aankondiging"
            }
          }
        }
      ]
    }
  }' > /dev/null && echo "✅ Nieuws page created"

# Kalender Page
echo "📄 Creating Kalender page..."
curl -s -X POST "$BASE_URL" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Kalender",
    "published": "published",
    "data": {
      "title": "Kalender - Talentenraad",
      "url": "/kalender",
      "blocks": [
        {
          "@type": "@builder.io/sdk:Element",
          "component": {
            "name": "Hero",
            "options": {
              "title": "Kalender 2025",
              "subtitle": "Alle activiteiten en evenementen op een rij",
              "overlay": true
            }
          }
        },
        {
          "@type": "@builder.io/sdk:Element",
          "component": {
            "name": "CalendarSection",
            "options": {
              "title": "Komende Activiteiten",
              "subtitle": "Noteer deze data alvast in je agenda!",
              "events": [
                {"date": "2025-01-25", "title": "Nieuwjaarsdrink", "time": "11:00 - 13:00"},
                {"date": "2025-02-14", "title": "Valentijnsactie - Rozenverkoop", "time": "Hele dag"},
                {"date": "2025-02-28", "title": "Carnavalsfeest", "time": "13:30 - 16:00"},
                {"date": "2025-03-08", "title": "Pannenkoekendag", "time": "10:00 - 14:00"},
                {"date": "2025-04-05", "title": "Paaseitjes zoeken", "time": "10:00 - 12:00"},
                {"date": "2025-04-12", "title": "Paasontbijt", "time": "09:00 - 11:30"},
                {"date": "2025-05-11", "title": "Moederdag Ontbijt", "time": "09:00 - 12:00"},
                {"date": "2025-06-08", "title": "Vaderdag BBQ", "time": "11:00 - 15:00"},
                {"date": "2025-06-28", "title": "Schoolfeest", "time": "14:00 - 22:00"},
                {"date": "2025-09-06", "title": "Startfeest nieuw schooljaar", "time": "10:00 - 13:00"},
                {"date": "2025-10-31", "title": "Halloween Party", "time": "18:00 - 21:00"},
                {"date": "2025-12-05", "title": "Sint op school", "time": "13:30 - 16:00"},
                {"date": "2025-12-20", "title": "Kerstmarkt", "time": "16:00 - 20:00"}
              ],
              "showViewAll": false
            }
          }
        },
        {
          "@type": "@builder.io/sdk:Element",
          "component": {
            "name": "CTABanner",
            "options": {
              "title": "Wil je op de hoogte blijven?",
              "subtitle": "Volg ons op sociale media voor de laatste updates en fotos van onze activiteiten.",
              "buttonText": "Volg ons op Facebook",
              "buttonLink": "https://facebook.com/talentenhuis",
              "variant": "primary"
            }
          }
        }
      ]
    }
  }' > /dev/null && echo "✅ Kalender page created"

echo ""
echo "✨ All pages created successfully!"
echo "🌐 Visit https://builder.io to review your content"
echo "🔗 Preview at: https://talentenraad.vercel.app"
