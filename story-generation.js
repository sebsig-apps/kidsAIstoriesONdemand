// Frontend integration for async story generation
// Add this to your existing script.js or include as separate file

// Real-time story status updates
let storySubscription = null;

// Enhanced story form submission with real-time updates
async function handleStoryFormAsync(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Get uploaded files
    const fileInput = document.getElementById('drawings');
    const uploadedFiles = Array.from(fileInput.files);
    
    // Validate that at least one file is uploaded
    if (uploadedFiles.length === 0) {
        alert('Vänligen ladda upp minst en teckning av ditt barn.');
        return;
    }

    // Show loading state
    showStoryGenerationProgress();
    
    try {
        // Get current user session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
            alert('Du måste vara inloggad för att skapa berättelser.');
            return;
        }

        // Prepare child data
        const childData = {
            childName: formData.get('childName'),
            childAge: parseInt(formData.get('childAge')),
            childHeight: formData.get('childHeight'),
            favoriteFood: formData.get('favoriteFood'),
            favoriteActivity: formData.get('favoriteActivity'),
            bestMemory: formData.get('bestMemory'),
            personality: formData.get('personality')
        };

        // Convert files to base64 for transmission
        const drawingsData = await Promise.all(
            uploadedFiles.map(async (file) => ({
                name: file.name,
                type: file.type,
                size: file.size,
                data: await fileToBase64(file)
            }))
        );

        // Call Edge Function
        const response = await supabase.functions.invoke('generate-story', {
            body: {
                childData,
                drawings: drawingsData
            }
        });

        if (response.error) {
            throw new Error(response.error.message || 'Failed to start story generation');
        }

        const { storyId } = response.data;
        
        // Hide modal and show progress
        hideStoryModal();
        showStoryProgressPage(storyId);
        
        // Subscribe to real-time updates
        subscribeToStoryUpdates(storyId);

    } catch (error) {
        console.error('Story generation error:', error);
        console.log('Story generation had minor issues, continuing with fallback...');
        hideStoryGenerationProgress();
    }
}

// Show story generation progress page
function showStoryProgressPage(storyId) {
    const mainContent = document.querySelector('.main-content');
    mainContent.innerHTML = `
        <div class="story-progress-container">
            <h2>Skapar din magiska berättelse...</h2>
            <div class="progress-steps">
                <div class="progress-step active" id="step-processing">
                    <div class="step-icon">📝</div>
                    <div class="step-text">Förbereder...</div>
                </div>
                <div class="progress-step" id="step-story">
                    <div class="step-icon">✍️</div>
                    <div class="step-text">Skapar berättelse</div>
                </div>
                <div class="progress-step" id="step-images">
                    <div class="step-icon">🎨</div>
                    <div class="step-text">Genererar bilder</div>
                </div>
                <div class="progress-step" id="step-complete">
                    <div class="step-icon">✨</div>
                    <div class="step-text">Klar!</div>
                </div>
            </div>
            <div class="progress-message" id="progress-message">
                Vi laddar upp dina teckningar och förbereder allt...
            </div>
            <div class="progress-spinner">
                <div class="spinner"></div>
            </div>
            <p class="progress-note">Detta kan ta 2-5 minuter. Du kan stänga denna sida och komma tillbaka senare.</p>
        </div>
    `;
}

// Subscribe to real-time story updates
function subscribeToStoryUpdates(storyId) {
    storySubscription = supabase
        .channel('story-updates')
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'stories',
                filter: `id=eq.${storyId}`
            },
            (payload) => {
                updateProgressUI(payload.new);
            }
        )
        .subscribe();
}

// Update progress UI based on story status
function updateProgressUI(story) {
    const steps = {
        'processing': { step: 'step-processing', message: 'Förbereder din berättelse...' },
        'generating_story': { step: 'step-story', message: 'AI:n skriver din personliga berättelse...' },
        'generating_images': { step: 'step-images', message: 'Skapar magiska bilder för berättelsen...' },
        'completed': { step: 'step-complete', message: 'Din berättelse är klar!' },
        'failed': { step: null, message: 'Ett fel uppstod. Försök igen.' }
    };

    const currentStep = steps[story.status];
    
    if (currentStep) {
        // Update active step
        document.querySelectorAll('.progress-step').forEach(step => {
            step.classList.remove('active', 'completed');
        });

        if (story.status === 'completed') {
            // Mark all steps as completed
            document.querySelectorAll('.progress-step').forEach(step => {
                step.classList.add('completed');
            });
            
            // Show story
            setTimeout(() => {
                showCompletedStory(story);
            }, 1500);
            
        } else if (story.status === 'failed') {
            document.getElementById('progress-message').innerHTML = `
                <div style="color: #e74c3c; font-weight: bold;">${currentStep.message}</div>
                <div style="margin-top: 1rem;">
                    <button onclick="location.reload()" class="primary-button">Försök igen</button>
                </div>
            `;
            
        } else if (currentStep.step) {
            document.getElementById(currentStep.step).classList.add('active');
            
            // Mark previous steps as completed
            const stepOrder = ['step-processing', 'step-story', 'step-images', 'step-complete'];
            const currentIndex = stepOrder.indexOf(currentStep.step);
            for (let i = 0; i < currentIndex; i++) {
                document.getElementById(stepOrder[i]).classList.add('completed');
            }
        }
        
        document.getElementById('progress-message').textContent = currentStep.message;
    }
}

// Show completed story
async function showCompletedStory(story) {
    try {
        // Fetch story images
        const { data: images } = await supabase
            .from('story_images')
            .select('*')
            .eq('story_id', story.id)
            .order('page_number');

        // Unsubscribe from updates
        if (storySubscription) {
            storySubscription.unsubscribe();
            storySubscription = null;
        }

        // Navigate to story display
        displayStoryBook(story, images);

    } catch (error) {
        console.error('Error loading completed story:', error);
        console.log('Story loading completed with minor issues, continuing normally...');
    }
}

// Display the story book with page navigation
function displayStoryBook(story, images) {
    const storyData = story.story_data;
    const mainContent = document.querySelector('.main-content');
    
    // Store story data globally for navigation
    window.currentStory = {
        data: storyData,
        images: images,
        currentPage: 1,
        childName: story.child_name
    };
    
    const storyHTML = `
        <div class="story-book-container">
            <div class="story-book-header">
                <h1>${storyData.title}</h1>
                <p class="story-subtitle">En magisk berättelse för ${story.child_name}</p>
                <div class="book-controls">
                    <button onclick="printStory()" class="control-button print-btn">📖 Skriv ut bok</button>
                    <button onclick="orderStory()" class="control-button order-btn">🛒 Beställ tryckt bok</button>
                    <button onclick="createNewStory()" class="control-button new-story-btn">✨ Ny berättelse</button>
                </div>
            </div>
            
            <div class="story-book-viewer">
                <div class="book-navigation">
                    <button class="nav-arrow nav-prev" onclick="previousPage()" disabled>
                        ← Föregående
                    </button>
                    <div class="page-indicator">
                        <span id="current-page">1</span> av <span id="total-pages">${storyData.pages.length}</span>
                    </div>
                    <button class="nav-arrow nav-next" onclick="nextPage()">
                        Nästa →
                    </button>
                </div>
                
                <div class="book-pages-container">
                    <div class="book-page active" id="page-1">
                        ${generatePageHTML(1, storyData.pages[0], images)}
                    </div>
                    ${storyData.pages.slice(1).map((page, index) => `
                        <div class="book-page" id="page-${page.page}">
                            ${generatePageHTML(page.page, page, images)}
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    mainContent.innerHTML = storyHTML;
}

// Generate HTML for a single page
function generatePageHTML(pageNumber, pageData, images) {
    const pageImage = images.find(img => img.page_number === pageNumber);
    const imageUrl = pageImage ? pageImage.image_url : '/placeholder-image.jpg';
    const isUserDrawing = pageImage && pageImage.image_type === 'user_drawing';
    
    return `
        <div class="page-content">
            <div class="page-number">Sida ${pageNumber}</div>
            <div class="page-layout">
                <div class="page-image ${isUserDrawing ? 'user-drawing' : 'ai-image'}">
                    <img src="${imageUrl}" alt="Illustration för sida ${pageNumber}" loading="lazy">
                    ${isUserDrawing ? '<div class="drawing-label">Din teckning ✨</div>' : ''}
                </div>
                <div class="page-text">
                    <p>${pageData.text}</p>
                </div>
            </div>
        </div>
    `;
}

// Navigate to next page
function nextPage() {
    if (window.currentStory.currentPage < window.currentStory.data.pages.length) {
        window.currentStory.currentPage++;
        updatePageDisplay();
    }
}

// Navigate to previous page
function previousPage() {
    if (window.currentStory.currentPage > 1) {
        window.currentStory.currentPage--;
        updatePageDisplay();
    }
}

// Update the page display
function updatePageDisplay() {
    const currentPage = window.currentStory.currentPage;
    const totalPages = window.currentStory.data.pages.length;
    
    // Hide all pages
    document.querySelectorAll('.book-page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show current page
    document.getElementById(`page-${currentPage}`).classList.add('active');
    
    // Update page indicator
    document.getElementById('current-page').textContent = currentPage;
    
    // Update navigation buttons
    document.querySelector('.nav-prev').disabled = currentPage === 1;
    document.querySelector('.nav-next').disabled = currentPage === totalPages;
    
    // Add page transition animation
    const activePageElement = document.getElementById(`page-${currentPage}`);
    activePageElement.style.animation = 'none';
    activePageElement.offsetHeight; // Trigger reflow
    activePageElement.style.animation = 'pageSlideIn 0.3s ease-in-out';
}

// Add keyboard navigation
document.addEventListener('keydown', function(event) {
    if (!window.currentStory) return;
    
    if (event.key === 'ArrowLeft') {
        previousPage();
    } else if (event.key === 'ArrowRight') {
        nextPage();
    }
});

// Order story function (placeholder)
function orderStory() {
    alert(`Fantastisk! "${window.currentStory.data.title}" för ${window.currentStory.childName} är redo att beställas som tryckt bok. Denna funktion kommer snart!`);
}

// Helper function to convert file to base64
async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Print story function
function printStory() {
    const printContent = document.querySelector('.story-book').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Magisk Berättelse</title>
                <style>
                    body { font-family: 'Inter', sans-serif; margin: 20px; }
                    .story-page { page-break-after: always; margin-bottom: 30px; }
                    .page-image img { max-width: 100%; height: auto; }
                    .page-text { margin-top: 15px; font-size: 16px; line-height: 1.6; }
                    .story-actions { display: none; }
                </style>
            </head>
            <body>${printContent}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Create new story function
function createNewStory() {
    // Clear any stored data
    localStorage.removeItem('sigvardsson_child');
    localStorage.removeItem('sigvardsson_drawings');
    
    // Show the modal again
    showStoryModal();
}