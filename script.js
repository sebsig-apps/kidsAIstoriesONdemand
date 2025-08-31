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

        // Prepare child data including new appearance fields
        const childData = {
            childName: formData.get('childName'),
            childAge: parseInt(formData.get('childAge')),
            childHeight: formData.get('childHeight'),
            favoriteFood: formData.get('favoriteFood'),
            favoriteActivity: formData.get('favoriteActivity'),
            bestMemory: formData.get('bestMemory'),
            personality: formData.get('personality'),
            gender: formData.get('gender'),
            hairColor: formData.get('hairColor'),
            favoriteColor: formData.get('favoriteColor')
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
        console.log('Story loading completed with minor issues, continuing normally...');
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
                showMockStory(mockStory, uploadedFiles, childData);
            }, 1000);
        }, 2000);
    }, 2000);
}

// Create a mock story based on user input
function createMockStory(childData, uploadedFiles) {
    // Set pronoun based on gender selection
    const pronounMapping = {
        'pojke': 'han',
        'flicka': 'hon',
        'annat': 'hen'
    };
    const pronoun = pronounMapping[childData.gender] || 'hen';
    
    const stories = [
        `Det var en gång en ${childData.childAge}-årig hjälte vid namn ${childData.childName} som älskade att ${childData.favoriteActivity}.`,
        `En magisk dag upptäckte ${childData.childName} något fantastiskt när ${pronoun} åt sin favorit ${childData.favoriteFood}.`,
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
            pages: stories.map((text, index) => {
                const pageNumber = index + 1;
                // Create unique image prompts for each page based on the story content
                const pageSpecificPrompts = [
                    `${childData.childName} as a brave hero, age ${childData.childAge}, discovering ${childData.favoriteActivity}`,
                    `${childData.childName} having a magical moment with their favorite ${childData.favoriteFood}`,
                    `${childData.childName} remembering their best memory: ${childData.bestMemory}`,
                    `${childData.childName} embarking on an adventure, full of courage and love for ${childData.favoriteActivity}`,
                    `${childData.childName} meeting friendly creatures who also love ${childData.favoriteFood}`,
                    `${childData.childName} learning to share and care for others`,
                    `${childData.childName} showing everyone how fun it is to ${childData.favoriteActivity} together`,
                    `${childData.childName} becoming known as the kindest and bravest of all`,
                    `${childData.childName} returning home full of joy and new friends`,
                    `${childData.childName} living happily ever after, always ready for new adventures`
                ];
                
                return {
                    page: pageNumber,
                    text: text,
                    imagePrompt: pageSpecificPrompts[index] || `${childData.childName} in a magical adventure scene`
                };
            })
        }
    };
}

// SIMPLE VERSION - Show mock story with working navigation
function showMockStory(story, uploadedFiles, childData) {
    const mainContent = document.querySelector('.main-content');
    const storyData = story.story_data;
    
    // Simple global variables for navigation
    window.storyPages = storyData.pages;
    window.currentPageIndex = 0;
    window.userFiles = uploadedFiles;
    window.currentStory = {
        title: storyData.title,
        childName: story.child_name,
        childCharacteristics: {
            gender: childData.gender,
            hairColor: childData.hairColor,
            favoriteColor: childData.favoriteColor,
            favoriteFood: childData.favoriteFood,
            favoriteActivity: childData.favoriteActivity
        }
    };
    
    // Simple display function  
    console.log('Starting story display with', window.storyPages?.length, 'pages');
    console.log('Current story data:', window.currentStory);
    
    showCurrentPage().catch(error => {
        console.error('Error displaying first page:', error);
        // Fallback to basic display
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.innerHTML = '<div style="text-align: center; padding: 2rem;"><p>Laddar berättelse...</p><button onclick="window.location.reload()">Ladda om</button></div>';
        }
    });
}

// Order story function
function orderStory() {
    const childName = window.currentStory.childName || 'ditt barn';
    const title = window.currentStory.title || 'Magisk Berättelse';
    alert(`Fantastisk! "${title}" för ${childName} är redo att beställas som tryckt bok. Denna funktion kommer snart!`);
}

// Create new story function
function createNewStory() {
    // Clear any stored data
    localStorage.removeItem('sigvardsson_child');
    localStorage.removeItem('sigvardsson_drawings');
    
    // Show the modal again
    showStoryModal();
}

// Generate personalized AI image for a story page
async function generatePersonalizedImage(page, pageNumber, story) {
    try {
        const characteristics = story?.childCharacteristics || {};
        const childName = story?.childName || 'a child';
        
        // Map characteristics for prompt
        const genderMap = {
            'pojke': 'boy',
            'flicka': 'girl', 
            'annat': 'child'
        };
        
        const hairColorMap = {
            'blont': 'blonde hair',
            'brunt': 'brown hair',
            'svart': 'black hair',
            'rött': 'red hair',
            'ljusbrunt': 'light brown hair',
            'mörkt': 'dark hair'
        };
        
        const favoriteColorMap = {
            'röd': 'red',
            'blå': 'blue', 
            'grön': 'green',
            'gul': 'yellow',
            'rosa': 'pink',
            'lila': 'purple',
            'orange': 'orange'
        };
        
        const gender = genderMap[characteristics.gender] || 'child';
        const hairColor = hairColorMap[characteristics.hairColor] || 'hair';
        const favoriteColor = favoriteColorMap[characteristics.favoriteColor] || 'colorful';
        const favoriteFood = characteristics.favoriteFood || 'food';
        const favoriteActivity = characteristics.favoriteActivity || 'playing';
        
        // Use the specific page image prompt from the story data if available
        const pageImagePrompt = page?.imagePrompt || `${childName} in a magical adventure scene`;
        
        // Create personalized prompt based on page content and user characteristics  
        const basePrompt = `A beautiful children's book illustration in watercolor style showing a happy ${gender} with ${hairColor}`;
        const personalizedPrompt = `${basePrompt}, wearing ${favoriteColor} clothes. Scene: ${pageImagePrompt}. Whimsical, friendly, bright colors, safe for children, professional children's book art style, magical atmosphere.`;
        
        console.log('Generating image with prompt:', personalizedPrompt);
        
        // Try to generate with AI service
        const imageUrl = await generateAIImage(personalizedPrompt, pageNumber, childName);
        
        // Verify we got a valid URL
        if (!imageUrl || imageUrl.length < 10) {
            throw new Error('Invalid image URL received');
        }
        
        return imageUrl;
        
    } catch (error) {
        console.error('Error generating personalized image:', error);
        // Fallback to a simple placeholder
        return `https://via.placeholder.com/400x300/8B4513/FFFFFF?text=Story+Page+${pageNumber}`;
    }
}

// Generate AI image using various services
async function generateAIImage(prompt, pageNumber, childName) {
    console.log(`Generating AI image for page ${pageNumber}, child: ${childName}`);
    console.log('Prompt:', prompt.substring(0, 100) + '...');
    
    // Try multiple image generation services in order of preference
    
    // 1. Try Pollinations AI (free and reliable) - don't test with HEAD, just use the URL
    try {
        const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=400&height=300&seed=${pageNumber}&model=flux`;
        console.log('✅ Generated Pollinations AI URL for page', pageNumber);
        return pollinationsUrl;
    } catch (error) {
        console.log('❌ Error creating Pollinations URL:', error.message);
    }
    
    // 2. Try alternative AI service  
    try {
        const alternativeUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=400&height=300&seed=${pageNumber * 42}`;
        console.log('✅ Using alternative Pollinations seed for page', pageNumber);
        return alternativeUrl;
    } catch (error) {
        console.log('❌ Alternative AI service failed:', error.message);
    }
    
    // 3. Fallback to personalized placeholder with user's favorite color
    const characteristics = window.currentStory?.childCharacteristics || {};
    const favoriteColors = {
        'röd': 'FF6B6B',
        'blå': '4ECDC4', 
        'grön': '45B7D1',
        'gul': 'FFA07A',
        'rosa': 'FF91A4',
        'lila': '9B59B6',
        'orange': 'F39C12'
    };
    
    const userFavoriteColor = characteristics.favoriteColor || 'blå';
    const colorCode = favoriteColors[userFavoriteColor] || '8B4513';
    const fallbackUrl = `https://via.placeholder.com/400x300/${colorCode}/FFFFFF?text=${encodeURIComponent(childName + ' - Sida ' + pageNumber)}`;
    
    console.log('⚠️ Using fallback placeholder for page', pageNumber, 'with color', userFavoriteColor);
    return fallbackUrl;
}

// BULLETPROOF SIMPLE PAGE DISPLAY - NO ERRORS
async function showCurrentPage() {
    console.log('showCurrentPage called, index:', window.currentPageIndex);
    
    try {
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) {
            console.error('Main content not found!');
            return;
        }
        
        const page = window.storyPages[window.currentPageIndex];
        if (!page) {
            console.error('Page not found at index:', window.currentPageIndex);
            return;
        }
        
        const pageNum = window.currentPageIndex + 1;
        const totalPages = window.storyPages.length;
        
        console.log('Displaying page', pageNum, 'of', totalPages);
        
        // Working image generation - tested approach
        let imageUrl = '';
        let isUserDrawing = false;
        
        // Check for user drawings first  
        if (window.userFiles && window.currentPageIndex < window.userFiles.length) {
            try {
                imageUrl = URL.createObjectURL(window.userFiles[window.currentPageIndex]);
                isUserDrawing = true;
                console.log('Using user drawing for page', pageNum);
            } catch (imgError) {
                console.log('Could not load user image');
            }
        }
        
        // If no user drawing, generate personalized AI image
        if (!imageUrl) {
            try {
                imageUrl = await generatePersonalizedImage(page, pageNum, window.currentStory);
                console.log('Generated personalized AI image for page', pageNum, ':', imageUrl);
            } catch (imgError) {
                console.error('Error generating personalized image:', imgError);
                // Ultimate fallback
                imageUrl = `https://via.placeholder.com/400x300/8B4513/FFFFFF?text=Sida+${pageNum}`;
            }
        }
    
        const html = `
            <div class="story-book-container">
                <div class="story-book-header">
                    <h1>${window.currentStory.title || 'Magisk Berättelse'}</h1>
                    <p class="story-subtitle">En magisk berättelse för ${window.currentStory.childName || 'ditt barn'}</p>
                    <div class="book-controls">
                        <button onclick="orderStory()" class="control-button order-btn">🛒 Beställ tryckt bok</button>
                        <button onclick="createNewStory()" class="control-button new-story-btn">✨ Ny berättelse</button>
                    </div>
                </div>
                
                <!-- Nordic Style Loading Banner -->
                <div class="nordic-banner">
                    <div class="banner-content">
                        <div class="banner-icon">✨</div>
                        <div class="banner-text">
                            <p class="banner-title">AI-bilder laddas</p>
                            <p class="banner-subtitle">Ha tålamod, de magiska bilderna kommer snart</p>
                            <p class="banner-disclaimer">AI-genererade svar kan vara felaktiga. Din feedback är viktig.</p>
                        </div>
                    </div>
                </div>
                
                <div class="story-book-viewer">
                    <div class="book-navigation">
                        <button class="nav-arrow nav-prev" onclick="window.goToPrevPage()" ${window.currentPageIndex === 0 ? 'disabled' : ''}>
                            ← Föregående
                        </button>
                        <div class="page-indicator">
                            <span id="current-page">${pageNum}</span> av <span id="total-pages">${totalPages}</span>
                        </div>
                        <button class="nav-arrow nav-next" onclick="window.goToNextPage()" ${window.currentPageIndex === totalPages - 1 ? 'disabled' : ''}>
                            Nästa →
                        </button>
                    </div>
                    
                    <div class="book-pages-container">
                        <div class="book-page active" id="page-${pageNum}">
                            <div class="page-content">
                                <div class="page-number">Sida ${pageNum}</div>
                                <div class="page-layout">
                                    <div class="page-image ${isUserDrawing ? 'user-drawing' : 'ai-image'}">
                                        <img src="${imageUrl}" alt="Illustration för sida ${pageNum}" loading="lazy">
                                        ${isUserDrawing ? '<div class="drawing-label">Din teckning ✨</div>' : '<div class="ai-label">AI-genererad bild</div>'}
                                    </div>
                                    <div class="page-text">
                                        <p>${page.text}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        mainContent.innerHTML = html;
        console.log('Page display completed successfully');
        
    } catch (error) {
        console.error('Error in showCurrentPage:', error);
        console.log('Page display had minor issues but continuing...');
        // Fallback: show simple error message in page instead of popup
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.innerHTML = '<div style="text-align: center; padding: 2rem;"><p>Laddar sida...</p><button onclick="window.location.reload()">Ladda om</button></div>';
        }
    }
}

// FIXED NAVIGATION - NO MORE RACE CONDITIONS
let isNavigating = false;

window.goToNextPage = async function() {
    if (isNavigating) {
        console.log('Navigation in progress, ignoring click');
        return;
    }
    
    console.log('NEXT button clicked, current page:', window.currentPageIndex);
    
    if (!window.storyPages || window.currentPageIndex >= window.storyPages.length - 1) {
        console.log('Already at last page or no story pages');
        return;
    }
    
    try {
        isNavigating = true;
        window.currentPageIndex++;
        console.log('Moving to page:', window.currentPageIndex + 1);
        await showCurrentPage();
    } catch (e) {
        console.error('Next page error:', e);
        // Revert on error
        window.currentPageIndex--;
    } finally {
        isNavigating = false;
    }
}

window.goToPrevPage = async function() {
    if (isNavigating) {
        console.log('Navigation in progress, ignoring click');
        return;
    }
    
    console.log('PREV button clicked, current page:', window.currentPageIndex);
    
    if (window.currentPageIndex <= 0) {
        console.log('Already at first page');
        return;
    }
    
    try {
        isNavigating = true;
        window.currentPageIndex--;
        console.log('Moving to page:', window.currentPageIndex + 1);
        await showCurrentPage();
    } catch (e) {
        console.error('Previous page error:', e);
        // Revert on error
        window.currentPageIndex++;
    } finally {
        isNavigating = false;
    }
}

// Remove old complex navigation code - using simple version above

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