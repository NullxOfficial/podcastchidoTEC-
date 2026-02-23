        /**
         * PARTICLE NETWORK ANIMATION
         * Uses HTML5 Canvas for high-performance rendering.
         */
        const canvas = document.getElementById('canvas1');
        const ctx = canvas.getContext('2d');
        
        // Configuration
        let particleArray = [];
        const numberOfParticles = 20; // Adjust density
        const connectionDistance = 120; // Max distance to draw line
        const mouseDistance = 120; // Mouse interaction radius
        
        // Set canvas size
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let mouse = {
            x: null,
            y: null,
            radius: mouseDistance
        }

        // Update mouse coordinates
        window.addEventListener('mousemove', function(event){
            mouse.x = event.x;
            mouse.y = event.y;
        });

        // Reset mouse when leaving window to prevent stuck particles
        window.addEventListener('mouseout', function(){
            mouse.x = undefined;
            mouse.y = undefined;
        });

        // Handle Resize
        window.addEventListener('resize', function(){
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            init();
        });

        // Particle Class
        class Particle {
            constructor(x, y, directionX, directionY, size, color){
                this.x = x;
                this.y = y;
                this.directionX = directionX;
                this.directionY = directionY;
                this.size = size;
                this.color = color;
                this.baseX = x; // Original position memory (optional, used for more complex effects)
                this.baseY = y;
            }

            // Draw individual particle
            draw(){
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                
                // Gradient fill for particles
                let gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
                gradient.addColorStop(0, '#ffffff');
                gradient.addColorStop(0.4, '#22d3ee'); // Cyan-400
                gradient.addColorStop(1, 'rgba(34, 211, 238, 0)');
                
                ctx.fillStyle = gradient;
                ctx.fill();
            }

            // Update particle position
            update(){
                // Boundary check - bounce off edges
                if (this.x > canvas.width || this.x < 0){
                    this.directionX = -this.directionX;
                }
                if (this.y > canvas.height || this.y < 0){
                    this.directionY = -this.directionY;
                }

                // Mouse Interaction (Repulsion/Attraction)
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx*dx + dy*dy);

                if (distance < mouse.radius + this.size){
                    // Push particles away from mouse
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (mouse.radius - distance) / mouse.radius;
                    const directionX = forceDirectionX * force * 3; // Strength of push
                    const directionY = forceDirectionY * force * 3;

                    this.x -= directionX;
                    this.y -= directionY;
                } else {
                    // Return to natural movement if not near mouse
                    if (this.x !== this.baseX){
                        let dx = this.x - this.baseX;
                        this.x -= dx/50; // Slowly return to flow
                    }
                    if (this.y !== this.baseY){
                        let dy = this.y - this.baseY;
                        this.y -= dy/50;
                    }
                }

                // Move particle
                this.x += this.directionX;
                this.y += this.directionY;
                
                // Update base coordinates to keep flow moving
                this.baseX += this.directionX;
                this.baseY += this.directionY;

                // Boundary check for base coordinates to prevent drift accumulation issues
                if (this.baseX > canvas.width) this.baseX = 0;
                if (this.baseX < 0) this.baseX = canvas.width;
                if (this.baseY > canvas.height) this.baseY = 0;
                if (this.baseY < 0) this.baseY = canvas.height;

                this.draw();
            }
        }

        // Create Particle Array
        function init(){
            particleArray = [];
            // Update UI counter
            document.getElementById('node-count').innerText = numberOfParticles;

            for (let i = 0; i < numberOfParticles; i++){
                let size = (Math.random() * 2) + 1;
                let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
                let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
                let directionX = (Math.random() * 0.8) - 0.4; // Speed X
                let directionY = (Math.random() * 0.8) - 0.4; // Speed Y
                let color = '#22d3ee';

                particleArray.push(new Particle(x, y, directionX, directionY, size, color));
            }
        }

        // Animation Loop
        function animate(){
            requestAnimationFrame(animate);
            
            // Clear canvas with slight opacity for trail effect (optional, set to 1 for no trails)
            // ctx.clearRect(0,0,innerWidth, innerHeight); 
            ctx.fillStyle = '#000099'; // Creates a fading trail effect background
            ctx.fillRect(0, 0, innerWidth, innerHeight);

            for (let i = 0; i < particleArray.length; i++){
                particleArray[i].update();
            }
            connect();
        }

        // Check if particles are close enough to draw lines
        function connect(){
            let opacityValue = 1;
            for (let a = 0; a < particleArray.length; a++){
                for (let b = a; b < particleArray.length; b++){
                    let distance = ((particleArray[a].x - particleArray[b].x) * (particleArray[a].x - particleArray[b].x))
                    + ((particleArray[a].y - particleArray[b].y) * (particleArray[a].y - particleArray[b].y));
                    
                    if (distance < (canvas.width/7) * (canvas.height/7)){
                        opacityValue = 1 - (distance/10000);
                        ctx.strokeStyle = 'rgba(34, 211, 238,' + opacityValue + ')'; // Cyan lines
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particleArray[a].x, particleArray[a].y);
                        ctx.lineTo(particleArray[b].x, particleArray[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        // Start
        init();
        animate();