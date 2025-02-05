// Importeer het npm package Express (uit de door npm aangemaakte node_modules map)
// Deze package is geïnstalleerd via `npm install`, en staat als 'dependency' in package.json
import express from "express";

// Importeer de Liquid package (ook als dependency via npm geïnstalleerd)
import { Liquid } from "liquidjs";

// Vul hier jouw eigen ID in (zie de instructies in de leertaak)
const personID = 171;

// Doe een fetch naar een URL op de WHOIS API, ga pas verder als de fetch gelukt is
const personResponse = await fetch("https://fdnd.directus.app/items/person/" + personID);

// Lees van de response van die fetch het JSON object in, waar we iets mee kunnen doen
const personResponseJSON = await personResponse.json();

// Haal de data op
let personData = personResponseJSON.data;

// Controleer of het custom veld bestaat en parse het als JSON
if (personData.custom) {
  try {
    personData.custom = JSON.parse(personData.custom);
  } catch (error) {
    console.error("Fout bij het parsen van custom JSON:", error);
    personData.custom = {}; // Fallback als er een fout optreedt
  }
}

if (personData.birthdate) {
  const birthdate = new Date(personData.birthdate);
  const today = new Date();
  let age = today.getFullYear() - birthdate.getFullYear();

  // Corrigeer als de verjaardag dit jaar nog niet is geweest
  const hasBirthdayPassed =
    today.getMonth() > birthdate.getMonth() || (today.getMonth() === birthdate.getMonth() && today.getDate() >= birthdate.getDate());

  if (!hasBirthdayPassed) {
    age--;
  }

  personData.age = age; // Voeg de leeftijd toe aan de data
} else {
  personData.age = "Onbekend"; // Fallback als er geen geboortedatum is
}

// Maak een nieuwe Express applicatie aan, waarin we de server configureren
const app = express();

// Gebruik de map 'public' voor statische bestanden (resources zoals CSS, JavaScript, afbeeldingen en fonts)
// Bestanden in deze map kunnen dus door de browser gebruikt worden
app.use(express.static("public"));

// Stel Liquid in als 'view engine'
const engine = new Liquid();
app.engine("liquid", engine.express());

// Stel de map met Liquid templates in
// Let op: de browser kan deze bestanden niet rechtstreeks laden (zoals voorheen met HTML bestanden)
app.set("views", "./views");

// Om Views weer te geven, heb je Routes nodig
// Maak een GET route voor de index (meestal doe je dit in de root, als /)
app.get("/", async function (request, response) {
  // Render index.liquid uit de Views map en geef de opgehaalde data mee, in een variabele genaamd person
  response.render("index.liquid", { person: personData });
});

// Maak een GET route voor de oefenen pagina
app.get("/oefenen", async function (request, response) {
  // Render oefenen.liquid uit de views map en geef de opgehaalde data mee, in een variabele genaamd person
  response.render("oefenen.liquid", { person: personData });
});

// Had je meer pagina's in je oude visitekaartje? Zoals een contact.html?
// Maak daar dan meer Routes voor aan, en koppel ze aan Views
// app.get('/contact', function (request, response) {
// Render bijvoorbeeld contact.liquid uit de views map, zonder daar iets aan mee te geven
// response.render('contact.liquid')
// })

// Maak een POST route voor de index; hiermee kun je bijvoorbeeld formulieren afvangen
// Hier doen we nu nog niets mee, maar je kunt er mee spelen als je wilt
app.post("/", async function (request, response) {
  // Je zou hier data kunnen opslaan, of veranderen, of wat je maar wilt
  // Er is nog geen afhandeling van een POST, dus stuur de bezoeker terug naar /
  response.redirect(303, "/");
});

// Stel het poortnummer in waar Express op moet gaan luisteren
// Lokaal is dit poort 8000, als dit ergens gehost wordt, is het waarschijnlijk poort 80
app.set("port", process.env.PORT || 8000);

// Start Express op, haal daarbij het zojuist ingestelde poortnummer op
app.listen(app.get("port"), function () {
  // Toon een bericht in de console en geef het poortnummer door
  console.log(`Application started on http://localhost:${app.get("port")}`);
});
