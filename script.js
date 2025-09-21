document.addEventListener("DOMContentLoaded", function() {
    setupSortListeners();
});

function disableToggle(){
	alert("A");
    event.preventDefault(); 
}


let achievementsData = [];

// Lade einmal beim Start
//loadAchievementsFromXMLRepo();
loadAchievementsFromGist();

// Rufe die Funktion jede Minute (60000 ms) erneut auf
setInterval(() => {
    //loadAchievementsFromXMLRepo();
	loadAchievementsFromGist();
}, 4000); // 60000 ms = 1 Minute

async function loadAchievementsFromGist() {
    const gistId = "eb319ba0c431d3a033ce578eb4117981"; // Deine Gist-ID
    const fileName = "gistfile1.txt";     // Name der Datei in der Gist

    try {
        // 1. API abrufen, um den aktuellen raw_url zu bekommen
        const gistResponse = await fetch(`https://api.github.com/gists/${gistId}`);
        if (!gistResponse.ok) throw new Error("Fehler beim Abrufen des Gist");

        const gistData = await gistResponse.json();
        const rawUrl = gistData.files[fileName].raw_url;

        // 2. Raw-Content abrufen
        const rawResponse = await fetch(rawUrl + `?t=${Date.now()}`, { cache: "no-store" });

        if (!rawResponse.ok) throw new Error("Fehler beim Laden der XML-Datei vom Gist");

        const xmlText = await rawResponse.text();

        // 3. XML parsen
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlText, "application/xml");
        const achievements = xml.getElementsByTagName("Achievement");

        // 4. achievementsData füllen
        achievementsData = Array.from(achievements).map(achievement => ({
            category: achievement.getElementsByTagName("Category")[0].textContent,
            difficulty: achievement.getElementsByTagName("Difficulty")[0].textContent.toLowerCase(),
            id: parseInt(achievement.getElementsByTagName("ID")[0].textContent),
            name: achievement.getElementsByTagName("Achievementname")[0].textContent,
            description: achievement.getElementsByTagName("Description")[0].textContent,
            isCompleted: achievement.getElementsByTagName("isCompleted")[0].textContent === "TRUE",
            isFollowing: achievement.getElementsByTagName("isFollowing")[0].textContent === "TRUE"
        }));

        // 5. Weiterverarbeitung wie gewohnt
        filterByKingdom();
        updateGreenscreenData();
        CheckAllCheckboxes();

    } catch (error) {
        console.error("Fehler beim Laden der Achievements vom Gist:", error);
        alert("Die Achievements konnten nicht geladen werden.");
    }
}


// Funktion zum Laden von Erfolgen aus einer XML-Datei direkt von GitHub
async function loadAchievementsFromXMLRepo() {
    const url = 'https://raw.githubusercontent.com/Skydorm1/ACAchievementWebsite/main/data/ACAchievementsXML%20-%20German.xml'; // Raw-URL deiner XML im Repo

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Fehler beim Laden der XML-Datei');

        const xmlText = await response.text();

        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlText, "application/xml");
        const achievements = xml.getElementsByTagName("Achievement");

        achievementsData = Array.from(achievements).map(achievement => ({
            category: achievement.getElementsByTagName("Category")[0].textContent,
            difficulty: achievement.getElementsByTagName("Difficulty")[0].textContent.toLowerCase(),
            id: parseInt(achievement.getElementsByTagName("ID")[0].textContent),
            name: achievement.getElementsByTagName("Achievementname")[0].textContent,
            description: achievement.getElementsByTagName("Description")[0].textContent,
            isCompleted: achievement.getElementsByTagName("isCompleted")[0].textContent === "TRUE",
            isFollowing: achievement.getElementsByTagName("isFollowing")[0].textContent === "TRUE"
        }));

        filterByKingdom();
        updateGreenscreenData();
		CheckAllCheckboxes();

    } catch (error) {
        console.error('Fehler beim Laden der Achievements von GitHub:', error);
        alert('Die Achievements konnten nicht geladen werden.');
    }
}

function CheckAllCheckboxes() {
    const checkboxes = document.querySelectorAll('.toggle');

    checkboxes.forEach((cb, index) => {
        const achievementId = parseInt(cb.dataset.id, 10);
        const achievement = achievementsData.find(a => a.id === achievementId);

        if (achievement) {
            cb.checked = achievement.isCompleted;
        }
    });
}


function updateGreenscreenData() {
    const totalAchievementsAC = achievementsData.length; // Gesamtzahl der Achievements
    const completedAchievementsAC = achievementsData.filter(a => a.isCompleted).length; // Anzahl der abgeschlossenen Achievements

    localStorage.setItem("totalAchievementsAC", JSON.stringify({
        total: totalAchievementsAC,
        completed: completedAchievementsAC
    }));
}

function CommunicationGreenscreenLastDone(achievement){
	 localStorage.setItem("lastAchievement", JSON.stringify({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
		difficulty: achievement.difficulty
    }));
}



function CommunicationGreenscreenComplete(achievement) {
    localStorage.setItem("completeAchievement", JSON.stringify({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
		difficulty: achievement.difficulty
    }));
}

function CommunicationGreenscreenFollowing(achievement) {
    // Speichern des gesamten Objekts im localStorage für den Greenscreen
    localStorage.setItem("followingAchievement", JSON.stringify({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
		difficulty: achievement.difficulty
    }));
}





// Funktion zum Erstellen des XML-Dokuments
function createXMLDocument() {
    const xmlDoc = document.implementation.createDocument("", "ACAchievements", null);
    const root = xmlDoc.documentElement;

    achievementsData.forEach(achievement => {
        const achievementElement = xmlDoc.createElement("Achievement");

        const category = xmlDoc.createElement("Category");
        category.textContent = achievement.category;
        achievementElement.appendChild(category);

        const difficulty = xmlDoc.createElement("Difficulty");
        difficulty.textContent = achievement.difficulty;
        achievementElement.appendChild(difficulty);

        const id = xmlDoc.createElement("ID");
        id.textContent = achievement.id;
        achievementElement.appendChild(id);

        const name = xmlDoc.createElement("Achievementname");
        name.textContent = achievement.name;
        achievementElement.appendChild(name);

        const description = xmlDoc.createElement("Description");
        description.textContent = achievement.description;
        achievementElement.appendChild(description);

        const isCompleted = xmlDoc.createElement("isCompleted");
        isCompleted.textContent = achievement.isCompleted ? "TRUE" : "FALSE";
        achievementElement.appendChild(isCompleted);
		
		const isFollowing = xmlDoc.createElement("isFollowing");
		isFollowing.textContent = achievement.isFollowing ? "TRUE" : "FALSE";
		achievementElement.appendChild(isFollowing);

        root.appendChild(achievementElement);
    });

    return xmlDoc;
}

function filterByKingdom() {
    const categoryLogo = document.querySelector(".kingdom-logo").alt;
    
    let filteredAchievements = achievementsData;

    switch (categoryLogo) {
        case "InselProgress":
            filteredAchievements = achievementsData.filter(achievement => achievement.category === "InselProgress");
            break;
        case "Mode":
            filteredAchievements = achievementsData.filter(achievement => achievement.category === "Mode");
            break;
		case "Shopping":
            filteredAchievements = achievementsData.filter(achievement => achievement.category === "Shopping");
            break;
        case "Event":
            filteredAchievements = achievementsData.filter(achievement => achievement.category === "Event");
            break;
		case "Interaktion":
            filteredAchievements = achievementsData.filter(achievement => achievement.category === "Interaktion");
            break;
        case "Inselverschonerung":
            filteredAchievements = achievementsData.filter(achievement => achievement.category === "Inselverschonerung");
            break;
		case "Crafting":
            filteredAchievements = achievementsData.filter(achievement => achievement.category === "Crafting");
            break;
        case "Museum":
            filteredAchievements = achievementsData.filter(achievement => achievement.category === "Museum");
            break;
		case "Sonstige":
            filteredAchievements = achievementsData.filter(achievement => achievement.category === "Sonstige");
            break;
        case "DLC":
            filteredAchievements = achievementsData.filter(achievement => achievement.category === "DLC");
            break;
        // Weitere Fälle für andere Kingdoms hinzufügen
        default:
            break;
    }

    renderAchievements(filteredAchievements);
}

function getStarImage(difficulty) {
    switch (difficulty) {
        case "leicht":
            return "stars/MoonBronze.png";
        case "easy":
            return "stars/MoonBronze.png";
        case "mittel":
            return "stars/MoonSilver.png";
        case "normal":
            return "stars/MoonSilver.png";
        case "schwer":
            return "stars/MoonGold.png";
        case "hard":
            return "stars/MoonGold.png";
        case "extrem":
            return "stars/MoonDevil.png";
        case "extreme":
            return "stars/MoonDevil.png";
        case "kaizo":
            return "stars/MoonRainbow.png";
        default:
            return "stars/MoonBronze.png";
    }
}

function getKingdomImage(category) {
    switch (category) {
        case "InselProgress":
            return "images/InselProgress.png";
        case "Mode":
            return "images/Mode.png";
		case "Shopping":
            return "images/Shopping.png";
        case "Event":
            return "images/Event.png";
        case "Interaktion":
            return "images/Interaktion.png";
        case "Inselverschonerung":
            return "images/Inselverschonerung.png";
		case "Crafting":
            return "images/Crafting.png";
        case "Museum":
            return "images/Museum.png";
        case "Sonstige":
            return "images/Sonstige.png";
        case "DLC":
            return "images/DLC.png";
        default:
            return "images/placeholder.png";
    }
}

// Funktion zum Abrufen des Achievement-Icons
function getAchievementIcon(id, isCompleted) {
    return `achievementicon/${id}${isCompleted ? '-complete' : ''}.png`;
}

// Funktion zum Rendern der Erfolge
function renderAchievements(achievements) {
    const achievementList = document.getElementById("achievement-list");
    achievementList.innerHTML = "";

    achievements.forEach(achievement => {
        const item = document.createElement("div");
        item.className = "achievement-item";

        item.innerHTML = `
			<div class="achievement-id"><img src="${getAchievementIcon(achievement.id, achievement.isCompleted)}" onerror="this.src='achievementicon/placeholder.png'" alt="ID Icon" /> ID: ${achievement.id}</div>
            <div class="achievement-category"><img src="${getKingdomImage(achievement.category)}" alt="Category Icon" /> ${achievement.category}</div>
            <div class="achievement-difficulty"><img src="${getStarImage(achievement.difficulty)}" alt="Difficulty Icon" /> ${achievement.difficulty}</div>
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-description">${achievement.description}</div>
<label>
    Completed:
    <input type="checkbox" class="toggle" ${achievement.isCompleted ? "checked" : ""} data-id="${achievement.id}" disabled>
</label>
<label>
    Follow:
    <input type="checkbox" class="toggle3" ${achievement.isFollowing ? "checked" : ""} data-id="${achievement.id}" disabled>
</label>

        `;
        achievementList.appendChild(item);
    });
}

// Funktion für die Sortier-Listener
function setupSortListeners() {
    document.getElementById("sort-id").addEventListener("click", () => {
        const direction = document.getElementById("sort-id").value === "asc" ? 1 : -1;
const sorted = achievementsData.sort((a, b) => direction * (a.id - b.id));
    
    // Jetzt filterByKingdom auf das sortierte Ergebnis anwenden
    const filteredAchievements = filterByKingdomResult(sorted);
    renderAchievements(filteredAchievements);
    });
	
document.getElementById("sort-difficulty").addEventListener("click", () => {
    const selectedDifficulty = document.getElementById("sort-difficulty").value;
    // Definiere die Reihenfolge basierend auf der Auswahl
    let order;
    switch (selectedDifficulty) {
        case "leicht":
            order = ["leicht", "mittel", "schwer", "extrem", "kaizo"];
            break;
        case "mittel":
            order = ["mittel", "leicht", "schwer", "extrem", "kaizo"];
            break;
        case "schwer":
            order = ["schwer", "leicht", "mittel", "extrem", "kaizo"];
            break;
        case "extrem":
            order = ["extrem", "leicht", "mittel", "schwer", "kaizo"];
            break;
        case "kaizo":
            order = ["kaizo", "leicht", "mittel", "schwer", "extrem"];
            break;
        default:
            console.error("Ungültige Auswahl in 'sort-difficulty'.");
            order = ["leicht", "mittel", "schwer", "extrem", "kaizo"]; // Fallback-Reihenfolge
            break;
    }

    // Sortiere basierend auf der Reihenfolge
    const sorted = achievementsData.sort((a, b) => {
        return order.indexOf(a.difficulty) - order.indexOf(b.difficulty);
    });

    // Render die Ergebnisse
    const filteredAchievements = filterByKingdomResult(sorted);
    renderAchievements(filteredAchievements);
});

    const sortComplete = document.getElementById("sort-complete");

    sortComplete.addEventListener("click", () => {
        const sorted = [...achievementsData].sort((a, b) => {
            return sortComplete.value === "true"
                ? (a.isCompleted === b.isCompleted ? 0 : a.isCompleted ? -1 : 1)
                : (a.isCompleted === b.isCompleted ? 0 : a.isCompleted ? 1 : -1);
        });
        const filteredAchievements = filterByKingdomResult(sorted);
    renderAchievements(filteredAchievements);
    });
}

function filterByKingdomResult(sortedAchievements) {
    const categoryLogo = document.querySelector(".kingdom-logo").alt;
    
    let filteredAchievements = sortedAchievements;

    switch (categoryLogo) {
        case "InselProgress":
            filteredAchievements = sortedAchievements.filter(achievement => achievement.category === "InselProgress");
            break;
        case "Mode":
            filteredAchievements = sortedAchievements.filter(achievement => achievement.category === "Mode");
            break;
        case "Shopping":
            filteredAchievements = sortedAchievements.filter(achievement => achievement.category === "Shopping");
            break;
        case "Event":
            filteredAchievements = sortedAchievements.filter(achievement => achievement.category === "Event");
            break;
        case "Interaktion":
            filteredAchievements = sortedAchievements.filter(achievement => achievement.category === "Interaktion");
            break;
        case "Inselverschonerung":
            filteredAchievements = sortedAchievements.filter(achievement => achievement.category === "Inselverschonerung");
            break;
        case "Crafting":
            filteredAchievements = sortedAchievements.filter(achievement => achievement.category === "Crafting");
            break;
        case "Museum":
            filteredAchievements = sortedAchievements.filter(achievement => achievement.category === "Museum");
            break;
        case "Sonstige":
            filteredAchievements = sortedAchievements.filter(achievement => achievement.category === "Sonstige");
            break;
        case "DLC":
            filteredAchievements = sortedAchievements.filter(achievement => achievement.category === "DLC");
            break;
        default:
            break;
    }

    return filteredAchievements;
}


