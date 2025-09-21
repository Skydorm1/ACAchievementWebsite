document.addEventListener("DOMContentLoaded", function () {
    setInterval(function () {
        const storedAchievement = localStorage.getItem("totalAchievementsAC");
        
        if (storedAchievement) {
            // Parse stored achievement data
            const achievementData = JSON.parse(storedAchievement);

            const { total, completed } = achievementData;

            // Berechnung der Prozentzahl, gerundet auf 2 Nachkommastellen
            const percentage = total > 0 ? ((completed / total) * 100).toFixed(2) : "0.00";

            // Update Achievements Text
            const achievementsDoneElement = document.querySelector(".achievements-Done");
            const achievementsDonePercentageElement = document.querySelector(".achievements-DonePercentage");

            if (achievementsDoneElement) {
                achievementsDoneElement.textContent = `Achievements: ${completed} / ${total}`;
            }

            if (achievementsDonePercentageElement) {
                achievementsDonePercentageElement.textContent = `Completed: ${percentage} %`;
            }

            // Optionally remove the item from localStorage after use
            localStorage.removeItem("totalAchievementsAC");
        }
    }, 1000); // Überprüfung alle 1 Sekunde
});



