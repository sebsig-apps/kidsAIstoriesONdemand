// Local storage helper functions
function saveData(key, data) {
    localStorage.setItem(`sigvardsson_${key}`, JSON.stringify(data));
}

function getData(key) {
    const data = localStorage.getItem(`sigvardsson_${key}`);
    return data ? JSON.parse(data) : null;
}

// Initialize page based on current location
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'index.html' || currentPage === '') {
        initLoginPage();
    } else if (currentPage === 'form.html') {
        initFormPage();
    } else if (currentPage === 'story.html') {
        initStoryPage();
    }
});

// Modal functions
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function hideLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('loginModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Login page functionality
function initLoginPage() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userData = {
        email: formData.get('email'),
        name: formData.get('name'),
        timestamp: new Date().toISOString()
    };
    
    saveData('user', userData);
    window.location.href = 'form.html';
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