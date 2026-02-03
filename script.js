document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("heartCanvas");
    const ctx = canvas.getContext("2d");
    const nameInput = document.getElementById('nameInput');
    const inputStage = document.getElementById('inputStage');
    const questionStage = document.getElementById('questionStage');
    const introText = document.getElementById('intro');
    const title = document.getElementById('title');
    const buttonsContainer = document.getElementById('buttons');
    const yesBtn = document.getElementById('yesBtn');
    const finalPopup = document.getElementById('final-popup');

    canvas.width = 700;
    canvas.height = 650;
    let time = 0;
    let messages = [];
    let clickIndex = 0;
    let isTransitioning = false;
    let isEnding = false;
    let userName = ""; 

    const btnTexts = ["Yes", "Are you sure?", "Really?", "Pls?", "Yes, I will!"];
    let btnStep = 0;

    function heartPoint(t, scale = 18) {
        return {
            x: scale * 16 * Math.pow(Math.sin(t), 3),
            y: -scale * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))
        };
    }

    function drawHeart() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2 + 20;

        const pulseSpeed = isEnding ? 5 : 2; 
        const pulseAmount = isEnding ? 0.12 : 0.05;
        const pulse = 0.95 + pulseAmount * Math.sin(time * pulseSpeed);
        
        // DYNAMIC ECHO: Layers increase based on clickIndex
        // Starts with 1 layer, adds more as messages progress.
        let layerCount = isEnding ? 5 : (1 + clickIndex);
        const layers = Array.from({ length: layerCount }, (_, i) => 1 + (i * 0.15));

        layers.forEach((layerScale, index) => {
            const dots = isEnding ? 130 : 100;
            // Layers get fainter as they go outward
            const opacityMultiplier = (1 - (index * 0.2));

            for (let i = 0; i < dots; i++) {
                const angle = (i / dots) * Math.PI * 2 + time;
                const baseScale = isEnding ? 18 : 16;
                const p = heartPoint(angle, baseScale * pulse * layerScale);
                
                ctx.beginPath();
                const radius = isEnding ? (Math.random() * 2.5 + 1) : 2;
                ctx.arc(centerX + p.x, centerY + p.y, radius, 0, Math.PI * 2);
                
                if (isEnding) {
                    ctx.fillStyle = `rgba(255, ${150 + Math.random() * 105}, ${180 + Math.random() * 75}, ${opacityMultiplier * (0.3 + Math.random() * 0.4)})`;
                } else {
                    // Subtle color shift as layers increase
                    const red = 255;
                    const green = 77 + (index * 20);
                    const blue = 109 + (index * 15);
                    ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${opacityMultiplier * (0.15 + Math.random() * 0.2)})`;
                }
                ctx.fill();
            }
        });
        
        time += isEnding ? 0.007 : 0.002; 
        requestAnimationFrame(drawHeart);
    }
    drawHeart();

    // Spawn heart on click
    document.addEventListener("click", (e) => {
        if (e.target.id === 'nameInput') return;
        const heart = document.createElement("div");
        heart.className = "click-heart";
        heart.style.left = `${e.clientX}px`;
        heart.style.top = `${e.clientY}px`;
        heart.innerText = "❤️";
        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 2500);
    });

    nameInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && nameInput.value.trim()) {
            userName = nameInput.value.trim();
            messages = [
                `Hey ${userName}, I’ve been wanting to 
                ask you something ❤️`, //
                `You’re one of the most 
                interesting people I know.`,
                `I love how your laugh 
                makes me forget everything.`,
                `You make even the simplest 
                things feel special.`,
                `Being around you just feels… right.`
            ];
            inputStage.classList.add("hidden");
            questionStage.classList.remove("hidden");
            showNextMessage();
        }
    });

    questionStage.addEventListener("click", (e) => {
        // Clicking the message area increments the background heart echo
        if (e.target.id !== 'yesBtn' && !isTransitioning && clickIndex <= messages.length) {
            showNextMessage();
        }
    });

    function showNextMessage() {
        if (clickIndex < messages.length) {
            introText.classList.remove('animate-slide');
            void introText.offsetWidth; 
            introText.innerText = messages[clickIndex];
            introText.classList.add('animate-slide');
            clickIndex++; // This adds a layer to drawHeart()
        } else {
            isTransitioning = true;
            introText.classList.add('animate-exit');
            setTimeout(() => {
                introText.classList.add('hidden');
                title.classList.remove('hidden');
                title.classList.add('pop');
                buttonsContainer.classList.remove('hidden');
                buttonsContainer.classList.add('pop');
                isTransitioning = false;
                // Keep the layers at max for the button sequence
            }, 700);
        }
    }

    yesBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (btnStep < btnTexts.length - 1) {
            btnStep++;
            yesBtn.innerText = btnTexts[btnStep];
            const rangeX = 200;
            const rangeY = 150;
            const randomX = Math.floor(Math.random() * rangeX * 2) - rangeX;
            const randomY = Math.floor(Math.random() * rangeY * 2) - rangeY;
            const isOverlappingText = (randomY > -100 && randomY < 20) && (Math.abs(randomX) < 180);
            if (isOverlappingText) {
                yesBtn.classList.add('transparent-mode');
            } else {
                yesBtn.classList.remove('transparent-mode');
            }
            yesBtn.style.transform = `translate(${randomX}px, ${randomY}px)`;
            yesBtn.style.fontSize = (18 + btnStep * 2) + "px";
        } else {
            isEnding = true; //
            canvas.style.filter = "drop-shadow(0 0 30px #ff4d6d)"; 
            const successSub = finalPopup.querySelector('p');
            successSub.innerHTML = `You'll forever be my always, <span style="color: #ff4d6d;">@${userName}.</span>`;
            title.classList.add('hidden');
            yesBtn.classList.add('hidden');
            finalPopup.classList.remove('hidden');
            finalPopup.classList.add('pop');
            startHeartRain();
        }
    });

    function startHeartRain() {
        const container = document.getElementById('hearts-container');
        setInterval(() => {
            const heart = document.createElement("div");
            heart.className = "heart";
            heart.style.left = Math.random() * 100 + "vw";
            heart.style.fontSize = (Math.random() * 20 + 15) + "px";
            heart.style.animationDuration = (Math.random() * 2 + 2) + "s";
            heart.innerText = "❤️";
            container.appendChild(heart);
            setTimeout(() => heart.remove(), 4000);
        }, 150);
    }
});