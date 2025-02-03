// Importeer het npm package Express (uit de door npm aangemaakte node_modules map)
import express from "express";

// Importeer de Liquid package (ook als dependency via npm geïnstalleerd)
import { Liquid } from "liquidjs";

// Vul hier jouw eigen ID in (zie de instructies in de leertaak)
const personID = 171;

// Maak een nieuwe Express applicatie aan, waarin we de server configureren
const app = express();

// Gebruik de map 'public' voor statische bestanden (resources zoals CSS, JavaScript, afbeeldingen en fonts)
app.use(express.static("public"));

// Stel Liquid in als 'view engine'
const engine = new Liquid();
app.engine("liquid", engine.express());

// Stel de map met Liquid templates in
app.set("views", "./views");

// Om Views weer te geven, heb je Routes nodig
app.get("/", async function (request, response) {
  try {
    // Doe een fetch naar de WHOIS API en wacht tot de fetch voltooid is
    const personResponse = await fetch("https://fdnd.directus.app/items/person/" + personID);
    const personResponseJSON = await personResponse.json();

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

    // Render de Liquid-template en geef de data mee
    response.render("index.liquid", { person: personData });
  } catch (error) {
    console.error("Fout bij ophalen van data:", error);
    response.status(500).send("Er ging iets mis met het ophalen van de gegevens.");
  }
});

// Maak een POST route voor de index (optioneel voor formulieren)
app.post("/", async function (request, response) {
  response.redirect(303, "/");
});

// Stel het poortnummer in waar Express op moet gaan luisteren
app.set("port", process.env.PORT || 8000);

// Start Express op en luister op de ingestelde poort
app.listen(app.get("port"), function () {
  console.log(`Application started on http://localhost:${app.get("port")}`);
});
