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

// Handle story form submission
function handleStoryForm(e) {
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
    
    const childData = {
        childName: formData.get('childName'),
        childAge: formData.get('childAge'),
        childHeight: formData.get('childHeight'),
        favoriteFood: formData.get('favoriteFood'),
        favoriteActivity: formData.get('favoriteActivity'),
        bestMemory: formData.get('bestMemory'),
        personality: formData.get('personality'),
        drawings: uploadedFiles.map(file => ({
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
        }))
    };
    
    // Store file metadata (actual files would be uploaded to server in production)
    saveData('child', childData);
    
    // Store actual files in a separate key for this demo
    saveFiles('drawings', uploadedFiles);
    
    hideStoryModal();
    window.location.href = 'story.html';
}

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