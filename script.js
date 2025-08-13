    // DOM Elements
    const generateBtn = document.getElementById('generate-btn');
    const randomBtn = document.getElementById('random-btn');
    const promptInput = document.getElementById('prompt');
    const styleSelect = document.getElementById('style');
    const resolutionSelect = document.getElementById('resolution');
    const generatedImage = document.getElementById('generated-image');
    const imagePreview = document.querySelector('.image-preview');
    const placeholder = document.querySelector('.placeholder');
    const loading = document.getElementById('loading');
    const historyGrid = document.getElementById('history-grid');
    const notification = document.getElementById('notification');
    const promptTags = document.querySelectorAll('.prompt-tag');
    
    // Together AI API configuration
    const TOGETHER_API_KEY = 'tgp_v1_AzgKHSbFIyq98yBIhyZJhlRZYtyQQb132lrLT15pcR4';
    const MODEL_NAME = 'black-forest-labs/FLUX.1-schnell-Free';
    const API_URL = 'https://api.together.xyz/v1/images/generations';
    
    // Initialize with empty history
    function initHistory() {
        historyGrid.innerHTML = '';
        const savedHistory = JSON.parse(localStorage.getItem('imageHistory') || '[]');
        savedHistory.forEach(item => {
            addToHistory(item.imageUrl, item.prompt);
        });
    }
    
    // Show notification
    function showNotification(message) {
        notification.textContent = message;
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    // Add image to history
    function addToHistory(imageUrl, prompt) {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <img src="${imageUrl}" alt="Generated image">
            <div class="history-prompt">${prompt}</div>
        `;
        historyGrid.insertBefore(historyItem, historyGrid.firstChild);
        
        // Save to localStorage
        const savedHistory = JSON.parse(localStorage.getItem('imageHistory') || '[]');
        savedHistory.unshift({ imageUrl, prompt });
        localStorage.setItem('imageHistory', JSON.stringify(savedHistory.slice(0, 10)));
    }
    
    // Clear all images from history
    function clearHistory() {
        historyGrid.innerHTML = '';
        localStorage.removeItem('imageHistory');
        showNotification('All images cleared');
    }
    
    // Generate image using Together AI API
    async function generateImage() {
        const prompt = promptInput.value.trim();
        if (!prompt) {
            showNotification('Please enter a description for your image');
            return;
        }
        
        // Show loading state
        placeholder.style.display = 'none';
        loading.style.display = 'flex';
        generatedImage.style.display = 'none';
        
        try {
            // Get selected options
            const style = styleSelect.value;
            const resolution = resolutionSelect.value;
            const [width, height] = resolution.split('x').map(Number);
            const fullPrompt = `${style ? `${style} style, ` : ''}${prompt}`;
            
            // Make the API request
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${TOGETHER_API_KEY}`
                },
                body: JSON.stringify({
                    model: MODEL_NAME,
                    prompt: fullPrompt,
                    width: width,
                    height: height,
                    steps: 4,
                    n: 1
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.data || !data.data[0] || !data.data[0].url) {
                throw new Error('Invalid response format from API');
            }
            
            // Get the temporary image URL
            const tempImageUrl = data.data[0].url;
            
            // Display generated image directly from the URL
            generatedImage.src = tempImageUrl;
            generatedImage.style.display = 'block';
            loading.style.display = 'none';
            
            // Add to history
            addToHistory(tempImageUrl, prompt);
            
            showNotification('Image generated successfully!');
        } catch (error) {
            console.error('Error generating image:', error);
            loading.style.display = 'none';
            placeholder.style.display = 'flex';
            showNotification('Failed to generate image. Please try again.');
        }
    }
    
    // Set random prompt
    function setRandomPrompt() {
        const prompts = [
            "A futuristic city with flying cars and neon lights",
            "A mystical forest with glowing mushrooms and fairies",
            "An astronaut exploring a colorful alien planet",
            "A cyberpunk samurai in a rainy Tokyo street",
            "A steampunk airship flying over Victorian London",
            "An underwater castle surrounded by sea creatures"
        ];
        
        const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
        promptInput.value = randomPrompt;
    }
    
    // Event Listeners
    generateBtn.addEventListener('click', generateImage);
    randomBtn.addEventListener('click', setRandomPrompt);
    
    // Prompt tag click handlers
    promptTags.forEach(tag => {
        tag.addEventListener('click', () => {
            promptInput.value = tag.textContent;
        });
    });
    
    // Initialize
    initHistory();
    setRandomPrompt();
    
    // Add Clear Images button event listener if the button exists
    const clearImagesBtn = document.getElementById('clear-images-btn');
    if (clearImagesBtn) {
        clearImagesBtn.addEventListener('click', clearHistory);
    }
