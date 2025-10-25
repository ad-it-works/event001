let currentDate = new Date();
let selectedDate = null;
let items = {};
let nextId = 1;
let selectedType = 'task';

const months = ['January', 'February', 'March', 'April', 'May', 'June',
               'July', 'August', 'September', 'October', 'November', 'December'];
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const philippineHolidays = {
    '1-1': 'New Year\'s Day',
    '2-25': 'EDSA Revolution',
    '4-9': 'Araw ng Kagitingan',
    '5-1': 'Labor Day',
    '6-12': 'Independence Day',
    '8-21': 'Ninoy Aquino Day',
    '8-29': 'National Heroes Day',
    '11-1': 'All Saints\' Day',
    '11-30': 'Bonifacio Day',
    '12-25': 'Christmas Day',
    '12-30': 'Rizal Day'
};

function getWeatherIcon(temp) {
    if (temp >= 32) return '☀️';
    if (temp >= 28) return '⛅';
    if (temp >= 24) return '☁️';
    return '🌧️';
}

function generateWeather() {
    const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy', 'Heavy Rain', 'Typhoon'];
    const weights = [30, 25, 20, 15, 8, 2];
    let random = Math.random() * 100;
    let condition = 'Sunny';
    
    for (let i = 0; i < conditions.length; i++) {
        if (random < weights[i]) {
            condition = conditions[i];
            break;
        }
        random -= weights[i];
    }
    
    return {
        temp: Math.floor(Math.random() * 10) + 24,
        condition: condition
    };
}

let weatherCache = {};

function getWeatherForDate(dateKey) {
    if (!weatherCache[dateKey]) {
        weatherCache[dateKey] = generateWeather();
    }
    return weatherCache[dateKey];
}

const itemInput = document.getElementById('itemInput');
const dayInput = document.getElementById('dayInput');
const timeInput = document.getElementById('timeInput');
const allDayInput = document.getElementById('allDayInput');
const addBtn = document.getElementById('addBtn');
const itemList = document.getElementById('todoList');
const modal = document.getElementById('modal');
const closeBtn = document.querySelector('.close');
const typeBtns = document.querySelectorAll('.type-btn');
const warningArea = document.getElementById('warningArea');
const loginPage = document.getElementById('loginPage');
const calendarPage = document.getElementById('calendarPage');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const warningDialog = document.getElementById('warningDialog');
const warningDialogMessage = document.getElementById('warningDialogMessage');
const proceedBtn = document.getElementById('proceedBtn');
const cancelBtn = document.getElementById('cancelBtn');
const locationModal = document.getElementById('locationModal');
const getGpsBtn = document.getElementById('getGpsBtn');
const openMapBtn = document.getElementById('openMapBtn');
const editLocationBtn = document.getElementById('editLocationBtn');
const saveLocationBtn = document.getElementById('saveLocationBtn');
const locationInput = document.getElementById('locationInput');
const currentLocationDiv = document.getElementById('currentLocation');
const changeLocationBtn = document.getElementById('changeLocationBtn');
const locationMethodDialog = document.getElementById('locationMethodDialog');
const useGpsBtn = document.getElementById('useGpsBtn');
const useMapBtn = document.getElementById('useMapBtn');
const cancelLocationBtn = document.getElementById('cancelLocationBtn');
const settingsModal = document.getElementById('settingsModal');
const settingsBtn = document.getElementById('settingsBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const settingsMessage = document.getElementById('settingsMessage');

let pendingAppointment = null;
let currentLocation = 'Manila, Philippines';
let userCredentials = { username: 'admin', password: 'password' };

function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === userCredentials.username && password === userCredentials.password) {
        loginPage.style.display = 'none';
        calendarPage.style.display = 'block';
        renderCalendar();
        setupLocationListeners();
        setupSettingsListeners();
    } else {
        loginError.textContent = 'Invalid username or password';
    }
}

function setupLocationListeners() {
    document.getElementById('changeLocationBtn').addEventListener('click', showLocationMethodDialog);
    document.getElementById('useGpsBtn').addEventListener('click', useGPS);
    document.getElementById('useMapBtn').addEventListener('click', useGoogleMap);
    document.getElementById('cancelLocationBtn').addEventListener('click', hideLocationMethodDialog);
    document.getElementById('saveLocationBtn').addEventListener('click', saveLocation);
}

function setupSettingsListeners() {
    document.getElementById('settingsBtn').addEventListener('click', openSettingsModal);
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
    document.getElementById('logoutBtn').addEventListener('click', logout);
}

function logout() {
    // Clear login form
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('loginError').textContent = '';
    
    // Hide calendar page and show login page
    calendarPage.style.display = 'none';
    loginPage.style.display = 'flex';
}

function openSettingsModal() {
    document.getElementById('newUsername').value = userCredentials.username;
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    settingsMessage.style.display = 'none';
    settingsModal.style.display = 'block';
}

function closeSettingsModal() {
    settingsModal.style.display = 'none';
}

function saveSettings() {
    const newUsername = document.getElementById('newUsername').value.trim();
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!newUsername) {
        showSettingsMessage('Username cannot be empty', 'error');
        return;
    }
    
    if (newPassword && newPassword !== confirmPassword) {
        showSettingsMessage('Passwords do not match', 'error');
        return;
    }
    
    if (newPassword && newPassword.length < 4) {
        showSettingsMessage('Password must be at least 4 characters', 'error');
        return;
    }
    
    // Update credentials
    userCredentials.username = newUsername;
    if (newPassword) {
        userCredentials.password = newPassword;
    }
    
    showSettingsMessage('Settings saved successfully!', 'success');
    
    setTimeout(() => {
        closeSettingsModal();
    }, 1500);
}

function showSettingsMessage(message, type) {
    settingsMessage.textContent = message;
    settingsMessage.className = `settings-message ${type}`;
    settingsMessage.style.display = 'block';
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    document.getElementById('monthYear').textContent = `${months[month]} ${year}`;
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    
    let html = days.map(day => `<div class="day-header">${day}</div>`).join('');
    
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = prevMonthDays - i;
        html += `<div class="day other-month"><div class="day-number">${day}</div></div>`;
    }
    
    const today = new Date();
    const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${year}-${month + 1}-${day}`;
        const dayItems = items[dateKey] || [];
        const dots = dayItems.map(item => `<span class="item-dot ${item.type}"></span>`).join('');
        const holidayKey = `${month + 1}-${day}`;
        const holiday = philippineHolidays[holidayKey];
        const holidayClass = holiday ? 'holiday' : '';
        const todayClass = (isCurrentMonth && day === today.getDate()) ? 'today' : '';
        const holidayText = holiday ? `<div class="holiday-name">${holiday}</div>` : '';
        
        const weather = getWeatherForDate(dateKey);
        const weatherIcon = getWeatherIcon(weather.temp);
        const weatherText = `<div class="weather"><span class="weather-icon">${weatherIcon}</span><span class="weather-temp">${weather.temp}°C</span></div>`;
        
        html += `<div class="day ${holidayClass} ${todayClass}" onclick="selectDate(${year}, ${month}, ${day})">
            <div class="day-number">${day}</div>
            ${holidayText}
            ${weatherText}
            ${dots}
        </div>`;
    }
    
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
    const remainingCells = totalCells - (firstDay + daysInMonth);
    for (let day = 1; day <= remainingCells; day++) {
        html += `<div class="day other-month"><div class="day-number">${day}</div></div>`;
    }
    
    document.getElementById('calendar').innerHTML = html;
    renderTodayInfo();
    renderMonthlyTasks();
}

function generateTrafficStatus() {
    const statuses = ['Light', 'Moderate', 'Heavy'];
    const weights = [40, 35, 25];
    let random = Math.random() * 100;
    
    for (let i = 0; i < statuses.length; i++) {
        if (random < weights[i]) {
            return statuses[i];
        }
        random -= weights[i];
    }
    return 'Light';
}

function renderTodayInfo() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();
    
    renderDateInfo(year, month, day);
}

function renderDateInfo(year, month, day) {
    const dateKey = `${year}-${month + 1}-${day}`;
    const today = new Date();
    const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
    
    // Update section title
    const sectionTitle = isToday ? "Today's Information" : "Selected Date Information";
    document.querySelector('.today-info h2').innerHTML = `${sectionTitle} - <span id="todayInfoDate">${months[month]} ${day}, ${year}</span>`;
    
    // Location info
    currentLocationDiv.innerHTML = `
        <div style="font-weight: bold; color: #007cba;">${currentLocation}</div>
        <div style="font-size: 12px; color: #666; margin-top: 4px;">Current location for navigation</div>
    `;
    
    // Weather info
    const weather = getWeatherForDate(dateKey);
    const weatherIcon = getWeatherIcon(weather.temp);
    document.getElementById('todayWeather').innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 24px;">${weatherIcon}</span>
            <div>
                <div style="font-weight: bold;">${weather.temp}°C - ${weather.condition}</div>
                <div style="font-size: 12px; color: #666;">Perfect for ${weather.condition === 'Sunny' ? 'outdoor activities' : weather.condition === 'Rainy' ? 'indoor meetings' : 'any activities'}</div>
            </div>
        </div>
    `;
    
    // Traffic info
    const traffic = generateTrafficStatus();
    const trafficClass = traffic.toLowerCase();
    const trafficAdvice = {
        'Light': 'Good time to travel. Expect normal travel times.',
        'Moderate': 'Allow extra 15-20 minutes for travel.',
        'Heavy': 'Heavy congestion expected. Consider alternative routes or reschedule if possible.'
    };
    
    document.getElementById('todayTraffic').innerHTML = `
        <div class="traffic-status traffic-${trafficClass}">${traffic} Traffic</div>
        <div style="margin-top: 8px; font-size: 12px; color: #666;">${trafficAdvice[traffic]}</div>
    `;
    
    // Selected date tasks
    const dateItems = items[dateKey] || [];
    const todayTasksList = document.getElementById('todayTasksList');
    const scheduleTitle = isToday ? "Today's Schedule" : "Schedule for Selected Date";
    document.querySelector('.today-tasks h3').textContent = `📅 ${scheduleTitle}`;
    
    if (dateItems.length === 0) {
        const noTasksText = isToday ? 'No tasks scheduled for today' : 'No tasks scheduled for this date';
        todayTasksList.innerHTML = `<p style="color: #666; font-style: italic;">${noTasksText}</p>`;
        return;
    }
    
    todayTasksList.innerHTML = dateItems.map(item => {
        const taskAdvice = generateTaskAdvice(item, weather, traffic);
        return `
            <div class="today-task-item ${item.type} ${item.completed ? 'completed' : ''}">
                <div class="today-task-content">
                    <div class="today-task-title">${item.text} ${item.time ? `- ${item.time}` : ''}</div>
                    <div class="today-task-details">${taskAdvice}</div>
                </div>
            </div>
        `;
    }).join('');
}

function generateTaskAdvice(item, weather, traffic) {
    let advice = [];
    const taskType = detectTaskType(item.text);
    
    switch (taskType) {
        case 'medicine':
            return generateMedicineInfo(item.text);
        case 'travel':
            return generateTravelInfo(item, weather, traffic);
        case 'food':
            return generateFoodInfo(item.text);
        case 'meeting':
            return generateMeetingInfo(item, weather, traffic);
        case 'movies':
            return generateMovieInfo(item.text);
        case 'shopping':
            return generateShoppingInfo(item.text);
        default:
            break;
    }
    
    if (item.type === 'appointment') {
        if (traffic === 'Heavy') {
            advice.push('🚗 Heavy traffic - leave 30 minutes early');
        } else if (traffic === 'Moderate') {
            advice.push('🚗 Moderate traffic - allow extra time');
        }
        
        if (weather.condition === 'Heavy Rain' || weather.condition === 'Typhoon') {
            advice.push('☔ Bad weather - consider rescheduling or indoor venue');
        } else if (weather.condition === 'Rainy') {
            advice.push('🌧️ Bring umbrella');
        }
    }
    
    if (item.type === 'event') {
        if (weather.condition === 'Sunny') {
            advice.push('☀️ Great weather for outdoor events');
        } else if (weather.condition === 'Rainy') {
            advice.push('🌧️ Consider indoor backup plan');
        }
    }
    
    return advice.length > 0 ? advice.join(' • ') : `📋 ${item.type.charAt(0).toUpperCase() + item.type.slice(1)} scheduled`;
}

function detectTaskType(taskText) {
    const text = taskText.toLowerCase();
    
    // Medicine detection
    if (detectMedicineInTask(taskText)) return 'medicine';
    
    // Travel detection
    if (detectLocationInTask(taskText)) return 'travel';
    
    // Food detection
    const foodKeywords = ['eat', 'food', 'lunch', 'dinner', 'breakfast', 'meal', 'restaurant', 'fastfood', 'mcdo', 'jollibee', 'kfc', 'pizza', 'burger'];
    if (foodKeywords.some(keyword => text.includes(keyword))) return 'food';
    
    // Meeting detection
    const meetingKeywords = ['meeting', 'conference', 'presentation', 'interview', 'discussion', 'call', 'zoom', 'teams'];
    if (meetingKeywords.some(keyword => text.includes(keyword))) return 'meeting';
    
    // Movies detection
    const movieKeywords = ['movie', 'cinema', 'film', 'watch', 'theater', 'sm cinema', 'ayala malls'];
    if (movieKeywords.some(keyword => text.includes(keyword))) return 'movies';
    
    // Shopping detection
    const shoppingKeywords = ['buy', 'shop', 'purchase', 'mall', 'store', 'grocery', 'market'];
    if (shoppingKeywords.some(keyword => text.includes(keyword))) return 'shopping';
    
    return 'general';
}

function generateFoodInfo(taskText) {
    const text = taskText.toLowerCase();
    let info = [];
    
    // Check for specific fast food chains
    const fastFoodChains = {
        'mcdo': { name: 'McDonald\'s', website: 'mcdonalds.com.ph' },
        'jollibee': { name: 'Jollibee', website: 'jollibee.com.ph' },
        'kfc': { name: 'KFC', website: 'kfc.com.ph' },
        'pizza': { name: 'Pizza Hut', website: 'pizzahut.com.ph' },
        'burger': { name: 'Burger King', website: 'burgerking.com.ph' }
    };
    
    let foundChain = null;
    for (const [keyword, chain] of Object.entries(fastFoodChains)) {
        if (text.includes(keyword)) {
            foundChain = chain;
            break;
        }
    }
    
    if (foundChain) {
        info.push(`🍔 Fast Food: ${foundChain.name} | Website: ${foundChain.website}`);
    } else if (text.includes('food') || text.includes('eat') || text.includes('dining')) {
        // General dining - show nearest restaurants
        const restaurants = getNearestRestaurants();
        info.push(`🍽️ NEAREST RESTAURANTS`);
        restaurants.forEach(restaurant => {
            info.push(`• ${restaurant.name}: ${restaurant.distance} | ${restaurant.cuisine} | Website: ${restaurant.website}`);
        });
    }
    
    return info.join(' • ');
}

function generateMeetingInfo(item, weather, traffic) {
    let info = [];
    
    // Weather advisory for meetings
    if (weather.condition === 'Heavy Rain' || weather.condition === 'Typhoon') {
        info.push(`⚠️ ${weather.condition} - Consider virtual meeting`);
    }
    
    // Traffic advisory
    if (traffic === 'Heavy') {
        info.push(`🚗 Heavy traffic - Leave 45 minutes early`);
    } else if (traffic === 'Moderate') {
        info.push(`🚗 Moderate traffic - Allow extra 20 minutes`);
    }
    
    // Meeting preparation
    info.push(`💼 Meeting scheduled - Prepare agenda and materials`);
    
    return info.join(' • ');
}

function generateMovieInfo(taskText) {
    const cinemas = getNearestCinemas();
    let info = [];
    
    info.push(`🎬 NEAREST CINEMAS`);
    cinemas.forEach(cinema => {
        info.push(`• ${cinema.name}: ${cinema.location} | ${cinema.distance} | Website: ${cinema.website}`);
    });
    
    return info.join(' • ');
}

function generateShoppingInfo(taskText) {
    const malls = getNearestMalls();
    let info = [];
    
    info.push(`🛍️ NEAREST SHOPPING CENTERS`);
    malls.forEach(mall => {
        info.push(`• ${mall.name}: ${mall.location} | ${mall.distance} | Website: ${mall.website}`);
    });
    
    return info.join(' • ');
}

function getNearestRestaurants() {
    return [
        {
            name: 'Max\'s Restaurant',
            distance: '0.8km away',
            cuisine: 'Filipino',
            website: 'maxschicken.com'
        },
        {
            name: 'Chowking',
            distance: '1.2km away',
            cuisine: 'Chinese-Filipino',
            website: 'chowking.com'
        },
        {
            name: 'Mang Inasal',
            distance: '0.5km away',
            cuisine: 'Grilled Chicken',
            website: 'manginasal.com'
        }
    ];
}

function getNearestCinemas() {
    return [
        {
            name: 'SM Cinema',
            location: 'SM Mall of Asia',
            distance: '2.5km away',
            website: 'smcinema.com'
        },
        {
            name: 'Ayala Cinemas',
            location: 'Greenbelt Mall',
            distance: '3.2km away',
            website: 'sureseats.com'
        },
        {
            name: 'Robinsons Movieworld',
            location: 'Robinsons Place',
            distance: '1.8km away',
            website: 'robinsonsmovieworld.com'
        }
    ];
}

function getNearestMalls() {
    return [
        {
            name: 'SM Mall of Asia',
            location: 'Pasay City',
            distance: '2.5km away',
            website: 'smmoa.com'
        },
        {
            name: 'Greenbelt',
            location: 'Makati City',
            distance: '3.2km away',
            website: 'ayalamalls.com'
        },
        {
            name: 'Robinsons Place Manila',
            location: 'Ermita, Manila',
            distance: '1.8km away',
            website: 'robinsonsmalls.com'
        }
    ];
}

function detectLocationInTask(taskText) {
    const locationKeywords = ['at ', 'in ', 'to ', 'visit ', 'go to ', 'meeting at ', 'appointment at ', 'mall', 'hospital', 'office', 'restaurant', 'hotel', 'airport', 'station'];
    return locationKeywords.some(keyword => taskText.toLowerCase().includes(keyword));
}

function generateTravelInfo(item, weather, traffic) {
    const destination = extractDestination(item.text);
    const travelType = detectTravelType(destination);
    
    if (travelType === 'sea_land') {
        return generateSeaLandTravelInfo(destination, weather);
    }
    
    const travelTime = calculateTravelTime(traffic);
    const route = suggestRoute(traffic, weather);
    
    let info = [];
    
    // Weather for travel
    if (weather.condition === 'Heavy Rain' || weather.condition === 'Typhoon') {
        info.push(`☔ ${weather.condition} - Drive carefully, expect delays`);
    } else if (weather.condition === 'Rainy') {
        info.push(`🌧️ Light rain - Bring umbrella, roads may be slippery`);
    } else {
        info.push(`☀️ ${weather.condition} - Good travel conditions`);
    }
    
    // Traffic situation
    if (traffic === 'Heavy') {
        info.push(`🚗 Heavy traffic - Est. travel time: ${travelTime}`);
    } else if (traffic === 'Moderate') {
        info.push(`🚗 Moderate traffic - Est. travel time: ${travelTime}`);
    } else {
        info.push(`🚗 Light traffic - Est. travel time: ${travelTime}`);
    }
    
    // Route suggestion
    info.push(`🗺️ Route: ${route}`);
    
    // Departure time suggestion
    if (item.time && item.time !== 'All Day') {
        const departureTime = calculateDepartureTime(item.time, travelTime);
        info.push(`🕰️ Leave by: ${departureTime}`);
    }
    
    return info.join(' • ');
}

function extractDestination(taskText) {
    const text = taskText.toLowerCase();
    const destinations = ['cebu', 'davao', 'bohol', 'palawan', 'boracay', 'siargao', 'baguio', 'iloilo', 'bacolod', 'cagayan de oro', 'zamboanga', 'tacloban', 'legazpi', 'puerto princesa', 'el nido', 'coron'];
    
    for (const dest of destinations) {
        if (text.includes(dest)) {
            return dest;
        }
    }
    return 'local';
}

function detectTravelType(destination) {
    const seaLandDestinations = ['cebu', 'davao', 'bohol', 'palawan', 'boracay', 'siargao', 'iloilo', 'bacolod', 'cagayan de oro', 'zamboanga', 'tacloban', 'puerto princesa', 'el nido', 'coron'];
    
    return seaLandDestinations.includes(destination) ? 'sea_land' : 'local';
}

function generateSeaLandTravelInfo(destination, weather) {
    const flightInfo = getFlightInfo(destination);
    const shippingInfo = getShippingInfo(destination);
    
    let info = [];
    
    // Weather warning for air/sea travel
    if (weather.condition === 'Typhoon') {
        info.push(`⚠️ Typhoon warning - Flights and ferries may be cancelled`);
    } else if (weather.condition === 'Heavy Rain') {
        info.push(`☔ Heavy rain - Check for flight/ferry delays`);
    }
    
    // All available flights
    info.push(`✈️ FLIGHTS`);
    flightInfo.forEach(flight => {
        info.push(`• ${flight.airline}: ${flight.price} | ${flight.schedule} | Website: ${flight.website}`);
    });
    
    // All available shipping lines
    info.push(`🚢 FERRIES`);
    shippingInfo.forEach(ship => {
        info.push(`• ${ship.line}: ${ship.price} | ${ship.schedule} | Website: ${ship.website}`);
    });
    
    return info.join(' • ');
}

function getFlightInfo(destination) {
    const flightData = {
        'cebu': [
            {
                airline: 'Cebu Pacific',
                price: '₱3,500-5,000',
                schedule: '6 daily flights',
                website: 'cebupacificair.com'
            },
            {
                airline: 'Philippine Airlines',
                price: '₱4,000-6,000',
                schedule: '4 daily flights',
                website: 'philippineairlines.com'
            },
            {
                airline: 'AirAsia Philippines',
                price: '₱3,200-4,800',
                schedule: '3 daily flights',
                website: 'airasia.com'
            }
        ],
        'davao': [
            {
                airline: 'Cebu Pacific',
                price: '₱4,500-6,500',
                schedule: '4 daily flights',
                website: 'cebupacificair.com'
            },
            {
                airline: 'Philippine Airlines',
                price: '₱5,000-7,000',
                schedule: '3 daily flights',
                website: 'philippineairlines.com'
            }
        ],
        'palawan': [
            {
                airline: 'Cebu Pacific',
                price: '₱3,800-5,200',
                schedule: '5 daily flights',
                website: 'cebupacificair.com'
            },
            {
                airline: 'Philippine Airlines',
                price: '₱4,200-5,800',
                schedule: '3 daily flights',
                website: 'philippineairlines.com'
            },
            {
                airline: 'AirAsia Philippines',
                price: '₱3,600-5,000',
                schedule: '2 daily flights',
                website: 'airasia.com'
            }
        ]
    };
    
    return flightData[destination] || [
        {
            airline: 'Cebu Pacific',
            price: '₱3,500-5,000',
            schedule: 'Multiple daily flights',
            website: 'cebupacificair.com'
        },
        {
            airline: 'Philippine Airlines',
            price: '₱4,000-6,000',
            schedule: 'Multiple daily flights',
            website: 'philippineairlines.com'
        }
    ];
}

function getShippingInfo(destination) {
    const shippingData = {
        'cebu': [
            {
                line: '2GO Travel',
                price: '₱1,200-2,000',
                schedule: '3x weekly',
                website: '2go.com.ph'
            },
            {
                line: 'Cokaliong Shipping',
                price: '₱1,000-1,800',
                schedule: '2x weekly',
                website: 'cokaliong.com'
            }
        ],
        'davao': [
            {
                line: '2GO Travel',
                price: '₱2,500-3,500',
                schedule: '2x weekly',
                website: '2go.com.ph'
            },
            {
                line: 'Sulpicio Lines',
                price: '₱2,200-3,200',
                schedule: 'Weekly',
                website: 'sulpiciolines.com.ph'
            }
        ],
        'palawan': [
            {
                line: '2GO Travel',
                price: '₱1,800-2,800',
                schedule: '2x weekly',
                website: '2go.com.ph'
            },
            {
                line: 'Atienza Shipping',
                price: '₱1,600-2,400',
                schedule: 'Weekly',
                website: 'atienzashipping.com'
            }
        ]
    };
    
    return shippingData[destination] || [
        {
            line: '2GO Travel',
            price: '₱1,500-2,500',
            schedule: 'Regular trips',
            website: '2go.com.ph'
        },
        {
            line: 'WG&A SuperFerry',
            price: '₱1,200-2,200',
            schedule: 'Regular trips',
            website: 'wgaferry.com.ph'
        }
    ];
}

function calculateTravelTime(traffic) {
    const baseTimes = {
        'Light': ['15-20 min', '20-25 min', '25-30 min'],
        'Moderate': ['25-35 min', '30-40 min', '35-45 min'],
        'Heavy': ['45-60 min', '50-70 min', '60-90 min']
    };
    
    const times = baseTimes[traffic] || baseTimes['Light'];
    return times[Math.floor(Math.random() * times.length)];
}

function suggestRoute(traffic, weather) {
    const routes = {
        'Light': ['Main highway', 'Direct route via EDSA', 'Fastest route available'],
        'Moderate': ['Alternative route via C5', 'Avoid EDSA, use Ortigas', 'Side streets recommended'],
        'Heavy': ['Use Waze/Google Maps', 'Consider public transport', 'Avoid major highways']
    };
    
    let routeOptions = routes[traffic] || routes['Light'];
    
    if (weather.condition === 'Heavy Rain' || weather.condition === 'Typhoon') {
        routeOptions = ['Avoid flood-prone areas', 'Use elevated highways', 'Consider postponing travel'];
    }
    
    return routeOptions[Math.floor(Math.random() * routeOptions.length)];
}

function calculateDepartureTime(appointmentTime, travelTime) {
    const [hours, minutes] = appointmentTime.split(':').map(Number);
    const travelMinutes = parseInt(travelTime.split('-')[1] || travelTime.split(' ')[0]) || 30;
    
    let departureHours = hours;
    let departureMinutes = minutes - travelMinutes;
    
    if (departureMinutes < 0) {
        departureMinutes += 60;
        departureHours -= 1;
    }
    
    if (departureHours < 0) departureHours += 24;
    
    return `${String(departureHours).padStart(2, '0')}:${String(departureMinutes).padStart(2, '0')}`;
}

function editMonthlyTask(dateKey, taskId) {
    const dayItems = items[dateKey] || [];
    const task = dayItems.find(t => t.id === taskId);
    if (!task) return;
    
    const newText = prompt('Edit task:', task.text);
    if (newText && newText.trim()) {
        task.text = newText.trim();
        renderCalendar();
    }
}

function toggleMonthlyTask(dateKey, taskId) {
    const dayItems = items[dateKey] || [];
    const task = dayItems.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        renderCalendar();
    }
}

function deleteMonthlyTask(dateKey, taskId) {
    if (confirm('Delete this task?')) {
        if (items[dateKey]) {
            items[dateKey] = items[dateKey].filter(t => t.id !== taskId);
            renderCalendar();
        }
    }
}

function detectMedicineInTask(taskText) {
    const medicineKeywords = ['medicine', 'medication', 'pills', 'tablet', 'capsule', 'drug', 'prescription', 'pharmacy', 'take medicine', 'buy medicine', 'paracetamol', 'ibuprofen', 'amoxicillin', 'cetirizine', 'omeprazole', 'metformin', 'amlodipine', 'losartan', 'atorvastatin', 'aspirin'];
    return medicineKeywords.some(keyword => taskText.toLowerCase().includes(keyword));
}

function generateMedicineInfo(taskText) {
    const detectedMedicine = extractMedicineName(taskText);
    const drugInfo = getDrugInformation(detectedMedicine);
    const nearestDrugstore = getNearestDrugstore();
    
    let info = [];
    
    // Drug information
    info.push(`💊 Medicine: ${drugInfo.brandName} (${drugInfo.genericName})`);
    info.push(`💰 Price: ${drugInfo.price}`);
    info.push(`ℹ️ Usage: ${drugInfo.usage}`);
    
    // Nearest drugstore
    info.push(`🏪 Nearest: ${nearestDrugstore.name} - ${nearestDrugstore.distance} - ${nearestDrugstore.hours} - Website: ${nearestDrugstore.website}`);
    
    return info.join(' • ');
}

function extractMedicineName(taskText) {
    const text = taskText.toLowerCase();
    const medicines = ['paracetamol', 'ibuprofen', 'amoxicillin', 'cetirizine', 'omeprazole', 'metformin', 'amlodipine', 'losartan', 'atorvastatin', 'aspirin'];
    
    for (const medicine of medicines) {
        if (text.includes(medicine)) {
            return medicine;
        }
    }
    return 'general medicine';
}

function getDrugInformation(medicineName) {
    const drugDatabase = {
        'paracetamol': {
            brandName: 'Biogesic',
            genericName: 'Paracetamol',
            price: '₱8-15 per tablet',
            usage: 'Pain relief, fever reducer'
        },
        'ibuprofen': {
            brandName: 'Advil',
            genericName: 'Ibuprofen',
            price: '₱12-20 per tablet',
            usage: 'Anti-inflammatory, pain relief'
        },
        'amoxicillin': {
            brandName: 'Amoxil',
            genericName: 'Amoxicillin',
            price: '₱15-25 per capsule',
            usage: 'Antibiotic for infections'
        },
        'cetirizine': {
            brandName: 'Zyrtec',
            genericName: 'Cetirizine',
            price: '₱10-18 per tablet',
            usage: 'Antihistamine for allergies'
        },
        'omeprazole': {
            brandName: 'Losec',
            genericName: 'Omeprazole',
            price: '₱20-35 per capsule',
            usage: 'Acid reflux, stomach ulcers'
        },
        'metformin': {
            brandName: 'Glucophage',
            genericName: 'Metformin',
            price: '₱8-15 per tablet',
            usage: 'Diabetes management'
        },
        'amlodipine': {
            brandName: 'Norvasc',
            genericName: 'Amlodipine',
            price: '₱12-22 per tablet',
            usage: 'High blood pressure'
        },
        'aspirin': {
            brandName: 'Bayer Aspirin',
            genericName: 'Aspirin',
            price: '₱5-12 per tablet',
            usage: 'Pain relief, blood thinner'
        }
    };
    
    return drugDatabase[medicineName] || {
        brandName: 'Generic Medicine',
        genericName: 'Various',
        price: '₱10-25 per unit',
        usage: 'As prescribed by doctor'
    };
}

function getNearestDrugstore() {
    const drugstores = [
        {
            name: 'Mercury Drug',
            distance: '0.5km away',
            hours: 'Open 24/7',
            website: 'mercurydrug.com'
        },
        {
            name: 'Watsons',
            distance: '0.8km away',
            hours: 'Open 8AM-10PM',
            website: 'watsons.com.ph'
        },
        {
            name: 'Rose Pharmacy',
            distance: '1.2km away',
            hours: 'Open 7AM-11PM',
            website: 'rosepharmacy.com'
        },
        {
            name: 'Generics Pharmacy',
            distance: '0.3km away',
            hours: 'Open 8AM-8PM',
            website: 'tgp.com.ph'
        }
    ];
    
    return drugstores[Math.floor(Math.random() * drugstores.length)];
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        currentLocationDiv.innerHTML = 'Getting GPS location...';
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                currentLocation = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                currentLocationDiv.innerHTML = `
                    <div style="font-weight: bold; color: #007cba;">${currentLocation}</div>
                    <div style="font-size: 12px; color: #666; margin-top: 4px;">GPS coordinates</div>
                `;
            },
            function(error) {
                currentLocationDiv.innerHTML = `
                    <div style="color: #dc3545;">GPS unavailable</div>
                    <div style="font-size: 12px; color: #666; margin-top: 4px;">Please enable location services</div>
                `;
            }
        );
    } else {
        currentLocationDiv.innerHTML = `
            <div style="color: #dc3545;">GPS not supported</div>
            <div style="font-size: 12px; color: #666; margin-top: 4px;">Browser doesn't support geolocation</div>
        `;
    }
}

function openGoogleMaps() {
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentLocation)}`;
    window.open(mapUrl, '_blank');
}

function openLocationModal() {
    locationInput.value = currentLocation;
    locationModal.style.display = 'block';
}

function closeLocationModal() {
    locationModal.style.display = 'none';
}

function saveLocation() {
    const newLocation = locationInput.value.trim();
    if (newLocation) {
        currentLocation = newLocation;
        updateLocationDisplay('Manually set location');
        closeLocationModal();
    }
}

function updateLocationDisplay(source) {
    currentLocationDiv.innerHTML = `
        <div style="font-weight: bold; color: #007cba;">${currentLocation}</div>
        <div style="font-size: 12px; color: #666; margin-top: 4px;">${source}</div>
    `;
}

function showLocationMethodDialog() {
    locationMethodDialog.style.display = 'block';
}

function hideLocationMethodDialog() {
    locationMethodDialog.style.display = 'none';
}

function useGPS() {
    hideLocationMethodDialog();
    if (navigator.geolocation) {
        currentLocationDiv.innerHTML = 'Getting GPS location...';
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                currentLocation = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                updateLocationDisplay('GPS coordinates');
            },
            function(error) {
                currentLocationDiv.innerHTML = `
                    <div style="color: #dc3545;">GPS unavailable</div>
                    <div style="font-size: 12px; color: #666; margin-top: 4px;">Please enable location services</div>
                `;
            }
        );
    } else {
        alert('GPS not supported by this browser');
    }
}

function useGoogleMap() {
    hideLocationMethodDialog();
    const mapUrl = `https://www.google.com/maps/@14.5995,120.9842,15z`;
    window.open(mapUrl, '_blank');
    
    setTimeout(() => {
        const instructions = `Instructions for Google Maps:\n\n1. Right-click on your desired location\n2. Click on the coordinates that appear\n3. Copy the coordinates (e.g., 14.5995, 120.9842)\n4. Paste them in the input field below\n\nOr simply type your address/location name.`;
        alert(instructions);
        openLocationModal();
    }, 1000);
}

function renderMonthlyTasks() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = months[month];
    
    document.getElementById('monthlyTasksTitle').textContent = `${monthName} ${year}`;
    
    const monthlyItems = [];
    
    for (let day = 1; day <= new Date(year, month + 1, 0).getDate(); day++) {
        const dateKey = `${year}-${month + 1}-${day}`;
        const dayItems = items[dateKey] || [];
        
        dayItems.forEach(item => {
            monthlyItems.push({
                ...item,
                date: day,
                dateKey: dateKey
            });
        });
    }
    
    monthlyItems.sort((a, b) => a.date - b.date);
    
    const monthlyTasksList = document.getElementById('monthlyTasksList');
    
    if (monthlyItems.length === 0) {
        monthlyTasksList.innerHTML = '<p style="color: #666; font-style: italic;">No tasks for this month</p>';
        return;
    }
    
    monthlyTasksList.innerHTML = monthlyItems.map(item => `
        <div class="monthly-task-item ${item.type} ${item.completed ? 'completed' : ''}">
            <div class="task-date">${item.date}</div>
            <div class="task-content">
                <span class="task-type">${item.type}</span>
                <span class="task-text" onclick="editMonthlyTask('${item.dateKey}', ${item.id})">${item.text}</span>
                ${item.time ? ` - <span class="task-time">${item.time}</span>` : ''}
            </div>
            <div class="monthly-task-actions">
                <input type="checkbox" ${item.completed ? 'checked' : ''} onchange="toggleMonthlyTask('${item.dateKey}', ${item.id})">
                <button class="monthly-delete-btn" onclick="deleteMonthlyTask('${item.dateKey}', ${item.id})">×</button>
            </div>
        </div>
    `).join('');
}

function changeMonth(delta) {
    currentDate.setMonth(currentDate.getMonth() + delta);
    renderCalendar();
}

function selectDate(year, month, day) {
    selectedDate = `${year}-${month + 1}-${day}`;
    
    // Only update the information section, don't open modal
    renderDateInfo(year, month, day);
}

function closeModal() {
    modal.style.display = 'none';
    // Reset to today's info when modal closes
    renderTodayInfo();
}

function addItem() {
    const text = itemInput.value.trim();
    const time = allDayInput.checked ? 'All Day' : timeInput.value;
    const targetDate = dayInput.value ? dayInput.value.replace(/-/g, '-') : selectedDate;
    if (!text || !targetDate) return;
    
    const newItem = {
        id: nextId++,
        text: text,
        time: time,
        type: selectedType,
        completed: false
    };
    
    if (selectedType === 'appointment') {
        const warnings = checkAppointmentConflicts(targetDate, time, text);
        if (warnings.length > 0) {
            pendingAppointment = { targetDate, item: newItem };
            showWarningDialog(warnings);
            return;
        }
    }
    
    saveItem(targetDate, newItem);
}

function saveItem(targetDate, item) {
    if (!items[targetDate]) items[targetDate] = [];
    items[targetDate].push(item);
    
    itemInput.value = '';
    timeInput.value = '';
    dayInput.value = '';
    allDayInput.checked = false;
    timeInput.disabled = false;
    renderItems();
    renderCalendar();
}

function checkAppointmentConflicts(targetDate, time, text) {
    const warnings = [];
    const weather = getWeatherForDate(targetDate);
    const [year, month, day] = targetDate.split('-');
    const holidayKey = `${month}-${day}`;
    const holiday = philippineHolidays[holidayKey];
    const existingItems = items[targetDate] || [];
    
    if (holiday) {
        warnings.push(`This appointment is scheduled on ${holiday}, a Philippine holiday.`);
    }
    
    if (weather.condition === 'Heavy Rain') {
        warnings.push('Heavy rain is expected on this date. Outdoor appointments may be affected.');
    }
    
    if (weather.condition === 'Typhoon') {
        warnings.push('A typhoon is expected on this date. This appointment may need to be rescheduled.');
    }
    
    const timeConflicts = existingItems.filter(item => 
        item.time === time && item.time !== 'All Day' && time !== 'All Day'
    );
    
    if (timeConflicts.length > 0) {
        const conflictList = timeConflicts.map(item => `${item.text} (${item.type})`).join(', ');
        warnings.push(`Time conflict detected at ${time} with: ${conflictList}`);
    }
    
    return warnings;
}

function showWarningDialog(warnings) {
    warningDialogMessage.innerHTML = warnings.map(warning => `<p>• ${warning}</p>`).join('');
    warningDialog.style.display = 'block';
}

function hideWarningDialog() {
    warningDialog.style.display = 'none';
    pendingAppointment = null;
}

function toggleItem(id) {
    const dayItems = items[selectedDate] || [];
    const item = dayItems.find(t => t.id === id);
    if (item) {
        item.completed = !item.completed;
        renderItems();
    }
}

function deleteItem(id) {
    if (items[selectedDate]) {
        items[selectedDate] = items[selectedDate].filter(t => t.id !== id);
        renderItems();
        renderCalendar();
    }
}

function renderItems() {
    const dayItems = items[selectedDate] || [];
    itemList.innerHTML = dayItems.map(item => `
        <li class="item ${item.type} ${item.completed ? 'completed' : ''}">
            <input type="checkbox" ${item.completed ? 'checked' : ''} 
                   onchange="toggleItem(${item.id})">
            <span class="item-text">${item.text}</span>
            ${item.time ? `<span class="item-time">${item.time}</span>` : ''}
            <button class="delete-btn" onclick="deleteItem(${item.id})">×</button>
        </li>
    `).join('');
}

function setType(type) {
    selectedType = type;
    typeBtns.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-type="${type}"]`).classList.add('active');
    itemInput.placeholder = `Add ${type}...`;
    checkWarnings();
}

function checkWarnings() {
    if (!selectedDate || selectedType !== 'appointment') {
        warningArea.innerHTML = '';
        return;
    }
    
    const warnings = [];
    const weather = getWeatherForDate(selectedDate);
    const [year, month, day] = selectedDate.split('-');
    const holidayKey = `${month}-${day}`;
    const holiday = philippineHolidays[holidayKey];
    
    if (holiday) {
        warnings.push(`<div class="warning holiday"><span class="warning-icon">🏛️</span>Warning: This is ${holiday}, a Philippine holiday.</div>`);
    }
    
    if (weather.condition === 'Heavy Rain') {
        warnings.push(`<div class="warning weather"><span class="warning-icon">🌧️</span>Warning: Heavy rain expected. Consider rescheduling outdoor appointments.</div>`);
    }
    
    if (weather.condition === 'Typhoon') {
        warnings.push(`<div class="warning weather"><span class="warning-icon">🌪️</span>Warning: Typhoon expected. Strongly consider rescheduling this appointment.</div>`);
    }
    
    warningArea.innerHTML = warnings.join('');
}

function quickAdd(type) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();
    
    selectedDate = `${year}-${month + 1}-${day}`;
    document.getElementById('modalDate').textContent = `${months[month]} ${day}, ${year}`;
    
    setType(type);
    renderItems();
    modal.style.display = 'block';
    itemInput.focus();
}

typeBtns.forEach(btn => {
    btn.addEventListener('click', () => setType(btn.dataset.type));
});

function goToToday() {
    currentDate = new Date();
    renderCalendar();
}

document.getElementById('prevBtn').addEventListener('click', () => changeMonth(-1));
document.getElementById('nextBtn').addEventListener('click', () => changeMonth(1));
document.getElementById('todayBtn').addEventListener('click', goToToday);
addBtn.addEventListener('click', addItem);
closeBtn.addEventListener('click', closeModal);

dayInput.addEventListener('change', function() {
    if (this.value) {
        const [year, month, day] = this.value.split('-');
        selectedDate = `${year}-${month}-${day}`;
        checkWarnings();
    }
});

allDayInput.addEventListener('change', function() {
    timeInput.disabled = this.checked;
    if (this.checked) timeInput.value = '';
});

itemInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') addItem();
});

window.addEventListener('click', function(e) {
    if (e.target === modal) closeModal();
});

loginForm.addEventListener('submit', handleLogin);

proceedBtn.addEventListener('click', function() {
    if (pendingAppointment) {
        saveItem(pendingAppointment.targetDate, pendingAppointment.item);
        hideWarningDialog();
    }
});

cancelBtn.addEventListener('click', hideWarningDialog);

getGpsBtn.addEventListener('click', getCurrentLocation);
openMapBtn.addEventListener('click', openGoogleMaps);




window.addEventListener('click', function(e) {
    if (e.target === locationModal) closeLocationModal();
    if (e.target === locationMethodDialog) hideLocationMethodDialog();
});