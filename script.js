// Local storage helper functions
function saveData(key, data) {
    localStorage.setItem(`sigvardsson_${key}`, JSON.stringify(data));
}

function getData(key) {
    const data = localStorage.getItem(`sigvardsson_${key}`);
    return data ? JSON.parse(data) : null;
}

// Check if user is authenticated
async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// Logout function
async function logout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            alert('Fel vid utloggning: ' + error.message);
            return;
        }
        
        // Clear any localStorage data
        localStorage.clear();
        
        // Redirect to homepage
        window.location.href = 'index.html';
        
    } catch (error) {
        alert('Ett fel uppstod: ' + error.message);
    }
}

// Initialize page based on current location
document.addEventListener('DOMContentLoaded', async function() {
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'index.html' || currentPage === '') {
        initLoginPage();
    } else if (currentPage === 'form.html') {
        // Check if user is logged in
        const user = await checkAuth();
        if (!user) {
            window.location.href = 'index.html';
            return;
        }
        initFormPage();
    } else if (currentPage === 'story.html') {
        // Check if user is logged in
        const user = await checkAuth();
        if (!user) {
            window.location.href = 'index.html';
            return;
        }
        initStoryPage();
    }
});

// Modal functions
function showLoginModal() {
    document.getElementById('signupModal').style.display = 'none';
    document.getElementById('loginModal').style.display = 'block';
}

function hideLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

function showSignupModal() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('signupModal').style.display = 'block';
}

function hideSignupModal() {
    document.getElementById('signupModal').style.display = 'none';
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const storyModal = document.getElementById('storyModal');
    
    if (event.target == loginModal) {
        loginModal.style.display = 'none';
    }
    if (event.target == signupModal) {
        signupModal.style.display = 'none';
    }
    if (event.target == storyModal) {
        storyModal.style.display = 'none';
    }
}

// Login page functionality
async function initLoginPage() {
    // Check if user is already logged in
    const user = await checkAuth();
    if (user) {
        showLoggedInView();
        return;
    }
    
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
}

// Show logged-in view
function showLoggedInView() {
    // Hide the public sections
    document.querySelector('.hero').style.display = 'none';
    document.querySelector('.welcome-section').style.display = 'none';
    
    // Update navigation
    const loginNav = document.querySelector('.login-nav');
    loginNav.innerHTML = '<a href="#" class="login-button" onclick="logout()">Logga ut</a>';
    
    // Show logged-in content
    const mainContent = document.querySelector('.main-content');
    mainContent.innerHTML = `
        <div class="logged-in-welcome">
            <h2>Välkommen till Magiska Berättelser!</h2>
            <p class="welcome-text">
                Här börjar magin! Ditt barns teckningar kommer att förvandlas till liv genom AI:s kraft. 
                Vi skapar en kort bok som skrivs ut och berättas med hjälp av artificiell intelligens. 
                Teckningarna blir del av en personlig berättelse som inkluderar ditt barns egna karaktärer och världar. 
                Tillsammans med den information du väljer att dela med oss skapar vi något helt unikt för just ditt barn.
            </p>
            <button class="primary-button create-story-btn" onclick="showStoryModal()">Skapa en magisk berättelse</button>
        </div>
    `;
}

// Show story creation modal
function showStoryModal() {
    document.getElementById('storyModal').style.display = 'block';
    // Initialize file upload functionality
    initFileUpload();
}

// Hide story creation modal
function hideStoryModal() {
    document.getElementById('storyModal').style.display = 'none';
    // Clear file preview when modal is closed
    const filePreview = document.getElementById('file-preview');
    if (filePreview) {
        filePreview.innerHTML = '';
    }
}

// Initialize file upload functionality
function initFileUpload() {
    const fileInput = document.getElementById('drawings');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelection);
    }
}

// Handle file selection and preview
function handleFileSelection(event) {
    const files = Array.from(event.target.files);
    const filePreview = document.getElementById('file-preview');
    
    // Clear previous preview
    filePreview.innerHTML = '';
    
    files.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-preview-item';
        fileItem.setAttribute('data-file-index', index);
        
        if (file.type.startsWith('image/')) {
            // Create image preview for image files
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.onload = () => URL.revokeObjectURL(img.src); // Free memory
            fileItem.appendChild(img);
        } else {
            // Create icon for non-image files (PDF, etc.)
            const fileIcon = document.createElement('div');
            fileIcon.innerHTML = '📄';
            fileIcon.style.fontSize = '40px';
            fileIcon.style.display = 'flex';
            fileIcon.style.alignItems = 'center';
            fileIcon.style.justifyContent = 'center';
            fileIcon.style.width = '80px';
            fileIcon.style.height = '80px';
            fileIcon.style.border = '2px solid var(--border-color)';
            fileIcon.style.borderRadius = '4px';
            fileIcon.style.backgroundColor = 'var(--light-beige)';
            fileItem.appendChild(fileIcon);
        }
        
        // Add file name
        const fileName = document.createElement('div');
        fileName.className = 'file-preview-name';
        fileName.textContent = file.name;
        fileName.title = file.name; // Show full name on hover
        fileItem.appendChild(fileName);
        
        // Add remove button
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-file';
        removeBtn.innerHTML = '×';
        removeBtn.title = 'Ta bort fil';
        removeBtn.onclick = (e) => {
            e.preventDefault();
            removeFile(index, event.target);
        };
        fileItem.appendChild(removeBtn);
        
        filePreview.appendChild(fileItem);
    });
}

// Remove a file from selection
function removeFile(fileIndex, fileInput) {
    const dt = new DataTransfer();
    const files = Array.from(fileInput.files);
    
    // Add all files except the one to remove
    files.forEach((file, index) => {
        if (index !== fileIndex) {
            dt.items.add(file);
        }
    });
    
    // Update file input
    fileInput.files = dt.files;
    
    // Trigger change event to update preview
    fileInput.dispatchEvent(new Event('change'));
}

// Enhanced story form submission with real-time updates
async function handleStoryForm(e) {
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
            hideStoryGenerationProgress();
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

        // TEMPORARY: Create mock story for immediate testing
        console.log('Creating mock story for immediate testing...');
        
        // Hide modal and show progress
        hideStoryModal();
        showStoryProgressPage('mock-story-id');
        
        // Simulate story generation with immediate results
        setTimeout(() => {
            simulateStoryGeneration(childData, uploadedFiles);
        }, 1000);

    } catch (error) {
        console.error('Story generation error:', error);
        alert('Ett fel uppstod vid skapande av berättelsen. Försök igen.');
        hideStoryGenerationProgress();
    }
}

// Convert file to base64
async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Show story generation progress
function showStoryGenerationProgress() {
    console.log('Showing story generation progress...');
}

// Hide story generation progress
function hideStoryGenerationProgress() {
    console.log('Hiding story generation progress...');
}

// Show story progress page
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
    console.log('Subscribing to story updates for:', storyId);
    
    // Set up real-time subscription
    const subscription = supabase
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
                console.log('Story update received:', payload.new);
                updateProgressUI(payload.new);
            }
        )
        .subscribe((status) => {
            console.log('Subscription status:', status);
            if (status === 'SUBSCRIBED') {
                console.log('Successfully subscribed to story updates');
            }
        });

    // Store subscription for cleanup
    window.storySubscription = subscription;
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
            
            // Don't call showCompletedStory for mock stories - they're handled differently
            console.log('Story marked as completed, but mock story display is handled separately');
            
        } else if (story.status === 'failed') {
            const progressMessage = document.getElementById('progress-message');
            if (progressMessage) {
                progressMessage.innerHTML = `
                    <div style="color: #e74c3c; font-weight: bold;">${currentStep.message}</div>
                    <div style="margin-top: 1rem; font-size: 0.9rem;">
                        ${story.error_message || 'Ett oväntat fel uppstod.'}
                    </div>
                    <div style="margin-top: 1rem;">
                        <button onclick="createNewStory()" class="primary-button">Försök igen</button>
                    </div>
                `;
            }
            
        } else if (currentStep.step) {
            const stepElement = document.getElementById(currentStep.step);
            if (stepElement) {
                stepElement.classList.add('active');
                
                // Mark previous steps as completed
                const stepOrder = ['step-processing', 'step-story', 'step-images', 'step-complete'];
                const currentIndex = stepOrder.indexOf(currentStep.step);
                for (let i = 0; i < currentIndex; i++) {
                    const prevStep = document.getElementById(stepOrder[i]);
                    if (prevStep) {
                        prevStep.classList.add('completed');
                    }
                }
            }
        }
        
        const progressMessage = document.getElementById('progress-message');
        if (progressMessage && story.status !== 'failed') {
            progressMessage.textContent = currentStep.message;
        }
    }
}

// Show completed story (placeholder for now)
async function showCompletedStory(story) {
    try {
        console.log('Loading completed story:', story);
        
        // Fetch story images
        const { data: images, error } = await supabase
            .from('story_images')
            .select('*')
            .eq('story_id', story.id)
            .order('page_number');

        if (error) {
            throw error;
        }

        // Unsubscribe from updates
        if (window.storySubscription) {
            window.storySubscription.unsubscribe();
            window.storySubscription = null;
        }

        // Check if story-generation.js is loaded for enhanced display
        if (typeof displayStoryBook === 'function') {
            displayStoryBook(story, images);
        } else {
            // Simple fallback display
            showSimpleStoryDisplay(story, images);
        }

    } catch (error) {
        console.error('Error loading completed story:', error);
        alert('Berättelsen är klar men det uppstod ett fel vid laddning. Ladda om sidan och försök igen.');
    }
}

// Simple story display fallback
function showSimpleStoryDisplay(story, images) {
    const mainContent = document.querySelector('.main-content');
    const storyData = story.story_data;
    
    let storyHTML = `
        <div style="max-width: 800px; margin: 0 auto; background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <h1 style="text-align: center; color: var(--primary-color); margin-bottom: 2rem;">${storyData.title}</h1>
            <p style="text-align: center; font-style: italic; margin-bottom: 3rem;">En magisk berättelse för ${story.child_name}</p>
    `;
    
    storyData.pages.forEach((page, index) => {
        const pageImage = images.find(img => img.page_number === page.page);
        const imageUrl = pageImage ? pageImage.image_url : '';
        
        storyHTML += `
            <div style="margin-bottom: 3rem; padding: 2rem; background: #f8f9fa; border-radius: 8px;">
                <div style="text-align: center; font-weight: bold; margin-bottom: 1rem;">Sida ${page.page}</div>
                ${imageUrl ? `<div style="text-align: center; margin-bottom: 1rem;"><img src="${imageUrl}" style="max-width: 300px; border-radius: 8px;" alt="Sida ${page.page}"></div>` : ''}
                <p style="font-size: 1.2rem; line-height: 1.6; text-align: center;">${page.text}</p>
            </div>
        `;
    });
    
    storyHTML += `
            <div style="text-align: center; margin-top: 2rem;">
                <button onclick="window.print()" class="primary-button" style="margin-right: 1rem;">Skriv ut</button>
                <button onclick="createNewStory()" class="primary-button">Skapa ny berättelse</button>
            </div>
        </div>
    `;
    
    mainContent.innerHTML = storyHTML;
}

// Simulate story generation for immediate testing
function simulateStoryGeneration(childData, uploadedFiles) {
    console.log('Starting simulated story generation...');
    
    // Update progress step by step
    updateProgressUI({ status: 'generating_story' });
    
    setTimeout(() => {
        updateProgressUI({ status: 'generating_images' });
        
        setTimeout(() => {
            // Create mock story
            const mockStory = createMockStory(childData, uploadedFiles);
            updateProgressUI({ status: 'completed' });
            
            setTimeout(() => {
                // Skip the real-time story loading and show directly
                showMockStory(mockStory, uploadedFiles);
            }, 1000);
        }, 2000);
    }, 2000);
}

// Create a mock story based on user input
function createMockStory(childData, uploadedFiles) {
    const stories = [
        `Det var en gång en ${childData.childAge}-årig hjälte vid namn ${childData.childName} som älskade att ${childData.favoriteActivity}.`,
        `En magisk dag upptäckte ${childData.childName} något fantastiskt när hen åt sin favorit ${childData.favoriteFood}.`,
        `${childData.childName} mindes det underbara minnet: ${childData.bestMemory}.`,
        `Med mod i hjärtat och kärlek för ${childData.favoriteActivity}, begav sig ${childData.childName} ut på ett äventyr.`,
        `På vägen mötte ${childData.childName} vänliga varelser som också älskade ${childData.favoriteFood}.`,
        `Tillsammans lärde de sig att dela är att bry sig om varandra.`,
        `${childData.childName} visade alla hur roligt det var att ${childData.favoriteActivity} tillsammans.`,
        `Snart blev ${childData.childName} känd som den vänligaste och modigaste av alla.`,
        `När äventyret var över, kom ${childData.childName} hem full av glädje och nya vänner.`,
        `Och så levde ${childData.childName} lyckligt i alla sina dagar, alltid redo för nya äventyr.`
    ];

    return {
        id: 'mock-story-' + Date.now(),
        title: `${childData.childName}s Magiska Äventyr`,
        child_name: childData.childName,
        story_data: {
            title: `${childData.childName}s Magiska Äventyr`,
            pages: stories.map((text, index) => ({
                page: index + 1,
                text: text,
                imagePrompt: `Children's book illustration showing ${childData.childName} in a magical adventure`
            }))
        }
    };
}

// Show mock story with user images
function showMockStory(story, uploadedFiles) {
    const mainContent = document.querySelector('.main-content');
    const storyData = story.story_data;
    
    // Create images array - use user files for first pages, placeholders for rest
    const images = [];
    
    // Add user drawings for first pages
    uploadedFiles.forEach((file, index) => {
        if (index < 10) {
            images.push({
                page_number: index + 1,
                image_type: 'user_drawing',
                image_url: URL.createObjectURL(file)
            });
        }
    });
    
    // Add placeholder images for remaining pages
    for (let i = uploadedFiles.length; i < 10; i++) {
        images.push({
            page_number: i + 1,
            image_type: 'ai_generated',
            image_url: 'https://via.placeholder.com/400x300/8B4513/FFFFFF?text=AI+Bild+' + (i + 1)
        });
    }
    
    // Store for navigation
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
                    <button onclick="orderStory()" class="control-button order-btn">🛒 Beställ tryckt bok</button>
                    <button onclick="createNewStory()" class="control-button new-story-btn">✨ Ny berättelse</button>
                </div>
            </div>
            
            <div class="story-book-viewer">
                <div class="book-navigation">
                    <button class="nav-arrow nav-prev" id="prev-btn" disabled>
                        ← Föregående
                    </button>
                    <div class="page-indicator">
                        <span id="current-page">1</span> av <span id="total-pages">${storyData.pages.length}</span>
                    </div>
                    <button class="nav-arrow nav-next" id="next-btn">
                        Nästa →
                    </button>
                </div>
                
                <div class="book-pages-container">
                    ${storyData.pages.map((page, index) => {
                        const pageImage = images.find(img => img.page_number === page.page);
                        const imageUrl = pageImage ? pageImage.image_url : 'https://via.placeholder.com/400x300/8B4513/FFFFFF?text=Sida+' + page.page;
                        const isUserDrawing = pageImage && pageImage.image_type === 'user_drawing';
                        
                        return `
                            <div class="book-page ${index === 0 ? 'active' : ''}" id="page-${page.page}">
                                <div class="page-content">
                                    <div class="page-number">Sida ${page.page}</div>
                                    <div class="page-layout">
                                        <div class="page-image ${isUserDrawing ? 'user-drawing' : 'ai-image'}">
                                            <img src="${imageUrl}" alt="Illustration för sida ${page.page}" loading="lazy">
                                            ${isUserDrawing ? '<div class="drawing-label">Din teckning ✨</div>' : ''}
                                        </div>
                                        <div class="page-text">
                                            <p>${page.text}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;

    mainContent.innerHTML = storyHTML;
    console.log('Mock story displayed successfully!');
    
    // Add event listeners after HTML is created
    setupNavigationButtons();
}

// Setup navigation button event listeners
function setupNavigationButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    console.log('Setting up navigation buttons:', { prevBtn, nextBtn });
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            console.log('Previous button clicked!');
            previousPage();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            console.log('Next button clicked!');
            nextPage();
        });
    }
    
    // Also add keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (!window.currentStory) return;
        
        if (e.key === 'ArrowLeft') {
            previousPage();
        } else if (e.key === 'ArrowRight') {
            nextPage();
        }
    });
}

// Navigation functions for book
function nextPage() {
    console.log('Next page clicked, current story:', window.currentStory);
    if (window.currentStory && window.currentStory.currentPage < window.currentStory.data.pages.length) {
        window.currentStory.currentPage++;
        console.log('Moving to page:', window.currentStory.currentPage);
        updatePageDisplay();
    }
}

function previousPage() {
    console.log('Previous page clicked, current story:', window.currentStory);
    if (window.currentStory && window.currentStory.currentPage > 1) {
        window.currentStory.currentPage--;
        console.log('Moving to page:', window.currentStory.currentPage);
        updatePageDisplay();
    }
}

// Expose functions globally to ensure they're accessible from onclick handlers
window.nextPage = nextPage;
window.previousPage = previousPage;

function updatePageDisplay() {
    if (!window.currentStory) {
        console.log('No current story available');
        return;
    }
    
    const currentPage = window.currentStory.currentPage;
    const totalPages = window.currentStory.data.pages.length;
    
    console.log(`Updating page display: ${currentPage} of ${totalPages}`);
    
    // Hide all pages
    const allPages = document.querySelectorAll('.book-page');
    console.log('Found pages:', allPages.length);
    allPages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Show current page
    const currentPageElement = document.getElementById(`page-${currentPage}`);
    console.log('Current page element:', currentPageElement);
    if (currentPageElement) {
        currentPageElement.classList.add('active');
        console.log('Added active class to page', currentPage);
    } else {
        console.error('Could not find page element for page', currentPage);
    }
    
    // Update page indicator
    const currentPageSpan = document.getElementById('current-page');
    if (currentPageSpan) {
        currentPageSpan.textContent = currentPage;
        console.log('Updated page indicator to', currentPage);
    }
    
    // Update navigation buttons
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
        console.log('Previous button disabled:', currentPage === 1);
    }
    if (nextBtn) {
        nextBtn.disabled = currentPage === totalPages;
        console.log('Next button disabled:', currentPage === totalPages);
    }
}

function orderStory() {
    if (window.currentStory) {
        alert(`Fantastisk! "${window.currentStory.data.title}" för ${window.currentStory.childName} är redo att beställas som tryckt bok. Denna funktion kommer snart!`);
    }
}

function createNewStory() {
    // Clear any stored data
    localStorage.removeItem('sigvardsson_child');
    localStorage.removeItem('sigvardsson_drawings');
    
    // Clean up current story
    if (window.currentStory) {
        window.currentStory = null;
    }
    
    // Show the modal again
    showStoryModal();
}

// Expose functions globally
window.orderStory = orderStory;
window.createNewStory = createNewStory;

// Helper function to save files (for demonstration purposes)
// In production, files would be uploaded to a server or cloud storage
function saveFiles(key, files) {
    try {
        // Convert files to base64 for local storage (only for demo)
        // Note: This is not recommended for production due to size limitations
        const filePromises = Array.from(files).map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => {
                    resolve({
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        data: reader.result // Base64 data
                    });
                };
                // Only store images as base64, skip large files
                if (file.type.startsWith('image/') && file.size < 5 * 1024 * 1024) { // 5MB limit
                    reader.readAsDataURL(file);
                } else {
                    resolve({
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        data: null // Don't store large files in localStorage
                    });
                }
            });
        });
        
        Promise.all(filePromises).then(fileData => {
            localStorage.setItem(`sigvardsson_${key}`, JSON.stringify(fileData));
        });
    } catch (error) {
        console.warn('Could not save files locally:', error);
        // Continue anyway since file metadata is still saved
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    try {
        // Use Supabase authentication
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            alert('Fel vid inloggning: ' + error.message);
            return;
        }
        
        // Success! Hide modal and show logged-in view
        hideLoginModal();
        showLoggedInView();
        
    } catch (error) {
        alert('Ett fel uppstod: ' + error.message);
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const email = formData.get('email');
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    
    // Validate password match
    if (password !== confirmPassword) {
        alert('Lösenorden matchar inte. Försök igen.');
        return;
    }
    
    try {
        // Create user with Supabase
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName
                }
            }
        });
        
        if (error) {
            alert('Fel vid registrering: ' + error.message);
            return;
        }
        
        // Success! 
        alert('Konto skapat! Du kan nu logga in.');
        hideSignupModal();
        showLoginModal();
        
    } catch (error) {
        alert('Ett fel uppstod: ' + error.message);
    }
}

// Form page functionality
function initFormPage() {
    const childForm = document.getElementById('childForm');
    if (childForm) {
        childForm.addEventListener('submit', handleChildForm);
        
        // Load existing data if any
        const existingData = getData('child');
        if (existingData) {
            populateForm(existingData);
        }
    }
}

function populateForm(data) {
    Object.keys(data).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            element.value = data[key];
        }
    });
}

function handleChildForm(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const childData = {
        childName: formData.get('childName'),
        childAge: formData.get('childAge'),
        childHeight: formData.get('childHeight'),
        favoriteFood: formData.get('favoriteFood'),
        favoriteActivity: formData.get('favoriteActivity'),
        bestMemory: formData.get('bestMemory'),
        personality: formData.get('personality')
    };
    
    saveData('child', childData);
    window.location.href = 'story.html';
}

function goBack() {
    window.location.href = 'index.html';
}

// Story page functionality
function initStoryPage() {
    const childData = getData('child');
    const userData = getData('user');
    
    if (!childData || !userData) {
        window.location.href = 'index.html';
        return;
    }
    
    showConfirmSection(childData);
}

function showConfirmSection(childData) {
    document.getElementById('confirmSection').style.display = 'block';
    document.getElementById('loadingSection').style.display = 'none';
    document.getElementById('storySection').style.display = 'none';
    
    const summaryHTML = `
        <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin: 1rem 0;">
            <h4 style="margin-bottom: 1rem; color: #2c3e50;">Barnets detaljer:</h4>
            <p><strong>Namn:</strong> ${childData.childName}</p>
            <p><strong>Ålder:</strong> ${childData.childAge} år</p>
            ${childData.childHeight ? `<p><strong>Längd:</strong> ${childData.childHeight}</p>` : ''}
            <p><strong>Favoritmat:</strong> ${childData.favoriteFood}</p>
            <p><strong>Favoritaktivitet:</strong> ${childData.favoriteActivity}</p>
            <p><strong>Bästa minne:</strong> ${childData.bestMemory}</p>
            ${childData.personality ? `<p><strong>Personlighet:</strong> ${childData.personality}</p>` : ''}
        </div>
    `;
    
    document.getElementById('childSummary').innerHTML = summaryHTML;
}

function goToForm() {
    window.location.href = 'form.html';
}

function generateStory() {
    document.getElementById('confirmSection').style.display = 'none';
    document.getElementById('loadingSection').style.display = 'block';
    
    // Simulate AI story generation
    setTimeout(() => {
        createStory();
    }, 3000);
}

function createStory() {
    const childData = getData('child');
    const userData = getData('user');
    
    // Generate a sample story (in real implementation, this would call an AI API)
    const story = generateSampleStory(childData);
    
    document.getElementById('loadingSection').style.display = 'none';
    document.getElementById('storySection').style.display = 'block';
    document.getElementById('storyChildName').textContent = childData.childName;
    document.getElementById('storyContent').innerHTML = `
        <h4>Äventyret med ${childData.childName}</h4>
        <div style="line-height: 1.8; font-size: 1.1rem;">
            ${story}
        </div>
    `;
}

function generateSampleStory(data) {
    const stories = [
        `<p>Det var en gång en ${data.childAge}-årig hjälte vid namn ${data.childName} som älskade att ${data.favoriteActivity}. ${data.childName} var känd i hela grannskapet för sitt mod och sin vänlighet.</p>
        
        <p>En vacker dag, medan ${data.childName} drömde om ${data.favoriteFood}, hände något magiskt. En liten fågel flög in genom fönstret och berättade om ett fantastiskt äventyr som väntade.</p>
        
        <p>"${data.childName}," sa fågeln med en glimt i ögat, "det finns en hemlig plats där alla som älskar att ${data.favoriteActivity} kan hitta den mest underbara skatten."</p>
        
        <p>${data.childName} mindes det underbara minnet när ${data.bestMemory.toLowerCase()}, och kände hur modet växte inuti. "Jag är redo för äventyret!" utropade ${data.childName}.</p>
        
        <p>Tillsammans begav de sig iväg på en resa full av glädje, skratt och upptäckter. Och när dagen var över, insåg ${data.childName} att den största skatten av alla var de vackra minnena och vänskap som skapats under vägen.</p>
        
        <p>Från den dagen levde ${data.childName} lyckligt och fortsatte att sprida glädje till alla omkring sig, alltid redo för nästa stora äventyr.</p>`
    ];
    
    return stories[0];
}

function printStory() {
    window.print();
}

function createAnother() {
    // Clear stored data and start over
    localStorage.removeItem('sigvardsson_child');
    window.location.href = 'form.html';
}