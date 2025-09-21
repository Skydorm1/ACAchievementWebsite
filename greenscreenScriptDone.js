var deactivateMoons = true;


document.addEventListener("DOMContentLoaded", function() {
    setInterval(function() {
        // Überprüfen, ob ein Achievement als „Complete“ markiert wurde
        const storedCompleteAchievement = localStorage.getItem("completeAchievement");
        
        if (storedCompleteAchievement) {
            const completeData = JSON.parse(storedCompleteAchievement);

            // Aktualisiere das Bild, den Namen und die Beschreibung für „Complete“-Achievement
            const imageElement = document.querySelector('.achievement-icon-Complete');
            imageElement.src = getAchievementIcon(completeData.id);
            imageElement.onerror = function() {
                this.src = 'achievementicon/placeholder.png';
            };

            const nameElement = document.querySelector('.achievement-name-Complete');
            nameElement.textContent = completeData.name;

            const descriptionElement = document.querySelector('.achievement-description-Complete');
            descriptionElement.textContent = completeData.description;
			
            // Animation nach Aktualisierung der Daten starten
            startCompleteAnimation(imageElement, completeData.id);

            // Daten aus dem `localStorage` entfernen
            localStorage.removeItem("completeAchievement");
			adjustAchievementNameSize();
        }
    }, 1000); // Überprüfung alle 1 Sekunde
});

function getAchievementIcon(id) {
    return `achievementicon/${id}.png`;
}

var timeToMove = 1.6; 
var timeItPauses = 1.75

function startCompleteAnimation(achievementIcon, id) {
    // Ziel-Element
    const boxComplete = document.querySelector('.achievement-box-Complete');
	adjustAchievementNameSize() 
    // Übergang für die Bewegung (timeToMove steuert die Geschwindigkeit)
    boxComplete.style.transition = `top ${timeToMove}s ease`;
    boxComplete.style.top = '-15%';

    setTimeout(function() {
        replaceAchievementIcon(achievementIcon, id);

        setTimeout(function() {
            boxComplete.style.top = '-75%';
        }, timeItPauses * 1000);
    }, timeToMove * 1000);
}

// Funktion zum Ersetzen des Achievement-Icons durch ein „Complete“-Bild
function replaceAchievementIcon(iconElement, id) {
    const stampImage = document.createElement('img');
    stampImage.src = `achievementicon/${id}-complete.png`; // „Complete“-Bild mit `-complete` Endung
    stampImage.alt = "Complete Icon";
    stampImage.classList.add('stamp-image');

    stampImage.onerror = function() {
        stampImage.src = 'achievementicon/placeholder-complete.png';
    };

    const boxComplete = document.querySelector('.achievement-box-Complete');
    boxComplete.appendChild(stampImage);

    const iconRect = iconElement.getBoundingClientRect();
    const boxRect = boxComplete.getBoundingClientRect();
    const iconX = iconRect.left - boxRect.left;
    const iconY = iconRect.top - boxRect.top;

    stampImage.style.left = `${iconX}px`;
    stampImage.style.top = `${iconY - 400}px`;
    stampImage.style.opacity = 1;
    stampImage.style.transform = 'rotate(0deg)';

    setTimeout(function() {
        stampImage.style.transition = 'all 0.5s ease';
        stampImage.style.top = `${iconY - 2}px`;
        stampImage.style.transform = 'rotate(0deg)';
    }, 50);

    setTimeout(function() {
        stampImage.remove();
    }, 3000);
}


function updateColorsTitle() {
    // Referenzen zu den Farb-Pickern
    const titleColorPicker = document.getElementById('title-color-picker');

    const titleColor = titleColorPicker.value;

    const titleElements = document.querySelectorAll('[class^="achievement-name"]');
    titleElements.forEach(element => {
        element.style.color = titleColor;
    });
}

function updateColorsDescription() {
    const descriptionColorPicker = document.getElementById('description-color-picker');
	
    const descriptionColor = descriptionColorPicker.value;
	
    const descriptionElements = document.querySelectorAll('[class^="achievement-description"]');
    descriptionElements.forEach(element => {
        element.style.color = descriptionColor;
    });
}

function updateColorsBackground() {
	const backgroundColorPicker = document.getElementById('background-color-picker');

	const backgroundColor = backgroundColorPicker.value;

	document.body.style.background = backgroundColor;
}

function resetColors() {
	const titleElements = document.querySelectorAll('[class^="achievement-name"]');
    titleElements.forEach(element => {
        element.style.color = "#ffffff";
    });

    // Alle Elemente mit der Klasse "achievement-description"
    const descriptionElements = document.querySelectorAll('[class^="achievement-description"]');
    descriptionElements.forEach(element => {
        element.style.color = "#ffffff";
    });
	
	document.body.style.background = "#3c395d";
}



// Event Listener hinzufügen, sobald DOM vollständig geladen ist
document.addEventListener('DOMContentLoaded', () => {
    // Referenzen zu den Farb-Pickern
    const titleColorPicker = document.getElementById('title-color-picker');
    const descriptionColorPicker = document.getElementById('description-color-picker');
	const backgroundColorPicker = document.getElementById('background-color-picker');
	
	const buttonReset = document.getElementById('colorreset');

    // Event Listener für beide Picker
    titleColorPicker.addEventListener('input', updateColorsTitle);
    descriptionColorPicker.addEventListener('input', updateColorsDescription);
	backgroundColorPicker.addEventListener('input', updateColorsBackground);
	buttonReset.addEventListener('click', resetColors);
});



function adjustAchievementNameSize() {
   /*  // Alle Elemente mit der Klasse 'achievement-name'
    const elements = document.querySelectorAll('[class^="achievement-name-"]');
	
    elements.forEach(element => {
      // Überprüfen, ob die Höhe des Elements >= 100px ist
      const elementHeight = element.offsetHeight;
      if (elementHeight >= 240) {
        // Wenn die Höhe des Elements >= 100px, setze die Schriftgröße auf 16px
        element.style.fontSize = '62px';
      } 
	  if (elementHeight >= 200) {
        // Wenn die Höhe des Elements >= 100px, setze die Schriftgröße auf 16px
        element.style.fontSize = '58px';
      } 
	  if (elementHeight >= 175) {
        // Wenn die Höhe des Elements >= 100px, setze die Schriftgröße auf 16px
        element.style.fontSize = '50px';
      } 
    }); */
  }
