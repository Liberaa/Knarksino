document.addEventListener("DOMContentLoaded", () => {
const symbols = ["💊", "🌿", "🍄", "🧪", "💉", "🧬", "🚬"];
    const reels = Array.from({ length: 5 }, (_, i) => document.getElementById(`reel${i + 1}`));
    const result = document.getElementById("result");
    const button = document.getElementById("spin-button");
    const winSound = document.getElementById("win-sound");

    function getRandomSymbol() {
        return symbols[Math.floor(Math.random() * symbols.length)];
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function spinReels() {
        button.disabled = true;
        result.textContent = "Spinning...";

        let finalSymbols = [];

        for (let i = 0; i < reels.length; i++) {
            for (let j = 0; j < 8; j++) { // Faster: fewer cycles
                reels[i].classList.add("spin");
                reels[i].textContent = getRandomSymbol();
                await sleep(20); // Faster delay
            }
            reels[i].classList.remove("spin");
            finalSymbols.push(reels[i].textContent);
        }

        evaluateResult(finalSymbols);
        button.disabled = false;
    }

    function evaluateResult(symbols) {
        const counts = {};
        symbols.forEach(symbol => counts[symbol] = (counts[symbol] || 0) + 1);

        const maxCount = Math.max(...Object.values(counts));

        if (maxCount >= 3) {
            result.textContent = `🎉 WIN! ${maxCount} symbols matched!`;
            winSound.play();
        } else {
            result.textContent = "🙁 No win. Try again!";
        }
    }

    button.addEventListener("click", spinReels);
});
