document.addEventListener("DOMContentLoaded", function() {
    loadFromIndexedDB(); // Versuchen, Daten aus IndexedDB zu laden
    setupSortListeners();
    document.querySelector(".Downloadknopf").addEventListener("click", downloadXML);
    document.querySelector("#fileInput").addEventListener("change", handleFileUpload); // Datei-Upload
    document.querySelector(".Deleteknopf").addEventListener("click", deleteIndexedDB);
	
});

function disableToggle(){
	alert("A");
    event.preventDefault(); 
}

function deleteIndexedDB() {
    // Zeige Bestätigungs-Popup
    const confirmed = confirm("Do you want to DELETE the current Database?");

    if (confirmed) {
        // Wenn der Benutzer bestätigt hat, lösche die Datenbank
        const request = indexedDB.deleteDatabase("AchievementsDB");

            const achievementList = document.getElementById("achievement-list");
            achievementList.innerHTML = "";

        request.onerror = function() {
            console.log("Error deleting Database");
        };
		
		location.reload();
		updateGreenscreenData();
		
    } else {
        console.log("Deletion canceled.");
    }
}


let achievementsData = [];

// Funktion zum Verarbeiten des Datei-Uploads
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file && file.type === "text/xml") {
        const reader = new FileReader();
        reader.onload = function() {
            const xmlData = reader.result;
            //loadAchievementsFromXML(xmlData);
        };
        reader.readAsText(file);
    } else {
        alert("Upload Valid XML-File");
    }
}

// Funktion zum Laden von Erfolgen aus einer XML-Datei
/*function loadAchievementsFromXML(xmlData) {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlData, "application/xml");
    const achievements = xml.getElementsByTagName("Achievement");

    achievementsData = Array.from(achievements).map(achievement => {
        const category = achievement.getElementsByTagName("Category")[0].textContent;
        const difficulty = achievement.getElementsByTagName("Difficulty")[0].textContent.toLowerCase();
        const id = parseInt(achievement.getElementsByTagName("ID")[0].textContent);
        const name = achievement.getElementsByTagName("Achievementname")[0].textContent;
        const description = achievement.getElementsByTagName("Description")[0].textContent;
        const isCompleted = achievement.getElementsByTagName("isCompleted")[0].textContent === "TRUE";
		const isFollowing = achievement.getElementsByTagName("isFollowing")[0].textContent === "TRUE";

        return {
            category,
            difficulty,
            id,
            name,
            description,
            isCompleted,
			isFollowing
        };
    });

    filterByKingdom();
    saveToIndexedDB(); // Speichern der Daten in IndexedDB
	
	updateGreenscreenData();
}*/

// Lade einmal beim Start
loadAchievementsFromXMLRepo();

// Rufe die Funktion jede Minute (60000 ms) erneut auf
setInterval(() => {
    loadAchievementsFromXMLRepo();
}, 60000); // 60000 ms = 1 Minute

// Funktion zum Laden von Erfolgen aus einer XML-Datei direkt von GitHub
async function loadAchievementsFromXMLRepo() {
    const url = 'https://raw.githubusercontent.com/Sky/WebsiteReader/main/achievement.xml'; // Raw-URL deiner XML im Repo

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
        saveToIndexedDB(); // Optional: speichert lokal
        updateGreenscreenData();

    } catch (error) {
        console.error('Fehler beim Laden der Achievements von GitHub:', error);
        alert('Die Achievements konnten nicht geladen werden.');
    }
}

function updateGreenscreenData() {
    const totalAchievementsAC = achievementsData.length; // Gesamtzahl der Achievements
    const completedAchievementsAC = achievementsData.filter(a => a.isCompleted).length; // Anzahl der abgeschlossenen Achievements

    localStorage.setItem("totalAchievementsAC", JSON.stringify({
        total: totalAchievementsAC,
        completed: completedAchievementsAC
    }));
}




function toggleIsCompleted(id, isChecked) {
    // Suchen des Achievement in achievementsData
    const achievement = achievementsData.find(a => a.id === id);
    if (achievement) {
        // Änderung im achievementsData Array vornehmen
        achievement.isCompleted = isChecked;

		const achievementElement = document.querySelector(`[data-id="${id}"]`).closest('.achievement-item');
        const imageElement = achievementElement.querySelector('.achievement-id img');
        imageElement.src = getAchievementIcon(id, isChecked); // Bild neu setzen
        imageElement.onerror = function() {
            this.src = 'achievementicon/placeholder.png'; // Fallback-Bild, falls das Bild nicht geladen werden kann
        };
		
        // Speichern der geänderten Daten in IndexedDB
        saveToIndexedDB();
		
		if(isChecked == true){
		CommunicationGreenscreenComplete(achievement);
		CommunicationGreenscreenLastDone(achievement);
		
		}
		updateGreenscreenData();
		
    } else {
        alert("Achievement not found! What the fuck did you toggle");
    }
}

function toggleIsFollowing(id, isChecked) {
    // Suchen des Achievement in achievementsData
    const achievement = achievementsData.find(a => a.id === id);
    if (achievement) {
        // Änderung im achievementsData Array vornehmen
		
		if (isChecked) {
            // Setze den "isFollowing"-Status für alle anderen auf 'false'
            achievementsData.forEach(a => {
                if (a.id !== id) {
                    a.isFollowing = false; // Alle anderen auf 'false' setzen
                }
            });
        }
		
        achievement.isFollowing = isChecked;
		
        // Speichern der geänderten Daten in IndexedDB
        saveToIndexedDB();
		
		document.querySelectorAll('.toggle3').forEach(checkbox => {
            const checkboxId = parseInt(checkbox.dataset.id, 10);
            const relatedAchievement = achievementsData.find(a => a.id === checkboxId);
            checkbox.checked = relatedAchievement?.isFollowing || false;
        });
		
		if(isChecked == true){
		CommunicationGreenscreenFollowing(achievement)
		}
    } else {
        alert("Achievement not found! What the fuck did you toggle");
    }
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

// Funktion zum Herunterladen der XML-Daten
function downloadXML() {
	const confirmed = confirm("Are you sure you wanna download the current Database?");

    if (confirmed) {
    const xmlDoc = createXMLDocument();
    const serializer = new XMLSerializer();
    const xmlString = serializer.serializeToString(xmlDoc);

    const blob = new Blob([xmlString], { type: "application/xml" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "ACAchievements.xml";
    link.click();
    URL.revokeObjectURL(link.href);
	
    } else {
        console.log("Download canceled.");
    }
	
   
}

function saveToIndexedDB() {
    const request = indexedDB.open("AchievementsDB", 1);

    request.onupgradeneeded = function(event) {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("achievements")) {
            db.createObjectStore("achievements", { keyPath: "id" });
        }
    };

    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction("achievements", "readwrite");
        const store = transaction.objectStore("achievements");

        achievementsData.forEach(achievement => {
            store.put(achievement); // Speichern jedes Erfolges in der Datenbank
        });

        transaction.oncomplete = function() {
            console.log("Achievements in IndexedDB gespeichert.");
        };
    };

    request.onerror = function(event) {
        console.log("Fehler beim Speichern der Erfolge in IndexedDB:", event);
    };
}

// Funktion zum Laden der Daten aus IndexedDB
function loadFromIndexedDB() {
    const request = indexedDB.open("AchievementsDB", 1);

    request.onupgradeneeded = function(event) {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("achievements")) {
            db.createObjectStore("achievements", { keyPath: "id" });
        }
    };

    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction("achievements", "readonly");
        const store = transaction.objectStore("achievements");

        const allAchievementsRequest = store.getAll();
        allAchievementsRequest.onsuccess = function() {
            achievementsData = allAchievementsRequest.result;
            if (achievementsData.length > 0) {
                filterByKingdom()
            }
			updateGreenscreenData();
        };
    };

    request.onerror = function(event) {
        console.log("Fehler beim Laden der Erfolge aus IndexedDB:", event);
    };
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
                <input type="checkbox" class="toggle" ${achievement.isCompleted ? "checked" : ""} data-id="${achievement.id}" onchange="toggleIsCompleted(${achievement.id}, this.checked)">
            </label>
			<label>
                Follow:
                <input type="checkbox" class="toggle3" ${achievement.isFollowing ? "checked" : ""} data-id="${achievement.id}" onchange="toggleIsFollowing(${achievement.id}, this.checked)">
            </label>
        `;
        achievementList.appendChild(item);
    });
	document.querySelectorAll('.toggle, .toggle3').forEach(cb => cb.disabled = true);
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


